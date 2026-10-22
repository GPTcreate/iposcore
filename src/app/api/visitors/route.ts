import { NextResponse } from 'next/server';
import { recordVisit, getVisitorStats } from '@/lib/visitorTracker';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // 무차별 카운터 조작 방지 (1분당 동일 IP 최대 20회)
    const rateLimit = checkRateLimit(`visitor:${ip}`, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      const stats = await getVisitorStats();
      return NextResponse.json({ success: true, ...stats, rateLimited: true });
    }

    const stats = await recordVisit();
    return NextResponse.json({ success: true, ...stats });
  } catch {
    return NextResponse.json({ success: false, error: '방문 기록 실패' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await getVisitorStats();
    return NextResponse.json({ success: true, ...stats });
  } catch {
    return NextResponse.json({ success: false, error: '통계 조회 실패' }, { status: 500 });
  }
}
