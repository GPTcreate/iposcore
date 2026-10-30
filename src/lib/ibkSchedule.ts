import { load } from 'cheerio';
import { isIsoDay, normalizeCompany } from './brokerSchedule';
import type { BrokerNotice, OfficialFacts, ScheduleField } from './brokerSchedule';

export const IBK_IPO_INDEX = 'https://www.ibks.com/hts/hts_noticelist.do?popup=Y';
export const IBK_PARSER_VERSION = 'ibk-schedule-v1';
const DETAIL = 'https://www.ibks.com/hts/hts_noticeview.do';
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
const compact = (value: string) => value.replace(/\s+/g, '');

export function isIbkNoticeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === 'https://www.ibks.com' && url.pathname === '/hts/hts_noticeview.do'
      && !url.username && !url.password && !url.hash && !url.port
      && [...url.searchParams.keys()].length === 1 && /^\d{1,8}$/.test(url.searchParams.get('seq') || '');
  } catch { return false; }
}

function companyFromTitle(title: string): string | undefined {
  const match = title.match(/^(.+?)\s+(?:코스닥|유가증권)(?:시장)?\s*상장\s*공모주\s*청약\s*안내$/);
  return match ? normalizeCompany(match[1]) : undefined;
}
function stamp(value: string): string | undefined {
  const match = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+\(?(\d{2}):(\d{2})\)?$/);
  if (!match || !isIsoDay(`${match[1]}-${match[2]}-${match[3]}`) || Number(match[4]) > 23 || Number(match[5]) > 59) return undefined;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00+09:00`;
}

/** The transport must decode the broker's EUC-KR response before calling this parser. */
export function parseIbkIndex(html: string): BrokerNotice[] {
  if (html.length > 2_000_000) throw new Error('IBK 공지 목록 크기 제한을 초과했습니다.');
  const $ = load(html);
  const table = $('table.list.tbl_type1[summary="공지사항"]').filter((_, element) => $(element).find('thead th')
    .toArray().map(th => clean($(th).text())).join('|') === '번호|제목|등록일|조회수');
  if (table.length !== 1) throw new Error('IBK 공지 목록 구조를 확인하지 못했습니다.');
  const notices: BrokerNotice[] = [];
  table.find('tbody tr').each((_, row) => {
    const link = $(row).children('td.td_type_sub').find('a');
    const seq = link.attr('onclick')?.match(/^ibkisNoticeView\(['"](\d{1,8})['"]\);?$/)?.[1];
    const title = clean(link.text()), company = companyFromTitle(title);
    const publishedAt = stamp(clean($(row).children('td.td_type_day').text()));
    if (link.length === 1 && seq && company && publishedAt) notices.push({ title, company, publishedAt, sourceUrl: `${DETAIL}?seq=${seq}` });
  });
  return notices;
}

function day(year: string, month: string, date: string): string {
  const value = `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`;
  if (!isIsoDay(value)) throw new Error('IBK 공지 일정의 날짜가 유효하지 않습니다.');
  return value;
}
const SINGLE_DAY = /^(20\d{2})년(\d{1,2})월(\d{1,2})일(?:\([월화수목금토일]\))?(?:\(예정\))?$/;
const RANGE = /^(20\d{2})년(\d{1,2})월(\d{1,2})일(?:\([월화수목금토일]\))?[~～∼〜-](?:(20\d{2})년)?(\d{1,2})월(\d{1,2})일(?:\([월화수목금토일]\))?(?:\(예정\))?$/;

function issuerCode(rows: string[][], expectedCompany: string): string | undefined {
  const identities = rows.filter(row => row.length === 2 && compact(row[0]) === '종목명(종목코드)');
  const codePattern = /\s*\(\s*A?([0-9A-Z]{6})\s*\)\s*$/;
  if (identities.length !== 1 || normalizeCompany(identities[0][1].replace(codePattern, '')) !== normalizeCompany(expectedCompany)) {
    throw new Error('IBK 공지 본문의 종목명이 일치하지 않습니다.');
  }
  return identities[0][1].match(codePattern)?.[1];
}

/** Optional KRX short code from the same explicitly named issuer row. */
export function extractIbkStockCode(html: string, expectedCompany: string): string | undefined {
  if (html.length > 2_000_000) throw new Error('IBK 공지 본문 크기 제한을 초과했습니다.');
  const $ = load(html), board = $('#content .board_view'), title = board.find('.view_box_t1 .tt_txt1');
  const body = board.find('.view_box_txt2 .hwp_editor_board_content');
  if (board.length !== 1 || title.length !== 1 || body.length !== 1 || companyFromTitle(clean(title.text())) !== normalizeCompany(expectedCompany)) {
    throw new Error('IBK 공지 회사명 또는 본문이 일치하지 않습니다.');
  }
  body.find('script,style').remove();
  return issuerCode(body.find('tr').toArray().map(row => $(row).children('td,th').toArray().map(cell => clean($(cell).text()))), expectedCompany);
}

/** Read exact schedule rows for the named issuer; payment and institution terms are excluded. */
export function parseIbkNotice(html: string, url: string, expectedCompany: string): OfficialFacts {
  if (!isIbkNoticeUrl(url)) throw new Error('허용되지 않은 IBK 공식 공지 주소입니다.');
  if (html.length > 2_000_000) throw new Error('IBK 공지 본문 크기 제한을 초과했습니다.');
  const $ = load(html), board = $('#content .board_view');
  const titleNode = board.find('.view_box_t1 .tt_txt1');
  const dateNode = board.find('.right_box .tt').filter((_, element) => clean($(element).text()) === '등록일');
  const title = clean(titleNode.text()), publishedAt = stamp(clean(dateNode.next('.tt_txt').text()));
  const body = board.find('.view_box_txt2 .hwp_editor_board_content');
  if (board.length !== 1 || titleNode.length !== 1 || dateNode.length !== 1 || body.length !== 1
    || companyFromTitle(title) !== normalizeCompany(expectedCompany) || !publishedAt) throw new Error('IBK 공지 회사명, 등록일 또는 본문이 일치하지 않습니다.');
  body.find('script,style').remove();
  const rows = body.find('tr').toArray().map(row => $(row).children('td,th').toArray().map(cell => clean($(cell).text())));
  issuerCode(rows, expectedCompany);
  const result: OfficialFacts = { sourceUrl: url, sourceTitle: title, publishedAt, fields: {}, excerpts: {} };
  const add = (field: ScheduleField, value: string, excerpt: string) => {
    if (result.fields[field] !== undefined && result.fields[field] !== value) throw new Error('IBK 공식 공지 일정이 상충합니다.');
    result.fields[field] = value;
    result.excerpts[field] = excerpt.slice(0, 320);
  };
  for (const row of rows) {
    if (row.length !== 2) continue;
    const label = compact(row[0]).replace(/[()]/g, ''), value = compact(row[1]), excerpt = `${row[0]} | ${row[1]}`;
    if (/^청약(?:일|기간)$/.test(label)) {
      const match = value.match(RANGE);
      if (!match) throw new Error('IBK 공지 청약기간을 명확히 확인하지 못했습니다.');
      add('subscriptionStart', day(match[1], match[2], match[3]), excerpt);
      add('subscriptionEnd', day(match[4] || match[1], match[5], match[6]), excerpt);
    } else if (/^(?:환불일|상장(?:예정)?일)$/.test(label)) {
      const field = label === '환불일' ? 'refundDate' : 'listingDate';
      if (/^(?:미정|미확정|추후확정|추후공지)$/.test(value)) {
        if (field === 'listingDate') result.pendingFields = ['listingDate'];
        continue;
      }
      const match = value.match(SINGLE_DAY);
      if (!match) throw new Error('IBK 공지 환불일 또는 상장일을 명확히 확인하지 못했습니다.');
      add(field, day(match[1], match[2], match[3]), excerpt);
    }
  }
  if (result.pendingFields?.length && result.fields.listingDate) throw new Error('IBK 공지 상장일의 확정 여부가 상충합니다.');
  const dates = [result.fields.subscriptionStart, result.fields.subscriptionEnd, result.fields.refundDate, result.fields.listingDate].filter(isIsoDay);
  if (!Object.keys(result.fields).length || dates.some((value, index) => index > 0 && value < dates[index - 1])) throw new Error('IBK 공지 일정이 없거나 순서가 모순됩니다.');
  return result;
}
