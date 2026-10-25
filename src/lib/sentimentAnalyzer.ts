import { calculateIpoScore, type ScoreBasis } from './scoring';
import { hasVerifiedForecast } from './contentQuality';
import { getCollectedReviews, summarizeReviews, type ReviewSummary } from './reviewEvidence';
import type { ExpertReview, IpoItem } from '../types/ipo';

export interface SentimentAnalysisOutput {
  // Missing samples remain null; a measured zero is different from no evidence.
  sentimentConsensus: { positiveRatio: number | null; neutralRatio: number | null; cautionRatio: number | null };
  aiSummary: { headline: string; bulletPoints: string[]; positivePoints: string[]; riskPoints: string[] };
  expertReviews: ExpertReview[];
  aiScore: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  basis: ScoreBasis;
  sampleSize: number;
  reviewSummary: ReviewSummary;
  llmUsed: boolean;
  llmModel?: string;
  publishable: boolean;
  holdReason?: string;
}

/** A company name alone cannot establish that an attributed review exists. */
export function getCollectedReviewsContext(ipo: Partial<IpoItem> | string): {
  reviewsText: string;
  sourceReviews: ExpertReview[];
} {
  const sourceReviews = typeof ipo === 'string' ? [] : getCollectedReviews(ipo);
  return {
    reviewsText: sourceReviews.map((review) =>
      [review.author, review.title, review.publishedAt, review.url, review.evidence!.excerpt].join('\n')
    ).join('\n\n'),
    sourceReviews,
  };
}

/**
 * Deterministic aggregation of retained source evidence. No paid LLM call,
 * financial-fact-driven opinion classification, or synthetic review fallback.
 * Financial publication still requires the independent official-source gate.
 */
export async function analyzeIpoSentiment(
  ipo: Partial<IpoItem> & { name: string },
  triggerType: 'NEW_SCHEDULE' | 'DAY_BEFORE_SUBSCRIPTION' | 'MANUAL_FORCE'
): Promise<SentimentAnalysisOutput> {
  void triggerType;
  const expertReviews = getCollectedReviews(ipo);
  const reviewSummary = summarizeReviews(ipo);
  const sentimentConsensus = {
    positiveRatio: reviewSummary.positiveRatio,
    neutralRatio: reviewSummary.neutralRatio,
    cautionRatio: reviewSummary.cautionRatio,
  };
  const forecast = hasVerifiedForecast(ipo);
  const scoring = calculateIpoScore({
    institutionalCompetitionRate: ipo.institutionalCompetitionRate ?? 0,
    lockupCommitmentRate: ipo.lockupCommitmentRate ?? 0,
    circulatingSupplyRate: ipo.circulatingSupplyRate ?? 0,
    priceBandMin: ipo.priceBandMin ?? 0,
    priceBandMax: ipo.priceBandMax ?? 0,
    confirmedPrice: ipo.confirmedPrice ?? 0,
    dataQuality: ipo.dataQuality,
    sentimentConsensus,
    id: ipo.id,
    name: ipo.name,
    subscriptionStart: ipo.subscriptionStart,
    reviewCollection: ipo.reviewCollection,
  });

  const bulletPoints: string[] = [];
  if (expertReviews.length > 0) {
    bulletPoints.push('수집 근거를 확인한 외부 원문 ' + reviewSummary.totalReviews
      + '편, 명시 입장 표본 ' + reviewSummary.sampleSize + '개');
  }
  if (forecast) {
    bulletPoints.push(
      '기관 수요예측 경쟁률 ' + ipo.institutionalCompetitionRate + ':1',
      '의무보유확약 ' + ipo.lockupCommitmentRate + '%, 상장일 유통가능물량 ' + ipo.circulatingSupplyRate + '%',
      '확정 공모가 ' + ipo.confirmedPrice!.toLocaleString('ko-KR') + '원',
    );
  } else {
    bulletPoints.push('공식 공시 원문과 수요예측 지표는 별도 확인 대기 중입니다.');
  }
  const riskPoints: string[] = [];
  if (ipo.reviewCollection?.status === 'failed') {
    riskPoints.push('최근 수집에 실패해 마지막 성공 원문을 표시합니다. 현재 여론 표본과 점수에는 반영하지 않았습니다.');
  } else if (reviewSummary.stale) {
    riskPoints.push('일부 채널 수집에 실패했습니다. 해당 채널의 보존 원문은 현재 의견 표본과 리뷰 점수에서 제외하고 정상 수집된 채널만 반영했습니다.');
  } else if (expertReviews.length > 0 && reviewSummary.sampleSize === 0) {
    riskPoints.push('명시 입장을 확인한 독립 표본이 없어 여론 비율과 리뷰 점수를 산출하지 않았습니다.');
  }
  if (forecast) riskPoints.push('점수는 사이트 자체 비교 기준이며 상장 후 수익률을 예측하지 않습니다.');
  const publishable = forecast || expertReviews.length > 0;
  return {
    sentimentConsensus,
    aiSummary: {
      headline: forecast ? ipo.name + ' 공시·수집 자료 확인'
        : expertReviews.length > 0 ? ipo.name + ' 외부 원문 · 공시 지표 확인 대기'
          : '공식 공시 및 외부 원문 확인 대기',
      bulletPoints,
      positivePoints: [],
      riskPoints,
    },
    expertReviews,
    aiScore: scoring.score,
    scoreGrade: scoring.scoreGrade,
    basis: scoring.basis,
    sampleSize: reviewSummary.sampleSize,
    reviewSummary,
    llmUsed: false,
    publishable,
    ...(!publishable ? { holdReason: '공식 공시 검토 이력과 수집 근거를 갖춘 외부 원문이 없어 공개를 보류했습니다.' } : {}),
  };
}
