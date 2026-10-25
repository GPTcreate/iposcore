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

    const credential = typeof pin === 'string' ? pin : typeof pin === 'number' && Number.isFinite(pin) ? String(pin) : '';
    if (!credential.trim()) {
      return NextResponse.json({ success: false, error: '관리자 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(credential);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '관리자 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '관리자 인증 성공',
      adminKey: credential.trim(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { success: false, error: '관리자 인증을 처리하지 못했습니다.' },
      { status: 500 }
    );
  }
}
