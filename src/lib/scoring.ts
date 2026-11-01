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
  isCancelled?: IpoItem['isCancelled'];
  scheduleVerification?: IpoItem['scheduleVerification'];
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
  version: typeof SCORING_RULES.version;
  score: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  isPendingForecast: boolean;
  isVerified: boolean;
  basis: ScoreBasis;
  reviewEligible: boolean;
  reviewStartsOn: string | null;
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
  sentimentIndex: number | null;
  sentimentWeight: number;
  sentimentConfidence: number;
  reviewSummary: ReviewSummary;
  breakdown: {
    competitionScore: number;
    lockupScore: number;
    circulatingScore: number;
    priceBonus: number;
    sentimentScore: number;
    quantitativeContribution: number;
  };
}

export const SCORING_RULES = {
  version: '2026-11-01-v3',
  competition: [[1200, 40], [900, 35], [600, 30], [300, 24], [100, 18], [0, 10]],
  lockup: [[20, 25], [15, 22], [10, 18], [5, 14], [0, 9]],
  circulating: [[20, 20], [25, 17], [30, 14], [38, 10], [100, 5]],
  maximumRawScore: 85,
  maximumSentimentScore: 25,
  fullSentimentSamples: 5,
  opinionValues: { POSITIVE: 100, NEUTRAL: 65, CAUTION: 15 },
  gradeThresholds: { S: 85, A: 75, B: 60 },
} as const;

/**
 * Before KST D-1: quantitative only, even when classified reviews already exist.
 * From KST D-1: blend quantitative score with observed participation intent.
 * Sentiment has up to 25% weight, increasing linearly through five independent samples.
 * Participation/defer/nonparticipation have index values 100/65/15 respectively.
 * Otherwise: round(quantitative raw / 85 * 100), labelled quantitative only.
 * Unknown opinions never receive invented votes or an imputed sentiment index.
 * This rule is a site-defined comparison measure, not a validated return forecast.
 */
export function calculateIpoScore(ipo: ScoringInput, now = new Date()): ScoringResult {
  const reviewSummary = summarizeReviews(ipo, now);
  const day = ipo.subscriptionStart;
  const validDay = typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
    && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
  const hasSchedule = validDay && !ipo.isCancelled && !ipo.scheduleVerification?.conflicts.includes('subscriptionStart');
  const reviewOpensAt = hasSchedule ? Date.parse(`${day}T00:00:00+09:00`) - 86400000 : null;
  const reviewStartsOn = hasSchedule ? new Date(Date.parse(`${day}T00:00:00Z`) - 86400000).toISOString().slice(0, 10) : null;
  const reviewEligible = reviewOpensAt !== null && Number.isFinite(now.getTime()) && now.getTime() >= reviewOpensAt;
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
      version: SCORING_RULES.version,
      score: 0,
      scoreGrade: 'C',
      isPendingForecast: true,
      isVerified,
      basis: 'PENDING',
      reviewEligible,
      reviewStartsOn,
      sampleSize: reviewSummary.sampleSize,
      coverage,
      quantitativeRawScore: 0,
      quantitativeScore: 0,
      sentimentIndex: null,
      sentimentWeight: 0,
      sentimentConfidence: 0,
      reviewSummary,
      breakdown: { competitionScore: 0, lockupScore: 0, circulatingScore: 0, priceBonus: 0, sentimentScore: 0, quantitativeContribution: 0 },
    };
  }

  const competitionScore = SCORING_RULES.competition.find(([minimum]) => ipo.institutionalCompetitionRate >= minimum)![1];
  // A disclosed zero lockup is zero points, not the old artificial 16-point baseline.
  const lockupScore = ipo.lockupCommitmentRate === 0 ? 0
    : SCORING_RULES.lockup.find(([minimum]) => ipo.lockupCommitmentRate >= minimum)![1];
  const circulatingScore = SCORING_RULES.circulating.find(([maximum]) => ipo.circulatingSupplyRate <= maximum)![1];
  const quantitativeRawScore = competitionScore + lockupScore + circulatingScore;
  const quantitativeIndex = quantitativeRawScore / SCORING_RULES.maximumRawScore * 100;
  const quantitativeScore = Math.round(quantitativeIndex);
  const hasClassifiedReviews = reviewEligible && reviewSummary.sampleSize > 0;
  const sentimentIndex = hasClassifiedReviews ? (
    reviewSummary.positiveCount * SCORING_RULES.opinionValues.POSITIVE
    + reviewSummary.neutralCount * SCORING_RULES.opinionValues.NEUTRAL
    + reviewSummary.cautionCount * SCORING_RULES.opinionValues.CAUTION
  ) / reviewSummary.sampleSize : null;
  const sentimentConfidence = hasClassifiedReviews ? Math.min(1, reviewSummary.sampleSize / SCORING_RULES.fullSentimentSamples) : 0;
  const sentimentWeight = SCORING_RULES.maximumSentimentScore * sentimentConfidence;
  const sentimentScore = sentimentIndex === null ? 0 : sentimentIndex * sentimentWeight / 100;
  const quantitativeContribution = quantitativeIndex * (100 - sentimentWeight) / 100;
  const score = Math.round(quantitativeContribution + sentimentScore);
  const scoreGrade = score >= SCORING_RULES.gradeThresholds.S ? 'S'
    : score >= SCORING_RULES.gradeThresholds.A ? 'A'
    : score >= SCORING_RULES.gradeThresholds.B ? 'B' : 'C';

  return {
    version: SCORING_RULES.version,
    score,
    scoreGrade,
    isPendingForecast: false,
    isVerified,
    basis: hasClassifiedReviews ? 'COMBINED' : 'QUANTITATIVE',
    reviewEligible,
    reviewStartsOn,
    sampleSize: reviewSummary.sampleSize,
    coverage,
    quantitativeRawScore,
    quantitativeScore,
    sentimentIndex,
    sentimentWeight,
    sentimentConfidence,
    reviewSummary,
    breakdown: { competitionScore, lockupScore, circulatingScore, priceBonus: 0, sentimentScore, quantitativeContribution },
  };
}
