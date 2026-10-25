import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import type { ExpertReview, IpoItem } from '../src/types/ipo';
import type { ReviewSnapshot } from '../src/types/reviews';
import { getReviewSnapshot, mergeReviewSnapshots, normalizeReviewArchive, reviewSnapshotKey } from '../src/lib/reviewArchive';
import { isReviewDate } from '../src/lib/reviewArchive';
import { analyzeIpoSentiment } from '../src/lib/sentimentAnalyzer';
import { parseCollectionArguments, selectReviewCollectionTargets, writeReviewArchiveFile } from '../scripts/collect-reviews';

const identity = { id: 'fixture-company', subscriptionStart: '2026-10-26' };
const review = (changes: Partial<ExpertReview> = {}): ExpertReview => ({
  id: 'post-1', sourceType: 'BLOG', author: '테스트 작성자', title: '수집한 원문',
  url: 'https://blog.naver.com/fixture/123456', publishedAt: '2026-10-25T00:00:00Z',
  sentiment: 'UNCLASSIFIED', summary: '원문에서 추출한 테스트 문장', ...changes,
});
const snapshot = (changes: Partial<ReviewSnapshot> = {}): ReviewSnapshot => ({
  ipoId: identity.id, stockName: '테스트 기업', subscriptionStart: identity.subscriptionStart,
  collectedAt: '2026-10-25T03:17:00Z', status: 'success', reviews: [review()],
  channels: [{ channelId: 'fixture-blog', feedUrl: 'https://rss.blog.naver.com/fixture.xml', status: 'success', fetchedCount: 3, matchedCount: 1 }],
  ...changes,
});
const empty = () => normalizeReviewArchive({ version: 1, updatedAt: null, snapshots: {} });

test('normalizes malformed files safely without inventing snapshots', () => {
  for (const value of [null, [], {}, { version: 99, snapshots: {} }, { version: 1, snapshots: { broken: { ipoId: 'bad' } } }]) {
    assert.deepEqual(normalizeReviewArchive(value).snapshots, {});
  }
});

test('URL deduplication updates changed content and is stable across exact replay', () => {
  const incoming = snapshot({ reviews: [review({ url: `${review().url}?utm_source=test#fragment`, summary: '이전 문장' }), review({ summary: '정정한 문장' })] });
  const archive = mergeReviewSnapshots(empty(), [incoming]);
  const stored = getReviewSnapshot(archive, identity)!;
  assert.equal(stored.reviews.length, 1);
  assert.equal(stored.reviews[0].summary, '정정한 문장');
  assert.deepEqual(mergeReviewSnapshots(archive, [incoming]), archive);
});

test('a fresh successful collection replaces removed posts instead of accumulating stale ones', () => {
  const first = mergeReviewSnapshots(empty(), [snapshot({ reviews: [review(), review({ id: 'post-2', url: 'https://blog.naver.com/fixture/234567' })] })]);
  const next = mergeReviewSnapshots(first, [snapshot({ collectedAt: '2026-10-25T09:17:00Z', reviews: [review({ summary: '최신 본문' })] })]);
  assert.equal(getReviewSnapshot(next, identity)!.reviews.length, 1);
  assert.equal(getReviewSnapshot(next, identity)!.reviews[0].summary, '최신 본문');
});

test('failed collection retains prior evidence with the last successful timestamp and current error', () => {
  const first = mergeReviewSnapshots(empty(), [snapshot()]);
  const failed = snapshot({ collectedAt: '2026-10-25T09:17:00Z', status: 'failed', reviews: [], channels: [{ channelId: 'fixture-blog', feedUrl: 'https://rss.blog.naver.com/fixture.xml', status: 'failed', fetchedCount: 0, matchedCount: 0, error: 'fixture timeout' }] });
  const next = mergeReviewSnapshots(first, [failed]);
  const stored = getReviewSnapshot(next, identity)!;
  assert.equal(stored.status, 'failed');
  assert.equal(stored.reviews.length, 1);
  assert.equal(stored.lastSuccessfulAt, first.snapshots[reviewSnapshotKey(identity.id, identity.subscriptionStart)].collectedAt);
  assert.equal(stored.collectedAt, failed.collectedAt);
  assert.equal(stored.channels[0].error, 'fixture timeout');
  const coldRestart = normalizeReviewArchive(JSON.parse(JSON.stringify(next)));
  const failedAgain = mergeReviewSnapshots(coldRestart, [snapshot({ ...failed, collectedAt: '2026-10-25T10:17:00Z' })]);
  assert.equal(getReviewSnapshot(failedAgain, identity)!.lastSuccessfulAt, stored.lastSuccessfulAt);
  assert.equal(getReviewSnapshot(failedAgain, identity)!.reviews.length, 1);
});

test('a confirmed empty collection clears previous posts and is not restored by a later failure', () => {
  const first = mergeReviewSnapshots(empty(), [snapshot()]);
  const cleared = mergeReviewSnapshots(first, [snapshot({ collectedAt: '2026-10-25T09:17:00Z', status: 'empty', reviews: [] })]);
  assert.equal(getReviewSnapshot(cleared, identity)!.reviews.length, 0);
  const failed = mergeReviewSnapshots(cleared, [snapshot({ collectedAt: '2026-10-25T10:17:00Z', status: 'failed', reviews: [] })]);
  assert.equal(getReviewSnapshot(failed, identity)!.reviews.length, 0);
  assert.equal(getReviewSnapshot(failed, identity)!.lastSuccessfulAt, '2026-10-25T09:17:00Z');
});

test('partial refresh preserves only failed publishers old evidence alongside fresh successful posts', () => {
  const withEvidence = (url: string, feedUrl: string, summary: string): ExpertReview => review({
    id: url, url, summary,
    evidence: { feedUrl, fetchedAt: '2026-10-25T03:17:00Z', contentHash: 'fixture-hash', matchedAlias: '테스트 기업', excerpt: summary, classification: 'unclassified' },
  });
  const failedFeed = 'https://rss.blog.naver.com/failed-blog.xml';
  const successfulFeed = 'https://rss.blog.naver.com/fresh-blog.xml';
  const failedPost = withEvidence('https://blog.naver.com/failed-blog/123456', failedFeed, '보존할 실패 채널 원문');
  const replacedPost = withEvidence('https://blog.naver.com/fresh-blog/234567', successfulFeed, '교체 전 본문');
  const removedPost = withEvidence('https://blog.naver.com/fresh-blog/345678', successfulFeed, '최신 성공 결과에 없는 글');
  const previous = mergeReviewSnapshots(empty(), [snapshot({ reviews: [failedPost, replacedPost, removedPost] })]);
  const partial = snapshot({
    collectedAt: '2026-10-25T09:17:00Z', status: 'partial',
    reviews: [{ ...replacedPost, summary: '새로 수집한 정정 본문' }],
    channels: [
      { channelId: 'failed-blog', feedUrl: failedFeed, status: 'failed', fetchedCount: 0, matchedCount: 0, error: 'fixture timeout' },
      { channelId: 'fresh-blog', feedUrl: successfulFeed, status: 'success', fetchedCount: 5, matchedCount: 1 },
    ],
  });
  const merged = mergeReviewSnapshots(previous, [partial]);
  const stored = getReviewSnapshot(merged, identity)!;
  assert.equal(stored.status, 'partial');
  assert.equal(stored.reviews.length, 2);
  assert.equal(stored.reviews.find((item) => item.url === failedPost.url)!.summary, failedPost.summary);
  assert.equal(stored.reviews.find((item) => item.url === replacedPost.url)!.summary, '새로 수집한 정정 본문');
  assert.equal(stored.reviews.some((item) => item.url === removedPost.url), false);
  assert.equal(stored.reviews.find((item) => item.url === failedPost.url)!.evidence!.fetchedAt, '2026-10-25T03:17:00Z');
  assert.deepEqual(mergeReviewSnapshots(merged, [partial]), merged);
  assert.equal(partial.reviews.length, 1);
});

test('rescheduled IPOs cannot inherit a snapshot from the former subscription date', () => {
  const first = mergeReviewSnapshots(empty(), [snapshot()]);
  const shifted = { ...identity, subscriptionStart: '2026-11-02' };
  assert.equal(getReviewSnapshot(first, shifted), undefined);
  const next = mergeReviewSnapshots(first, [snapshot({ subscriptionStart: shifted.subscriptionStart, collectedAt: '2026-11-01T03:17:00Z' })]);
  assert.equal(Object.keys(next.snapshots).length, 2);
  assert.equal(getReviewSnapshot(next, identity)!.subscriptionStart, identity.subscriptionStart);
  assert.equal(getReviewSnapshot(next, shifted)!.subscriptionStart, shifted.subscriptionStart);
});

test('late older jobs cannot overwrite a newer collection', () => {
  const current = mergeReviewSnapshots(empty(), [snapshot({ collectedAt: '2026-10-25T09:17:00Z', reviews: [review({ summary: '최신 문장' })] })]);
  assert.deepEqual(mergeReviewSnapshots(current, [snapshot()]), current);
});

test('merging and reading snapshots do not mutate the source or archive', () => {
  const raw = snapshot();
  const before = JSON.stringify(raw);
  const archive = mergeReviewSnapshots(empty(), [raw]);
  const returned = getReviewSnapshot(archive, identity)!;
  returned.reviews[0].summary = 'caller mutation';
  assert.equal(JSON.stringify(raw), before);
  assert.notEqual(getReviewSnapshot(archive, identity)!.reviews[0].summary, 'caller mutation');
});

test('invalid dates and incomplete collection results cannot become new archives', () => {
  assert.throws(() => mergeReviewSnapshots(empty(), [snapshot({ subscriptionStart: '2026-02-30' })]));
  assert.throws(() => mergeReviewSnapshots(empty(), [snapshot({ collectedAt: 'not a date' })]));
});

test('CLI defaults to dry run and validates dates, exact IDs and conflicting flags', () => {
  assert.equal(parseCollectionArguments([], new Date('2026-10-24T16:00:00Z')).date, '2026-10-25');
  assert.equal(parseCollectionArguments([]).write, false);
  assert.equal(parseCollectionArguments(['--date', '2026-10-25', '--stock', identity.id, '--write']).write, true);
  for (const args of [['--date', '2026-02-30'], ['--date'], ['--stock'], ['--write', '--dry-run'], ['--unknown'], ['--write', '--write']]) {
    assert.throws(() => parseCollectionArguments(args));
  }
});

test('D-1 targets include unreviewed financial records but exclude cancelled, listed and other dates', () => {
  const ipo = { ...identity, name: '테스트 기업', code: '123456', status: 'UPCOMING' } as IpoItem;
  const input = [ipo, { ...ipo, id: 'cancelled', isCancelled: true }, { ...ipo, id: 'listed', status: 'LISTED' }, { ...ipo, id: 'future', subscriptionStart: '2026-11-03' }] as IpoItem[];
  assert.deepEqual(selectReviewCollectionTargets(input, { date: '2026-10-25' }).map((item) => item.id), [identity.id]);
  assert.deepEqual(selectReviewCollectionTargets(input, { date: '2026-10-25', stockId: 'future' }).map((item) => item.id), ['future']);
  assert.throws(() => selectReviewCollectionTargets(input, { date: '2026-10-25', stockId: '테스트 기업' }));
});

test('atomic local writes survive a fresh file reload and exact replay without duplicate reviews', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-archive-fixture-'));
  const file = path.join(directory, 'reviewSnapshots.json');
  const beforeVercel = process.env.VERCEL;
  delete process.env.VERCEL;
  try {
    const archive = mergeReviewSnapshots(empty(), [snapshot()]);
    writeReviewArchiveFile(file, archive);
    const restarted = normalizeReviewArchive(JSON.parse(fs.readFileSync(file, 'utf8')));
    assert.deepEqual(restarted, archive);
    const firstBytes = fs.readFileSync(file, 'utf8');
    writeReviewArchiveFile(file, mergeReviewSnapshots(restarted, [snapshot()]));
    assert.equal(fs.readFileSync(file, 'utf8'), firstBytes);
    assert.equal(getReviewSnapshot(restarted, identity)!.reviews.length, 1);
  } finally {
    if (beforeVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = beforeVercel;
    if (fs.existsSync(file)) fs.unlinkSync(file);
    fs.rmdirSync(directory);
  }
});

test('Vercel writes fail explicitly instead of claiming durable success', () => {
  const previous = process.env.VERCEL;
  try {
    for (const value of ['1', 'true', 'hosted-runtime']) {
      process.env.VERCEL = value;
      assert.throws(() => writeReviewArchiveFile('never-written.json', empty()), /Vercel/);
    }
  }
  finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});

type PipelineResult = {
  processedCount: number; skippedCount: number; reviewsCollectedCount: number;
  reviewSnapshots: ReviewSnapshot[]; storageStatus: string;
  collectionErrors: { ipoId: string; channelId: string; error: string }[];
  processedTargets: { collectionStatus: string; reviewCount: number; fetchedCount: number }[];
};

/**
 * Execute the actual pipeline module with its external boundaries replaced.
 * This avoids importing the browser store's @ aliases into the isolated test output.
 * Selection, collector injection, normalization, merge and analysis stay real.
 */
function fixturePipeline() {
  let writes = 0;
  const dependencies: Record<string, unknown> = {
    './ipoStore': { getAllIpos: () => { throw new Error('Fixture must supply the IPO list'); } },
    './ipoUtils': { getEffectiveIpoStatus: (ipo: IpoItem) => ipo.status },
    './sentimentAnalyzer': { analyzeIpoSentiment },
    './reviewCollector': { collectReviewsForIpos: () => { throw new Error('Live collector must not run in fixture tests'); } },
    './reviewArchive': { isReviewDate, mergeReviewSnapshots, normalizeReviewArchive, reviewSnapshotKey },
    './reviewArchiveServer': {
      loadServerReviewArchive: () => { throw new Error('Fixture must supply the archive'); },
      saveServerReviewArchive: () => { writes++; },
    },
  };
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'pipeline.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const moduleObject = { exports: {} };
  const run = vm.runInNewContext(`(function(require, module, exports) { ${compiled}\n})`, { process: { env: { VERCEL: 'hosted-runtime' } } });
  run((name: string) => {
    if (!(name in dependencies)) throw new Error(`Unexpected pipeline dependency: ${name}`);
    return dependencies[name];
  }, moduleObject, moduleObject.exports);
  const api = moduleObject.exports as {
    runMethod2Pipeline(options: {
      allIpos: IpoItem[]; targetDate: string; now: Date;
      archive: ReturnType<typeof empty>;
      collector: (ipos: IpoItem[]) => Promise<ReviewSnapshot[]>;
    }): Promise<PipelineResult>;
  };
  return { ...api, writes: () => writes };
}

function pipelineIpo(changes: Partial<IpoItem> = {}): IpoItem {
  return {
    ...identity, name: '테스트 기업', code: '123456', market: 'KOSDAQ', status: 'UPCOMING',
    subscriptionEnd: '2026-10-27', refundDate: '2026-10-29', listingDate: '2026-11-02',
    priceBandMin: 10000, priceBandMax: 12000, confirmedPrice: 12000,
    underwriters: [], institutionalCompetitionRate: 900, lockupCommitmentRate: 12,
    circulatingSupplyRate: 27, totalOfferingAmount: 0, marketCapAtIpo: 0,
    aiScore: 0, scoreGrade: 'C', aiSummary: { headline: '원본 해설', bulletPoints: [], positivePoints: [], riskPoints: [] },
    sentimentConsensus: { positiveRatio: 0, neutralRatio: 0, cautionRatio: 0 }, expertReviews: [],
    ...changes,
  };
}

test('actual pipeline selects unreviewed D-1 IPOs, merges collected posts and previews without storage writes', async () => {
  const pipeline = fixturePipeline();
  const input = [pipelineIpo(), pipelineIpo({ id: 'cancelled', isCancelled: true }), pipelineIpo({ id: 'listed', status: 'LISTED' }), pipelineIpo({ id: 'different-date', subscriptionStart: '2026-11-03' })];
  const before = JSON.stringify(input);
  let collectorCalls = 0;
  const result = await pipeline.runMethod2Pipeline({
    allIpos: input, targetDate: '2026-10-25', now: new Date('2026-10-25T03:17:00Z'), archive: empty(),
    collector: async (targets) => {
      collectorCalls++;
      assert.deepEqual(Array.from(targets, (ipo) => ipo.id), [identity.id]);
      return [snapshot()];
    },
  });
  assert.equal(collectorCalls, 1);
  assert.equal(result.processedCount, 1);
  assert.equal(result.skippedCount, 3);
  assert.equal(result.reviewsCollectedCount, 1);
  assert.equal(result.processedTargets[0].reviewCount, 1);
  assert.equal(result.processedTargets[0].fetchedCount, 3);
  assert.equal(result.processedTargets[0].collectionStatus, 'success');
  assert.equal(result.storageStatus, 'preview-only');
  assert.equal(result.reviewSnapshots[0].lastSuccessfulAt, snapshot().collectedAt);
  assert.equal(pipeline.writes(), 0);
  assert.equal(JSON.stringify(input), before);
});

test('actual pipeline preserves last success after failed refresh but reports zero newly collected posts', async () => {
  const pipeline = fixturePipeline();
  const prior = mergeReviewSnapshots(empty(), [snapshot()]);
  const result = await pipeline.runMethod2Pipeline({
    allIpos: [pipelineIpo()], targetDate: '2026-10-25', now: new Date('2026-10-25T09:17:00Z'), archive: prior,
    collector: async () => [snapshot({ collectedAt: '2026-10-25T09:17:00Z', status: 'failed', reviews: [], channels: [{ channelId: 'fixture-blog', feedUrl: 'https://rss.blog.naver.com/fixture.xml', status: 'failed', fetchedCount: 0, matchedCount: 0, error: 'fixture timeout' }] })],
  });
  assert.equal(result.processedCount, 1);
  assert.equal(result.storageStatus, 'preview-only');
  assert.equal(result.reviewsCollectedCount, 0);
  assert.equal(result.processedTargets[0].reviewCount, 0);
  assert.equal(result.processedTargets[0].collectionStatus, 'failed');
  assert.equal(result.reviewSnapshots[0].reviews.length, 1);
  assert.equal(result.reviewSnapshots[0].lastSuccessfulAt, snapshot().collectedAt);
  assert.equal(result.reviewSnapshots[0].collectedAt, '2026-10-25T09:17:00Z');
  assert.equal(result.collectionErrors[0].error, 'fixture timeout');
  assert.equal(pipeline.writes(), 0);
  assert.equal(getReviewSnapshot(prior, identity)!.status, 'success');
});

test('all-failed CLI attempts save failure metadata and prior evidence before marking CI unsuccessful', async () => {
  const root = path.join(os.tmpdir(), 'iposcore-virtual-cli');
  const targetFile = path.join(root, 'src', 'data', 'reviewSnapshots.json');
  const prior = mergeReviewSnapshots(empty(), [snapshot()]);
  const virtualFiles = new Map<string, string>([
    [path.join(root, 'src', 'data', 'mockIpo.ts'), `export const MOCK_IPOS: IpoItem[] = ${JSON.stringify([pipelineIpo()])};`],
    [path.join(root, 'src', 'data', 'customIpos.json'), '[]'],
    [targetFile, JSON.stringify(prior)],
  ]);
  const fakeFs = {
    readFileSync: (file: string) => {
      const content = virtualFiles.get(file);
      if (content === undefined) throw new Error('Missing virtual file');
      return content;
    },
    writeFileSync: (file: string, content: string) => virtualFiles.set(file, content),
    renameSync: (from: string, to: string) => { virtualFiles.set(to, virtualFiles.get(from)!); virtualFiles.delete(from); },
    existsSync: (file: string) => virtualFiles.has(file),
    unlinkSync: (file: string) => virtualFiles.delete(file),
  };
  const processBoundary = { env: {}, argv: [], cwd: () => root, exitCode: 0 };
  const dependencies: Record<string, unknown> = {
    'node:fs': fakeFs, 'node:path': path, 'node:crypto': { randomUUID: () => 'fixture-temp' },
    '../src/lib/reviewArchive': { isReviewDate, mergeReviewSnapshots, normalizeReviewArchive },
    '../src/lib/reviewCollector': {
      collectReviewsForIpos: async () => [snapshot({ collectedAt: '2026-10-25T09:17:00Z', status: 'failed', reviews: [], channels: [{ channelId: 'fixture-blog', feedUrl: 'https://rss.blog.naver.com/fixture.xml', status: 'failed', fetchedCount: 0, matchedCount: 0, error: 'fixture transport failure' }] })],
    },
  };
  const source = fs.readFileSync(path.join(process.cwd(), 'scripts', 'collect-reviews.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const moduleObject = { exports: {} };
  const run = vm.runInNewContext(`(function(require, module, exports) { ${compiled}\n})`, { process: processBoundary, console: { log: () => {}, error: () => {} } });
  run((name: string) => {
    if (!(name in dependencies)) throw new Error(`Unexpected CLI dependency: ${name}`);
    return dependencies[name];
  }, moduleObject, moduleObject.exports);
  await (moduleObject.exports as { main(args: string[]): Promise<void> }).main(['--date', '2026-10-25', '--write']);
  const saved = getReviewSnapshot(normalizeReviewArchive(JSON.parse(virtualFiles.get(targetFile)!)), identity)!;
  assert.equal(saved.status, 'failed');
  assert.equal(saved.channels[0].error, 'fixture transport failure');
  assert.equal(saved.reviews.length, 1);
  assert.equal(saved.lastSuccessfulAt, snapshot().collectedAt);
  assert.equal(processBoundary.exitCode, 1);
  assert.equal(Array.from(virtualFiles.keys()).some((file) => file.endsWith('.tmp')), false);
});
