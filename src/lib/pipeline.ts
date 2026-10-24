import { getAllIpos } from './ipoStore';
import { IpoItem } from '@/types/ipo';
import { getEffectiveIpoStatus } from './ipoUtils';
import { analyzeIpoSentiment, SentimentAnalysisOutput } from './sentimentAnalyzer';
import { hasVerifiedForecast, isReviewedIpo } from './contentQuality';

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
 *  ② 청약 전날 시점 (DAY_BEFORE_SUBSCRIPTION): 청약 시작일 D-1 인 종목
 *  공식 공시 검토와 필수 지표 확인을 마친 종목에만 적용합니다.
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
    if (!isReviewedIpo(ipo) || !hasVerifiedForecast(ipo)) {
      skipped.push({ stock: ipo, reason: '공식 공시 검토 또는 필수 수요예측 지표 확인 전 자동 분석 보류' });
      continue;
    }
    const effectiveStatus = getEffectiveIpoStatus(ipo, todayObj);
    // 취소 또는 이미 상장된 종목은 스킵
    if (ipo.isCancelled || effectiveStatus === 'LISTED') {
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

    // 조건 1: 미확정(공모가 0 또는 경쟁률 0) 상태인 청약 임박 및 진행 중 종목 (D-2 ~ 청약 마감일까지 매일 추적)
    const isNearOrActive = (todayStr >= ipo.subscriptionStart || tomorrowStr >= ipo.subscriptionStart) && todayStr <= ipo.subscriptionEnd;
    if (isNearOrActive && (ipo.confirmedPrice === 0 || ipo.institutionalCompetitionRate === 0)) {
      targets.push({
        ipo,
        triggerType: 'DAY_BEFORE_SUBSCRIPTION',
        reason: `청약 임박/진행 중이나 수요예측 미확정 상태! DART 확정 수치(공모가/경쟁률/유통비율) 필수 추적 및 갱신 (청약 기간: ${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd})`,
      });
      continue;
    }

    // 조건 2: 청약 시작일 D-1 (내일이 청약 시작일인 오늘)
    if (ipo.subscriptionStart === tomorrowStr) {
      targets.push({
        ipo,
        triggerType: 'DAY_BEFORE_SUBSCRIPTION',
        reason: `청약 전날(D-1) 검토된 수요예측 정량 지표 재계산 (청약 시작일: ${ipo.subscriptionStart})`,
      });
      continue;
    }

    // 조건 3: 청약 예정 최초 등록 시점 (신규 등록 및 분석 대기)
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
  const ipoList = options?.allIpos || getAllIpos();
  const executionDate = options?.targetDate || getKstDateString();

  const { targets, skipped } = identifyPipelineTargets(ipoList, executionDate, options?.forceStockName);

  const processedTargets: PipelineExecutionResult['processedTargets'] = [];

  for (const item of targets) {
    const beforeScore = item.ipo.aiScore;

    // 검토된 정량 자료만 요약. 외부 리뷰와 여론은 생성하지 않습니다.
    const analysisResult: SentimentAnalysisOutput = await analyzeIpoSentiment(item.ipo, item.triggerType);
    if (!analysisResult.publishable) {
      skipped.push({ stock: item.ipo, reason: analysisResult.holdReason || '근거 자료 확인 전 자동 분석 보류' });
      continue;
    }

    // 계산 결과만 반환합니다. 검토된 본문·출처를 덮어쓰거나 외부로 발송하지 않습니다.
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
      ? `[방법 2 파이프라인] 검토된 지표 ${processedTargets.length}개 종목의 참고 계산을 반환했습니다. 저장과 외부 발송은 하지 않았습니다.`
      : '[방법 2 파이프라인] 검토 이력과 필수 지표를 갖춘 대상이 없어 자동 분석을 보류했습니다.';

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
