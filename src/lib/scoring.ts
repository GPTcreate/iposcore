import type { IpoItem } from '../types/ipo';
import { hasVerifiedForecast } from './contentQuality';

export interface ScoringInput {
  institutionalCompetitionRate: number;
  lockupCommitmentRate: number;
  circulatingSupplyRate: number;
  priceBandMin: number;
  priceBandMax: number;
  confirmedPrice: number;
  sentimentConsensus: {
    positiveRatio: number;
    neutralRatio: number;
    cautionRatio: number;
  };
  status?: IpoItem['status'];
  dataQuality?: IpoItem['dataQuality'];
}

export interface ScoringResult {
  score: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  isPendingForecast: boolean;
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
  gradeThresholds: { S: 85, A: 75, B: 60 },
} as const;

/**
 * Editorially reviewed quantitative reference: round((competition + lockup + float) / 85 * 100).
 * No market-average replacement, price bonus or uncollected sentiment contributes points.
 * This rule is a site-defined comparison measure, not a validated return forecast.
 */
export function calculateIpoScore(ipo: ScoringInput): ScoringResult {
  if (!hasVerifiedForecast(ipo)) {
    return {
      score: 0,
      scoreGrade: 'C',
      isPendingForecast: true,
      breakdown: { competitionScore: 0, lockupScore: 0, circulatingScore: 0, priceBonus: 0, sentimentScore: 0 },
    };
  }

  const competitionScore = SCORING_RULES.competition.find(([minimum]) => ipo.institutionalCompetitionRate >= minimum)![1];
  // A disclosed zero lockup is zero points, not the old artificial 16-point baseline.
  const lockupScore = ipo.lockupCommitmentRate === 0 ? 0
    : SCORING_RULES.lockup.find(([minimum]) => ipo.lockupCommitmentRate >= minimum)![1];
  const circulatingScore = SCORING_RULES.circulating.find(([maximum]) => ipo.circulatingSupplyRate <= maximum)![1];
  const score = Math.round(((competitionScore + lockupScore + circulatingScore) / SCORING_RULES.maximumRawScore) * 100);
  const scoreGrade = score >= SCORING_RULES.gradeThresholds.S ? 'S'
    : score >= SCORING_RULES.gradeThresholds.A ? 'A'
    : score >= SCORING_RULES.gradeThresholds.B ? 'B' : 'C';

  return {
    score,
    scoreGrade,
    isPendingForecast: false,
    breakdown: { competitionScore, lockupScore, circulatingScore, priceBonus: 0, sentimentScore: 0 },
  };
}
