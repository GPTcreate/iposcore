import { NextResponse } from 'next/server';
import { validateEmail } from '@/lib/emailValidator';
import { registerSubscriber } from '@/lib/subscriberStore';
import { sendVerificationEmail } from '@/lib/emailSender';

export async function POST(request: Request) {
  try {
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

    // 2. 가입 처리 (PENDING 상태로 등록 후 동의 메일 발송)
    const { subscriber, isNew } = await registerSubscriber({
      email: cleanEmail,
      frequency: frequency === 'WEEKLY' ? 'WEEKLY' : 'ALL',
      skipDoubleOptIn: false, // 동의하기 메일 발송을 위해 PENDING 시작
    });

    // 3. 수신 동의/인증 메일 자동 발송
    const sendResult = await sendVerificationEmail(subscriber);

    const message = isNew
      ? `${cleanEmail} 주소로 수신 동의 확인 메일을 발송했습니다. 메일함에서 [구독 동의] 버튼을 눌러주시면 신청이 최종 완료됩니다.`
      : `이미 등록된 이메일입니다. 구독 확인 메일을 다시 발송해 드렸습니다. 메일함을 확인해주세요.`;

    return NextResponse.json({
      success: true,
      message,
      email: cleanEmail,
      status: subscriber.status,
      deliveryMode: sendResult.mode,
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
