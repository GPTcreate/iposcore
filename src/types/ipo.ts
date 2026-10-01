export type IpoStatus = 'UPCOMING' | 'SUBSCRIPTION' | 'WAITING_LISTING' | 'LISTED';

export interface ExpertReview {
  id: string;
  sourceType: 'YOUTUBE' | 'BLOG';
  author: string;
  title: string;
  url: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CAUTION';
  summary: string;
}

export interface IpoItem {
  id: string;
  name: string;
  code: string;
  market: 'KOSPI' | 'KOSDAQ';
  status: IpoStatus;
  
  // 일정
  subscriptionStart: string; // YYYY-MM-DD
  subscriptionEnd: string;   // YYYY-MM-DD
  refundDate: string;        // 환불일
  listingDate?: string;      // 상장일 (미정이면 optional)

  // 공모가
  priceBandMin: number;
  priceBandMax: number;
  confirmedPrice: number;    // 확정 공모가 (0이면 미확정)
  
  // 주관사
  underwriters: {
    name: string;
    allocatedShares: number;
    fee: number;             // 청약 수수료
  }[];

  // 정량 지표 (DART 공시 기반)
  institutionalCompetitionRate: number; // 기관 수요예측 경쟁률 (예: 1120 -> 1120:1)
  lockupCommitmentRate: number;         // 의무보유확약 비율 (%)
  circulatingSupplyRate: number;        // 유통가능물량 비율 (%)
  totalOfferingAmount: number;          // 총 공모금액 (억원)
  marketCapAtIpo: number;               // 상장 시 시가총액 (억원)

  // AI 분석 & 점수
  aiScore: number;                      // 1 ~ 100점
  scoreGrade: 'S' | 'A' | 'B' | 'C';    // 적극추천, 추천, 중립, 패스권장
  aiSummary: {
    headline: string;
    bulletPoints: string[];
    positivePoints: string[];
    riskPoints: string[];
  };

  // 전문가 여론 통계
  sentimentConsensus: {
    positiveRatio: number; // %
    neutralRatio: number;  // %
    cautionRatio: number;  // %
  };
  
  // 상장 결과 지표 (상장 완료 종목)
  openingPrice?: number;         // 상장일 시초가 (원)
  openingReturnRate?: number;    // 시초가 기준 수익률 (%)
  closingPrice?: number;         // 상장일 종가 (원)
  closingReturnRate?: number;    // 종가 기준 수익률 (%)

  // 취소/철회 종목 정보
  isCancelled?: boolean;         // 공모 취소/철회 여부
  cancelReason?: string;         // 공모 취소/철회 사유

  expertReviews: ExpertReview[];
}

export interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
  frequency: 'WEEKLY' | 'ALL';
}
