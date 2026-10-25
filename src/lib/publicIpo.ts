import type { IpoItem } from '../types/ipo';
import { isReviewedIpo } from './contentQuality';
import { getCollectedReviews } from './reviewEvidence';

export function isPublicIpo(ipo: IpoItem): boolean {
  return isReviewedIpo(ipo) || getCollectedReviews(ipo).length > 0;
}

/** Review evidence can be useful before financial facts are checked. Do not expose unrelated legacy guesses. */
export function toPublicIpo(ipo: IpoItem): IpoItem {
  if (isReviewedIpo(ipo)) return ipo;
  return {
    ...ipo,
    code: '',
    subscriptionEnd: '', refundDate: '', listingDate: undefined,
    priceBandMin: 0, priceBandMax: 0, confirmedPrice: 0, underwriters: [],
    institutionalCompetitionRate: 0, generalCompetitionRate: undefined,
    lockupCommitmentRate: 0, circulatingSupplyRate: 0, totalOfferingAmount: 0, marketCapAtIpo: 0,
    subscriptionResults: undefined, openingPrice: undefined, openingReturnRate: undefined,
    closingPrice: undefined, closingReturnRate: undefined,
    aiScore: 0, scoreGrade: 'C',
    aiSummary: { headline: '수집된 블로그 원문과 의견을 확인하세요.', bulletPoints: [], positivePoints: [], riskPoints: [] },
    expertReviews: getCollectedReviews(ipo),
  };
}
