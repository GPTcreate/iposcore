import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import { getAllIpos } from './ipoStore';
import { addOrUpdateIpo, DartFilingItem, DartListResponse } from './ipoServerStore';
import { findIpoForDartFiling } from './ipoDiscovery';

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export interface DartFilingParseResult {
  rcpNo: string;
  corpName: string;
  confirmedPrice?: number;
  circulatingSupplyRate?: number;
  institutionalCompetitionRate?: number;
  lockupCommitmentRate?: number;
}

type ViewerNode = { title: string; dcmNo?: string; eleId?: string; offset?: string; length?: string; dtd?: string; rcpNo?: string };
const compact = (value: string) => value.replace(/\s+/g, '');
function exactNumber(value: string): number | undefined {
  const clean = compact(value).replace(/,/g, '').replace(/(?:%|:1)$/, '');
  return /^\d+(?:\.\d+)?$/.test(clean) ? Number(clean) : undefined;
}
function uniqueValue(values: number[]): number | undefined {
  const distinct = [...new Set(values.filter(Number.isFinite))];
  return distinct.length === 1 ? distinct[0] : undefined;
}

/** Only current, explicitly labelled facts are eligible; unknown layouts fail closed. */
export function parseDartFilingBody(html: string, rcpNo: string): DartFilingParseResult | null {
  const $ = load(html, { xml: { xmlMode: false, decodeEntities: true, withStartIndices: true } });
  $('script,style').remove();
  const text = (node: AnyNode) => $(node).text().replace(/\s+/g, ' ').trim();
  const markers: { at: number; before: boolean }[] = [];
  $('p,td,th').each((_, node) => {
    const label = text(node).replace(/[\s\p{P}\p{S}]/gu, '');
    if (/^정정[전후]$/.test(label) && node.startIndex !== null) markers.push({ at: node.startIndex!, before: label === '정정전' });
  });
  markers.sort((a, b) => a.at - b.at);
  const current = (node: AnyNode): boolean => {
    const own = compact(text(node));
    if (own.includes('정정전') && own.includes('정정후')) return false;
    if (own.includes('정정전') && !own.includes('정정후')) return false;
    // Side-by-side amendment columns, including nested tables, are ambiguous.
    if ($(node).parents('table').addBack('table').toArray().some((table) => {
      const tableText = compact(text(table));
      return tableText.includes('정정전') && tableText.includes('정정후');
    })) return false;
    const marker = markers.filter((item) => item.at < (node.startIndex ?? -1)).at(-1);
    return !marker?.before;
  };
  const price: number[] = [], circulation: number[] = [], competition: number[] = [], lockup: number[] = [];
  $('p,td,th,tr').each((_, node) => {
    if (!current(node)) return;
    const value = text(node);
    for (const match of value.matchAll(/(?:1주당|주당)?\s*확정\s*공모가액\s*[:：]?\s*([\d,]+)\s*원/g)) {
      const number = exactNumber(match[1]); if (number && number > 0) price.push(number);
    }
    for (const match of value.matchAll(/의무보유\s*확약\s*비율\s*[:：]?\s*([\d.]+)\s*%/g)) {
      const number = exactNumber(match[1]); if (number !== undefined && number >= 0 && number <= 100) lockup.push(number);
    }
    for (const match of value.matchAll(/(?:상장일|상장\s*직후)\s*유통가능(?:주식수|물량)?\s*비율\s*[:：]?\s*([\d.]+)\s*%/g)) {
      const number = exactNumber(match[1]); if (number && number <= 100) circulation.push(number);
    }
    // The ratio must describe the same tradable share count and reconcile arithmetically.
    for (const match of value.matchAll(/상장(?:예정)?주식수\s*([\d,]+)\s*주\s*중\s*(?:약\s*)?([\d.]+)\s*%\s*에\s*해당하는\s*([\d,]+)\s*주(?:는|가)?\s*상장\s*(?:직후|일|후)\s*유통\s*가능/g)) {
      const total = exactNumber(match[1]), ratio = exactNumber(match[2]), tradable = exactNumber(match[3]);
      if (total && tradable && ratio && Number.isInteger(total) && Number.isInteger(tradable) && tradable <= total && ratio <= 100
        && Math.abs(tradable / total * 100 - ratio) <= 0.015) circulation.push(ratio);
    }
  });
  $('table').each((_, table) => {
    if (!current(table)) return;
    const rows = $(table).find('tr').filter((_, row) => $(row).closest('table')[0] === table).toArray().map((row) => {
      const cells = $(row).children('td,th').toArray();
      return { cells, values: cells.map((cell) => compact(text(cell))) };
    });
    const context = compact($(table).prevAll('p').slice(0, 4).text() + $(table).find('caption').text());
    const header = rows[0];
    if (!header) return;
    const width = header.cells.reduce((sum, cell) => sum + (Number($(cell).attr('colspan')) || 1), 0);
    if (context.includes('수요예측') && header.values.some((cell) => cell.includes('기관투자자')) && header.values.at(-1) === '합계'
      && (Number($(header.cells.at(-1)!).attr('colspan')) || 1) === 1) {
      for (const row of rows) {
        if (!/^경쟁률(?:\(주\d+\))?$/.test(row.values[0] || '') || row.values.length !== width) continue;
        const number = exactNumber(row.values.at(-1) || ''); if (number && number > 0) competition.push(number);
      }
    }
    // A zero is disclosed only when all commitment periods are empty and the
    // uncommitted row exactly accounts for the positive total participation.
    const uncommitted = rows.find((row) => row.values[0] === '미확약');
    const total = rows.find((row) => row.values[0] === '합계');
    const periods = rows.filter((row) => /^\d+(?:일|개월|년)확약$/.test(row.values[0] || ''));
    const quantityHeader = rows.some((row) => row.values.join('|').includes('건수|수량|신청가격'));
    if (context.includes('의무보유확약') && context.includes('수요예측') && quantityHeader && uncommitted && total && periods.length >= 2
      && uncommitted.values.length === total.values.length && uncommitted.values.slice(1).join('|') === total.values.slice(1).join('|')
      && uncommitted.values.slice(1).some((cell, index) => index % 3 === 0 && (exactNumber(cell) || 0) > 0)
      && periods.every((row) => row.values.length === total.values.length && row.values.slice(1).every((cell) => /^[-–—]$/.test(cell) || exactNumber(cell) === 0))) lockup.push(0);
    // Only a self-contained, explicitly named tradable-ratio column is accepted.
    const ratioColumn = header.values.findIndex((cell) => /^(?:상장일|상장직후)?유통가능(?:주식수)?비율$/.test(cell));
    if (ratioColumn >= 0) for (const row of rows) {
      if (row.values[0] !== '합계' || row.values.length !== header.values.length) continue;
      const number = exactNumber(row.values[ratioColumn]); if (number && number <= 100) circulation.push(number);
    }
  });
  const result: DartFilingParseResult = { rcpNo, corpName: '' };
  const candidates = { confirmedPrice: uniqueValue(price), circulatingSupplyRate: uniqueValue(circulation), institutionalCompetitionRate: uniqueValue(competition), lockupCommitmentRate: uniqueValue(lockup) };
  for (const [key, value] of Object.entries(candidates)) if (value !== undefined) Object.assign(result, { [key]: value });
  return Object.keys(result).length > 2 ? result : null;
}

/** Select offering-body nodes, never the amendment cover or an attachment. */
export async function parseConfirmedFilingDetails(rcpNo: string, options?: { fetcher?: typeof fetch }): Promise<DartFilingParseResult | null> {
  if (!/^\d{14}$/.test(rcpNo)) return null;
  const fetcher = options?.fetcher || fetch;
  const get = async (url: string, limit: number) => {
    const response = await fetcher(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok || Number(response.headers.get('content-length')) > limit) return null;
    const body = await response.text(); return body.length <= limit ? body : null;
  };
  try {
    const main = await get(`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`, 1_000_000);
    if (!main) return null;
    const nodes: ViewerNode[] = []; let node: ViewerNode | undefined;
    for (const match of main.matchAll(/node\d+\['(text|dcmNo|eleId|offset|length|dtd|rcpNo)'\]\s*=\s*['"]([^'"\r\n]*)['"]/g)) {
      const [, key, value] = match;
      if (key === 'text') { if (node) nodes.push(node); node = { title: compact(value) }; }
      else if (node) Object.assign(node, { [key]: value });
    }
    if (node) nodes.push(node);
    const eligible = nodes.filter((item) => (!item.rcpNo || item.rcpNo === rcpNo) && /^\d+$/.test(item.dcmNo || '') && /^\d+$/.test(item.eleId || '')
      && /^\d+$/.test(item.offset || '') && /^\d+$/.test(item.length || '') && Number(item.length) > 0 && Number(item.length) <= 2_000_000 && item.dtd === 'dart4.xsd');
    const bodyNodes = eligible.filter((item) => /^(?:제1부)?모집또는매출에관한사항$/.test(item.title));
    const confirmedNodes = eligible.filter((item) => /^증권발행조건확정$/.test(item.title));
    const chosen = bodyNodes.length === 1 ? bodyNodes[0] : bodyNodes.length === 0 && confirmedNodes.length === 1 ? confirmedNodes[0] : undefined;
    if (!chosen) return null;
    const url = `https://dart.fss.or.kr/report/viewer.do?rcpNo=${rcpNo}&dcmNo=${chosen.dcmNo}&eleId=${chosen.eleId}&offset=${chosen.offset}&length=${chosen.length}&dtd=dart4.xsd`;
    const html = await get(url, 2_000_000);
    return html ? parseDartFilingBody(html, rcpNo) : null;
  } catch { return null; }
}

export async function syncExistingIposWithDartFilings(options?: {
  days?: number;
  apiKey?: string;
  now?: Date;
  fetcher?: typeof fetch;
  parseFiling?: (receiptNo: string) => Promise<DartFilingParseResult | null>;
}): Promise<{
  success: boolean;
  updatedCount: number;
  updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[];
  message: string;
  errors: { name?: string; receiptNo?: string; error: string }[];
}> {
  const apiKey = options?.apiKey || process.env.DART_API_KEY;
  const failed = (message: string) => ({ success: false, updatedCount: 0, updatedStocks: [], message, errors: [{ error: message }] });
  if (!apiKey?.trim()) return failed('DART_API_KEY가 설정되지 않았습니다. 기존 수치를 유지합니다.');
  const days = Math.max(1, Math.min(90, Math.floor(options?.days || 14)));
  const today = options?.now || new Date();
  const todayKst = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(today);
  const endDate = todayKst.replace(/-/g, '');
  const pastDate = new Date(`${todayKst}T00:00:00Z`);
  pastDate.setUTCDate(pastDate.getUTCDate() - days);
  const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

  const filings: DartFilingItem[] = [];
  const fetcher = options?.fetcher || fetch;
  try {
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page++) {
      const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${encodeURIComponent(apiKey)}&bgn_de=${startDate}&end_de=${endDate}&pblntf_ty=C&sort=date&sort_mth=desc&page_no=${page}&page_count=100`;
      const res = await fetcher(dartUrl, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!res.ok) return failed(`DART 공시 목록 조회 실패: HTTP ${res.status}. 기존 수치를 유지합니다.`);
      const data: DartListResponse = await res.json();
      if (data.status === '013' && page === 1) break;
      if (data.status !== '000' || !Array.isArray(data.list)) return failed('DART 공시 목록 응답 오류. 기존 수치를 유지합니다.');
      totalPages = Number(data.total_page) || 1;
      if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > 100) return failed('DART 공시 조회 범위를 처리하지 못했습니다. 기존 수치를 유지합니다.');
      filings.push(...data.list);
    }
  } catch {
    return failed('DART 공시 목록 조회 실패. 기존 수치를 유지합니다.');
  }

  const allCurrentIpos = getAllIpos();
  const updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[] = [];
  const errors: { name?: string; receiptNo?: string; error: string }[] = [];

  for (const ipo of allCurrentIpos) {
    // 이미 상장 완료되었거나 취소된 종목은 스킵
    if (ipo.isCancelled || ipo.status === 'LISTED') continue;

    // 해당 종목의 최근 DART 공시 검색
    const targetFilings = filings.filter((f) => typeof f.corp_name === 'string' && typeof f.report_nm === 'string' && /^\d{14}$/.test(f.rcept_no)
      && findIpoForDartFiling([ipo], f)?.id === ipo.id
      && (f.report_nm.includes('발행조건확정')
        || (f.report_nm.includes('투자설명서') && !f.report_nm.includes('예비'))
        || (f.report_nm.includes('기재정정') && f.report_nm.includes('지분증권'))))
      .sort((a, b) => b.rcept_no.localeCompare(a.rcept_no));

    // A matching latest filing is authoritative even if unchanged or unparseable.
    // Never descend to an older amendment merely because the newest values match.
    const filing = targetFilings[0];
    if (!filing) continue;

      console.log(`[DartFilingSync] 확정 공시 감지 -> ${ipo.name} (${filing.report_nm}, rcpNo: ${filing.rcept_no})`);
      const parsed = await (options?.parseFiling ? options.parseFiling(filing.rcept_no) : parseConfirmedFilingDetails(filing.rcept_no, { fetcher }));
      if (!parsed || ![parsed.confirmedPrice, parsed.circulatingSupplyRate, parsed.institutionalCompetitionRate, parsed.lockupCommitmentRate]
        .some((value) => typeof value === 'number' && Number.isFinite(value))) {
        errors.push({ name: ipo.name, receiptNo: filing.rcept_no, error: '최신 공시에서 수치를 추출하지 못했습니다. 기존 수치를 유지합니다.' });
        continue;
      }

      let changed = false;

      if (finite(parsed.confirmedPrice) && parsed.confirmedPrice > 0 && ipo.confirmedPrice !== parsed.confirmedPrice) {
        ipo.confirmedPrice = parsed.confirmedPrice;
        changed = true;
      }

      if (finite(parsed.circulatingSupplyRate) && parsed.circulatingSupplyRate > 0 && parsed.circulatingSupplyRate <= 100 && ipo.circulatingSupplyRate !== parsed.circulatingSupplyRate) {
        ipo.circulatingSupplyRate = parsed.circulatingSupplyRate;
        changed = true;
      }

      if (finite(parsed.institutionalCompetitionRate) && parsed.institutionalCompetitionRate > 0 && ipo.institutionalCompetitionRate !== parsed.institutionalCompetitionRate) {
        ipo.institutionalCompetitionRate = parsed.institutionalCompetitionRate;
        changed = true;
      }

      if (finite(parsed.lockupCommitmentRate) && parsed.lockupCommitmentRate >= 0 && parsed.lockupCommitmentRate <= 100 && ipo.lockupCommitmentRate !== parsed.lockupCommitmentRate) {
        ipo.lockupCommitmentRate = parsed.lockupCommitmentRate;
        changed = true;
      }

      if (ipo.pendingForecastFields) {
        const remaining = ipo.pendingForecastFields.filter((field) => {
          const value = parsed[field];
          if (!finite(value)) return true;
          if (field === 'institutionalCompetitionRate') return value <= 0;
          if (field === 'circulatingSupplyRate') return value <= 0 || value > 100;
          return value < 0 || value > 100;
        });
        if (remaining.length !== ipo.pendingForecastFields.length) {
          ipo.pendingForecastFields = remaining;
          changed = true;
        }
      }

      if (changed) {
        // 날짜 기준 상태 전이 확인
        const nowStr = todayKst;
        if (ipo.status === 'UPCOMING' && nowStr >= ipo.subscriptionStart && nowStr <= ipo.subscriptionEnd) {
          ipo.status = 'SUBSCRIPTION';
        }
        addOrUpdateIpo(ipo);
        updatedStocks.push({
          name: ipo.name,
          code: ipo.code,
          confirmedPrice: ipo.confirmedPrice,
          circulatingRate: ipo.circulatingSupplyRate,
          competitionRate: ipo.institutionalCompetitionRate,
        });
      }
  }

  return {
    success: errors.length === 0,
    updatedCount: updatedStocks.length,
    updatedStocks,
    message: `기존 공모주 DART 확정공시 자동 대조 완료 (총 ${updatedStocks.length}건 갱신)`,
    errors,
  };
}
