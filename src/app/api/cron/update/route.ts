import { NextResponse } from 'next/server';
import { runMethod2Pipeline, getKstDateString } from '@/lib/pipeline';
import { syncNewIposFromDart } from '@/lib/ipoServerStore';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isManual = searchParams.get('manual') === 'true';
    const forceStock = searchParams.get('stock') || undefined;
    const testDate = searchParams.get('testDate') || undefined;

    // Vercel Cron 또는 수동 실행 승인 검증
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isManual) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    // 1. DART 전자공시 오픈 API 실시간 조회 및 신규 공모주 카드 자동 감지/생성
    const dartSync = await syncNewIposFromDart({ days: 30, limit: 10 });

    // 2. '방법 2' 정책에 따른 선별적 파이프라인 실행
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
      policy: '방법 2 (DART 신규 접수 카드 자동생성 + D-1 수요예측 확정 시 1회 분석)',
      dartFilingsCount: dartSync.filingsCount,
      dartNewCardsCreated: dartSync.newCount,
      dartSyncMessage: dartSync.message,
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
