import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 무차별 대입(Brute-force) 공격 방지: 10분당 최대 5회 실패 허용
    const rateLimit = checkRateLimit(`admin-auth:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `너무 많은 로그인 시도가 발생했습니다. ${rateLimit.retryAfterSec}초 후 다시 시도해주세요.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN을 입력해주세요.' }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(String(pin));
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '관리자 인증 PIN 번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '관리자 인증 성공',
      adminKey: String(pin).trim(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '인증 처리 실패' },
      { status: 500 }
    );
  }
}
