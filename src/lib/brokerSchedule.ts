import { load } from 'cheerio';
import { KIS_IPO_INDEX, isKisNoticeUrl } from './officialSource';
export { KIS_IPO_INDEX, isKisNoticeUrl } from './officialSource';

export const BROKER_PARSER_VERSION = 'kis-schedule-v2';
export type ScheduleField = 'subscriptionStart' | 'subscriptionEnd' | 'refundDate' | 'listingDate';
export type OfficialField = ScheduleField | 'confirmedPrice';
export interface OfficialFacts {
  sourceUrl: string;
  sourceTitle: string;
  publishedAt: string;
  fields: Partial<Record<OfficialField, string | number>>;
  excerpts: Partial<Record<OfficialField, string>>;
}
export interface BrokerNotice { sourceUrl: string; title: string; publishedAt: string; company: string }
export const normalizeCompany = (name: string) => name.replace(/주식회사|\(주\)|㈜|\s+/g, '');
export function isIsoDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function companyFromTitle(title: string): string | undefined {
  const match = title.match(/^(.+?)\s+(?:확정\s*발행가액\s*공지\s*및\s*청약\s*안내|수요예측\s*(?:관련\s*)?공지|공모주\s*청약\s*안내|상장\s*(?:예정일|일정)\s*(?:변경\s*)?(?:안내|공지))\s*$/);
  return match ? normalizeCompany(match[1]) : undefined;
}
export function parseKisIndex(html: string): BrokerNotice[] {
  const $ = load(html);
  const table = $('#searchForm .tableDefault > table').filter((_, element) => $(element).find('thead th').toArray().map(th => $(th).text().trim()).join('|') === '번호|제목|작성자|등록일');
  if (table.length !== 1) throw new Error('한국투자증권 공지 목록 구조를 확인하지 못했습니다.');
  const notices: BrokerNotice[] = [];
  table.find('tbody tr').each((_, row) => {
    const cells = $(row).children('td');
    const link = cells.eq(1).find('a');
    const number = link.attr('href')?.match(/^javascript:goView\(['"](\d{1,8})['"]\);?$/)?.[1];
    const title = link.text().replace(/\s+/g, ' ').trim();
    const publishedAt = cells.eq(3).text().trim().replace(/\./g, '-');
    const company = companyFromTitle(title);
    if (number && company && isIsoDay(publishedAt)) notices.push({ company, title, publishedAt,
      sourceUrl: `${KIS_IPO_INDEX}?cmd=TF09ac010002&num=${number}` });
  });
  return notices;
}
function koreanDay(match: RegExpMatchArray): string | undefined {
  const day = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  return isIsoDay(day) ? day : undefined;
}
/** Only the issuer's own announcement body is evidence; institution terms are not retail terms. */
export function parseKisNotice(html: string, url: string, expectedCompany: string): OfficialFacts {
  if (!isKisNoticeUrl(url)) throw new Error('허용되지 않은 공식 공지 주소입니다.');
  const $ = load(html);
  const board = $('.boardView');
  const metadata = (label: string) => board.find('.board_table th').filter((_, th) => $(th).text().trim() === label).next('td').text().trim();
  const title = metadata('제목').replace(/\s+/g, ' ');
  const stamp = metadata('등록일').match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/);
  if (companyFromTitle(title) !== normalizeCompany(expectedCompany) || !stamp || !isIsoDay(`${stamp[1]}-${stamp[2]}-${stamp[3]}`)) throw new Error('공지 회사명 또는 등록일이 일치하지 않습니다.');
  const body = board.children('dd.bCon');
  if (board.length !== 1 || body.length !== 1) throw new Error('공식 공지 본문을 확인하지 못했습니다.');
  body.find('script,style').remove();
  const text = body.text().replace(/\s+/g, ' ').trim();
  const result: OfficialFacts = { sourceUrl: url, sourceTitle: title,
    publishedAt: `${stamp[1]}-${stamp[2]}-${stamp[3]}T${stamp[4]}:${stamp[5]}:00+09:00`, fields: {}, excerpts: {} };
  const listings = [...text.matchAll(/상장\s*(?:\(\s*예정\s*\)|예정)?\s*일(?:은|는|\s*[:：])\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g)];
  const dates = listings.map(koreanDay);
  if (dates.some(day => !day) || new Set(dates).size > 1) throw new Error('공식 공지 상장일이 모호합니다.');
  if (dates[0]) { result.fields.listingDate = dates[0]; result.excerpts.listingDate = listings[0][0]; }
  const prices = [...text.matchAll(/(?:확정\s*발행가액|확정\s*공모가(?:액|격)?)(?:\s*[:：]|은|는)?\s*([\d,]+)\s*원/g)];
  const values = prices.map(match => Number(match[1].replace(/,/g, '')));
  if (new Set(values).size > 1) throw new Error('공식 공지 확정가격이 모호합니다.');
  if (values[0] > 0) { result.fields.confirmedPrice = values[0]; result.excerpts.confirmedPrice = prices[0][0]; }
  if (/수요예측\s*(?:관련\s*)?공지$/.test(title)) {
    // The numbered IPO summary precedes institutional subscription/payment instructions.
    const summary = text.slice(0, 500).split(/수요예측에\s*관해|수요예측\s*실시일/)[0];
    const subscriptions = [...summary.matchAll(/(?:^|\s)2\.\s*청약일\s*[:：]\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(?:\([^)]+\))?\s*[~～]\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/g)];
    if (subscriptions.length > 1) throw new Error('공식 청약 일정이 모호합니다.');
    if (subscriptions[0]) {
      const match = subscriptions[0], start = koreanDay(match);
      const end = `${match[4] || match[1]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`;
      if (!start || !isIsoDay(end) || start > end) throw new Error('공식 청약 일정이 유효하지 않습니다.');
      result.fields.subscriptionStart = start; result.fields.subscriptionEnd = end;
      result.excerpts.subscriptionStart = result.excerpts.subscriptionEnd = match[0].trim();
    }
    const refunds = [...summary.matchAll(/(?:^|\s)3\.\s*납입\s*및\s*환불일\s*[:：]\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g)];
    if (refunds.length > 1 || refunds.some(match => !koreanDay(match))) throw new Error('공식 환불 일정이 모호합니다.');
    if (refunds[0]) { result.fields.refundDate = koreanDay(refunds[0]); result.excerpts.refundDate = refunds[0][0].trim(); }
  }
  // Do not derive retail subscription/refund dates from institution subscription/payment prose.
  if (!Object.keys(result.fields).length) throw new Error('지원하는 일정 또는 확정가격이 본문에 없습니다.');
  return result;
}
