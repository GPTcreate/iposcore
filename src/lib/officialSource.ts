/** Pure URL policy shared by browser views and server-only source collectors. */
export const KRX_COMPANY_LIST = 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13';
/** Exact corporate identity, including the conventional SPAC short name. No fuzzy matching. */
export function normalizeListingCompany(value: string): string {
  return value.normalize('NFKC').replace(/주식회사|\(주\)|㈜/g, '').replace(/기업인수목적|SPAC/gi, '스팩')
    .replace(/[\s()]/g, '').toLowerCase();
}
export const KIS_IPO_INDEX = 'https://www.truefriend.com/main/research/corporate/ipo/Pre01.jsp';
export function isKisNoticeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === 'https://www.truefriend.com' && url.pathname === '/main/research/corporate/ipo/Pre01.jsp'
      && !url.username && !url.password && url.searchParams.get('cmd') === 'TF09ac010002'
      && /^\d{1,8}$/.test(url.searchParams.get('num') || '') && [...url.searchParams.keys()].length === 2;
  } catch { return false; }
}
export function isIbkNoticeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === 'https://www.ibks.com' && url.pathname === '/hts/hts_noticeview.do'
      && !url.username && !url.password && !url.hash && !url.port && /^\d{1,8}$/.test(url.searchParams.get('seq') || '')
      && [...url.searchParams.keys()].length === 1;
  } catch { return false; }
}
