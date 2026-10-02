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
  status?: string;
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

/**
 * DART 공시 정량 지표(70%) + 전문가 여론 감성 지수(30%) 기반
 * 100점 만점 공모주 종합 투자 매력도 산출 수식
 * 
 * [청약 예정 종목(UPCOMING) 보정 정책]:
 * - 기관 수요예측 및 의무확약 발표 전인 종목(경쟁률/확약 0)의 경우,
 *   감점/0점 처리하여 'C등급 패스 권고'로 오도하는 결함을 방지하고
 *   시장 중간 기대치(경쟁률 28점, 확약 16점)를 임시 베이스라인으로 부여하여
 *   유통물량 및 비즈니스 펀더멘털에 따른 합리적인 사전 기대 점수(70~80점 대)를 도출합니다.
 */
export function calculateIpoScore(ipo: ScoringInput): ScoringResult {
  const isPendingForecast =
    ipo.status === 'UPCOMING' ||
    (ipo.institutionalCompetitionRate === 0 && ipo.lockupCommitmentRate === 0);

  // 1. 기관 경쟁률 (40점 만점)
  let competitionScore = 0;
  if (ipo.institutionalCompetitionRate >= 1200) competitionScore = 40;
  else if (ipo.institutionalCompetitionRate >= 900) competitionScore = 35;
  else if (ipo.institutionalCompetitionRate >= 600) competitionScore = 30;
  else if (ipo.institutionalCompetitionRate >= 300) competitionScore = 24;
  else if (ipo.institutionalCompetitionRate >= 100) competitionScore = 18;
  else if (ipo.institutionalCompetitionRate > 0) competitionScore = 10;
  else competitionScore = 28; // 수요예측 결과 발표 전 시장 평균 기대치

  // 2. 의무보유확약 비율 (25점 만점)
  let lockupScore = 0;
  if (ipo.lockupCommitmentRate >= 20) lockupScore = 25;
  else if (ipo.lockupCommitmentRate >= 15) lockupScore = 22;
  else if (ipo.lockupCommitmentRate >= 10) lockupScore = 18;
  else if (ipo.lockupCommitmentRate >= 5) lockupScore = 14;
  else if (ipo.lockupCommitmentRate > 0) lockupScore = 9;
  else lockupScore = 16; // 발표 전 시장 평균 기대치

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
  if (isPendingForecast) {
    // 수요예측 발표 전: 실질적인 지표(유통물량 + 여론)에 따라 A 또는 B 잠정 등급 부여
    if (score >= 76) scoreGrade = 'A';
    else scoreGrade = 'B';
  } else {
    if (score >= 85) scoreGrade = 'S';
    else if (score >= 75) scoreGrade = 'A';
    else if (score >= 60) scoreGrade = 'B';
    else scoreGrade = 'C';
  }

  return {
    score,
    scoreGrade,
    isPendingForecast,
    breakdown: {
      competitionScore,
      lockupScore,
      circulatingScore,
      priceBonus,
      sentimentScore,
    },
  };
}
