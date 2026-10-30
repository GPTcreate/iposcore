import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';

export const DART_SCHEDULE_PARSER_VERSION = 'dart-schedule-v3';
export type DartScheduleField = 'subscriptionStart' | 'subscriptionEnd' | 'refundDate' | 'listingDate';
export interface DartScheduleResult {
  receiptNo: string;
  bodyReceiptNo?: string;
  sourceUrl: string;
  status: 'parsed' | 'pending' | 'ambiguous' | 'error';
  fields: Partial<Record<DartScheduleField, string>>;
  evidence: Partial<Record<DartScheduleField, { excerpt: string }>>;
  pendingFields?: 'listingDate'[];
  requestCount: number;
  error?: string;
}

const compact = (value: string) => value.replace(/\s+/g, '');
const sourceUrl = (receiptNo: string) => `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receiptNo}`;
const validDate = (value: string) => /^20\d{2}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const validReceipt = (value: string) => /^\d{14}$/.test(value)
  && validDate(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`);
function empty(receiptNo: string, status: DartScheduleResult['status'], error?: string): DartScheduleResult {
  return { receiptNo, sourceUrl: sourceUrl(receiptNo), status, fields: {}, evidence: {}, requestCount: 0, ...(error ? { error } : {}) };
}

function dates(value: string): string[] {
  const text = compact(value);
  const result: string[] = [];
  for (const match of text.matchAll(/(?<!\d)(20\d{2})(?:[./-](\d{1,2})[./-](\d{1,2})|년(\d{1,2})월(\d{1,2})일?)(?!\d)/g)) {
    result.push(`${match[1]}-${(match[2] || match[4]).padStart(2, '0')}-${(match[3] || match[5]).padStart(2, '0')}`);
  }
  return result;
}

function label(value: string): string {
  return compact(value).replace(/\(주\d+\)|주\d+\)|[:：]/g, '').replace(/[()]/g, '');
}
const subscriptionLabel = /^(?:일반(?:투자자|청약자)?|일반청약)?청약(?:기일|일|기간|예정일)$/;
const startLabel = /^(?:일반(?:투자자|청약자)?|일반청약)?청약(?:개시일|시작일)$/;
const endLabel = /^(?:일반(?:투자자|청약자)?|일반청약)?청약(?:종료일|마감일)$/;
const refundLabel = /^(?:(?:청약증거금)?환불(?:예정)?(?:일|기일)|환불및납입일|납입및환불일)$/;
const listingLabel = /^(?:신규)?상장(?:예정)?(?:일|일자)$/;
const scheduleText = /청약(?:기일|일|기간|개시일|시작일|종료일|마감일)|환불|상장(?:예정)?일/;

/** Extract only explicitly labelled schedule cells; no payment-date or IPO-date inference. */
export function parseDartScheduleBody(html: string, receiptNo: string): DartScheduleResult {
  if (!validReceipt(receiptNo)) return empty(receiptNo, 'error', '유효하지 않은 DART 접수번호입니다.');
  if (html.length > 2_000_000) return empty(receiptNo, 'error', '공시 본문 크기 제한을 초과했습니다.');
  const $ = load(html, { xml: { xmlMode: false, decodeEntities: true, withStartIndices: true } });
  $('script,style').remove();
  const text = (node: AnyNode) => $(node).text().replace(/\s+/g, ' ').trim();
  const markers: { at: number; before: boolean }[] = [];
  $('p,td,th').each((_, node) => {
    const value = label(text(node));
    if (/^정정[전후]$/.test(value) && node.startIndex !== null) markers.push({ at: node.startIndex!, before: value === '정정전' });
  });
  markers.sort((first, second) => first.at - second.at);
  const current = (node: AnyNode) => {
    const own = compact(text(node));
    if (own.includes('정정전') && !own.includes('정정후')) return false;
    const marker = markers.filter((item) => item.at < (node.startIndex ?? -1)).at(-1);
    return !marker?.before;
  };
  const candidates: Partial<Record<DartScheduleField, { value: string; excerpt: string }[]>> = {};
  const pendingListingEvidence: string[] = [];
  let ambiguous = false;
  const add = (field: DartScheduleField, value: string, excerpt: string) => {
    if (!validDate(value)) { ambiguous = true; return; }
    (candidates[field] ||= []).push({ value, excerpt: excerpt.slice(0, 320) });
  };
  $('table').each((_, table) => {
    const tableText = compact(text(table));
    if (tableText.includes('정정전') && tableText.includes('정정후')) {
      // The amendment index often only points to before/after sections below it.
      // A side-by-side table containing actual schedule dates is ambiguous.
      if ($(table).find('tr').toArray().some((row) => scheduleText.test(compact(text(row)))
        && $(row).children('td,th').toArray().some((cell) => dates(text(cell)).length > 0))) ambiguous = true;
      return;
    }
    if (!current(table) || $(table).find('table').length) return;
    type Cell = { node: AnyNode; value: string };
    const grid: Cell[][] = [];
    let validGrid = true;
    const rows = $(table).find('tr').filter((_, row) => $(row).closest('table')[0] === table).toArray();
    if (rows.length > 256) return;
    rows.forEach((row, y) => {
      grid[y] ||= [];
      let x = 0;
      for (const node of $(row).children('td,th').toArray()) {
        while (grid[y][x]) x++;
        const across = Number($(node).attr('colspan')) || 1, down = Number($(node).attr('rowspan')) || 1;
        if (!Number.isInteger(across) || !Number.isInteger(down) || across < 1 || across > 16 || down < 1 || down > 64 || x + across > 32 || y + down > 256) {
          validGrid = false; break;
        }
        const cell = { node, value: text(node) };
        for (let nextY = y; nextY < y + down; nextY++) for (let nextX = x; nextX < x + across; nextX++) {
          grid[nextY] ||= [];
          if (grid[nextY][nextX]) validGrid = false;
          grid[nextY][nextX] = cell;
        }
        x += across;
      }
    });
    if (!validGrid) return;
    // DART's standard short schedule table places field names in a header row
    // and all dates in the following row. Read only the date in that column.
    const headerAt = grid.findIndex((row, index) => index < 3
      && row.some((cell) => subscriptionLabel.test(label(cell.value)))
      && row.some((cell) => /^(?:납입기일|청약공고일|배정공고일|배정기준일)$/.test(label(cell.value))
        || refundLabel.test(label(cell.value)) || listingLabel.test(label(cell.value))));
    if (headerAt >= 0) {
      const header = grid[headerAt];
      for (const values of grid.slice(headerAt + 1)) {
        if (values.length !== header.length || values.some((cell) => subscriptionLabel.test(label(cell.value)))) continue;
        for (let column = 0; column < header.length; column++) {
          const fieldLabel = label(header[column].value), cell = values[column];
          if (!cell || !current(cell.node)) continue;
          const valuesAtCell = dates(cell.value), excerpt = `${header[column].value} | ${cell.value}`;
          if (subscriptionLabel.test(fieldLabel)) {
            if (valuesAtCell.length === 2) { add('subscriptionStart', valuesAtCell[0], excerpt); add('subscriptionEnd', valuesAtCell[1], excerpt); }
            else if (valuesAtCell.length > 2) ambiguous = true;
          } else if (refundLabel.test(fieldLabel) || listingLabel.test(fieldLabel)) {
            if (valuesAtCell.length === 1) add(refundLabel.test(fieldLabel) ? 'refundDate' : 'listingDate', valuesAtCell[0], excerpt);
            else if (valuesAtCell.length > 1) ambiguous = true;
          }
        }
      }
    }
    const hasGeneralRows = grid.some((row) => row.some((cell) => /^(?:일반청약자|일반투자자|일반청약)$/.test(label(cell.value))));
    for (const row of grid) {
      const cells = [...new Set(row)].filter((cell) => current(cell.node));
      if (!cells.length) continue;
      const labels = cells.map((cell) => label(cell.value));
      const excerpt = cells.map((cell) => cell.value).join(' | ');
      const dateValues = cells.flatMap((cell) => dates(cell.value));
      const general = labels.some((value) => /^(?:일반청약자|일반투자자|일반청약)$/.test(value));
      const otherCategory = labels.some((value) => /우리사주|기관투자자|전문투자자/.test(value));
      // A general-investor row can inherit 청약기일 through a rowspan.
      const subscription = labels.some((value) => subscriptionLabel.test(value))
        || general && /청약(?:기일|일|기간|개시일|시작일|종료일|마감일)/.test(tableText);
      if (subscription && !otherCategory && (general || !hasGeneralRows)) {
        if (dateValues.length === 2) { add('subscriptionStart', dateValues[0], excerpt); add('subscriptionEnd', dateValues[1], excerpt); }
        else if (dateValues.length > 2) ambiguous = true;
        // In the detailed table each general-investor date occupies its own
        // row, beneath the same 청약기일/general-investor rowspan cells.
        else if (dateValues.length === 1 && general) {
          if (labels.includes('개시일')) add('subscriptionStart', dateValues[0], excerpt);
          if (labels.includes('종료일')) add('subscriptionEnd', dateValues[0], excerpt);
        }
      }
      const single = (pattern: RegExp, field: DartScheduleField) => {
        if (!labels.some((value) => pattern.test(value))) return;
        if (dateValues.length === 1) add(field, dateValues[0], excerpt);
        else if (dateValues.length > 1) ambiguous = true;
      };
      if (!otherCategory && (general || !hasGeneralRows)) { single(startLabel, 'subscriptionStart'); single(endLabel, 'subscriptionEnd'); }
      single(refundLabel, 'refundDate');
      single(listingLabel, 'listingDate');
    }
  });
  $('p,td').each((_, node) => {
    if (!current(node) || $(node).parents('table').toArray().some((table) => {
      const value = compact(text(table)); return value.includes('정정전') && value.includes('정정후');
    })) return;
    const value = text(node);
    if (value.includes('정정 전') && value.includes('정정 후')) return;
    // This is an explicit retail surplus refund statement, not a payment-date inference.
    const refunds = [...value.matchAll(/초과\s*청약증거금[^.!?]{0,180}?(20\d{2}년\s*\d{1,2}월\s*\d{1,2}일)(?:\s*\([^)]{0,8}\))?\s*\)?\s*에\s*환불합니다/g)];
    for (const match of refunds) {
      const values = dates(match[1]);
      if (values.length === 1) add('refundDate', values[0], match[0]);
    }
    const pending = value.match(/주권의\s*신규상장\s*및\s*매매개시일은\s*아직\s*확정되지\s*않았으며[^.]{0,160}/);
    if (pending) pendingListingEvidence.push(pending[0].slice(0, 240));
  });
  const result = empty(receiptNo, 'pending');
  for (const field of ['subscriptionStart', 'subscriptionEnd', 'refundDate', 'listingDate'] as const) {
    const values = candidates[field] || [];
    if (new Set(values.map((item) => item.value)).size > 1) ambiguous = true;
    if (values[0]) { result.fields[field] = values[0].value; result.evidence[field] = { excerpt: values[0].excerpt }; }
  }
  const ordered = [result.fields.subscriptionStart, result.fields.subscriptionEnd, result.fields.refundDate, result.fields.listingDate].filter((value): value is string => !!value);
  if (ordered.some((value, index) => index > 0 && ordered[index - 1] > value)) ambiguous = true;
  if (pendingListingEvidence.length && result.fields.listingDate) ambiguous = true;
  if (ambiguous) return empty(receiptNo, 'ambiguous');
  if (pendingListingEvidence[0]) {
    result.pendingFields = ['listingDate'];
    result.evidence.listingDate = { excerpt: pendingListingEvidence[0] };
  }
  if (Object.keys(result.fields).length) result.status = 'parsed';
  return result;
}

type ViewerNode = { title: string; dcmNo?: string; eleId?: string; offset?: string; length?: string; dtd?: string; rcpNo?: string };

function offeringNodes(main: string, receiptNo: string): { eligible: ViewerNode[]; choices: ViewerNode[] } {
  const nodes: ViewerNode[] = [];
  let node: ViewerNode | undefined;
  for (const match of main.matchAll(/node\d+\['(text|dcmNo|eleId|offset|length|dtd|rcpNo)'\]\s*=\s*['"]([^'"\r\n]*)['"]/g)) {
    const [, key, value] = match;
    if (key === 'text') { if (node) nodes.push(node); node = { title: compact(value) }; }
    else if (node) Object.assign(node, { [key]: value });
  }
  if (node) nodes.push(node);
  const eligible = nodes.filter((item) => (!item.rcpNo || item.rcpNo === receiptNo) && /^\d{1,20}$/.test(item.dcmNo || '')
    && /^\d{1,8}$/.test(item.eleId || '') && /^\d{1,12}$/.test(item.offset || '') && /^\d{1,8}$/.test(item.length || '')
    && Number(item.length) > 0 && Number(item.length) <= 2_000_000 && item.dtd === 'dart4.xsd');
  const general = eligible.filter((item) => /^(?:I|Ⅰ|1)[.．]?모집또는매출에관한일반사항$/.test(item.title));
  const body = eligible.filter((item) => /^(?:제1부)?모집또는매출에관한사항$/.test(item.title));
  const confirmed = eligible.filter((item) => item.title === '증권발행조건확정');
  return { eligible, choices: general.length ? general : body.length ? body : confirmed };
}

function mainIdentity(main: string): string | undefined {
  const $ = load(main);
  const identities = $('[onclick]').toArray().flatMap((node) => {
    const code = $(node).attr('onclick')?.match(/^openCorpInfoNew\(['"](\d{8})['"],/)?.[1];
    const name = compact($(node).text().normalize('NFKC')).replace(/주식회사|\(주\)|㈜/g, '');
    return code && name ? [`${code}:${name}`] : [];
  });
  return new Set(identities).size === 1 ? identities[0] : undefined;
}

/** Follow only DART's explicitly selected attachment-to-body relation, never search older filings. */
function attachmentBodyReceipt(main: string, receiptNo: string, eligible: ViewerNode[]): string | undefined {
  const $ = load(main), selected = $('#att option[selected]');
  if (selected.length !== 1 || $('#att').length !== 1 || $('#family').length !== 1 || !mainIdentity(main)) return undefined;
  const attachment = selected.attr('value')?.match(/^rcpNo=(\d{14})&dcmNo=(\d{1,20})$/);
  if (!attachment || attachment[1] !== receiptNo || !eligible.some(node => node.dcmNo === attachment[2])) return undefined;
  const receipts = $('#family option').toArray().flatMap((node) => {
    if (compact($(node).attr('title') || '') !== '증권신고서(지분증권)') return [];
    const value = $(node).attr('value')?.match(/^rcpNo=(\d{14})$/)?.[1];
    return value && validReceipt(value) ? [value] : [];
  });
  // A future relation means this is not a self-contained latest-filing snapshot.
  if (receipts.some(value => value >= receiptNo)) return undefined;
  return [...new Set(receipts)].sort().at(-1);
}

/** Two requests normally; an authenticated attachment-to-body relation allows one extra main page. */
export async function fetchDartSchedule(receiptNo: string, options: { fetcher?: typeof fetch; maxRequests?: number } = {}): Promise<DartScheduleResult> {
  if (!validReceipt(receiptNo)) return empty(receiptNo, 'error', '유효하지 않은 DART 접수번호입니다.');
  const fetcher = options.fetcher || fetch;
  const budget = Math.max(0, Math.min(3, Math.floor(options.maxRequests ?? 3)));
  let requestCount = 0;
  const get = async (url: string, limit: number): Promise<string> => {
    if (requestCount >= budget) throw new Error('공시 요청 예산을 초과했습니다.');
    requestCount++;
    const response = await fetcher(url, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000), headers: { 'User-Agent': 'IPOScore/1.0' } });
    if (!response.ok || response.status >= 300 || response.headers.get('location')) throw new Error('공시 조회 또는 리다이렉트가 거부되었습니다.');
    if (response.url && response.url !== url) throw new Error('공시 응답 주소가 요청과 다릅니다.');
    const declared = Number(response.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > limit) throw new Error('공시 응답 크기 제한을 초과했습니다.');
    if (!response.body) return '';
    const reader = response.body.getReader(), chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > limit) { await reader.cancel(); throw new Error('공시 응답 크기 제한을 초과했습니다.'); }
      chunks.push(next.value);
    }
    const body = new Uint8Array(bytes);
    let at = 0;
    for (const chunk of chunks) { body.set(chunk, at); at += chunk.byteLength; }
    return new TextDecoder().decode(body);
  };
  try {
    const main = await get(sourceUrl(receiptNo), 1_000_000);
    let { eligible, choices } = offeringNodes(main, receiptNo);
    let bodyReceiptNo = receiptNo;
    if (!choices.length) {
      const linkedReceipt = attachmentBodyReceipt(main, receiptNo, eligible);
      if (linkedReceipt) {
        const bodyMain = await get(sourceUrl(linkedReceipt), 1_000_000);
        if (!mainIdentity(bodyMain) || mainIdentity(bodyMain) !== mainIdentity(main)) throw new Error('본문 법인 불일치');
        bodyReceiptNo = linkedReceipt;
        ({ eligible, choices } = offeringNodes(bodyMain, bodyReceiptNo));
      }
    }
    if (choices.length !== 1) return { ...empty(receiptNo, choices.length ? 'ambiguous' : 'error',
      choices.length ? undefined : '유효한 DART 모집 본문을 확인하지 못했습니다. 기존 일정을 유지합니다.'), requestCount };
    const selected = choices[0];
    const url = `https://dart.fss.or.kr/report/viewer.do?rcpNo=${bodyReceiptNo}&dcmNo=${selected.dcmNo}&eleId=${selected.eleId}&offset=${selected.offset}&length=${selected.length}&dtd=dart4.xsd`;
    const result = parseDartScheduleBody(await get(url, 2_000_000), bodyReceiptNo);
    return { ...result, receiptNo, ...(bodyReceiptNo !== receiptNo ? { bodyReceiptNo } : {}), requestCount };
  } catch {
    return { ...empty(receiptNo, 'error', 'DART 일정 원문을 안전하게 조회하지 못했습니다. 기존 일정을 유지합니다.'), requestCount };
  }
}
