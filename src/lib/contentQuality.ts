import type { IpoEvidenceField, IpoFieldEvidence, IpoItem } from '../types/ipo';

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

function isValidReviewDate(value: string | undefined, requireTimestamp = false): boolean {
  const timestamp = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
  if (!value || !(timestamp.test(value) || (!requireTimestamp && /^\d{4}-\d{2}-\d{2}$/.test(value)))) return false;
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

export type EvidenceField = IpoEvidenceField;
export type FieldEvidence = IpoFieldEvidence;
export type FieldEvidenceMap = NonNullable<IpoItem['fieldEvidence']>;
type EvidenceInput = Partial<IpoItem>;

const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const percentage = (value: unknown, allowZero: boolean): value is number => typeof value === 'number'
  && Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) && value <= 100;

/** Only the three inputs used by the scoring formula determine calculability. */
export function hasScorableForecast(ipo: Partial<IpoItem> | null | undefined): boolean {
  return !!ipo && (ipo.pendingForecastFields === undefined
    || (Array.isArray(ipo.pendingForecastFields) && ipo.pendingForecastFields.length === 0))
    && positive(ipo.institutionalCompetitionRate)
    && percentage(ipo.lockupCommitmentRate, true) && percentage(ipo.circulatingSupplyRate, false);
}

export const hasScorableMetrics = hasScorableForecast;

/** An item-level audit does not silently create a field-specific source record. */
export function getFieldEvidence(ipo: EvidenceInput | null | undefined, field: EvidenceField): FieldEvidence | undefined {
  const evidence = ipo?.fieldEvidence?.[field];
  return evidence && typeof evidence.sourceTitle === 'string' && evidence.sourceTitle.trim().length > 0
    && typeof evidence.sourceUrl === 'string' && isSpecificOfficialSourceUrl(evidence.sourceUrl)
    && isValidReviewDate(evidence.checkedAt, true) ? evidence : undefined;
}

function hasValidFieldValue(ipo: EvidenceInput, field: EvidenceField): boolean {
  if (ipo.pendingForecastFields !== undefined && (!Array.isArray(ipo.pendingForecastFields)
    || ipo.pendingForecastFields.some((pending) => pending === field))) return false;
  const value = ipo[field];
  if (field === 'institutionalCompetitionRate' || field === 'confirmedPrice') return positive(value);
  if (field === 'lockupCommitmentRate') return percentage(value, true);
  if (field === 'circulatingSupplyRate') return percentage(value, false);
  if (field === 'depositRatePercent') return percentage(value, false);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function hasVerifiedField(ipo: EvidenceInput | null | undefined, field: EvidenceField): boolean {
  return !!ipo && hasValidFieldValue(ipo, field) && (isReviewedIpo(ipo) || !!getFieldEvidence(ipo, field));
}

/** Verification labels provenance separately from whether registered inputs can be scored. */
export function hasVerifiedForecast(ipo: EvidenceInput | null | undefined): boolean {
  return hasScorableForecast(ipo) && !!ipo && (isReviewedIpo(ipo)
    || (['institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate'] as const)
      .every((field) => hasVerifiedField(ipo, field)));
}
