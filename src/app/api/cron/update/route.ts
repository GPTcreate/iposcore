import { NextResponse } from 'next/server';
import { runMethod2Pipeline, getKstDateString } from '@/lib/pipeline';

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

    const dartApiKey = process.env.DART_API_KEY || '035394bc3056c32575160716cc7cbd3d44b2fff7';
    let dartFilingsCount = 0;

    // 1. DART 전자공시 오픈 API 실시간 조회 (신규 증권신고서/투자설명서 접수 건)
    if (dartApiKey) {
      try {
        const today = new Date();
        const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
        const pastDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

        const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${dartApiKey}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&page_no=1&page_count=20`;
        const res = await fetch(dartUrl, { next: { revalidate: 0 } });
        const data = await res.json();

        if (data.status === '000' && Array.isArray(data.list)) {
          dartFilingsCount = data.list.length;
        }
      } catch (err) {
        console.error('[Cron] DART API 요청 중 오류 발생:', err);
      }
    }

    // 2. '방법 2' 정책에 따른 선별적 파이프라인 실행
    // (매일 무차별 실행 X ➡️ ① 청약 예정 등록 시 1회 + ② 청약 전날 D-1 확정 시 1회만 정확히 실행)
    const pipelineResult = await runMethod2Pipeline({
      targetDate: testDate || getKstDateString(),
      forceStockName: forceStock,
    });

    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    return NextResponse.json({
      success: true,
      timestamp: now,
      policy: '방법 2 (청약 예정 등록 시 1회 + 청약 전날 D-1 수요예측 확정 시 1회)',
      dartFilingsCount,
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
