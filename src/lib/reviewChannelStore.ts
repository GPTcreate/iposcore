import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReviewChannel } from '../types/reviews';

const filename = path.join(process.cwd(), 'src', 'data', 'reviewChannels.json');

export function makeBlogChannel(id: string, name: string, inputUrl: string, isActive = true): ReviewChannel {
  const url = new URL(inputUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) throw new Error('HTTPS 블로그 주소를 입력하세요.');
  if (url.hostname === 'blog.naver.com') {
    const match = url.pathname.match(/^\/([a-zA-Z0-9_-]{2,50})\/?$/);
    if (!match) throw new Error('개별 게시물 대신 네이버 블로그 홈 주소를 입력하세요.');
    return { id, name, type: 'BLOG', url: `https://blog.naver.com/${match[1]}`, feedUrl: `https://rss.blog.naver.com/${match[1]}.xml`, isActive };
  }
  if (/^[a-z0-9][a-z0-9-]*\.tistory\.com$/.test(url.hostname) && /^\/?$/.test(url.pathname)) {
    return { id, name, type: 'BLOG', url: `https://${url.hostname}`, feedUrl: `https://${url.hostname}/rss`, isActive };
  }
  throw new Error('네이버 블로그 또는 티스토리 홈 주소만 지원합니다.');
}

export function loadReviewChannels(): ReviewChannel[] {
  const parsed: unknown = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length > 12) throw new Error('블로그 채널 설정은 최대 12개의 배열이어야 합니다.');
  return parsed.map((item) => {
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.url !== 'string' || typeof item.isActive !== 'boolean') throw new Error('블로그 채널 설정을 확인하세요.');
    return makeBlogChannel(item.id, item.name, item.url, item.isActive);
  });
}

export function saveReviewChannels(channels: ReviewChannel[]): void {
  if (process.env.VERCEL) throw new Error('운영 채널 설정은 저장소에서 변경한 뒤 배포해야 합니다.');
  if (channels.length > 12) throw new Error('블로그 채널은 최대 12개까지 지원합니다.');
  const content = `${JSON.stringify(channels, null, 2)}\n`;
  const temporary = `${filename}.tmp-${randomUUID()}`;
  try {
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, filename);
    if (fs.readFileSync(filename, 'utf8') !== content) throw new Error('채널 설정 저장을 확인하지 못했습니다.');
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
