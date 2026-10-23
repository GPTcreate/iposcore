import { NextResponse } from 'next/server';
import { runMethod2Pipeline, getKstDateString } from '@/lib/pipeline';
import { syncNewIposFromDart } from '@/lib/ipoServerStore';
import { syncExistingIposWithDartFilings } from '@/lib/dartFilingSync';
import { syncListingReturnsForIpos } from '@/lib/stockPriceCrawler';
import { crossCheckAndSyncIpos } from '@/lib/crossCheckSync';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 철통 인증 검사: Vercel 정식 크론, CRON_SECRET Bearer 토큰, 또는 관리자 키 일치 시에만 실행 허용
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다. (Vercel Cron 또는 올바른 인증 키 필요)' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const forceStock = searchParams.get('stock') || undefined;
    const testDate = searchParams.get('testDate') || undefined;
    const forcePrices = searchParams.get('forcePrices') === 'true';

    // 1. DART 전자공시 오픈 API 실시간 조회 및 신규 공모주 카드 자동 감지/생성
    const dartSync = await syncNewIposFromDart({ days: 30, limit: 10 });

    // 2. 기존 청약예정/진행 종목의 DART 확정공시(발행조건확정/투자설명서) 자동 대조 및 수치(공모가, 유통비율 등) 갱신
    const confirmedSync = await syncExistingIposWithDartFilings({ days: 14 });

    // 2-1. 38커뮤니케이션/외부 포털 2중 교차 검증 및 자가 치유(Self-Healing Diff Audit)
    // 주관사의 상장일 변경(11/5 -> 11/4 등), 확정공모가, 기관경쟁률, 의무확약의 DART 누락/지연을 원천 방지
    const crossCheckSync = await crossCheckAndSyncIpos();

    // 3. 상장 완료 및 상장일 도래 종목의 실제 한국거래소(KRX) 실전 시초가·종가 자동 크롤링 동기화
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
      success: true,
      timestamp: now,
      policy: '방법 2 (DART 신규 접수 카드 자동생성 + 기존 종목 DART 확정공시 자동갱신 + KRX 실전거래 시세 자동 크롤링 + D-1 분석)',
      dartFilingsCount: dartSync.filingsCount,
      dartNewCardsCreated: dartSync.newCount,
      dartSyncMessage: dartSync.message,
      confirmedUpdatedCount: confirmedSync.updatedCount,
      confirmedUpdatedStocks: confirmedSync.updatedStocks,
      crossCheck: {
        updatedCount: crossCheckSync.updatedCount,
        updatedStocks: crossCheckSync.updatedStocks,
        message: crossCheckSync.message,
      },
      priceCrawler: {
        totalCandidates: priceSync.totalCandidates,
        updatedCount: priceSync.updatedCount,
        updatedStocks: priceSync.updatedStocks,
        skippedCount: priceSync.skippedCount,
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
