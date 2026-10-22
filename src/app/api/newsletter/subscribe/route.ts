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

    // 2. 가입 처리:
    // 실제 메일 발송 서버(Resend/SMTP)가 설정되어 있으면 Double Opt-in (PENDING) 수행
    // 메일 발송 서버가 아직 설정되지 않은 경우 사용자가 헛걸음하지 않도록 즉시 활성화 (ACTIVE)
    const { subscriber, isNew } = await registerSubscriber({
      email: cleanEmail,
      frequency: frequency === 'WEEKLY' ? 'WEEKLY' : 'ALL',
      skipDoubleOptIn: !emailConfigured,
    });

    let message: string;
    let deliveryMode: string;

    if (emailConfigured) {
      // 3. 실제 메일 발송 서버 연동 시 수신 동의 확인 메일 발송
      const sendResult = await sendVerificationEmail(subscriber);
      deliveryMode = sendResult.mode;
      message = isNew
        ? `${cleanEmail} 주소로 수신 동의 확인 메일을 발송했습니다. 메일함에서 [구독 동의] 버튼을 눌러주시면 신청이 최종 완료됩니다.`
        : `이미 등록된 이메일입니다. 구독 확인 메일을 다시 발송해 드렸습니다. 메일함을 확인해주세요.`;
    } else {
      // 메일 발송 미설정 시 즉시 구독 완료 안내
      deliveryMode = 'direct_active';
      message = isNew
        ? `${cleanEmail} 님의 구독 신청이 완료되었습니다! 매주 월요일 아침 공모주 핵심 리포트를 보내드립니다.`
        : `${cleanEmail} 님은 이미 구독 중입니다. 매주 월요일 아침 공모주 핵심 리포트가 발송됩니다.`;
    }

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
