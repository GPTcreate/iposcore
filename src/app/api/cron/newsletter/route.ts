import { NextResponse } from 'next/server';
import { getAllSubscribersAsync } from '@/lib/subscriberStore';
import { sendWeeklyReportEmail } from '@/lib/emailSender';
import { syncExistingIposWithDartFilings } from '@/lib/dartFilingSync';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { isReviewedIpo } from '@/lib/contentQuality';

export const dynamic = 'force-dynamic';

/**
 * [매주 월요일 아침 09:35 KST] 정기 공모주 핵심 리포트 발송 크론 라우트
 * - Vercel Cron: 35 0 * * 1 (UTC 00:35 Mon == KST 09:35 Mon)
 * - 수신 동의가 완료된 ACTIVE 구독자에게 이번 주 공모주 요약 및 배정 공략 발송
 */
export async function GET(request: Request) {
  try {
    // 철통 인증 검사: Vercel 정식 크론, CRON_SECRET Bearer 토큰, 또는 관리자 키 일치 시에만 실행 허용
    const auth = verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다. (Vercel Cron 또는 올바른 인증 키 필요)' }, { status: 401 });
    }

    // 발송 직전 최신 DART 확정공시(확정 공모가, 수요예측 경쟁률) 실시간 동기화
    try {
      await syncExistingIposWithDartFilings({ days: 7 });
    } catch (syncErr) {
      console.warn('[Cron:Newsletter] 발송 전 DART 동기화 경고 (기존 데이터로 계속 진행):', syncErr);
    }

    if (!getAllEffectiveIpos().some((ipo) => isReviewedIpo(ipo) && !ipo.isCancelled && ipo.status !== 'LISTED')) {
      return NextResponse.json({ success: true, sentCount: 0, message: '원문 확인을 마친 청약 자료가 없어 발송을 보류합니다.' });
    }

    const allSubscribers = await getAllSubscribersAsync();
    const activeSubscribers = allSubscribers.filter(
      (s) =>
        s.status === 'ACTIVE' &&
        !s.email.endsWith('@iposcore.kr') &&
        !s.email.endsWith('@example.com') &&
        !s.email.startsWith('test_') &&
        !s.email.startsWith('testuser') &&
        s.email !== 'test@test.com'
    );

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
