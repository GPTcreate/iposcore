import { calculateIpoScore, type ScoreBasis } from './scoring';
import { hasScorableForecast, hasVerifiedField, hasVerifiedForecast } from './contentQuality';
import { getCollectedReviews, summarizeReviews, type ReviewSummary } from './reviewEvidence';
import type { ExpertReview, IpoItem } from '../types/ipo';

export interface SentimentAnalysisOutput {
  // Missing samples remain null; a measured zero is different from no evidence.
  sentimentConsensus: { positiveRatio: number | null; neutralRatio: number | null; cautionRatio: number | null };
  aiSummary: { headline: string; bulletPoints: string[]; positivePoints: string[]; riskPoints: string[] };
  expertReviews: ExpertReview[];
  aiScore: number;
  scoreGrade: 'S' | 'A' | 'B' | 'C';
  isVerified: boolean;
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
 * Registered metrics and source-checked metrics retain distinct labels.
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
  const scorable = hasScorableForecast(ipo);
  const scoring = calculateIpoScore({
    institutionalCompetitionRate: ipo.institutionalCompetitionRate ?? 0,
    lockupCommitmentRate: ipo.lockupCommitmentRate ?? 0,
    circulatingSupplyRate: ipo.circulatingSupplyRate ?? 0,
    pendingForecastFields: ipo.pendingForecastFields,
    priceBandMin: ipo.priceBandMin ?? 0,
    priceBandMax: ipo.priceBandMax ?? 0,
    confirmedPrice: ipo.confirmedPrice ?? 0,
    dataQuality: ipo.dataQuality,
    fieldEvidence: ipo.fieldEvidence,
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
  if (scorable) {
    const sourceLabel = forecast ? '공시 확인' : '등록자료 · 검토전';
    bulletPoints.push(
      sourceLabel + ': 기관 수요예측 경쟁률 ' + ipo.institutionalCompetitionRate + ':1',
      sourceLabel + ': 의무보유확약 ' + ipo.lockupCommitmentRate + '%, 상장일 유통가능물량 ' + ipo.circulatingSupplyRate + '%',
    );
  } else {
    bulletPoints.push('필수 수요예측 지표 입력 또는 발표 대기 중입니다.');
  }
  if (typeof ipo.confirmedPrice === 'number' && Number.isFinite(ipo.confirmedPrice) && ipo.confirmedPrice > 0) {
    bulletPoints.push((hasVerifiedField(ipo, 'confirmedPrice') ? '공시 확인 공모가 ' : '등록 공모가(검토전) ')
      + ipo.confirmedPrice.toLocaleString('ko-KR') + '원');
  }
  const riskPoints: string[] = [];
  if (ipo.reviewCollection?.status === 'failed') {
    riskPoints.push('최근 수집에 실패해 마지막 성공 원문을 표시합니다. 현재 여론 표본과 점수에는 반영하지 않았습니다.');
  } else if (reviewSummary.stale) {
    riskPoints.push('일부 채널 수집에 실패했습니다. 해당 채널의 보존 원문은 현재 의견 표본과 리뷰 점수에서 제외하고 정상 수집된 채널만 반영했습니다.');
  } else if (expertReviews.length > 0 && reviewSummary.sampleSize === 0) {
    riskPoints.push('명시 입장을 확인한 독립 표본이 없어 여론 비율과 리뷰 점수를 산출하지 않았습니다.');
  }
  if (scorable && !forecast) riskPoints.push('등록된 수치로 계산한 참고점수입니다. 점수 지표의 공시 근거는 별도 검토 전입니다.');
  if (scorable) riskPoints.push('점수는 사이트 자체 비교 기준이며 상장 후 수익률을 예측하지 않습니다.');
  const publishable = scorable || expertReviews.length > 0;
  return {
    sentimentConsensus,
    aiSummary: {
      headline: scorable ? ipo.name + (forecast ? ' 공시·수집 자료 확인' : ' 등록자료 참고점수 · 검토전')
        : expertReviews.length > 0 ? ipo.name + ' 외부 원문 · 공시 지표 확인 대기'
          : '공식 공시 및 외부 원문 확인 대기',
      bulletPoints,
      positivePoints: [],
      riskPoints,
    },
    expertReviews,
    aiScore: scoring.score,
    scoreGrade: scoring.scoreGrade,
    isVerified: scoring.isVerified,
    basis: scoring.basis,
    sampleSize: reviewSummary.sampleSize,
    reviewSummary,
    llmUsed: false,
    publishable,
    ...(!publishable ? { holdReason: '필수 수요예측 지표와 수집 근거를 갖춘 외부 원문을 확인하지 못했습니다.' } : {}),
  };
}
