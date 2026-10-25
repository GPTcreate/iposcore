import type { IpoItem } from '../types/ipo';
import { getCollectedReviews } from './reviewEvidence';

export function isPublicIpo(ipo: IpoItem): boolean {
  return Boolean(ipo && typeof ipo.id === 'string' && ipo.id.trim() && typeof ipo.name === 'string' && ipo.name.trim());
}

/** New filing-only cards stay browsable while incomplete landing pages await actual offering facts. */
export function isIndexableIpo(ipo: IpoItem): boolean {
  if (!isPublicIpo(ipo)) return false;
  return !ipo.discovery || Boolean(ipo.subscriptionStart && ipo.subscriptionEnd);
}

/** Keep the registered profile available. Only retained source evidence supplies attributed opinions. */
export function toPublicIpo(ipo: IpoItem): IpoItem {
  return { ...ipo, expertReviews: getCollectedReviews(ipo) };
}
