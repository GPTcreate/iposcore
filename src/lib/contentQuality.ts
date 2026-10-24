import type { IpoItem } from '../types/ipo';

function isReceiptNumber(value: string | null): boolean {
  if (!value || !/^\d{14}$/.test(value)) return false;
  const dateString = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const date = new Date(`${dateString}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
}

/** A home page or search result is not evidence for a particular IPO. */
export function isSpecificOfficialSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (url.hostname === 'dart.fss.or.kr' && url.pathname === '/dsaf001/main.do') {
      return isReceiptNumber(url.searchParams.get('rcpNo'));
    }
    if (url.hostname === 'kind.krx.co.kr' && url.pathname === '/common/disclsviewer.do') {
      return isReceiptNumber(url.searchParams.get('acptno'));
    }
    return false;
  } catch {
    return false;
  }
}

function isValidReviewDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false;
  const date = new Date(value);
  const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(date.getTime())
    && Number.isFinite(calendarDate.getTime())
    && calendarDate.toISOString().slice(0, 10) === value.slice(0, 10)
    && date.getTime() <= Date.now();
}

/**
 * Reviewed is an explicit editorial assertion. Legacy entries are unverified.
 * URL validation checks the document identifier, not the remote document's contents.
 */
export function isReviewedIpo(ipo: Partial<IpoItem> | null | undefined): boolean {
  const quality = ipo?.dataQuality;
  return quality?.status === 'reviewed'
    && isValidReviewDate(quality.reviewedAt)
    && Array.isArray(quality.sources)
    && quality.sources.some((source) => typeof source?.title === 'string'
      && source.title.trim().length > 0
      && typeof source.url === 'string'
      && isSpecificOfficialSourceUrl(source.url));
}

/** Zero lockup is a valid disclosed result; missing or invalid ratios are not. */
export function hasVerifiedForecast(ipo: Partial<IpoItem> | null | undefined): boolean {
  if (!ipo || !isReviewedIpo(ipo)) return false;
  const positive = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) && value > 0;
  const percentage = (value: number | undefined, allowZero: boolean) => typeof value === 'number'
    && Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) && value <= 100;
  return positive(ipo.institutionalCompetitionRate)
    && percentage(ipo.lockupCommitmentRate, true)
    && percentage(ipo.circulatingSupplyRate, false)
    && positive(ipo.priceBandMin)
    && positive(ipo.priceBandMax)
    && ipo.priceBandMax! >= ipo.priceBandMin!
    && positive(ipo.confirmedPrice);
}
