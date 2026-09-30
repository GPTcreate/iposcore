import { NextResponse } from 'next/server';

// 메모리 캐시 (실제 운영 시 Supabase 또는 DB 연동)
const subscribers: { email: string; frequency: string; subscribedAt: string }[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, frequency = 'ALL' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 중복 체크
    const existing = subscribers.find((sub) => sub.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.frequency = frequency;
      return NextResponse.json({
        message: '이미 등록된 이메일입니다. 구독 옵션이 업데이트되었습니다.',
        email,
      });
    }

    subscribers.push({
      email,
      frequency,
      subscribedAt: new Date().toISOString(),
    });

    console.log(`[Newsletter] 신규 구독자 등록: ${email} (${frequency}) - 누적: ${subscribers.length}명`);

    // 향후 Resend / Stibee 연동 시 여기서 Welcome 메일 발송 트리거
    return NextResponse.json({
      message: '성공적으로 구독되었습니다! 매주 월요일 아침 첫 리포트를 보내드립니다.',
      email,
      subscriberCount: subscribers.length
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: '서버 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
