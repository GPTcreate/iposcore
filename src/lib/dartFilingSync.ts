import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import { getAllIpos } from './ipoStore';
import { addOrUpdateIpo, DartFilingItem, DartListResponse } from './ipoServerStore';
import { findIpoForDartFiling } from './ipoDiscovery';
import { fetchOfficialText } from './officialHttp';
import { fetchDartDocumentOffering } from './dartDocument';

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export const DART_METRIC_SYNC_BUDGET_MS = 5 * 60 * 1000;

export interface DartFilingParseResult {
  rcpNo: string;
  corpName: string;
  confirmedPrice?: number;
  circulatingSupplyRate?: number;
  institutionalCompetitionRate?: number;
  lockupCommitmentRate?: number;
  publicationPending?: { reason: string; evidence: string; sourceUrl: string };
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
function inspectDartFilingBody(html: string, rcpNo: string): { data: DartFilingParseResult | null; ambiguous: boolean; publishedFacts: boolean } {
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
  const demandQuantities: number[] = [], pendingEvidence: string[] = [];
  const commitments: { total: number; uncommitted: number; committed: number }[] = [];
  let hasDemandResult = false;
  $('p,td,th,tr').each((_, node) => {
    if (!current(node)) return;
    const value = text(node);
    for (const match of value.matchAll(/(?:1주당|주당)?\s*확정\s*공모가액\s*(?:[:：]|인|은|는)?\s*([\d,]+)\s*원/g)) {
      if (/(?:예정|가정|예시)/.test(value.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 20))) continue;
      const number = exactNumber(match[1]); if (number && number > 0) price.push(number);
    }
    for (const match of value.matchAll(/확정\s*공모가액[을를]\s*([\d,]+)\s*원(?:으로)?\s*(?:최종\s*)?(?:결정|확정)(?:하였습니다|했습니다|되었습니다)/g)) {
      const number = exactNumber(match[1]); if (number && number > 0) price.push(number);
    }
    const pending = value.match(/확정\s*공모가(?:액|격)[^.!?]{0,220}?(?:최종\s*결정할\s*예정|최종\s*확정할\s*예정)/);
    if (pending && /수요예측/.test(value)) {
      const at = value.indexOf(pending[0]), demandAt = value.lastIndexOf('수요예측', at);
      const start = demandAt >= 0 && at - demandAt < 120 ? demandAt : at;
      pendingEvidence.push(value.slice(start, Math.min(start + 240, at + pending[0].length)));
    }
    for (const match of value.matchAll(/의무보유\s*확약\s*비율\s*[:：]?\s*([\d.]+)\s*%/g)) {
      const number = exactNumber(match[1]); if (number !== undefined && number >= 0 && number <= 100) lockup.push(number);
    }
    for (const match of value.matchAll(/(?:상장일|상장\s*직후)\s*유통가능(?:주식수|물량)?\s*비율\s*[:：]?\s*([\d.]+)\s*%/g)) {
      const number = exactNumber(match[1]); if (number && number <= 100) circulation.push(number);
    }
    // The ratio must describe the same tradable share count and reconcile arithmetically.
    for (const match of value.matchAll(/상장(?:예정)?주식수(?:는|인)?(?:\s*\([^)\r\n]{0,100}\))?\s*([\d,]+)\s*주\s*중\s*(?:약\s*)?([\d.]+)\s*%\s*에\s*해당하는\s*([\d,]+)\s*주(?:는|가)?\s*상장\s*(?:직후|일|후)\s*유통\s*가능/g)) {
      const total = exactNumber(match[1]), ratio = exactNumber(match[2]), tradable = exactNumber(match[3]);
      if (total && tradable && ratio && Number.isInteger(total) && Number.isInteger(tradable) && tradable <= total && ratio <= 100
        && Math.abs(tradable / total * 100 - ratio) <= 0.015) circulation.push(ratio);
    }
    for (const match of compact(value).matchAll(/상장(?:예정)?주식수(?:는|인)?(?:\([^)]{0,100}\))?([\d,]+)주(?:\([^)]{0,100}\))?중상장일유통가능물량은([\d,]+)주\((?:상장일기준)?([\d.]+)%\)/g)) {
      const total = exactNumber(match[1]), tradable = exactNumber(match[2]), ratio = exactNumber(match[3]);
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
    if (context.includes('수요예측') && rows.some((row) => /^경쟁률(?:\(주\d+\))?$/.test(row.values[0] || '') && row.values.slice(1).some((cell) => (exactNumber(cell) || 0) > 0))) hasDemandResult = true;
    if (context.includes('수요예측') && header.values.some((cell) => /기관투자자|운용사|연기금/.test(cell)) && header.values.at(-1) === '합계'
      && (Number($(header.cells.at(-1)!).attr('colspan')) || 1) === 1) {
      for (const row of rows) {
        if (!/^경쟁률(?:\(주\d+\))?$/.test(row.values[0] || '') || row.values.length !== width) continue;
        const number = exactNumber(row.values.at(-1) || ''); if (number && number > 0) competition.push(number);
      }
      for (const row of rows) if (row.values[0] === '수량' && row.values.length === width) {
        const quantity = exactNumber(row.values.at(-1) || ''); if (quantity && Number.isInteger(quantity)) demandQuantities.push(quantity);
      }
    }
    // The global total column must reconcile with the overall demand quantity.
    // Domestic-only tables cannot establish either zero or a global ratio.
    const rowLabel = (value: string) => value.replace(/^\d+[.．]/, '');
    let commitmentValues = rows.map((row) => row.values);
    let quantityHeader = rows.some((row) => row.values.join('|').includes('건수|수량|신청가격'));
    if (!commitmentValues.some((row) => rowLabel(row[0] || '') === '미확약') && header.values.some((cell) => cell.includes('외국기관투자자')) && header.values.at(-1) === '합계') {
      const previous = $(table).prevAll('table').first();
      if (previous.length && current(previous[0])) {
        const previousRows = previous.find('tr').filter((_, row) => $(row).closest('table')[0] === previous[0]).toArray()
          .map((row) => $(row).children('td,th').toArray().map((cell) => compact(text(cell))));
        const labels = previousRows.map((row) => rowLabel(row[0] || '')).filter((label) => /^(?:미확약|\d+(?:일|개월|년)확약|합계)$/.test(label));
        const continuation = commitmentValues.filter((row) => row.length === width && row.every((cell) => /^[-–—]$/.test(cell) || exactNumber(cell) !== undefined));
        if (previousRows.slice(0, 4).some((row) => row.some((cell) => cell.includes('국내기관투자자'))) && labels[0] === '미확약' && labels.at(-1) === '합계' && labels.length >= 4 && labels.length === continuation.length) {
          commitmentValues = continuation.map((row, index) => [labels[index], ...row]);
          quantityHeader = previousRows.some((row) => row.join('|').includes('건수|수량|신청가격'));
        }
      }
    }
    const uncommitted = commitmentValues.find((row) => rowLabel(row[0] || '') === '미확약');
    const total = commitmentValues.find((row) => row[0] === '합계');
    const periods = commitmentValues.filter((row) => /^\d+(?:일|개월|년)확약$/.test(rowLabel(row[0] || '')));
    if (context.includes('의무보유확약') && context.includes('수요예측') && quantityHeader && uncommitted && total && periods.length >= 2
      && header.values.at(-1) === '합계' && (Number($(header.cells.at(-1)!).attr('colspan')) || 1) === 3
      && uncommitted.length === total.length && periods.every((row) => row.length === total.length)) {
      const quantity = (values: string[]) => /^[-–—]$/.test(values.at(-2) || '') ? 0 : exactNumber(values.at(-2) || '');
      const totalQuantity = quantity(total), uncommittedQuantity = quantity(uncommitted), quantities = periods.map((row) => quantity(row));
      if (totalQuantity && Number.isInteger(totalQuantity) && uncommittedQuantity !== undefined && quantities.every((value) => value !== undefined && Number.isInteger(value))) {
        const committed = quantities.reduce<number>((sum, value) => sum + value!, 0);
        if (uncommittedQuantity + committed === totalQuantity) commitments.push({ total: totalQuantity, uncommitted: uncommittedQuantity, committed });
      }
    }
    // Expand rowspan/colspan so the post-offering tradable columns cannot be
    // confused with protected shares or the same shareholder's pre-IPO stake.
    type Cell = { value: string };
    const grid: Cell[][] = [];
    let validGrid = rows.length <= 500;
    rows.forEach((row, rowIndex) => {
      grid[rowIndex] ||= []; let column = 0;
      for (const cell of row.cells) {
        while (grid[rowIndex][column]) column++;
        const across = Number($(cell).attr('colspan')) || 1, down = Number($(cell).attr('rowspan')) || 1;
        if (!Number.isInteger(across) || !Number.isInteger(down) || across < 1 || across > 32 || down < 1 || down > 64 || column + across > 128) { validGrid = false; break; }
        for (let y = rowIndex; y < rowIndex + down; y++) for (let x = column; x < column + across; x++) {
          grid[y] ||= []; if (grid[y][x]) validGrid = false; grid[y][x] = { value: compact(text(cell)) };
        }
        column += across;
      }
    });
    const firstData = grid.findIndex((row) => row.some((cell) => (exactNumber(cell?.value || '') || 0) > 0));
    if (validGrid && firstData > 0 && firstData <= 6) {
      const columnLabels = Array.from({ length: grid[firstData].length }, (_, column) => [...new Set(grid.slice(0, firstData).map((row) => row[column]?.value || '').filter(Boolean))].join('|'));
      const findColumn = (pattern: (label: string) => boolean) => { const matches = columnLabels.flatMap((label, index) => pattern(label) ? [index] : []); return matches.length === 1 ? matches[0] : -1; };
      const heldColumn = findColumn((label) => /공모후/.test(label) && /보유주식/.test(label) && /주식수/.test(label) && !/매각제한|유통가능/.test(label));
      const tradableColumn = findColumn((label) => /공모후/.test(label) && /유통가능물량/.test(label) && /주식수/.test(label));
      const percentColumn = findColumn((label) => /공모후/.test(label) && /유통가능물량/.test(label) && /지분율|비율/.test(label));
      if (heldColumn >= 0 && tradableColumn >= 0 && percentColumn >= 0) for (const row of grid.slice(firstData)) {
        if (!row.slice(0, 4).some((cell) => /^(?:공모후)?(?:합계|총계)$/.test(cell?.value || ''))) continue;
        const held = exactNumber((row[heldColumn]?.value || '').replace(/주$/, '')), tradable = exactNumber((row[tradableColumn]?.value || '').replace(/주$/, '')), ratio = exactNumber(row[percentColumn]?.value || '');
        if (held && tradable && ratio && Number.isInteger(held) && Number.isInteger(tradable) && tradable <= held && ratio <= 100
          && Math.abs(tradable / held * 100 - ratio) <= 0.015) circulation.push(ratio);
      }
    }
    // Only a self-contained, explicitly named tradable-ratio column is accepted.
    const ratioColumn = header.values.findIndex((cell) => /^(?:상장일|상장직후)?유통가능(?:주식수)?비율$/.test(cell));
    if (ratioColumn >= 0) for (const row of rows) {
      if (row.values[0] !== '합계' || row.values.length !== header.values.length) continue;
      const number = exactNumber(row.values[ratioColumn]); if (number && number <= 100) circulation.push(number);
    }
  });
  const demandTotal = uniqueValue(demandQuantities);
  for (const candidate of commitments) if (demandTotal && candidate.total === demandTotal) lockup.push(Math.round(candidate.committed / candidate.total * 10000) / 100);
  const result: DartFilingParseResult = { rcpNo, corpName: '' };
  const candidates = { confirmedPrice: uniqueValue(price), circulatingSupplyRate: uniqueValue(circulation), institutionalCompetitionRate: uniqueValue(competition), lockupCommitmentRate: uniqueValue(lockup) };
  for (const [key, value] of Object.entries(candidates)) if (value !== undefined) Object.assign(result, { [key]: value });
  const publishedAmbiguity = [price, competition, lockup].some((values) => values.length > 0 && uniqueValue(values) === undefined);
  const circulationAmbiguity = circulation.length > 0 && uniqueValue(circulation) === undefined;
  const publicationPending = pendingEvidence.length > 0 && !price.length && !competition.length && !lockup.length && !hasDemandResult;
  // A pre-pricing float discrepancy cannot invalidate an explicit publication wait.
  // Keep that float unassigned; conflicting published results still fail closed.
  const ambiguous = publishedAmbiguity || (circulationAmbiguity && !publicationPending);
  if (publicationPending && !ambiguous) result.publicationPending = {
    reason: '공시에서 수요예측 후 확정 공모가를 결정할 예정이라고 명시했습니다.',
    evidence: pendingEvidence[0], sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcpNo}`,
  };
  return { data: Object.keys(result).length > 2 ? result : null, ambiguous, publishedFacts: hasDemandResult || price.length > 0 || competition.length > 0 || lockup.length > 0 };
}

export function parseDartFilingBody(html: string, rcpNo: string): DartFilingParseResult | null {
  return inspectDartFilingBody(html, rcpNo).data;
}

function mergeDartFilingBodies(bodies: string[], rcpNo: string): DartFilingParseResult | null {
  const parts: DartFilingParseResult[] = [];
  let publishedFacts = false;
  for (const html of bodies) {
    const inspection = inspectDartFilingBody(html, rcpNo);
    if (inspection.ambiguous) return null;
    publishedFacts ||= inspection.publishedFacts;
    if (inspection.data) parts.push(inspection.data);
  }
  const merged: DartFilingParseResult = { rcpNo, corpName: '' };
  const fields = ['confirmedPrice', 'circulatingSupplyRate', 'institutionalCompetitionRate', 'lockupCommitmentRate'] as const;
  for (const field of fields) {
    const values = parts.flatMap(part => part[field] === undefined ? [] : [part[field]!]);
    const value = uniqueValue(values);
    if (values.length && value === undefined) return null;
    if (value !== undefined) merged[field] = value;
  }
  if (!publishedFacts) merged.publicationPending = parts.find(part => part.publicationPending)?.publicationPending;
  return Object.values(merged).some(value => typeof value === 'number') || merged.publicationPending ? merged : null;
}

/** Select offering-body nodes, never the amendment cover or an attachment. */
export async function parseConfirmedFilingDetails(rcpNo: string, options?: { fetcher?: typeof fetch; apiKey?: string }): Promise<DartFilingParseResult | null> {
  if (!/^\d{14}$/.test(rcpNo)) return null;
  const fetcher = options?.fetcher || fetch;
  const apiKey = options?.apiKey || process.env.DART_API_KEY;
  if (apiKey?.trim()) {
    try {
      const bodies = await fetchDartDocumentOffering(rcpNo, { apiKey, fetcher });
      // A valid current source containing conflicting or unextractable facts must not be bypassed.
      if (bodies) return mergeDartFilingBodies(bodies, rcpNo);
    } catch { /* The bounded viewer remains available after an API transport or format failure. */ }
  }
  const get = async (url: string, limit: number) => {
    // Preserve the existing character bound while bounding the complete UTF-8 stream.
    // Korean text can use three bytes per UTF-16 code unit.
    const { response, text } = await fetchOfficialText(url, { fetcher, maxBytes: limit * 3,
      init: { cache: 'no-store', headers: { 'User-Agent': 'IPOScore/1.0' } } });
    return response.status === 304 || text.length > limit ? null : text;
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
    const chosen = bodyNodes.length === 1 ? [bodyNodes[0]] : bodyNodes.length === 0 && confirmedNodes.length === 1 ? [confirmedNodes[0]] : [];
    if (!chosen.length && !bodyNodes.length && !confirmedNodes.length) {
      const general = eligible.filter((item) => /^(?:I|Ⅰ)[.．]?모집또는매출에관한일반사항$/.test(item.title));
      const risk = eligible.filter((item) => /^(?:III|Ⅲ)[.．]?투자위험요소$/.test(item.title));
      if (general.length === 1 && risk.length === 1 && general[0].dcmNo === risk[0].dcmNo) chosen.push(general[0], risk[0]);
    }
    if (!chosen.length) return null;
    const bodies: string[] = [];
    for (const selected of chosen) {
      const url = `https://dart.fss.or.kr/report/viewer.do?rcpNo=${rcpNo}&dcmNo=${selected.dcmNo}&eleId=${selected.eleId}&offset=${selected.offset}&length=${selected.length}&dtd=dart4.xsd`;
      const html = await get(url, 2_000_000);
      if (!html) return null;
      bodies.push(html);
    }
    return mergeDartFilingBodies(bodies, rcpNo);
  } catch { return null; }
}

export async function syncExistingIposWithDartFilings(options?: {
  days?: number;
  apiKey?: string;
  now?: Date;
  /** Monotonic elapsed time is separate from the KST date used to select filings. */
  monotonicNow?: () => number;
  timeBudgetMs?: number;
  fetcher?: typeof fetch;
  parseFiling?: (receiptNo: string) => Promise<DartFilingParseResult | null>;
}): Promise<{
  success: boolean;
  updatedCount: number;
  updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[];
  message: string;
  errors: { name?: string; receiptNo?: string; error: string }[];
  pendingCount: number;
  pendingStocks: { name: string; code: string; receiptNo: string; sourceUrl: string; reason: string; evidence: string }[];
  deferredCount: number;
  deferredStocks: { name: string; code: string; receiptNo: string; reason: string }[];
}> {
  const apiKey = options?.apiKey || process.env.DART_API_KEY;
  const failed = (message: string) => ({ success: false, updatedCount: 0, updatedStocks: [], pendingCount: 0, pendingStocks: [],
    deferredCount: 0, deferredStocks: [], message, errors: [{ error: message }] });
  if (!apiKey?.trim()) return failed('DART_API_KEY가 설정되지 않았습니다. 기존 수치를 유지합니다.');
  const monotonicNow = options?.monotonicNow || (() => performance.now());
  const budget = options?.timeBudgetMs ?? DART_METRIC_SYNC_BUDGET_MS;
  const started = monotonicNow();
  if (!Number.isFinite(budget) || budget < 0 || !Number.isFinite(started)) return failed('금융 원문 조회 시간 예산이 유효하지 않습니다. 기존 수치를 유지합니다.');
  const budgetExpired = () => {
    const current = monotonicNow();
    return !Number.isFinite(current) || current - started >= budget;
  };
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
      // Do not use a partial list to guess which filing is the latest for each company.
      if (page > 1 && budgetExpired()) return failed('금융 시간 예산 안에 DART 공시 목록 전체를 확인하지 못했습니다. 기존 수치를 유지하고 다음 실행에서 재시도합니다.');
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

  const awaitingListingResults = (ipo: ReturnType<typeof getAllIpos>[number]) => ipo.status === 'LISTED'
    || Boolean(ipo.listingDate && /^\d{4}-\d{2}-\d{2}$/.test(ipo.listingDate) && ipo.listingDate <= todayKst);
  // Recover the offer-price denominator for current/missed listings before spending the budget on future offerings.
  const allCurrentIpos = [...getAllIpos()].sort((first, second) => Number(awaitingListingResults(second)) - Number(awaitingListingResults(first)));
  const updatedStocks: { name: string; code: string; confirmedPrice?: number; circulatingRate?: number; competitionRate?: number }[] = [];
  const errors: { name?: string; receiptNo?: string; error: string }[] = [];
  const pendingStocks: { name: string; code: string; receiptNo: string; sourceUrl: string; reason: string; evidence: string }[] = [];
  const deferredStocks: { name: string; code: string; receiptNo: string; reason: string }[] = [];

  for (const ipo of allCurrentIpos) {
    // A displayed/stored LISTED state does not prove that listing results were collected.
    // Preserve completed records in full; incomplete listings can still recover their offer price.
    if (ipo.isCancelled || (finite(ipo.openingPrice) && ipo.openingPrice > 0
      && finite(ipo.closingPrice) && ipo.closingPrice > 0)) continue;

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
    if (budgetExpired()) {
      deferredStocks.push({ name: ipo.name, code: ipo.code, receiptNo: filing.rcept_no,
        reason: '이번 실행의 금융 원문 조회 시간 예산을 사용하여 다음 실행에서 재시도합니다.' });
      continue;
    }

      console.log(`[DartFilingSync] 확정 공시 감지 -> ${ipo.name} (${filing.report_nm}, rcpNo: ${filing.rcept_no})`);
      const parsed = await (options?.parseFiling ? options.parseFiling(filing.rcept_no) : parseConfirmedFilingDetails(filing.rcept_no, { fetcher }));
      const pending = parsed?.publicationPending;
      const hasPendingEvidence = Boolean(pending?.reason?.trim() && pending.evidence?.trim()
        && pending.sourceUrl === `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${filing.rcept_no}`);
      if (pending && hasPendingEvidence) {
        pendingStocks.push({ name: ipo.name, code: ipo.code, receiptNo: filing.rcept_no,
          sourceUrl: pending.sourceUrl, reason: pending.reason, evidence: pending.evidence });
      }
      if (!parsed || ![parsed.confirmedPrice, parsed.circulatingSupplyRate, parsed.institutionalCompetitionRate, parsed.lockupCommitmentRate]
        .some((value) => typeof value === 'number' && Number.isFinite(value))) {
        if (hasPendingEvidence) continue;
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
    success: errors.length === 0 && deferredStocks.length === 0,
    updatedCount: updatedStocks.length,
    updatedStocks,
    message: `DART 대조: 갱신 ${updatedStocks.length}건 · 발표 대기 ${pendingStocks.length}건 · 시간 예산 대기 ${deferredStocks.length}건 · 오류 ${errors.length}건`,
    errors,
    pendingCount: pendingStocks.length,
    pendingStocks,
    deferredCount: deferredStocks.length,
    deferredStocks,
  };
}
