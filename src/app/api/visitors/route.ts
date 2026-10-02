import { NextResponse } from 'next/server';
import { recordVisit, getVisitorStats } from '@/lib/visitorTracker';

export async function POST() {
  try {
    const stats = await recordVisit();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: '방문 기록 실패' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = getVisitorStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: '통계 조회 실패' }, { status: 500 });
  }
}
