import * as cheerio from 'cheerio';
import type { IpoItem } from '../types/ipo';
import { KRX_COMPANY_LIST, normalizeListingCompany } from './officialSource';
import { fetchOfficialText, isTransientOfficialError, OfficialResponseError } from './officialHttp';
import { isStockCode } from './stockCode';
import { getFieldEvidence } from './contentQuality';

export const KRX_LISTING_VERSION = 'krx-company-list-v1';
export const KRX_MAX_REQUESTS = 3;
const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);
interface ListedCompany { name: string; code: string; listingDate: string; market: 'KOSPI' | 'KOSDAQ'; excerpt: string }
const isDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day))
  && new Date(day).toISOString().slice(0, 10) === day;
const finalized = (ipo: IpoItem) => Number.isFinite(ipo.openingPrice) && (ipo.openingPrice || 0) > 0
  && Number.isFinite(ipo.closingPrice) && (ipo.closingPrice || 0) > 0;

/** The exchange's full listed-company export supplies identity and the actual first trading day. */
export function parseKrxCompanyList(html: string): ListedCompany[] {
  const $ = cheerio.load(html), rows = $('table tr').toArray();
  const headers = rows.length ? $(rows[0]).children('th,td').toArray().map(cell => $(cell).text().trim()) : [];
  const columns = ['회사명', '시장구분', '종목코드', '상장일'].map(label => headers.indexOf(label));
  if (columns.some(index => index < 0)) throw new Error('KRX 상장법인 목록 구조를 확인하지 못했습니다.');
  const result: ListedCompany[] = [];
  for (const row of rows.slice(1)) {
    const cells = $(row).children('td').toArray().map(cell => $(cell).text().replace(/\s+/g, ' ').trim());
    const [name, marketName, code, listingDate] = columns.map(index => cells[index] || '');
    const market = marketName === '코스닥' ? 'KOSDAQ' : marketName === '유가증권' ? 'KOSPI' : undefined;
    if (name && market && isStockCode(code) && isDay(listingDate)) {
      result.push({ name, code, listingDate, market, excerpt: `${name} | ${marketName} | ${code} | 상장일 ${listingDate}` });
    }
  }
  if (!result.length) throw new Error('KRX 상장법인 목록이 비어 있습니다.');
  return result;
}

export async function syncKrxListingIdentities(ipos: IpoItem[], options: {
  now?: Date; fetcher?: typeof fetch; save: (ipo: IpoItem) => unknown;
  retryDelayMs?: number;
}) {
  const now = options.now || new Date(), today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);
  const targets = ipos.filter(ipo => !ipo.isCancelled && !finalized(ipo)
    && (ipo.status === 'LISTED' || (ipo.listingDate && ipo.listingDate <= today)
      || (isDay(ipo.subscriptionEnd) && ipo.subscriptionEnd < today)))
    .filter(ipo => ipo.scheduleVerification?.status === 'unavailable' || ipo.scheduleVerification?.status === 'conflict'
      || !(['code', 'listingDate'] as const).every(field => getFieldEvidence(ipo, field)?.parserVersion === KRX_LISTING_VERSION
        && ipo.fieldEvidence?.[field]?.value === ipo[field]))
    .sort((a, b) => (a.listingDate || a.subscriptionEnd).localeCompare(b.listingDate || b.subscriptionEnd));
  const result = { success: true, checkedCount: targets.length, requestCount: 0, updatedCount: 0,
    updatedStocks: [] as { id: string; code: string; listingDate: string }[], pendingCount: 0,
    attempts: [] as { request: number; outcome: string; status?: number; characters?: number }[],
    errors: [] as { name: string; error: string; code?: string }[] };
  if (!targets.length) return result;
  let companies: ListedCompany[] | undefined;
  // Each complete attempt owns its deadline and body. Never parse/reuse a partial export.
  // HTTP overload and temporary HTML/error pages need the same bounded recovery as sockets.
  for (let attempt = 0; attempt < KRX_MAX_REQUESTS; attempt++) {
    let status: number | undefined, characters: number | undefined, parsing = false;
    try {
      const { text } = await fetchOfficialText(KRX_COMPANY_LIST, { fetcher: async (url, init) => {
        result.requestCount++;
        const response = await (options.fetcher || fetch)(url, init);
        status = response.status;
        return response;
      }, maxBytes: 3_000_000, maxAttempts: 1,
        // Expose the redirect response to the shared rejection guard; native redirect:error
        // otherwise throws an unclassified TypeError that resembles a temporary socket failure.
        encoding: 'euc-kr', init: { redirect: 'manual', headers: { 'User-Agent': 'IPOScore/1.0' } } });
      characters = text.length;
      parsing = true;
      companies = parseKrxCompanyList(text);
      result.attempts.push({ request: result.requestCount, outcome: 'ok', status, characters });
      break;
    } catch (error) {
      const code = parsing ? 'SCHEMA' : error instanceof OfficialResponseError ? error.code
        : isTransientOfficialError(error) ? 'TRANSPORT' : 'RESPONSE';
      result.attempts.push({ request: result.requestCount, outcome: code, status, characters });
      const retryable = parsing || isTransientOfficialError(error)
        || (error instanceof OfficialResponseError && (error.code === 'EMPTY_BODY'
          || (error.code === 'HTTP' && retryableStatuses.has(error.status || 0))));
      if (!retryable || attempt + 1 === KRX_MAX_REQUESTS) break;
      await new Promise(resolve => setTimeout(resolve, options.retryDelayMs ?? 1_000 * (attempt + 1)));
    }
  }
  if (!companies) {
    result.success = false;
    const last = result.attempts.at(-1)!;
    result.errors.push({ name: 'KRX', code: `${last.outcome}${last.status === undefined ? '' : `_${last.status}`}`,
      error: `상장법인 목록 확인 실패 (${result.requestCount}회, ${last.outcome}${last.status === undefined ? '' : ` HTTP ${last.status}`}). 기존 종목코드와 상장일을 보존했습니다.` });
    return result;
  }
  for (const ipo of targets) {
    const matches = companies.filter(company => normalizeListingCompany(company.name) === normalizeListingCompany(ipo.name));
    if (!matches.length) { result.pendingCount++; continue; }
    const company = matches[0];
    if (matches.length === 1 && company.listingDate > today) { result.pendingCount++; continue; }
    if (matches.length !== 1 || (ipo.market !== 'UNCONFIRMED' && company.market !== ipo.market)
      || (isDay(ipo.subscriptionEnd) && company.listingDate <= ipo.subscriptionEnd)
      || ipos.some(other => other.id !== ipo.id && other.code === company.code)) {
      result.errors.push({ name: ipo.name, error: 'KRX 법인명·시장·상장일·코드가 등록자료와 충돌합니다. 자동 저장하지 않았습니다.' });
      continue;
    }
    const incoming = structuredClone(ipo);
    if (incoming.dataQuality?.status === 'reviewed'
      && (company.code !== ipo.code || company.listingDate !== ipo.listingDate || company.market !== ipo.market)) {
      incoming.dataQuality = { ...incoming.dataQuality, status: 'unverified', reviewedAt: undefined };
    }
    incoming.code = company.code;
    incoming.market = company.market;
    incoming.listingDate = company.listingDate;
    incoming.fieldEvidence = { ...incoming.fieldEvidence };
    for (const field of ['code', 'listingDate'] as const) incoming.fieldEvidence[field] = {
      sourceTitle: '한국거래소 KIND 상장법인 목록', sourceUrl: KRX_COMPANY_LIST, checkedAt: now.toISOString(),
      value: incoming[field], excerpt: company.excerpt, parserVersion: KRX_LISTING_VERSION,
    };
    // This directly confirms the actual listing, independently of partial pre-listing schedules.
    if (incoming.scheduleVerification) incoming.scheduleVerification = { ...incoming.scheduleVerification,
      conflicts: incoming.scheduleVerification.conflicts.filter(field => field !== 'listingDate'),
      pendingFields: undefined,
      coveredFields: [...new Set([...incoming.scheduleVerification.coveredFields, 'listingDate' as const])],
      status: incoming.scheduleVerification.conflicts.some(field => field !== 'listingDate') ? 'conflict' : 'partial' };
    if (incoming.listingDate !== ipo.listingDate) {
      incoming.aiSummary = { ...incoming.aiSummary, headline: `${ipo.name} 공모 일정과 공시 자료`,
        bulletPoints: incoming.aiSummary.bulletPoints.filter(line => !/상장.*(?:\d|예정)/.test(line)) };
    }
    try {
      options.save(incoming);
      result.updatedCount++;
      result.updatedStocks.push({ id: ipo.id, code: company.code, listingDate: company.listingDate });
    } catch { result.errors.push({ name: ipo.name, error: 'KRX 상장정보 저장 확인에 실패했습니다.' }); }
  }
  result.success = !result.errors.length;
  return result;
}
