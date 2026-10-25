import { NextResponse } from 'next/server';
import { runMethod2Pipeline, getKstDateString } from '@/lib/pipeline';
import { syncNewIposFromDart } from '@/lib/ipoServerStore';
import { syncExistingIposWithDartFilings } from '@/lib/dartFilingSync';
import { syncListingReturnsForIpos } from '@/lib/stockPriceCrawler';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Configured CRON_SECRET Bearer or ADMIN_SECRET only; platform headers are not credentials.
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다. (Vercel Cron 또는 올바른 인증 키 필요)' }, { status: 401 });
    }
    if (process.env.VERCEL) {
      return NextResponse.json({ success: false, storageStatus: 'repository-job-required', reviewsExecuted: false,
        error: '운영 자동 갱신은 저장소 작업과 배포가 필요합니다. 이 요청에서는 금융 변경과 리뷰 수집을 실행하지 않았습니다.' }, { status: 409 });
    }

    const { searchParams } = new URL(request.url);
    const forceStock = searchParams.get('stock') || undefined;
    const testDate = searchParams.get('testDate') || undefined;
    const forcePrices = searchParams.get('forcePrices') === 'true';

    // 1. DART 전자공시 오픈 API 실시간 조회 및 신규 공모주 카드 자동 감지/생성
    const dartSync = await syncNewIposFromDart({ days: 30, limit: 10 });

    // 2. 기존 청약예정/진행 종목의 DART 확정공시(발행조건확정/투자설명서) 자동 대조 및 수치(공모가, 유통비율 등) 갱신
    const confirmedSync = await syncExistingIposWithDartFilings({ days: 14 });

    // 3. 네이버 시세의 실제 상장일과 일치하는 시초가·종가만 동기화
    const priceSync = await syncListingReturnsForIpos({ forceAll: forcePrices });

    // 4. '방법 2' 정책에 따른 선별적 파이프라인 실행
    const allIpos = getAllEffectiveIpos();
    const pipelineResult = await runMethod2Pipeline({
      targetDate: testDate || getKstDateString(),
      forceStockName: forceStock,
      allIpos,
    });

    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    return NextResponse.json({
      success: dartSync.success && confirmedSync.success && priceSync.success
        && pipelineResult.reviewSnapshots.every((snapshot) => snapshot.status !== 'failed'),
      reviewsExecuted: true,
      timestamp: now,
      policy: '공시 후보·수치 동기화 및 D-1 실제 블로그 점검 (운영 리뷰 저장은 GitHub 스냅샷·배포)',
      dartFilingsCount: dartSync.filingsCount,
      dartNewCardsCreated: dartSync.newCount,
      dartSyncMessage: dartSync.message,
      confirmedUpdatedCount: confirmedSync.updatedCount,
      confirmedUpdatedStocks: confirmedSync.updatedStocks,
      confirmedErrors: confirmedSync.errors,
      confirmedPendingCount: confirmedSync.pendingCount,
      confirmedPendingStocks: confirmedSync.pendingStocks,
      crossCheck: {
        updatedCount: 0,
        updatedStocks: [],
        message: '자동 단계에서 실행하지 않았습니다. 로컬 관리자에서 별도로 수동 실행할 수 있습니다.',
      },
      priceCrawler: {
        totalCandidates: priceSync.totalCandidates,
        updatedCount: priceSync.updatedCount,
        updatedStocks: priceSync.updatedStocks,
        skippedCount: priceSync.skippedCount,
        deferredCount: priceSync.deferredCount,
        errorCount: priceSync.errors.length,
      },
      newlyCreatedIpos: dartSync.newIpos.map((i) => ({ name: i.name, code: i.code, status: i.status })),
      ...pipelineResult,
    });
  } catch (error) {
    console.error('[Cron] 스케줄러 실행 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '자동 갱신 실패',
      },
      { status: 500 }
    );
  }
}
