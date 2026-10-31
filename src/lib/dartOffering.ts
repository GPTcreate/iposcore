import type { CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';

export interface DartOfferingTerms {
  offeringShareCount?: number;
  totalOfferingAmount?: number;
  confirmedPrice?: number;
  ambiguous: boolean;
  excerpt?: string;
}
const compact = (value: string) => value.normalize('NFKC').replace(/\s+/g, '');
const header = (value: string) => compact(value).replace(/[()]/g, '');
const columns = ['증권의종류', '증권수량', '액면가액', '모집매출가액', '모집매출총액', '모집매출방법'];
function positiveInteger(value: string): number | undefined {
  const text = compact(value);
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return undefined;
  const number = Number(text.replace(/,/g, ''));
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
}

/** Exact current public-offering rows, bound to a separately established current confirmed offer price. Amounts are in 억원. */
export function inspectDartOfferingTerms($: CheerioAPI, current: (node: AnyNode) => boolean, currentConfirmedPrice?: number): DartOfferingTerms {
  if (!Number.isSafeInteger(currentConfirmedPrice) || !currentConfirmedPrice || currentConfirmedPrice <= 0) return { ambiguous: false };
  const candidates: { shares: number; price: number; total: number; excerpt: string }[] = [];
  let ambiguous = false;
  $('table').each((_, table) => {
    if (!current(table)) return;
    const rows = $(table).find('tr').filter((_, row) => $(row).closest('table')[0] === table).toArray();
    const first = rows[0];
    if (!first) return;
    const cells = $(first).children('th,td').toArray();
    if (cells.length !== columns.length || cells.some((cell, index) => header($(cell).text()) !== columns[index]
      || Number($(cell).attr('colspan') || 1) !== 1 || Number($(cell).attr('rowspan') || 1) !== 1)) return;

    // Only a nearby explicit unit declaration is relevant; never reinterpret a 천원/백만원 table as 원.
    const contexts = [...$(table).children('caption').toArray(), ...$(table).prevAll('p').slice(0, 4).toArray()]
      .filter(node => current(node)).map(node => compact($(node).text()));
    const unit = contexts.map(value => value.match(/단위[:：]?([^)]{1,40})/)?.[1]).find(Boolean);
    const wrongUnits = !!unit && /(?:천|백만|천만|억|만)원|달러|USD|EUR|엔/.test(unit);

    for (const row of rows.slice(1)) {
      if (!current(row)) continue;
      const rowCells = $(row).children('td,th').toArray();
      if (rowCells.length !== columns.length || rowCells.some(cell => Number($(cell).attr('colspan') || 1) !== 1
        || Number($(cell).attr('rowspan') || 1) !== 1)) continue;
      const values = rowCells.map(cell => compact($(cell).text()));
      if (!['보통주', '기명식보통주'].includes(values[0]) || values[5] !== '일반공모') continue;
      const shares = positiveInteger(values[1]), par = positiveInteger(values[2]), price = positiveInteger(values[3]), total = positiveInteger(values[4]);
      // Ranges, blanks and unresolved terms are not confirmed facts.
      if (shares === undefined || par === undefined || price === undefined || total === undefined) continue;
      const calculated = shares * price;
      if (wrongUnits || price !== currentConfirmedPrice || !Number.isSafeInteger(calculated) || calculated !== total) {
        ambiguous = true;
        continue;
      }
      candidates.push({ shares, price, total,
        excerpt: `보통주 일반공모 | 증권수량 ${values[1]}주 | 모집(매출)가액 ${values[3]}원 | 모집(매출)총액 ${values[4]}원` });
    }
  });
  const unique = new Map(candidates.map(candidate => [`${candidate.shares}:${candidate.price}:${candidate.total}`, candidate]));
  if (ambiguous || unique.size > 1) return { ambiguous: true };
  const accepted = unique.values().next().value;
  return accepted ? { offeringShareCount: accepted.shares, totalOfferingAmount: accepted.total / 100_000_000,
    confirmedPrice: accepted.price, ambiguous: false, excerpt: accepted.excerpt } : { ambiguous: false };
}
