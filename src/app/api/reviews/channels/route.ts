import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { loadReviewChannels, makeBlogChannel, saveReviewChannels } from '@/lib/reviewChannelStore';
import { loadServerReviewArchive } from '@/lib/reviewArchiveServer';

export const dynamic = 'force-dynamic';
const result = () => {
  const snapshots = Object.values(loadServerReviewArchive().snapshots);
  const channels = loadReviewChannels().map((channel) => {
    const attempts = snapshots.filter((snapshot) => snapshot.channels.some((item) => item.channelId === channel.id)).sort((a, b) => b.collectedAt.localeCompare(a.collectedAt));
    const urls = new Set(snapshots.flatMap((snapshot) => snapshot.reviews.filter((review) => review.evidence?.feedUrl === channel.feedUrl).map((review) => review.url)));
    return { ...channel, collectedCount: urls.size, lastCrawledAt: attempts[0]?.collectedAt };
  });
  return { channels, editable: !process.env.VERCEL, storage: 'repository-file' };
};

export async function GET(request: Request) {
  if (!verifyAdminRequest(request).authorized) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  try { return NextResponse.json(result()); }
  catch { return NextResponse.json({ error: '채널 설정을 읽지 못했습니다.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!verifyAdminRequest(request).authorized) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  if (process.env.VERCEL) return NextResponse.json({ error: '운영 채널 설정은 저장소에서 변경한 뒤 배포해야 합니다. 화면에서만 변경한 설정은 저장된 것으로 처리하지 않습니다.' }, { status: 409 });
  try {
    const body = await request.json();
    let channels = loadReviewChannels();
    if (body.action === 'add') {
      if (typeof body.name !== 'string' || !body.name.trim() || typeof body.url !== 'string') throw new Error('채널명과 주소를 입력하세요.');
      const channel = makeBlogChannel(randomUUID(), body.name.trim().slice(0, 100), body.url);
      if (channels.some((item) => item.feedUrl === channel.feedUrl)) throw new Error('이미 등록된 블로그입니다.');
      channels.push(channel);
    } else if (body.action === 'toggle') {
      if (!channels.some((item) => item.id === body.id)) throw new Error('채널을 찾을 수 없습니다.');
      channels = channels.map((item) => item.id === body.id ? { ...item, isActive: !item.isActive } : item);
    } else if (body.action === 'delete') {
      if (!channels.some((item) => item.id === body.id)) throw new Error('채널을 찾을 수 없습니다.');
      channels = channels.filter((item) => item.id !== body.id);
    } else throw new Error('지원하지 않는 변경입니다.');
    saveReviewChannels(channels);
    return NextResponse.json({ success: true, ...result() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '채널 설정을 저장하지 못했습니다.' }, { status: 400 });
  }
}
