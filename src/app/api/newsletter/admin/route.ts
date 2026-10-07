import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSubscribersAsync,
  verifySubscriber,
  verifySubscriberByEmail,
  unsubscribeSubscriber,
  syncToGoogleSheet,
  sanitizeSubscriber,
  Subscriber,
} from '@/lib/subscriberStore';
import { sendEmail, sendVerificationEmail } from '@/lib/emailSender';

export async function GET() {
  const subscribers: Subscriber[] = await getAllSubscribersAsync();

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === 'ACTIVE').length,
    pending: subscribers.filter((s) => s.status === 'PENDING').length,
    cancelled: subscribers.filter((s) => s.status === 'CANCELLED').length,
  };

  // 보안: 클라이언트에 민감한 verificationToken / unsubscribeToken 노출 방지
  const safeSubscribers = subscribers.map(sanitizeSubscriber);

  return NextResponse.json({
    subscribers: safeSubscribers,
    stats,
    googleSheetWebhookConfigured: !!process.env.GOOGLE_SHEET_WEBHOOK_URL,
    resendConfigured: !!process.env.RESEND_API_KEY,
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token, testTo } = body;

    if (action === 'MANUAL_UNSUBSCRIBE') {
      const updated = await unsubscribeSubscriber(token || email);
      return NextResponse.json({
        success: !!updated,
        subscriber: updated ? sanitizeSubscriber(updated) : null,
      });
    }

    if (action === 'MANUAL_VERIFY') {
      let updated: Subscriber | null = null;
      if (token) {
        updated = await verifySubscriber(token);
      } else if (email) {
        updated = await verifySubscriberByEmail(email);
      }
      return NextResponse.json({
        success: !!updated,
        subscriber: updated ? sanitizeSubscriber(updated) : null,
      });
    }

    if (action === 'SEND_TEST_EMAIL') {
      const target = testTo || 'test@example.com';
      const result = await sendEmail({
        to: target,
        subject: '[공모주 알리미] 테스트 발송 메일입니다',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>공모주 알리미 테스트 메일</h2>
            <p>메일 발송 시스템이 정상적으로 연결되었습니다.</p>
            <p>발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
          </div>
        `,
      });
      return NextResponse.json({ success: result.success, mode: result.mode });
    }

    if (action === 'RESEND_VERIFICATION') {
      const subscribers = await getAllSubscribersAsync();
      const sub = subscribers.find((s: Subscriber) => s.email === email?.toLowerCase());
      if (!sub) return NextResponse.json({ error: '구독자를 찾을 수 없습니다.' }, { status: 404 });
      const result = await sendVerificationEmail(sub);
      return NextResponse.json({ success: result.success, mode: result.mode });
    }

    if (action === 'TEST_SHEETS_SYNC') {
      const dummySub = {
        id: 'test_sync',
        email: email || 'test@iposcore.kr',
        status: 'ACTIVE' as const,
        frequency: 'ALL' as const,
        verificationToken: 'test_token',
        unsubscribeToken: 'test_unsub',
        subscribedAt: new Date().toISOString(),
      };
      const synced = await syncToGoogleSheet('SUBSCRIBE', dummySub);
      return NextResponse.json({
        success: synced,
        message: synced
          ? '구글 시트 웹훅 전송 성공!'
          : 'GOOGLE_SHEET_WEBHOOK_URL 환경변수가 없거나 전송에 실패했습니다.',
      });
    }

    return NextResponse.json({ error: '알 수 없는 요청입니다.' }, { status: 400 });
  } catch (err) {
    console.error('[Admin Newsletter POST Error]:', err);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
