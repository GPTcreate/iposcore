import * as cheerio from 'cheerio';
import type { IpoItem } from '../types/ipo';
import { KRX_COMPANY_LIST, normalizeListingCompany } from './officialSource';
import { fetchOfficialText } from './officialHttp';
import { isStockCode } from './stockCode';
import { getFieldEvidence } from './contentQuality';

export const KRX_LISTING_VERSION = 'krx-company-list-v1';
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
    errors: [] as { name: string; error: string }[] };
  if (!targets.length) return result;
  let companies: ListedCompany[];
  try {
    const { text } = await fetchOfficialText(KRX_COMPANY_LIST, { fetcher: async (url, init) => {
      result.requestCount++;
      return (options.fetcher || fetch)(url, init);
    }, maxBytes: 3_000_000,
      encoding: 'euc-kr', init: { headers: { 'User-Agent': 'IPOScore/1.0' } } });
    companies = parseKrxCompanyList(text);
  } catch {
    result.success = false;
    result.errors.push({ name: 'KRX', error: '상장법인 목록 조회 또는 해석 실패. 기존 종목코드와 상장일을 보존했습니다.' });
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
