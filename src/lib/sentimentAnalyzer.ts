import { calculateIpoScore } from './scoring';
import { hasVerifiedForecast } from './contentQuality';
import type { ExpertReview, IpoItem } from '../types/ipo';

export interface SentimentAnalysisOutput {
  sentimentConsensus: {
    positiveRatio: number;
    neutralRatio: number;
    cautionRatio: number;
  };
  aiSummary: {
    headline: string;
    bulletPoints: string[];
    positivePoints: string[];
    riskPoints: string[];
  };
  expertReviews: ExpertReview[];
  aiScore: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  llmUsed: boolean;
  llmModel?: string;
  publishable: boolean;
  holdReason?: string;
}

/**
 * No external review collector is currently connected. A channel name or a search
 * URL cannot establish that a review exists or that its author expressed a view.
 * Preserve the interface until a collector stores the actual source evidence.
 */
export function getCollectedReviewsContext(stockName: string): {
  reviewsText: string;
  sourceReviews: ExpertReview[];
} {
  void stockName;
  return { reviewsText: '', sourceReviews: [] };
}

/**
 * Only summarize reviewed numerical facts. No simulated reviews, inferred public
 * sentiment, fallback investment opinions, or ungrounded LLM claims are published.
 */
export async function analyzeIpoSentiment(
  ipo: Partial<IpoItem> & { name: string },
  triggerType: 'NEW_SCHEDULE' | 'DAY_BEFORE_SUBSCRIPTION' | 'MANUAL_FORCE'
): Promise<SentimentAnalysisOutput> {
  void triggerType;
  const sentimentConsensus = { positiveRatio: 0, neutralRatio: 0, cautionRatio: 0 };
  if (!hasVerifiedForecast(ipo)) {
    return {
      sentimentConsensus,
      aiSummary: {
        headline: '공식 공시 검토 및 수요예측 지표 확인 대기',
        bulletPoints: ['공식 공시 원문과 수요예측 결과를 확인한 뒤 정량 지표를 제공합니다.'],
        positivePoints: [],
        riskPoints: [],
      },
      expertReviews: [],
      aiScore: 0,
      scoreGrade: 'C',
      llmUsed: false,
      publishable: false,
      holdReason: '공식 공시 검토 이력 또는 필수 수요예측 지표가 없어 자동 분석을 보류했습니다.',
    };
  }

  const scoring = calculateIpoScore({
    institutionalCompetitionRate: ipo.institutionalCompetitionRate!,
    lockupCommitmentRate: ipo.lockupCommitmentRate!,
    circulatingSupplyRate: ipo.circulatingSupplyRate!,
    priceBandMin: ipo.priceBandMin!,
    priceBandMax: ipo.priceBandMax!,
    confirmedPrice: ipo.confirmedPrice!,
    dataQuality: ipo.dataQuality,
    sentimentConsensus,
  });

  return {
    sentimentConsensus,
    aiSummary: {
      headline: `${ipo.name} 공시 정량 지표 확인`,
      bulletPoints: [
        `기관 수요예측 경쟁률 ${ipo.institutionalCompetitionRate}:1`,
        `의무보유확약 ${ipo.lockupCommitmentRate}%, 상장일 유통가능물량 ${ipo.circulatingSupplyRate}%`,
        `확정 공모가 ${ipo.confirmedPrice!.toLocaleString('ko-KR')}원`,
      ],
      positivePoints: [],
      riskPoints: ['정량 점수는 사이트 자체 비교 기준이며 상장 후 수익률을 예측하지 않습니다.'],
    },
    expertReviews: [],
    aiScore: scoring.score,
    scoreGrade: scoring.scoreGrade,
    llmUsed: false,
    publishable: true,
  };
}
