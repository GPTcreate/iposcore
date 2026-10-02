import { NextResponse } from 'next/server';
import { getAllSubscribers } from '@/lib/subscriberStore';
import { sendWeeklyReportEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

/**
 * [매주 월요일 아침 09:35 KST] 정기 공모주 핵심 리포트 발송 크론 라우트
 * - Vercel Cron: 35 0 * * 1 (UTC 00:35 Mon == KST 09:35 Mon)
 * - 수신 동의가 완료된 ACTIVE 구독자에게 이번 주 공모주 요약 및 배정 공략 발송
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const isManual = searchParams.get('manual') === 'true';
    const cronSecret = process.env.CRON_SECRET;

    // 인증 검사 (Vercel Cron 헤더 또는 관리자 manual 쿼리)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isManual) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const allSubscribers = getAllSubscribers();
    const activeSubscribers = allSubscribers.filter((s) => s.status === 'ACTIVE');

    const executionTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        success: true,
        timestamp: executionTime,
        policy: '매주 월요일 아침 09:35 KST 주간 공모주 리포트',
        activeSubscribersCount: 0,
        sentCount: 0,
        message: '현재 활성 구독자(ACTIVE)가 없어 발송 대기 상태입니다.',
      });
    }

    const results = [];
    for (const sub of activeSubscribers) {
      try {
        const sendRes = await sendWeeklyReportEmail(sub);
        results.push({ email: sub.email, success: sendRes.success, mode: sendRes.mode });
      } catch (err) {
        results.push({ email: sub.email, success: false, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: executionTime,
      policy: '매주 월요일 아침 09:35 KST 주간 공모주 리포트',
      activeSubscribersCount: activeSubscribers.length,
      sentCount: results.filter((r) => r.success).length,
      details: results,
      message: `총 ${activeSubscribers.length}명의 활성 구독자에게 주간 핵심 리포트 발송을 완료했습니다.`,
    });
  } catch (error) {
    console.error('[Cron:WeeklyNewsletter] 에러:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
