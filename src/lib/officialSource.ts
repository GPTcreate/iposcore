/** Pure URL policy shared by browser views and server-only source collectors. */
export const KIS_IPO_INDEX = 'https://www.truefriend.com/main/research/corporate/ipo/Pre01.jsp';
export function isKisNoticeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === 'https://www.truefriend.com' && url.pathname === '/main/research/corporate/ipo/Pre01.jsp'
      && !url.username && !url.password && url.searchParams.get('cmd') === 'TF09ac010002'
      && /^\d{1,8}$/.test(url.searchParams.get('num') || '') && [...url.searchParams.keys()].length === 2;
  } catch { return false; }
}
