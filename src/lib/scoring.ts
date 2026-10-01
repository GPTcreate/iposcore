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
}

export interface ScoringResult {
  score: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  breakdown: {
    competitionScore: number;
    lockupScore: number;
    circulatingScore: number;
    priceBonus: number;
    sentimentScore: number;
  };
}

/**
 * DART 공시 정량 지표(70%) + 전문가 여론 감성 지수(30%) 기반
 * 100점 만점 공모주 종합 투자 매력도 산출 수식
 */
export function calculateIpoScore(ipo: ScoringInput): ScoringResult {
  // 1. 기관 경쟁률 (40점 만점)
  let competitionScore = 0;
  if (ipo.institutionalCompetitionRate >= 1200) competitionScore = 40;
  else if (ipo.institutionalCompetitionRate >= 900) competitionScore = 35;
  else if (ipo.institutionalCompetitionRate >= 600) competitionScore = 30;
  else if (ipo.institutionalCompetitionRate >= 300) competitionScore = 24;
  else if (ipo.institutionalCompetitionRate >= 100) competitionScore = 18;
  else if (ipo.institutionalCompetitionRate > 0) competitionScore = 10;
  else competitionScore = 20; // 수요예측 결과 발표 전 기본치

  // 2. 의무보유확약 비율 (25점 만점)
  let lockupScore = 0;
  if (ipo.lockupCommitmentRate >= 20) lockupScore = 25;
  else if (ipo.lockupCommitmentRate >= 15) lockupScore = 22;
  else if (ipo.lockupCommitmentRate >= 10) lockupScore = 18;
  else if (ipo.lockupCommitmentRate >= 5) lockupScore = 14;
  else if (ipo.lockupCommitmentRate > 0) lockupScore = 9;
  else lockupScore = 12; // 발표 전 기본치

  // 3. 상장일 유통가능물량 비율 (20점 만점 - 낮을수록 우수)
  let circulatingScore = 0;
  if (ipo.circulatingSupplyRate <= 20) circulatingScore = 20;
  else if (ipo.circulatingSupplyRate <= 25) circulatingScore = 17;
  else if (ipo.circulatingSupplyRate <= 30) circulatingScore = 14;
  else if (ipo.circulatingSupplyRate <= 38) circulatingScore = 10;
  else circulatingScore = 5;

  // 4. 공모가 상단 초과 확정 가산(+3점) 또는 하단 미달 감점(-8점)
  let priceBonus = 0;
  if (ipo.confirmedPrice > 0) {
    if (ipo.confirmedPrice > ipo.priceBandMax) {
      priceBonus = 3;
    } else if (ipo.confirmedPrice < ipo.priceBandMin) {
      priceBonus = -8;
    }
  }

  // 5. 전문가 여론 감성 지수 (15점 만점)
  const sentimentScore = Math.round((ipo.sentimentConsensus.positiveRatio / 100) * 15);

  const rawScore = competitionScore + lockupScore + circulatingScore + priceBonus + sentimentScore;
  const score = Math.min(99, Math.max(30, Math.round(rawScore)));

  let scoreGrade: 'S' | 'A' | 'B' | 'C' = 'B';
  if (score >= 85) scoreGrade = 'S';
  else if (score >= 75) scoreGrade = 'A';
  else if (score >= 60) scoreGrade = 'B';
  else scoreGrade = 'C';

  return {
    score,
    scoreGrade,
    breakdown: {
      competitionScore,
      lockupScore,
      circulatingScore,
      priceBonus,
      sentimentScore,
    },
  };
}
