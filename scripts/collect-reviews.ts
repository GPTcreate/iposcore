import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { IpoItem } from '../src/types/ipo';
import type { ReviewArchive, ReviewSnapshot } from '../src/types/reviews';
import { collectReviewsForIpos } from '../src/lib/reviewCollector';
import { isReviewDate, mergeReviewSnapshots, normalizeReviewArchive } from '../src/lib/reviewArchive';

interface CollectionOptions { date: string; stockId?: string; write: boolean; help: boolean }
const kstDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export function parseCollectionArguments(args: string[], now = new Date()): CollectionOptions {
  const options: CollectionOptions = { date: kstDate(now), write: false, help: false };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (seen.has(argument)) throw new Error(`중복 옵션: ${argument}`);
    seen.add(argument);
    if (argument === '--write') options.write = true;
    else if (argument === '--dry-run') options.write = false;
    else if (argument === '--help') options.help = true;
    else if (argument === '--date' || argument === '--stock') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`${argument} 값을 입력하세요.`);
      if (argument === '--date') {
        if (!isReviewDate(value)) throw new Error('--date는 실제 존재하는 YYYY-MM-DD 날짜여야 합니다.');
        options.date = value;
      } else {
        if (value.trim() !== value || value.length > 200) throw new Error('--stock에는 정확한 종목 ID를 입력하세요.');
        options.stockId = value;
      }
    } else throw new Error(`지원하지 않는 옵션: ${argument}`);
  }
  if (seen.has('--write') && seen.has('--dry-run')) throw new Error('--write와 --dry-run은 함께 사용할 수 없습니다.');
  return options;
}

export function selectReviewCollectionTargets(ipos: IpoItem[], options: Pick<CollectionOptions, 'date' | 'stockId'>): IpoItem[] {
  if (!isReviewDate(options.date)) throw new Error('기준 날짜 형식이 올바르지 않습니다.');
  const tomorrow = new Date(`${options.date}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);
  if (options.stockId && !ipos.some((ipo) => ipo.id === options.stockId)) throw new Error('--stock과 정확히 일치하는 종목 ID가 없습니다.');
  return ipos.filter((ipo) => !ipo.isCancelled && ipo.status !== 'LISTED'
    && (!isReviewDate(ipo.listingDate) || ipo.listingDate > options.date)
    && isReviewDate(ipo.subscriptionStart)
    && (options.stockId ? ipo.id === options.stockId : ipo.subscriptionStart === tomorrowDate));
}

function loadSourceIpos(root: string): IpoItem[] {
  const source = fs.readFileSync(path.join(root, 'src', 'data', 'mockIpo.ts'), 'utf8');
  const marker = 'export const MOCK_IPOS: IpoItem[] = ';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('기본 종목 데이터의 JSON 선언을 찾지 못했습니다.');
  const base = JSON.parse(source.slice(start + marker.length).trim().replace(/;$/, ''));
  const custom = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'customIpos.json'), 'utf8'));
  if (!Array.isArray(base) || !Array.isArray(custom)) throw new Error('종목 파일은 배열이어야 합니다.');
  const combined = new Map<string, IpoItem>();
  for (const ipo of [...base, ...custom] as IpoItem[]) {
    if (!ipo || typeof ipo.id !== 'string' || typeof ipo.name !== 'string') throw new Error('종목 ID 또는 이름이 올바르지 않습니다.');
    combined.set(ipo.code || ipo.id, ipo);
  }
  return Array.from(combined.values());
}

function readArchive(file: string): ReviewArchive {
  const input = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!input || input.version !== 1 || !input.snapshots || typeof input.snapshots !== 'object' || Array.isArray(input.snapshots)) {
    throw new Error('기존 리뷰 스냅샷 형식이 올바르지 않습니다. 기존 파일을 덮어쓰지 않습니다.');
  }
  const normalized = normalizeReviewArchive(input);
  if (Object.keys(input.snapshots).length !== Object.keys(normalized.snapshots).length) throw new Error('손상된 리뷰 기록이 있어 기존 파일을 덮어쓰지 않습니다.');
  return normalized;
}

/** Atomic local acknowledgement; the workflow then commits this one tracked file. */
export function writeReviewArchiveFile(file: string, archive: ReviewArchive): void {
  if (process.env.VERCEL) throw new Error('Vercel에서는 파일 저장이 영속화되지 않습니다. GitHub 수집 워크플로를 사용하세요.');
  const temporary = `${file}.${randomUUID()}.tmp`;
  const content = `${JSON.stringify(normalizeReviewArchive(archive), null, 2)}\n`;
  try {
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, file);
    if (fs.readFileSync(file, 'utf8') !== content) throw new Error('저장된 스냅샷 내용 확인에 실패했습니다.');
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseCollectionArguments(args);
  if (options.help) {
    console.log('Usage: npm run collect:reviews -- [--date YYYY-MM-DD] [--stock EXACT_IPO_ID] [--write | --dry-run]\nDefault: collect D-1 targets and preview only. --stock forces one eligible ID. --date changes selection, not the actual collection timestamp. --write updates only src/data/reviewSnapshots.json; deployment is separate.');
    return;
  }
  const root = process.cwd();
  const targetFile = path.join(root, 'src', 'data', 'reviewSnapshots.json');
  const archive = readArchive(targetFile);
  const targets = selectReviewCollectionTargets(loadSourceIpos(root), options);
  if (targets.length === 0) {
    console.log(JSON.stringify({ selectionDate: options.date, targetCount: 0, storageStatus: 'unchanged', message: '수집할 D-1 또는 수동 지정 대상이 없습니다.' }));
    return;
  }
  const snapshots: ReviewSnapshot[] = await collectReviewsForIpos(targets, { now: new Date() });
  const merged = mergeReviewSnapshots(archive, snapshots);
  if (options.write) writeReviewArchiveFile(targetFile, merged);
  console.log(JSON.stringify({
    selectionDate: options.date, targetCount: targets.length, snapshotCount: snapshots.length,
    reviewCount: snapshots.reduce((sum, snapshot) => sum + snapshot.reviews.length, 0),
    failedCount: snapshots.filter((snapshot) => snapshot.status === 'failed').length,
    storageStatus: options.write ? 'local-file-written' : 'preview-only',
    deploymentConfirmed: false,
    results: snapshots.map((snapshot) => ({ ipoId: snapshot.ipoId, subscriptionStart: snapshot.subscriptionStart, status: snapshot.status, reviewCount: snapshot.reviews.length })),
  }, null, 2));
  // Persist the failed attempt first, but do not let an all-failed CI run appear healthy.
  if (snapshots.length > 0 && snapshots.every((snapshot) => snapshot.status === 'failed')) process.exitCode = 1;
}

if (require.main === module) main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : '리뷰 수집 실행에 실패했습니다.');
  process.exitCode = 1;
});
