import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { runMethod2Pipeline } from '@/lib/pipeline';
import { getAllIpos } from '@/lib/ipoStore';
import { loadReviewChannels } from '@/lib/reviewChannelStore';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!verifyAdminRequest(request).authorized) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  try {
    loadServerCustomIpos();
    const body = await request.json();
    if (body.stock && (typeof body.stock !== 'string' || !getAllIpos().some((ipo) => ipo.name === body.stock || ipo.id === body.stock))) {
      return NextResponse.json({ error: '등록된 종목을 선택하세요.' }, { status: 400 });
    }
    const selected = body.stock ? getAllIpos().find((ipo) => ipo.name === body.stock || ipo.id === body.stock) : undefined;
    const result = await runMethod2Pipeline({
      forceStockName: selected?.name,
      channels: loadReviewChannels(),
      persist: body.dryRun !== true && !process.env.VERCEL,
    });
    const failedCount = result.reviewSnapshots.filter((snapshot) => snapshot.status === 'failed').length;
    return NextResponse.json({ success: failedCount === 0, failedCount, ...result });
  } catch {
    return NextResponse.json({ error: '블로그 수집을 완료하지 못했습니다. 실행 기록과 채널 상태를 확인하세요.' }, { status: 500 });
  }
}
