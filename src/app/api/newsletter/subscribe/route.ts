import { NextResponse } from 'next/server';
import { validateEmail } from '@/lib/emailValidator';
import { registerSubscriber } from '@/lib/subscriberStore';
import { sendVerificationEmail, isEmailConfigured } from '@/lib/emailSender';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // 스팸 및 이메일 폭탄 방지: 10분당 동일 IP 최대 5회 구독 요청 허용
    const rateLimit = checkRateLimit(`subscribe:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `단시간 내 너무 많은 구독 요청이 발생했습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, frequency = 'ALL' } = body;

    // 1. 가짜 메일 및 유효성 엄격 검증
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.reason,
          suggestedCorrection: validation.suggestedCorrection,
        },
        { status: 400 }
      );
    }

    const cleanEmail = validation.normalizedEmail;
    const emailConfigured = isEmailConfigured();

    if (!emailConfigured) {
      return NextResponse.json({ success: false, error: '메일 발송 설정을 확인 중입니다. 잠시 후 다시 신청해주세요.' }, { status: 503 });
    }
    const { subscriber, isNew } = await registerSubscriber({
      email: cleanEmail,
      frequency: frequency === 'WEEKLY' ? 'WEEKLY' : 'ALL',
      skipDoubleOptIn: false,
    });
    if (!isNew && subscriber.status === 'ACTIVE') {
      return NextResponse.json({ success: true, message: '이미 구독 중인 이메일입니다.', status: 'ACTIVE' });
    }
    const sendResult = await sendVerificationEmail(subscriber);
    if (!sendResult.success) {
      return NextResponse.json({ success: false, error: '구독 확인 메일을 발송하지 못했습니다. 잠시 후 다시 신청해주세요.' }, { status: 502 });
    }
    const deliveryMode = sendResult.mode;
    const message = '수신 동의 확인 메일을 발송했습니다. 메일함에서 [구독 동의] 버튼을 눌러주시면 신청이 완료됩니다.';

    return NextResponse.json({
      success: true,
      message,
      email: cleanEmail,
      status: subscriber.status,
      emailConfigured,
      deliveryMode,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '서버 처리 중 일시적인 오류가 발생했습니다.';
    console.error('[SubscribeRoute] 처리 에러:', errorMsg);
    return NextResponse.json(
      {
        error: errorMsg.includes('영속 저장소')
          ? errorMsg
          : '서버 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}
