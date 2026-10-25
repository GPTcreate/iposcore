import { getAllIpos } from './ipoStore';
import type { IpoItem } from '../types/ipo';
import type { ReviewArchive, ReviewChannel, ReviewSnapshot } from '../types/reviews';
import { getEffectiveIpoStatus } from './ipoUtils';
import { analyzeIpoSentiment } from './sentimentAnalyzer';
import { collectReviewsForIpos } from './reviewCollector';
import { isReviewDate, mergeReviewSnapshots, normalizeReviewArchive, reviewSnapshotKey } from './reviewArchive';
import { loadServerReviewArchive, saveServerReviewArchive } from './reviewArchiveServer';

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
    triggerType: PipelineTarget['triggerType'];
    reason: string;
    beforeScore: number;
    afterScore: number;
    scoreGrade: string;
    llmUsed: boolean;
    llmModel?: string;
    headline: string;
    collectionStatus: ReviewSnapshot['status'];
    fetchedCount: number;
    reviewCount: number;
  }[];
  skippedStocks: { stockName: string; status: string; subscriptionStart: string; reason: string }[];
  reviewSnapshots: ReviewSnapshot[];
  reviewsCollectedCount: number;
  collectionErrors: { ipoId: string; channelId: string; error: string }[];
  storageStatus: 'unchanged' | 'preview-only' | 'local-file-written';
  message: string;
}

export function getKstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Collect blogs on D-1 regardless of whether financial metrics have been reviewed. */
export function identifyPipelineTargets(
  ipos: IpoItem[], targetDateStr?: string, forceStockName?: string
): { targets: PipelineTarget[]; skipped: { stock: IpoItem; reason: string }[] } {
  const todayStr = targetDateStr || getKstDateString();
  if (!isReviewDate(todayStr)) throw new Error('수집 기준 날짜는 YYYY-MM-DD 형식이어야 합니다.');
  const today = new Date(`${todayStr}T00:00:00+09:00`);
  const tomorrowStr = getKstDateString(new Date(today.getTime() + 86400000));
  const targets: PipelineTarget[] = [];
  const skipped: { stock: IpoItem; reason: string }[] = [];
  for (const ipo of ipos) {
    if (ipo.isCancelled || !isReviewDate(ipo.subscriptionStart) || getEffectiveIpoStatus(ipo, today) === 'LISTED') {
      skipped.push({ stock: ipo, reason: '공모 취소·상장 완료 또는 확인 가능한 청약 일정이 없어 제외' });
      continue;
    }
    if (forceStockName) {
      if ([ipo.name, ipo.id, ipo.code].includes(forceStockName)) targets.push({ ipo, triggerType: 'MANUAL_FORCE', reason: '관리자가 지정한 종목의 실제 블로그 원문 수집' });
      else skipped.push({ stock: ipo, reason: '수동 지정한 종목이 아니므로 제외' });
    } else if (ipo.subscriptionStart === tomorrowStr) {
      targets.push({ ipo, triggerType: 'DAY_BEFORE_SUBSCRIPTION', reason: `청약 D-1 실제 블로그 수집 (${ipo.subscriptionStart} 청약 시작)` });
    } else skipped.push({ stock: ipo, reason: '청약 D-1이 아니므로 제외' });
  }
  return { targets, skipped };
}

export async function runMethod2Pipeline(options?: {
  targetDate?: string;
  forceStockName?: string;
  allIpos?: IpoItem[];
  channels?: ReviewChannel[];
  now?: Date;
  fetcher?: typeof fetch;
  persist?: boolean;
  // Injectable only by code/fixture tests; request payloads cannot supply functions.
  collector?: typeof collectReviewsForIpos;
  archive?: ReviewArchive;
}): Promise<PipelineExecutionResult> {
  const now = options?.now || new Date();
  const executionDate = options?.targetDate || getKstDateString(now);
  const { targets, skipped } = identifyPipelineTargets(options?.allIpos || getAllIpos(), executionDate, options?.forceStockName);
  const processedTargets: PipelineExecutionResult['processedTargets'] = [];
  let storageStatus: PipelineExecutionResult['storageStatus'] = 'unchanged';
  let snapshots: ReviewSnapshot[] = [];
  let visibleSnapshots: ReviewSnapshot[] = [];
  if (targets.length > 0) {
    const collector = options?.collector || collectReviewsForIpos;
    snapshots = await collector(targets.map((target) => target.ipo), { channels: options?.channels, now, fetcher: options?.fetcher });
    const expected = new Set(targets.map((target) => reviewSnapshotKey(target.ipo.id, target.ipo.subscriptionStart)));
    const received = new Set(snapshots.map((snapshot) => reviewSnapshotKey(snapshot.ipoId, snapshot.subscriptionStart)));
    if (snapshots.length !== expected.size || received.size !== expected.size || Array.from(received).some((key) => !expected.has(key))) {
      throw new Error('수집 결과의 종목과 청약 일정이 요청 대상과 일치하지 않습니다.');
    }
    const previous = options?.archive ? normalizeReviewArchive(options.archive) : loadServerReviewArchive();
    const merged = mergeReviewSnapshots(previous, snapshots);
    visibleSnapshots = snapshots.map((snapshot) => merged.snapshots[reviewSnapshotKey(snapshot.ipoId, snapshot.subscriptionStart)]);
    const persist = options?.persist ?? !process.env.VERCEL;
    if (persist) {
      saveServerReviewArchive(merged);
      storageStatus = 'local-file-written';
    } else storageStatus = 'preview-only';

    for (const target of targets) {
      const snapshot = merged.snapshots[reviewSnapshotKey(target.ipo.id, target.ipo.subscriptionStart)];
      const analysis = await analyzeIpoSentiment({ ...target.ipo, reviewCollection: snapshot }, target.triggerType);
      processedTargets.push({
        stockName: target.ipo.name, stockCode: target.ipo.code, triggerType: target.triggerType, reason: target.reason,
        beforeScore: target.ipo.aiScore, afterScore: analysis.aiScore, scoreGrade: analysis.scoreGrade,
        llmUsed: analysis.llmUsed, llmModel: analysis.llmModel, headline: analysis.aiSummary.headline,
        collectionStatus: snapshot.status,
        fetchedCount: snapshot.channels.reduce((sum, channel) => sum + channel.fetchedCount, 0),
        reviewCount: snapshots.find((item) => item.ipoId === snapshot.ipoId && item.subscriptionStart === snapshot.subscriptionStart)!.reviews.length,
      });
    }
  }
  const collectionErrors = snapshots.flatMap((snapshot) => snapshot.channels
    .filter((channel) => channel.status === 'failed')
    .map((channel) => ({ ipoId: snapshot.ipoId, channelId: channel.channelId, error: channel.error || '원문 수집 실패' })));
  const reviewsCollectedCount = snapshots.reduce((sum, snapshot) => sum + (snapshot.status === 'failed' ? 0 : snapshot.reviews.length), 0);
  return {
    executionDate, processedCount: processedTargets.length, skippedCount: skipped.length, processedTargets,
    skippedStocks: skipped.map(({ stock, reason }) => ({ stockName: stock.name, status: stock.status, subscriptionStart: stock.subscriptionStart, reason })),
    reviewSnapshots: visibleSnapshots, reviewsCollectedCount, collectionErrors, storageStatus,
    message: targets.length === 0 ? '청약 D-1 또는 수동 지정 수집 대상이 없습니다.'
      : storageStatus === 'local-file-written'
        ? `실제 블로그 ${reviewsCollectedCount}건을 수집하고 로컬 스냅샷을 확인했습니다. 운영 반영에는 저장소 커밋과 배포가 필요합니다.`
        : `실제 블로그 ${reviewsCollectedCount}건을 미리보기로 반환했습니다. 운영 스냅샷은 GitHub 수집 작업과 배포로 갱신합니다.`,
  };
}
