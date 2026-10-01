import { MOCK_IPOS } from '@/data/mockIpo';
import { IpoItem } from '@/types/ipo';
import { analyzeIpoSentiment, SentimentAnalysisOutput } from './sentimentAnalyzer';

export interface PipelineTarget {
  ipo: IpoItem;
  triggerType: 'NEW_SCHEDULE' | 'DAY_BEFORE_SUBSCRIPTION' | 'MANUAL_FORCE';
  reason: string;
}

export interface PipelineExecutionResult {
  executionDate: string;
  processedCount: number;
  skippedCount: number;
  processedTargets: {
    stockName: string;
    stockCode: string;
    triggerType: 'NEW_SCHEDULE' | 'DAY_BEFORE_SUBSCRIPTION' | 'MANUAL_FORCE';
    reason: string;
    beforeScore: number;
    afterScore: number;
    scoreGrade: string;
    llmUsed: boolean;
    llmModel?: string;
    headline: string;
  }[];
  skippedStocks: {
    stockName: string;
    status: string;
    subscriptionStart: string;
    reason: string;
  }[];
  message: string;
}

/**
 * 한국 시간(KST) 기준 YYYY-MM-DD 날짜 문자열 계산
 */
export function getKstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 특정 기준 날짜(기본 오늘)를 바탕으로 '방법 2' 정책에 부합하는 타겟 종목 추출
 * 정책:
 *  ① 청약 예정 신규 등록 시점 (NEW_SCHEDULE): 예정 상태이면서 분석 이력이 없는 종목 1회
 *  ② 청약 전날 시점 (DAY_BEFORE_SUBSCRIPTION): 청약 시작일 D-1 인 종목 1회 (수요예측 확정 및 유튜브/블로그 최종 분석)
 *  * 그 외 날짜는 100% 스킵하여 불필요한 LLM 비용 및 크롤링 낭비 방지
 */
export function identifyPipelineTargets(
  ipos: IpoItem[],
  targetDateStr?: string,
  forceStockName?: string
): { targets: PipelineTarget[]; skipped: { stock: IpoItem; reason: string }[] } {
  const todayStr = targetDateStr || getKstDateString();

  // 내일 날짜 계산 (D-1 판정용)
  const todayObj = new Date(todayStr + 'T00:00:00+09:00');
  const tomorrowObj = new Date(todayObj.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = getKstDateString(tomorrowObj);

  const targets: PipelineTarget[] = [];
  const skipped: { stock: IpoItem; reason: string }[] = [];

  for (const ipo of ipos) {
    // 취소 또는 이미 상장된 종목은 스킵
    if (ipo.isCancelled || ipo.status === 'LISTED') {
      skipped.push({ stock: ipo, reason: '이미 상장 완료되었거나 공모 취소된 종목' });
      continue;
    }

    // 관리자 수동 강제 실행인 경우 해당 단일 종목만 집중 처리
    if (forceStockName) {
      if (ipo.name === forceStockName) {
        targets.push({
          ipo,
          triggerType: 'MANUAL_FORCE',
          reason: `관리자 수동 즉시 실행 요청 (${ipo.name})`,
        });
      } else {
        skipped.push({ stock: ipo, reason: `특정 종목 수동 지정 실행 중으로 제외 (${forceStockName})` });
      }
      continue;
    }

    // 조건 1: 청약 시작일 D-1 (내일이 청약 시작일인 오늘)
    if (ipo.subscriptionStart === tomorrowStr) {
      targets.push({
        ipo,
        triggerType: 'DAY_BEFORE_SUBSCRIPTION',
        reason: `청약 전날(D-1) 도래! 수요예측 결과 확정 및 유튜브/블로그 최종 분석 반영 (청약 시작일: ${ipo.subscriptionStart})`,
      });
      continue;
    }

    // 조건 2: 청약 예정 최초 등록 시점 (신규 등록 및 분석 대기)
    if (ipo.status === 'UPCOMING' && (!ipo.expertReviews || ipo.expertReviews.length === 0)) {
      targets.push({
        ipo,
        triggerType: 'NEW_SCHEDULE',
        reason: `신규 청약 예정 등록! DART 증권신고서 기본 스펙 1차 분석 (청약 시작일: ${ipo.subscriptionStart})`,
      });
      continue;
    }

    // 그 외는 스킵
    skipped.push({
      stock: ipo,
      reason: `청약 예정 등록 시점 또는 청약 전날(D-1)이 아니므로 스킵 (청약 시작일: ${ipo.subscriptionStart})`,
    });
  }

  return { targets, skipped };
}

/**
 * '방법 2' 파이프라인 실제 실행
 */
export async function runMethod2Pipeline(options?: {
  targetDate?: string;
  forceStockName?: string;
  allIpos?: IpoItem[];
}): Promise<PipelineExecutionResult> {
  const ipoList = options?.allIpos || MOCK_IPOS;
  const executionDate = options?.targetDate || getKstDateString();

  const { targets, skipped } = identifyPipelineTargets(ipoList, executionDate, options?.forceStockName);

  const processedTargets: PipelineExecutionResult['processedTargets'] = [];

  for (const item of targets) {
    const beforeScore = item.ipo.aiScore;

    // 감성 분석 & 종합 점수 산출
    const analysisResult: SentimentAnalysisOutput = await analyzeIpoSentiment(item.ipo, item.triggerType);

    processedTargets.push({
      stockName: item.ipo.name,
      stockCode: item.ipo.code,
      triggerType: item.triggerType,
      reason: item.reason,
      beforeScore,
      afterScore: analysisResult.aiScore,
      scoreGrade: analysisResult.scoreGrade,
      llmUsed: analysisResult.llmUsed,
      llmModel: analysisResult.llmModel,
      headline: analysisResult.aiSummary.headline,
    });
  }

  const message =
    processedTargets.length > 0
      ? `[방법 2 파이프라인] 총 ${processedTargets.length}개 종목 실행 완료 (청약 예정 등록 및 D-1 전날 대상 종목 선별 처리)`
      : `[방법 2 파이프라인] 오늘 청약 예정 등록(최초) 또는 청약 전날(D-1) 대상 종목이 없어 불필요한 LLM 호출을 건너뛰었습니다 (비용 $0 절감).`;

  return {
    executionDate,
    processedCount: processedTargets.length,
    skippedCount: skipped.length,
    processedTargets,
    skippedStocks: skipped.map((s) => ({
      stockName: s.stock.name,
      status: s.stock.status,
      subscriptionStart: s.stock.subscriptionStart,
      reason: s.reason,
    })),
    message,
  };
}
