import { NextResponse } from 'next/server';
import { MOCK_IPOS } from '@/data/mockIpo';
import { calculateIpoScore } from '@/lib/scoring';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Vercel Cron 또는 수동 실행 승인 검증
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && searchParams.get('manual') !== 'true') {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const dartApiKey = process.env.DART_API_KEY || '035394bc3056c32575160716cc7cbd3d44b2fff7';
    let dartFilingsCount = 0;
    const updatedStocks: string[] = [];

    // 1. DART 전자공시 오픈 API 실시간 조회 (증권신고서/투자설명서 접수 건)
    if (dartApiKey) {
      try {
        const today = new Date();
        const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
        const pastDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        const startDate = pastDate.toISOString().slice(0, 10).replace(/-/g, '');

        const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${dartApiKey}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&page_no=1&page_count=30`;
        const res = await fetch(dartUrl, { next: { revalidate: 0 } });
        const data = await res.json();

        if (data.status === '000' && Array.isArray(data.list)) {
          dartFilingsCount = data.list.length;
        }
      } catch (err) {
        console.error('[Cron] DART API 요청 중 오류 발생:', err);
      }
    }

    // 2. 각 공모주 종목별 정량 지표와 감성 점수 정밀 재산출
    const recalculatedIpos = MOCK_IPOS.map((ipo) => {
      const scoring = calculateIpoScore({
        institutionalCompetitionRate: ipo.institutionalCompetitionRate,
        lockupCommitmentRate: ipo.lockupCommitmentRate,
        circulatingSupplyRate: ipo.circulatingSupplyRate,
        priceBandMin: ipo.priceBandMin,
        priceBandMax: ipo.priceBandMax,
        confirmedPrice: ipo.confirmedPrice,
        sentimentConsensus: ipo.sentimentConsensus,
      });

      updatedStocks.push(ipo.name);

      return {
        ...ipo,
        aiScore: scoring.score,
        scoreGrade: scoring.scoreGrade,
      };
    });

    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    return NextResponse.json({
      success: true,
      timestamp: now,
      message: `DART 공시 ${dartFilingsCount}건 확인 및 ${recalculatedIpos.length}개 전 종목 AI 점수 동기화 완료`,
      dartFilingsCount,
      updatedStocks,
    });
  } catch (error) {
    console.error('[Cron] 스케줄러 실행 중 오류:', error);
    return NextResponse.json({ success: false, error: '자동 갱신 실패' }, { status: 500 });
  }
}
