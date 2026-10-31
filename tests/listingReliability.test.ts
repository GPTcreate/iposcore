import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import type { IpoItem } from '../src/types/ipo';
import { getFieldEvidence } from '../src/lib/contentQuality';
import { KRX_COMPANY_LIST, normalizeListingCompany } from '../src/lib/officialSource';

const listingDay = '2026-11-19';
const at = (day: string, time: string) => new Date(`${day}T${time}:00+09:00`);
const evidence = (day = listingDay) => ({ sourceTitle: '공식 상장일 공시', value: day,
  sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000001', checkedAt: '2026-10-30T01:00:00Z' });
const ipo = (changes: Partial<IpoItem> = {}): IpoItem => ({ id: 'alpha', name: 'Alpha', code: '123456', status: 'WAITING_LISTING', market: 'KOSDAQ',
  subscriptionStart: '2026-11-10', subscriptionEnd: '2026-11-11', refundDate: '2026-11-13', listingDate: listingDay,
  priceBandMin: 2000, priceBandMax: 2000, confirmedPrice: 2000, underwriters: [],
  institutionalCompetitionRate: 1000, lockupCommitmentRate: 10, circulatingSupplyRate: 20,
  totalOfferingAmount: 100, marketCapAtIpo: 1000, aiScore: 80, scoreGrade: 'A', expertReviews: [],
  aiSummary: { headline: 'Alpha', bulletPoints: [], positivePoints: [], riskPoints: [] },
  sentimentConsensus: { positiveRatio: null, neutralRatio: null, cautionRatio: null },
  fieldEvidence: { listingDate: evidence() }, ...changes });
function krxIpo(changes: Partial<IpoItem> = {}): IpoItem {
  const item = ipo(changes), excerpt = `${item.name} | 코스닥 | ${item.code} | 상장일 ${item.listingDate}`;
  const source = { sourceTitle: '한국거래소 KIND 상장법인 목록', sourceUrl: KRX_COMPANY_LIST,
    checkedAt: '2026-10-30T01:00:00Z', parserVersion: 'krx-company-list-v1', excerpt };
  item.fieldEvidence = { ...item.fieldEvidence, code: { ...source, value: item.code }, listingDate: { ...source, value: item.listingDate } };
  return item;
}
const prices = (item: IpoItem) => ({ code: item.code, tradeDate: item.listingDate!, openingPrice: 3000, closingPrice: 4000, source: 'fchart_origin' });
const priceEvidence = (item: IpoItem) => ({ code: item.code, tradeDate: item.listingDate!, source: 'fchart_origin',
  sourceUrl: `https://fchart.stock.naver.com/sise.nhn?symbol=${item.code}`, checkedAt: '2026-10-30T10:00:00Z' });
interface Price { code: string; tradeDate: string; openingPrice: number; closingPrice: number; source: string }
interface Result {
  success: boolean; totalCandidates: number; updatedCount: number; skippedCount: number; deferredCount: number;
  deferredStocks: { code: string; name: string; reason: string }[]; errors: { code: string; name: string; error: string }[];
}
type Sync = (options: { now: Date; targetCode?: string; forceAll?: boolean; requireVerifiedListingDate?: boolean; deferCodes?: string[];
  fetchPrices: (code: string, date?: string) => Promise<Price | null> }) => Promise<Result>;
function fixture(input: IpoItem[]) {
  let current = structuredClone(input);
  const writes: IpoItem[] = [];
  const exports: Record<string, unknown> = {};
  const imports: Record<string, unknown> = {
    https: { get: () => { throw new Error('Live network is forbidden in listing fixtures.'); } },
    './ipoUtils': { getAllEffectiveIpos: () => structuredClone(current), getKstDateString: (now?: Date) =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now || new Date()) },
    './ipoServerStore': { addOrUpdateIpo: (incoming: IpoItem) => {
      writes.push(structuredClone(incoming));
      current = current.map(item => item.id === incoming.id ? structuredClone(incoming) : item);
      return { success: true, ipo: incoming };
    } },
    './contentQuality': { getFieldEvidence }, './officialSource': { normalizeListingCompany },
  };
  const compiled = ts.transpileModule(fs.readFileSync('src/lib/stockPriceCrawler.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, { exports, module: { exports }, require: (name: string) => {
    assert(Object.prototype.hasOwnProperty.call(imports, name), `Unexpected fixture import: ${name}`);
    return imports[name];
  }, Intl, Date, structuredClone, console: { log: () => {}, warn: () => {} } });
  return { sync: exports.syncListingReturnsForIpos as Sync, writes, current: () => structuredClone(current) };
}

test('a budget-deferred latest filing prevents freezing an old denominator and resumes next run', async () => {
  const item = ipo(), run = fixture([item]);
  let requests = 0;
  const fetchPrices = async () => { requests++; return prices(item); };
  const first = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true, deferCodes: [item.code], fetchPrices });
  assert.equal(first.success, false); assert.equal(first.deferredCount, 1); assert.equal(requests, 0); assert.equal(run.writes.length, 0);
  const retry = await run.sync({ now: at('2026-11-20', '09:17'), requireVerifiedListingDate: true, deferCodes: [], fetchPrices });
  assert.equal(retry.success, true); assert.equal(retry.updatedCount, 1); assert.equal(requests, 1);
});

test('listing-day collection waits until 18:00 KST even with a manual target or a delayed regular session', async () => {
  for (const time of ['09:17', '15:40', '16:30', '17:59', '18:00', '18:17']) {
    const item = ipo(), run = fixture([item]); let requests = 0;
    const result = await run.sync({ now: at(listingDay, time), targetCode: item.code, requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return prices(item); } });
    const afterCutoff = time >= '18:00';
    assert.equal(requests, afterCutoff ? 1 : 0);
    assert.equal(result.updatedCount, afterCutoff ? 1 : 0);
    assert.equal(result.deferredCount, afterCutoff ? 0 : 1);
    assert.equal(result.success, true);
    assert.equal(run.writes.length, afterCutoff ? 1 : 0);
    if (!afterCutoff) assert.match(result.deferredStocks[0].reason, /18시/);
  }
});

test('a delayed backfill can use Friday prices on Saturday morning without waiting for that evenings cutoff', async () => {
  const item = ipo({ listingDate: '2026-11-20', fieldEvidence: { listingDate: evidence('2026-11-20') } });
  const run = fixture([item]); let requests = 0;
  const result = await run.sync({ now: at('2026-11-21', '09:17'), requireVerifiedListingDate: true,
    fetchPrices: async (_code, day) => { requests++; assert.equal(day, '2026-11-20'); return prices(item); } });
  assert.equal(result.success, true); assert.equal(requests, 1); assert.equal(result.updatedCount, 1);
  assert.equal(run.writes[0].listingPriceEvidence?.tradeDate, '2026-11-20');
});

test('one-sided prices remain eligible and are completed only by a matching trading day and code', async () => {
  for (const partial of [{ openingPrice: 2500 }, { closingPrice: 3500 }]) {
    const item = ipo({ ...partial }), run = fixture([item]);
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true, fetchPrices: async () => prices(item) });
    assert.equal(result.updatedCount, 1);
    assert.equal(run.writes[0].openingPrice, 3000); assert.equal(run.writes[0].closingPrice, 4000);
    assert.equal(run.writes[0].openingReturnRate, 50); assert.equal(run.writes[0].closingReturnRate, 100);
    assert.equal(run.writes[0].listingPriceEvidence?.code, item.code);
  }
  for (const changes of [{ code: '654321' }, { tradeDate: '2026-11-20' }, { closingPrice: Number.NaN }]) {
    const item = ipo({ openingPrice: 2500 }), original = structuredClone(item), run = fixture([item]);
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
      fetchPrices: async () => ({ ...prices(item), ...changes }) });
    assert.equal(result.success, false); assert.equal(result.errors.length, 1); assert.equal(run.writes.length, 0);
    assert.deepEqual(run.current()[0], original);
  }
});

test('temporary missing prices are retried on the next run then frozen after successful completion', async () => {
  const item = ipo(), run = fixture([item]); let requests = 0;
  const initial = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
    fetchPrices: async () => { requests++; return null; } });
  assert.equal(initial.success, false); assert.equal(run.writes.length, 0);
  const recovered = await run.sync({ now: at('2026-11-20', '09:17'), requireVerifiedListingDate: true,
    fetchPrices: async () => { requests++; return prices(item); } });
  assert.equal(recovered.success, true); assert.equal(recovered.updatedCount, 1);
  const stored = run.current()[0];
  const frozen = await run.sync({ now: at('2026-11-20', '18:17'), requireVerifiedListingDate: true,
    fetchPrices: async () => { requests++; throw new Error('Completed prices must never be queried.'); } });
  assert.equal(frozen.success, true); assert.equal(frozen.totalCandidates, 0); assert.equal(requests, 2);
  assert.deepEqual(run.current()[0], stored); assert.equal(run.writes.length, 1);
});

test('legacy complete results and matching bound results remain unchanged without requests or new evidence requirements', async () => {
  for (const withEvidence of [false, true]) {
    const item = ipo({ openingPrice: 3000, closingPrice: 4000, fieldEvidence: undefined });
    if (withEvidence) item.listingPriceEvidence = priceEvidence(item);
    const run = fixture([item]); let requests = 0;
    const result = await run.sync({ now: at('2026-11-20', '09:17'), forceAll: true, requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return null; } });
    assert.equal(result.success, true); assert.equal(result.skippedCount, 1); assert.equal(result.deferredCount, 0);
    assert.equal(requests, 0); assert.equal(run.writes.length, 0); assert.deepEqual(run.current()[0], item);
  }
});

test('complete results with a changed code or listing day report a binding error without replacing their stored prices', async () => {
  for (const mismatch of [{ code: '654321' }, { tradeDate: '2026-11-18' }]) {
    const item = ipo({ openingPrice: 3000, closingPrice: 4000 });
    item.listingPriceEvidence = { ...priceEvidence(item), ...mismatch };
    const run = fixture([item]); let requests = 0;
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return prices(item); } });
    assert.equal(result.success, false); assert.equal(result.errors.length, 1); assert.match(result.errors[0].error, /확정 가격/);
    assert.equal(result.totalCandidates, 0); assert.equal(result.skippedCount, 1);
    assert.equal(requests, 0); assert.equal(run.writes.length, 0); assert.deepEqual(run.current()[0], item);
  }
});

test('a completed binding error is retained when another eligible stock is successfully collected in the same run', async () => {
  const broken = ipo({ id: 'broken', openingPrice: 3000, closingPrice: 4000 });
  broken.listingPriceEvidence = { ...priceEvidence(broken), code: '654321' };
  const pending = ipo({ id: 'pending', code: '222222' }), run = fixture([broken, pending]);
  const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
    fetchPrices: async code => { assert.equal(code, pending.code); return prices(pending); } });
  assert.equal(result.updatedCount, 1); assert.equal(result.success, false); assert.equal(result.errors.length, 1);
  assert.deepEqual(run.writes.map(item => item.id), ['pending']); assert.deepEqual(run.current()[0], broken);
});

test('an exact KRX listing row allows prices despite an unrelated refund conflict or unavailable general schedule', async () => {
  for (const status of ['conflict', 'unavailable'] as const) {
    const item = krxIpo({ scheduleVerification: { status, checkedAt: '2026-10-30T01:00:00Z',
      conflicts: status === 'conflict' ? ['refundDate'] : [], coveredFields: ['listingDate'] } });
    assert.equal(getFieldEvidence(item, 'listingDate')?.parserVersion, 'krx-company-list-v1');
    const run = fixture([item]); let requests = 0;
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return prices(item); } });
    assert.equal(result.success, true); assert.equal(requests, 1); assert.equal(result.updatedCount, 1);
    assert.deepEqual(run.writes[0].scheduleVerification?.conflicts, item.scheduleVerification?.conflicts);
  }
});

test('listing-day or confirmed-price conflicts still block prices even when the exchange row is bound', async () => {
  for (const conflict of ['listingDate', 'confirmedPrice'] as const) {
    const item = krxIpo({ scheduleVerification: { status: 'conflict', checkedAt: '2026-10-30T01:00:00Z', conflicts: [conflict], coveredFields: [] } });
    const run = fixture([item]); let requests = 0;
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return prices(item); } });
    assert.equal(result.success, false); assert.equal(result.deferredCount, 1); assert.equal(result.errors.length, 1);
    assert.equal(requests, 0); assert.equal(run.writes.length, 0);
  }
});

test('non-exchange evidence cannot bypass an unavailable or conflicting general schedule', async () => {
  for (const status of ['conflict', 'unavailable'] as const) {
    const item = ipo({ scheduleVerification: { status, checkedAt: '2026-10-30T01:00:00Z', conflicts: ['refundDate'], coveredFields: ['listingDate'] } });
    const run = fixture([item]);
    const result = await run.sync({ now: at(listingDay, '18:17'), requireVerifiedListingDate: true,
      fetchPrices: async () => { throw new Error('Schedule is not eligible.'); } });
    assert.equal(result.deferredCount, 1); assert.equal(result.errors.length, 1); assert.equal(run.writes.length, 0);
  }
});

test('missing official evidence is pending before cutoff and becomes a visible error after cutoff without querying quotes', async () => {
  for (const time of ['17:59', '18:00']) {
    const run = fixture([ipo({ fieldEvidence: undefined })]); let requests = 0;
    const result = await run.sync({ now: at(listingDay, time), requireVerifiedListingDate: true,
      fetchPrices: async () => { requests++; return null; } });
    assert.equal(result.deferredCount, 1); assert.equal(result.deferredStocks.length, 1);
    assert.equal(result.errors.length, time === '18:00' ? 1 : 0); assert.equal(result.success, time !== '18:00');
    assert.match(result.deferredStocks[0].reason, /공식 상장일/); assert.equal(requests, 0); assert.equal(run.writes.length, 0);
  }
});

test('missing code or confirmed price remains pending and produces an explicit evening omission error', async () => {
  for (const changes of [{ code: '' }, { confirmedPrice: 0 }]) {
    for (const time of ['17:59', '18:00']) {
      const item = ipo(changes), run = fixture([item]); let requests = 0;
      const result = await run.sync({ now: at(listingDay, time), requireVerifiedListingDate: true,
        fetchPrices: async () => { requests++; return null; } });
      assert.equal(result.deferredCount, 1); assert.equal(result.errors.length, time === '18:00' ? 1 : 0);
      assert.equal(result.success, time !== '18:00'); assert.equal(requests, 0); assert.equal(run.writes.length, 0);
      if (time === '18:00') assert.match(result.deferredStocks[0].reason, /종목코드 또는 확정 공모가/);
    }
  }
});

test('previous-day evidence gaps are errors even on the next mornings retry and future listings remain untouched', async () => {
  const overdue = ipo({ fieldEvidence: undefined }), run = fixture([overdue]);
  const result = await run.sync({ now: at('2026-11-20', '09:17'), requireVerifiedListingDate: true, fetchPrices: async () => null });
  assert.equal(result.success, false); assert.equal(result.deferredCount, 1); assert.equal(result.errors.length, 1);
  const future = fixture([ipo()]); let requests = 0;
  const beforeListing = await future.sync({ now: at('2026-11-18', '18:17'), requireVerifiedListingDate: true,
    fetchPrices: async () => { requests++; return null; } });
  assert.equal(beforeListing.success, true); assert.equal(beforeListing.totalCandidates, 0); assert.equal(requests, 0);
});
