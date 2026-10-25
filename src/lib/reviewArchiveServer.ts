import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import compiledArchive from '../data/reviewSnapshots.json';
import type { ReviewArchive } from '../types/reviews';
import { normalizeReviewArchive } from './reviewArchive';
import { setRuntimeReviewArchive } from './ipoStore';

const archivePath = () => path.join(process.cwd(), 'src', 'data', 'reviewSnapshots.json');

export function loadServerReviewArchive(): ReviewArchive {
  let archive: ReviewArchive;
  try {
    const input = JSON.parse(fs.readFileSync(archivePath(), 'utf8'));
    if (!input || input.version !== 1 || !input.snapshots || typeof input.snapshots !== 'object' || Array.isArray(input.snapshots)) throw new Error('Invalid archive');
    archive = normalizeReviewArchive(input);
    if (Object.keys(input.snapshots).length !== Object.keys(archive.snapshots).length) throw new Error('Invalid snapshot');
  } catch {
    console.warn('[ReviewArchive] 로컬 스냅샷을 읽지 못해 배포에 포함된 스냅샷을 사용합니다.');
    archive = normalizeReviewArchive(compiledArchive);
  }
  setRuntimeReviewArchive(archive);
  return archive;
}

/** Local acknowledgement only. Vercel data is made durable through a repository deployment. */
export function saveServerReviewArchive(archive: ReviewArchive): void {
  if (process.env.VERCEL) throw new Error('운영 스냅샷은 저장소 배포 방식으로 갱신합니다. Vercel에서는 미리보기만 제공합니다.');
  const target = archivePath();
  const temporary = `${target}.${randomUUID()}.tmp`;
  const normalized = normalizeReviewArchive(archive);
  const content = `${JSON.stringify(normalized, null, 2)}\n`;
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, target);
    if (fs.readFileSync(target, 'utf8') !== content) throw new Error('스냅샷 저장 내용 확인에 실패했습니다.');
    setRuntimeReviewArchive(normalized);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
