import type { IpoItem } from '../types/ipo';
import { hasScorableForecast, hasVerifiedForecast, type FieldEvidenceMap } from './contentQuality';
import { summarizeReviews, type ReviewSummary } from './reviewEvidence';

export interface ScoringInput {
  institutionalCompetitionRate: number;
  lockupCommitmentRate: number;
  circulatingSupplyRate: number;
  pendingForecastFields?: IpoItem['pendingForecastFields'];
  priceBandMin?: number;
  priceBandMax?: number;
  confirmedPrice?: number;
  sentimentConsensus?: {
    positiveRatio: number | null;
    neutralRatio: number | null;
    cautionRatio: number | null;
  };
  status?: IpoItem['status'];
  dataQuality?: IpoItem['dataQuality'];
  fieldEvidence?: FieldEvidenceMap;
  id?: IpoItem['id'];
  name?: IpoItem['name'];
  subscriptionStart?: IpoItem['subscriptionStart'];
  reviewCollection?: IpoItem['reviewCollection'];
  expertReviews?: IpoItem['expertReviews'];
}

export type ScoreBasis = 'PENDING' | 'QUANTITATIVE' | 'COMBINED';

export interface ScoringResult {
  score: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  isPendingForecast: boolean;
  isVerified: boolean;
  basis: ScoreBasis;
  sampleSize: number;
  coverage: {
    quantitative: boolean;
    verifiedQuantitative: boolean;
    reviews: boolean;
    collectedReviews: number;
    classifiedReviews: number;
    stale: boolean;
  };
  quantitativeRawScore: number;
  quantitativeScore: number;
  reviewSummary: ReviewSummary;
  breakdown: {
    competitionScore: number;
    lockupScore: number;
    circulatingScore: number;
    priceBonus: number;
    sentimentScore: number;
  };
}

export const SCORING_RULES = {
  competition: [[1200, 40], [900, 35], [600, 30], [300, 24], [100, 18], [0, 10]],
  lockup: [[20, 25], [15, 22], [10, 18], [5, 14], [0, 9]],
  circulating: [[20, 20], [25, 17], [30, 14], [38, 10], [100, 5]],
  maximumRawScore: 85,
  maximumSentimentScore: 15,
  gradeThresholds: { S: 85, A: 75, B: 60 },
} as const;

/**
 * With actual classified reviews: round(quantitative raw (max 85) + positiveRatio * .15).
 * Without a classified sample: round(quantitative raw / 85 * 100), labelled quantitative only.
 * No market-average replacement, price bonus or legacy sentiment contributes points.
 * This rule is a site-defined comparison measure, not a validated return forecast.
 */
export function calculateIpoScore(ipo: ScoringInput): ScoringResult {
  const reviewSummary = summarizeReviews(ipo);
  const scorable = hasScorableForecast(ipo);
  const isVerified = hasVerifiedForecast(ipo);
  const coverage = {
    quantitative: scorable,
    verifiedQuantitative: isVerified,
    reviews: reviewSummary.sampleSize > 0,
    collectedReviews: reviewSummary.totalReviews,
    classifiedReviews: reviewSummary.sampleSize,
    stale: reviewSummary.stale,
  };
  if (!scorable) {
    return {
      score: 0,
      scoreGrade: 'C',
      isPendingForecast: true,
      isVerified,
      basis: 'PENDING',
      sampleSize: reviewSummary.sampleSize,
      coverage,
      quantitativeRawScore: 0,
      quantitativeScore: 0,
      reviewSummary,
      breakdown: { competitionScore: 0, lockupScore: 0, circulatingScore: 0, priceBonus: 0, sentimentScore: 0 },
    };
  }

  const competitionScore = SCORING_RULES.competition.find(([minimum]) => ipo.institutionalCompetitionRate >= minimum)![1];
  // A disclosed zero lockup is zero points, not the old artificial 16-point baseline.
  const lockupScore = ipo.lockupCommitmentRate === 0 ? 0
    : SCORING_RULES.lockup.find(([minimum]) => ipo.lockupCommitmentRate >= minimum)![1];
  const circulatingScore = SCORING_RULES.circulating.find(([maximum]) => ipo.circulatingSupplyRate <= maximum)![1];
  const quantitativeRawScore = competitionScore + lockupScore + circulatingScore;
  const quantitativeScore = Math.round(quantitativeRawScore / SCORING_RULES.maximumRawScore * 100);
  const hasClassifiedReviews = reviewSummary.sampleSize > 0;
  const sentimentScore = hasClassifiedReviews ? reviewSummary.positiveRatio! * SCORING_RULES.maximumSentimentScore / 100 : 0;
  const score = hasClassifiedReviews ? Math.round(quantitativeRawScore + sentimentScore) : quantitativeScore;
  const scoreGrade = score >= SCORING_RULES.gradeThresholds.S ? 'S'
    : score >= SCORING_RULES.gradeThresholds.A ? 'A'
    : score >= SCORING_RULES.gradeThresholds.B ? 'B' : 'C';

  return {
    score,
    scoreGrade,
    isPendingForecast: false,
    isVerified,
    basis: hasClassifiedReviews ? 'COMBINED' : 'QUANTITATIVE',
    sampleSize: reviewSummary.sampleSize,
    coverage,
    quantitativeRawScore,
    quantitativeScore,
    reviewSummary,
    breakdown: { competitionScore, lockupScore, circulatingScore, priceBonus: 0, sentimentScore },
  };
}
