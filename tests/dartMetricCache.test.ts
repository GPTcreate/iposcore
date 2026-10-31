import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createDartMetricCache, DART_METRIC_PARSER_VERSION } from '../src/lib/dartMetricCache';
import type { DartMetricParseResult } from '../src/lib/dartMetricCache';

const receipt = '20261015000345';
const facts = (rcpNo = receipt): DartMetricParseResult => ({ rcpNo, corpName: '', confirmedPrice: 2000, lockupCommitmentRate: 0 });
const location = () => path.join(fs.mkdtempSync(path.join(tmpdir(), 'iposcore-metric-cache-')), 'nested', 'dart-metrics.json');

test('successful receipt facts are immutable across runs and cache hits do not rewrite the file', async () => {
  const file = location();
  let calls = 0;
  const first = createDartMetricCache({ file, parseFiling: async () => { calls++; return facts(); } });
  assert.equal((await first.parseFiling(receipt))!.confirmedPrice, 2000);
  first.flush();
  const bytes = fs.readFileSync(file, 'utf8');
  const second = createDartMetricCache({ file, parseFiling: async () => { calls++; return { ...facts(), confirmedPrice: 9999 }; } });
  const cached = await second.parseFiling(receipt);
  cached!.confirmedPrice = 1111;
  assert.equal((await second.parseFiling(receipt))!.confirmedPrice, 2000);
  second.flush();
  assert.equal(calls, 1);
  assert.equal(fs.readFileSync(file, 'utf8'), bytes);
  assert.deepEqual(second.stats, { hits: 2, misses: 0, backoffSkipped: 0, failures: 0 });
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['dart-metrics.json']);
});

test('an explicit publication wait is cached and a new receipt or parser version is fetched', async () => {
  const file = location();
  let calls = 0;
  const pending = { rcpNo: receipt, corpName: '', publicationPending: {
    sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`,
    reason: '확정 공모가 발표 전', evidence: '수요예측 후 확정 공모가를 결정할 예정입니다.' } };
  const first = createDartMetricCache({ file, parseFiling: async () => { calls++; return pending; } });
  await first.parseFiling(receipt);
  first.flush();
  const second = createDartMetricCache({ file, parseFiling: async (rcpNo) => { calls++; return facts(rcpNo); } });
  assert.deepEqual((await second.parseFiling(receipt))!.publicationPending, pending.publicationPending);
  await second.parseFiling('20261016000346');
  second.flush();
  const changedParser = createDartMetricCache({ file, parserVersion: `${DART_METRIC_PARSER_VERSION}-changed`, parseFiling: async (rcpNo) => { calls++; return facts(rcpNo); } });
  await changedParser.parseFiling(receipt);
  changedParser.flush();
  assert.equal(calls, 3);
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')).entries).length, 3);
});

test('the current parser retries a receipt despite an older parser failure backoff', async () => {
  const file = location(), now = () => new Date('2026-10-31T00:00:00.000Z');
  for (const parserVersion of ['dart-metrics-v1', 'dart-metrics-v2', 'dart-metrics-v3', 'dart-metrics-v4']) {
    const old = createDartMetricCache({ file, parserVersion, now, parseFiling: async () => null });
    await old.parseFiling(receipt);
    old.flush();
  }
  let calls = 0;
  const current = createDartMetricCache({ file, now, parseFiling: async () => { calls++; return facts(); } });
  assert.notEqual(DART_METRIC_PARSER_VERSION, 'dart-metrics-v1');
  assert.notEqual(DART_METRIC_PARSER_VERSION, 'dart-metrics-v2');
  assert.notEqual(DART_METRIC_PARSER_VERSION, 'dart-metrics-v3');
  assert.notEqual(DART_METRIC_PARSER_VERSION, 'dart-metrics-v4');
  assert.equal((await current.parseFiling(receipt))?.confirmedPrice, 2000);
  assert.equal(calls, 1);
  assert.equal(current.stats.backoffSkipped, 0);
  current.flush();
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')).entries).length, 5);
});

test('offering facts survive cache round trips only when final price and total reconcile', async () => {
  const file = location();
  const offering = { rcpNo: receipt, corpName: '', confirmedPrice: 8000, offeringShareCount: 5000000,
    totalOfferingAmount: 400, offeringExcerpt: '일반공모 5,000,000주 × 8,000원 = 40,000,000,000원' };
  const cache = createDartMetricCache({ file, parseFiling: async () => offering });
  assert.equal((await cache.parseFiling(receipt))?.totalOfferingAmount, 400);
  cache.flush();
  const restored = createDartMetricCache({ file, parseFiling: async () => { throw new Error('No request on cache hit'); } });
  assert.equal((await restored.parseFiling(receipt))?.offeringShareCount, 5000000);
  const rejected = createDartMetricCache({ file: location(), parseFiling: async () => ({ ...offering, totalOfferingAmount: 650 }) });
  assert.equal(await rejected.parseFiling(receipt), null);
});

test('failed parsing backs off 6, 12, 24 then 48 hours and the boundary allows one retry', async () => {
  const file = location();
  let current = new Date('2026-10-30T00:00:00.000Z'), calls = 0;
  for (const [index, hours] of [6, 12, 24, 48, 48].entries()) {
    const cache = createDartMetricCache({ file, now: () => current, parseFiling: async () => { calls++; return null; } });
    assert.equal(await cache.parseFiling(receipt), null);
    cache.flush();
    const entry = Object.values(JSON.parse(fs.readFileSync(file, 'utf8')).entries)[0] as { attempts: number; nextRetryAt: string };
    assert.equal(entry.attempts, index + 1);
    assert.equal(Date.parse(entry.nextRetryAt) - current.getTime(), hours * 3_600_000);
    const waiting = createDartMetricCache({ file, now: () => new Date(Date.parse(entry.nextRetryAt) - 1), parseFiling: async () => { throw new Error('must not call'); } });
    assert.equal(await waiting.parseFiling(receipt), null);
    assert.equal(waiting.stats.backoffSkipped, 1);
    waiting.flush();
    current = new Date(entry.nextRetryAt);
  }
  assert.equal(calls, 5);
});

test('malformed cache fails closed before parser execution and preserves the original file', () => {
  for (const bytes of ['{', JSON.stringify({ version: 2, entries: {} }), JSON.stringify({ version: 1, entries: { invalid: {} } })]) {
    const file = location();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
    let calls = 0;
    assert.throws(() => createDartMetricCache({ file, parseFiling: async () => { calls++; return facts(); } }), /기존 파일을 보존/);
    assert.equal(calls, 0);
    assert.equal(fs.readFileSync(file, 'utf8'), bytes);
  }
});

test('raw failures, credential URLs, wrong receipts and malformed pending evidence are never stored as facts', async () => {
  const secret = 'private-value-never-store';
  const parses: (() => Promise<DartMetricParseResult | null>)[] = [
    async () => { throw new Error(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${secret}`); },
    async () => ({ ...facts(), publicationPending: { sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}&key=${secret}`, reason: '발표 대기', evidence: '예정' } }),
    async () => ({ ...facts(), publicationPending: { sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`, reason: '발표 대기', evidence: `https://example.invalid/?token=${secret}` } }),
    async () => facts('20261016000346'),
    async () => ({ rcpNo: receipt, corpName: '' }),
    async () => ({ ...facts(), lockupCommitmentRate: 101 }),
  ];
  for (const parseFiling of parses) {
    const file = location();
    const cache = createDartMetricCache({ file, parseFiling });
    assert.equal(await cache.parseFiling(receipt), null);
    cache.flush();
    const bytes = fs.readFileSync(file, 'utf8');
    assert(!bytes.includes(secret));
    assert(!bytes.includes('crtfc_key'));
    assert(!bytes.includes('sourceUrl'));
    assert.equal(Object.values(JSON.parse(bytes).entries)[0] && cache.stats.failures, 1);
  }
});

test('in-flight receipt requests coalesce and unknown parser properties cannot leak into the cache', async () => {
  const file = location();
  let calls = 0;
  const cache = createDartMetricCache({ file, parseFiling: async () => {
    calls++;
    return { ...facts(), requestUrl: 'https://example.invalid/?token=secret' };
  } });
  const results = await Promise.all([cache.parseFiling(receipt), cache.parseFiling(receipt)]);
  assert.equal(calls, 1);
  assert.deepEqual(results[0], results[1]);
  cache.flush();
  assert(!fs.readFileSync(file, 'utf8').includes('secret'));
  assert.equal(await cache.parseFiling('20260230000001'), null);
  assert.equal(calls, 1);
});

test('missing parser is rejected before trying to access any cache path', () => {
  assert.throws(() => createDartMetricCache({ file: 'invalid:\\unreachable', parseFiling: undefined as never }), /최신 수치 파서/);
});
