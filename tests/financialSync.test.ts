import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as cheerio from 'cheerio';
import { createDiscoveredIpo, invalidateChangedIpoEvidence } from '../src/lib/ipoDiscovery';
import * as discovery from '../src/lib/ipoDiscovery';
import type { DartFilingItem } from '../src/lib/ipoDiscovery';
import type { IpoItem } from '../src/types/ipo';
import { hasScorableForecast, hasVerifiedField } from '../src/lib/contentQuality';
import { calculateIpoScore } from '../src/lib/scoring';
import { analyzeIpoSentiment } from '../src/lib/sentimentAnalyzer';

type Callable = (...args: never[]) => unknown;
const filing = (changes: Partial<DartFilingItem> = {}): DartFilingItem => ({ corp_code: '12345678', corp_name: '실제공시기업', corp_cls: 'E',
  stock_code: '123456', report_nm: '[발행조건확정]증권신고서(지분증권)', rcept_no: '20261023000001', rcept_dt: '20261023', ...changes });
const fixtureIpo = (changes: Partial<IpoItem> = {}): IpoItem => ({ ...createDiscoveredIpo(filing())!, confirmedPrice: 2000,
  institutionalCompetitionRate: 1266, circulatingSupplyRate: 95.42, lockupCommitmentRate: 0, pendingForecastFields: undefined, ...changes });

function moduleFixture(relative: string, imports: Record<string, unknown>, environment: Record<string, string> = {}) {
  const exports: Record<string, Callable> = {};
  const source = fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { exports, module: { exports }, require: (name: string) => {
    if (name === 'cheerio') return cheerio;
    if (Object.prototype.hasOwnProperty.call(imports, name)) return imports[name];
    throw new Error(`Unexpected fixture import: ${name}`);
  }, process: { env: environment, argv: [] }, console: { log: () => {}, warn: () => {}, error: () => {} },
  structuredClone, URL, AbortSignal, Response });
  return exports;
}

function dartFixture(initial: IpoItem) {
  let current = structuredClone(initial);
  const writes: IpoItem[] = [];
  const loaded = moduleFixture('src/lib/dartFilingSync.ts', {
    './ipoStore': { getAllIpos: () => [structuredClone(current)] },
    './ipoServerStore': { addOrUpdateIpo: (incoming: IpoItem) => {
      current = invalidateChangedIpoEvidence(current, incoming); writes.push(structuredClone(current)); return { success: true, ipo: current };
    } }, './ipoDiscovery': discovery,
  });
  return { module: loaded, writes, current: () => current };
}

interface DartResult { success: boolean; updatedCount: number; errors: unknown[] }
interface Parsed { rcpNo: string; corpName: string; confirmedPrice?: number; circulatingSupplyRate?: number; institutionalCompetitionRate?: number; lockupCommitmentRate?: number }
type SyncDart = (options: { apiKey?: string; fetcher: typeof fetch; parseFiling?: (receipt: string) => Promise<Parsed | null> }) => Promise<DartResult>;

test('latest unchanged 1266/95.42/0 metrics never fall back to an older different filing', async () => {
  const fixture = dartFixture(fixtureIpo());
  const parsed: string[] = [];
  const latest = filing({ rcept_no: '20261024000002', rcept_dt: '20261024' });
  const sync = fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart;
  const result = await sync({ apiKey: 'fixture-key', fetcher: (async () => Response.json({ status: '000', list: [filing(), latest] })) as typeof fetch,
    parseFiling: async (receipt) => {
      parsed.push(receipt);
      return receipt === latest.rcept_no
        ? { rcpNo: receipt, corpName: '', confirmedPrice: 2000, institutionalCompetitionRate: 1266, circulatingSupplyRate: 95.42, lockupCommitmentRate: 0 }
        : { rcpNo: receipt, corpName: '', confirmedPrice: 3000, institutionalCompetitionRate: 100, circulatingSupplyRate: 20, lockupCommitmentRate: 30 };
    } });
  assert.equal(result.success, true);
  assert.equal(result.updatedCount, 0);
  assert.deepEqual(parsed, [latest.rcept_no]);
  assert.equal(fixture.writes.length, 0);
  assert.equal(fixture.current().lockupCommitmentRate, 0);
  assert.equal(fixture.current().institutionalCompetitionRate, 1266);
  assert.equal(fixture.current().circulatingSupplyRate, 95.42);
});

test('unparseable latest filing records failure and cannot overwrite with an older filing', async () => {
  const fixture = dartFixture(fixtureIpo());
  const receipts: string[] = [];
  const result = await (fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart)({ apiKey: 'fixture-key',
    fetcher: (async () => Response.json({ status: '000', list: [filing(), filing({ rcept_no: '20261024000002' })] })) as typeof fetch,
    parseFiling: async (receipt) => { receipts.push(receipt); return null; } });
  assert.equal(result.success, false);
  assert.equal(result.errors.length, 1);
  assert.deepEqual(receipts, ['20261024000002']);
  assert.equal(fixture.writes.length, 0);
});

test('unpublished zero lockup cannot score after only competition and float were parsed', async () => {
  const created = createDiscoveredIpo(filing())!;
  const fixture = dartFixture(created);
  const result = await (fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart)({ apiKey: 'fixture-key',
    fetcher: (async () => Response.json({ status: '000', list: [filing()] })) as typeof fetch,
    parseFiling: async (receipt) => ({ rcpNo: receipt, corpName: '', institutionalCompetitionRate: 1266, circulatingSupplyRate: 95.42 }) });
  assert.equal(result.updatedCount, 1);
  assert.deepEqual(fixture.current().pendingForecastFields, ['lockupCommitmentRate']);
  assert.equal(fixture.current().lockupCommitmentRate, 0);
  assert.equal(hasScorableForecast(fixture.current()), false);
  assert.equal(calculateIpoScore(fixture.current()).isPendingForecast, true);
  const analysis = await analyzeIpoSentiment(fixture.current(), 'MANUAL_FORCE');
  assert.equal(analysis.aiScore, 0);
});

test('actually parsed zero lockup clears pending and persists even when the numerical value stays zero', async () => {
  const initial = fixtureIpo({ pendingForecastFields: ['lockupCommitmentRate'] });
  const fixture = dartFixture(initial);
  const result = await (fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart)({ apiKey: 'fixture-key',
    fetcher: (async () => Response.json({ status: '000', list: [filing()] })) as typeof fetch,
    parseFiling: async (receipt) => ({ rcpNo: receipt, corpName: '', lockupCommitmentRate: 0 }) });
  assert.equal(result.updatedCount, 1);
  assert.equal(fixture.writes.length, 1);
  assert.deepEqual(fixture.current().pendingForecastFields, []);
  assert.equal(fixture.current().lockupCommitmentRate, 0);
  assert.equal(hasScorableForecast(fixture.current()), true);
  assert.equal(hasScorableForecast(fixtureIpo()), true);
});

test('pending input cannot be verified by an old citation and invalid parsed ranges cannot release it', async () => {
  const evidence = { sourceTitle: '기존 공시', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261023000001', checkedAt: '2026-10-23T00:00:00Z' };
  const initial = fixtureIpo({ pendingForecastFields: ['lockupCommitmentRate'], fieldEvidence: { lockupCommitmentRate: evidence } });
  assert.equal(hasVerifiedField(initial, 'lockupCommitmentRate'), false);
  const fixture = dartFixture(initial);
  await (fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart)({ apiKey: 'fixture-key',
    fetcher: (async () => Response.json({ status: '000', list: [filing()] })) as typeof fetch,
    parseFiling: async (receipt) => ({ rcpNo: receipt, corpName: '', lockupCommitmentRate: 101 }) });
  assert.deepEqual(fixture.current().pendingForecastFields, ['lockupCommitmentRate']);
  assert.equal(fixture.writes.length, 0);
});

test('DART pagination processes a later page and actual changes invalidate the affected evidence', async () => {
  const evidence = { sourceTitle: '기존 공시', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261023000001', checkedAt: '2026-10-23T00:00:00Z' };
  const fixture = dartFixture(fixtureIpo({ fieldEvidence: { confirmedPrice: evidence, institutionalCompetitionRate: evidence } }));
  let requests = 0;
  const result = await (fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart)({ apiKey: 'fixture-key',
    fetcher: (async () => Response.json({ status: '000', total_page: 2, list: ++requests === 1 ? [] : [filing()] })) as typeof fetch,
    parseFiling: async (receipt) => ({ rcpNo: receipt, corpName: '', confirmedPrice: 2200 }) });
  assert.equal(requests, 2);
  assert.equal(result.updatedCount, 1);
  assert.equal(fixture.writes[0].confirmedPrice, 2200);
  assert.equal(fixture.writes[0].fieldEvidence!.confirmedPrice, undefined);
  assert.deepEqual(fixture.writes[0].fieldEvidence!.institutionalCompetitionRate, evidence);
});

test('missing configured DART key and rejected DART responses fail without mutation', async () => {
  const fixture = dartFixture(fixtureIpo());
  let requests = 0;
  const fetcher = (async () => { requests++; return Response.json({ status: '020' }); }) as typeof fetch;
  const sync = fixture.module.syncExistingIposWithDartFilings as unknown as SyncDart;
  assert.equal((await sync({ fetcher })).success, false);
  assert.equal(requests, 0);
  assert.equal((await sync({ apiKey: 'fixture-key', fetcher })).success, false);
  assert.equal(fixture.writes.length, 0);
  const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dartFilingSync.ts'), 'utf8');
  assert.equal(/DART_API_KEY\s*\|\|\s*['"][a-z0-9]{30,}/i.test(source), false);
});

test('actual document parsing preserves comma-separated 1,266 competition and zero lockup', async () => {
  const fixture = dartFixture(fixtureIpo());
  let count = 0;
  const parse = fixture.module.parseConfirmedFilingDetails as unknown as (receipt: string, options: { fetcher: typeof fetch }) => Promise<Parsed | null>;
  const result = await parse(filing().rcept_no, { fetcher: (async () => new Response(++count === 1
    ? "node1['text']='증권발행조건확정';node1['dcmNo']='12345';node1['eleId']='1';node1['offset']='0';node1['length']='1000';node1['dtd']='dart4.xsd';"
    : '<p>수요예측 참여내역</p><table><tr><th>구분</th><th>국내기관투자자</th><th>합계</th></tr><tr><td>경쟁률</td><td>100</td><td>1,266.00</td></tr></table><p>의무보유 확약 비율 0 %</p><p>상장일 유통가능비율 95.42 %</p>')) as typeof fetch });
  assert.equal(result!.institutionalCompetitionRate, 1266);
  assert.equal(result!.lockupCommitmentRate, 0);
  assert.equal(result!.circulatingSupplyRate, 95.42);
});

function priceFixture(initial: IpoItem) {
  const writes: IpoItem[] = [];
  const loaded = moduleFixture('src/lib/stockPriceCrawler.ts', {
    https: { get: () => { throw new Error('Live HTTPS is forbidden in fixtures.'); } },
    './ipoUtils': { getAllEffectiveIpos: () => [structuredClone(initial)], getKstDateString: () => '2026-10-25' },
    './ipoServerStore': { addOrUpdateIpo: (incoming: IpoItem) => { writes.push(structuredClone(incoming)); return { success: true, ipo: incoming }; } },
  });
  return { module: loaded, writes };
}
interface Prices { code: string; tradeDate: string; openingPrice: number; closingPrice: number; source: string }
type FetchPrices = (code: string, listingDate?: string, options?: { fetcher: (url: string) => Promise<string> }) => Promise<Prices | null>;
type SyncPrices = (options?: { fetchPrices?: () => Promise<Prices | null>; now?: Date; targetCode?: string }) => Promise<{ success: boolean; updatedCount: number; skippedCount: number; deferredCount: number; errors: unknown[] }>;

test('fchart selects the exact listing day rather than the oldest candle', async () => {
  const fixture = priceFixture(fixtureIpo());
  const result = await (fixture.module.fetchStockListingPrices as unknown as FetchPrices)('123456', '2026-10-20', {
    fetcher: async () => '<item data="20240101|100|0|0|110|1"/><item data="20261020|2000|0|0|2500|1"/><item data="20261021|3000|0|0|3500|1"/>',
  });
  assert.equal(result!.tradeDate, '2026-10-20');
  assert.equal(result!.openingPrice, 2000);
});

test('recent-session fallback searches for the exact listing day', async () => {
  const fixture = priceFixture(fixtureIpo());
  const result = await (fixture.module.fetchStockListingPrices as unknown as FetchPrices)('123456', '2026-10-20', {
    fetcher: async (url) => url.includes('fchart') ? '<item data="20240101|100|0|0|110|1"/>'
      : JSON.stringify([{ localTradedAt: '2026-10-20T15:30:00', openPrice: 2000, closePrice: 2300 }, { localTradedAt: '2026-10-19', openPrice: 100, closePrice: 110 }]),
  });
  assert.equal(result!.tradeDate, '2026-10-20');
  assert.equal(result!.closingPrice, 2300);
});

test('all mismatched dates return no price instead of substituting a current session', async () => {
  const fixture = priceFixture(fixtureIpo());
  const result = await (fixture.module.fetchStockListingPrices as unknown as FetchPrices)('123456', '2026-10-20', {
    fetcher: async (url) => url.includes('fchart') ? '<item data="20240101|100|0|0|110|1"/>'
      : url.includes('polling') ? JSON.stringify({ datas: [{ localTradedAt: '2026-10-25T15:30:00', openPriceRaw: 9999, closePriceRaw: 9999 }] })
        : JSON.stringify([{ localTradedAt: '2026-10-24', openPrice: 9999, closePrice: 9999 }]),
  });
  assert.equal(result, null);
});

test('sync preserves existing records and reports failure on a mismatched trade date', async () => {
  const initial = fixtureIpo({ status: 'WAITING_LISTING', listingDate: '2026-10-20', openingPrice: 10 });
  const fixture = priceFixture(initial);
  const result = await (fixture.module.syncListingReturnsForIpos as unknown as SyncPrices)({
    fetchPrices: async () => ({ code: initial.code, tradeDate: '2026-10-24', openingPrice: 1000, closingPrice: 2000, source: 'fchart_origin' }),
  });
  assert.equal(result.success, false);
  assert.equal(result.errors.length, 1);
  assert.equal(result.skippedCount, 1);
  assert.equal(result.updatedCount, 0);
  assert.equal(fixture.writes.length, 0);
  assert.equal(initial.status, 'WAITING_LISTING');
  assert.equal(initial.openingPrice, 10);
});

test('matching-day prices still persist returns and finalized records remain frozen', async () => {
  const initial = fixtureIpo({ listingDate: '2026-10-20' });
  const fixture = priceFixture(initial);
  const result = await (fixture.module.syncListingReturnsForIpos as unknown as SyncPrices)({
    fetchPrices: async () => ({ code: initial.code, tradeDate: '2026-10-20', openingPrice: 3000, closingPrice: 4000, source: 'fchart_origin' }),
  });
  assert.equal(result.success, true);
  assert.equal(fixture.writes[0].openingReturnRate, 50);
  assert.equal(fixture.writes[0].closingReturnRate, 100);
  const frozen = priceFixture(fixture.writes[0]);
  assert.equal((await (frozen.module.syncListingReturnsForIpos as unknown as SyncPrices)()).updatedCount, 0);
  assert.equal(frozen.writes.length, 0);
});

test('listing-day prices defer before 15:40 KST even for a manual target and resume after close', async () => {
  for (const time of ['2026-10-25T00:10:00Z', '2026-10-25T06:39:00Z', '2026-10-25T06:40:00Z']) {
    const initial = fixtureIpo({ listingDate: '2026-10-25' });
    const fixture = priceFixture(initial);
    let fetches = 0;
    const result = await (fixture.module.syncListingReturnsForIpos as unknown as SyncPrices)({
      now: new Date(time), targetCode: initial.code,
      fetchPrices: async () => { fetches++; return { code: initial.code, tradeDate: '2026-10-25', openingPrice: 3000, closingPrice: 4000, source: 'realtime_polling' }; },
    });
    const afterClose = time.endsWith('06:40:00Z');
    assert.equal(fetches, afterClose ? 1 : 0);
    assert.equal(result.deferredCount, afterClose ? 0 : 1);
    assert.equal(fixture.writes.length, afterClose ? 1 : 0);
  }
});

interface Dependencies { load: () => unknown[]; syncDart: () => Promise<{ success: boolean; updatedCount: number; message: string; errors: unknown[] }>;
  syncPrices: () => Promise<{ success: boolean; totalCandidates: number; updatedCount: number; skippedCount: number; errors: unknown[] }> }
type RunSync = (options: { write: boolean; days: number; help: boolean }, dependencies: Dependencies) => Promise<{ success: boolean; storageStatus: string; deploymentConfirmed: boolean }>;
const successDart = { success: true, updatedCount: 1, message: 'fixture', errors: [] };
const successPrices = { success: true, totalCandidates: 1, updatedCount: 1, skippedCount: 0, errors: [] };

test('CLI execution guards prevent all IO without --write, configured key, or durable local execution', async () => {
  for (const [environment, write] of [[{ DART_API_KEY: 'fixture-key' }, false], [{}, true], [{ DART_API_KEY: 'fixture-key', VERCEL: 'production' }, true]] as const) {
    const fixture = moduleFixture('scripts/sync-financials.ts', {}, { ...environment });
    let calls = 0;
    const dependencies = { load: () => { calls++; return []; }, syncDart: async () => { calls++; return successDart; }, syncPrices: async () => { calls++; return successPrices; } };
    await assert.rejects((fixture.runFinancialSync as unknown as RunSync)({ write, days: 14, help: false }, dependencies));
    assert.equal(calls, 0);
  }
});

test('CLI runs only the two allowed paths then reloads persisted source and never claims deployment', async () => {
  const fixture = moduleFixture('scripts/sync-financials.ts', {}, { DART_API_KEY: 'fixture-key' });
  const calls: string[] = [];
  const result = await (fixture.runFinancialSync as unknown as RunSync)({ write: true, days: 14, help: false }, {
    load: () => { calls.push('load'); return []; },
    syncDart: async () => { calls.push('dart'); return successDart; },
    syncPrices: async () => { calls.push('prices'); return successPrices; },
  });
  assert.deepEqual(calls, ['load', 'dart', 'prices', 'load']);
  assert.equal(result.storageStatus, 'local-file-checked');
  assert.equal(result.deploymentConfirmed, false);
});

test('CLI exposes failure from either path and does not acknowledge an unreadable saved file', async () => {
  const fixture = moduleFixture('scripts/sync-financials.ts', {}, { DART_API_KEY: 'fixture-key' });
  const run = fixture.runFinancialSync as unknown as RunSync;
  let priceCalls = 0;
  const dependencies = { load: () => [], syncDart: async () => ({ ...successDart, success: false }),
    syncPrices: async () => { priceCalls++; return successPrices; } };
  assert.equal((await run({ write: true, days: 14, help: false }, dependencies)).success, false);
  assert.equal(priceCalls, 1);
  assert.equal((await run({ write: true, days: 14, help: false }, { ...dependencies, syncDart: async () => successDart, syncPrices: async () => ({ ...successPrices, success: false }) })).success, false);
  let loads = 0;
  await assert.rejects(run({ write: true, days: 14, help: false }, { ...dependencies, syncDart: async () => successDart,
    load: () => { if (++loads === 2) throw new Error('Readback failed'); return []; } }));
});

function routeFixture(relative: string, environment: Record<string, string>, failures: string[] = [], authorized = true) {
  const calls: string[] = [];
  const source = fixtureIpo();
  const loaded = moduleFixture(relative, {
    'next/server': { NextResponse: { json: (body: unknown, options?: ResponseInit) => Response.json(body, options) } },
    '@/lib/ipoUtils': { getAllEffectiveIpos: () => { calls.push('read-ipos'); return [source]; } },
    '@/lib/adminAuth': { verifyAdminRequest: () => ({ authorized }) },
    '@/lib/publicIpo': { isPublicIpo: () => true, toPublicIpo: (item: IpoItem) => item },
    '@/lib/reviewArchiveServer': { loadServerReviewArchive: () => { calls.push('read-reviews'); } },
    '@/lib/ipoServerStore': {
      loadServerCustomIpos: () => { calls.push('read-custom'); return []; },
      syncNewIposFromDart: async () => { calls.push('discovery'); return { success: !failures.includes('discovery'), filingsCount: 1, newCount: 0, newIpos: [], message: 'fixture' }; },
      addOrUpdateIpo: (item: IpoItem) => { calls.push('write-ipo'); return { success: true, ipo: item }; },
      deleteCustomIpo: () => { calls.push('delete-ipo'); return true; },
    },
    '@/lib/dartFilingSync': { syncExistingIposWithDartFilings: async () => { calls.push('dart'); return { success: !failures.includes('dart'), updatedCount: 0, updatedStocks: [], errors: [] }; } },
    '@/lib/stockPriceCrawler': { syncListingReturnsForIpos: async () => { calls.push('prices'); return { success: !failures.includes('prices'), totalCandidates: 0, updatedCount: 0, updatedStocks: [], skippedCount: 0, deferredCount: 0, errors: [] }; } },
    '@/lib/crossCheckSync': { crossCheckAndSyncIpos: async () => { calls.push('crosscheck'); return { updatedCount: 0, updatedStocks: [] }; } },
    '@/lib/pipeline': {
      getKstDateString: () => '2026-10-25',
      runMethod2Pipeline: async () => { calls.push('reviews'); return { reviewSnapshots: failures.includes('reviews') ? [{ status: 'failed' }] : [], storageStatus: 'unchanged' }; },
    },
  }, environment);
  return { module: loaded, calls };
}
type RouteHandler = (request: Request) => Promise<Response>;

test('Vercel cron returns 409 before all financial and review work', async () => {
  const fixture = routeFixture('src/app/api/cron/update/route.ts', { VERCEL: 'production' });
  const response = await (fixture.module.GET as unknown as RouteHandler)(new Request('https://example.invalid/api/cron/update'));
  assert.equal(response.status, 409);
  const body = await response.json();
  assert.equal(body.storageStatus, 'repository-job-required');
  assert.equal(body.reviewsExecuted, false);
  assert.equal(fixture.calls.length, 0);
});

test('Vercel IPO mutations reject before execution while ordinary public reads stay available', async () => {
  const fixture = routeFixture('src/app/api/ipo/route.ts', { VERCEL: 'production' });
  for (const [method, suffix] of [['GET', '?forceSync=true'], ['POST', ''], ['DELETE', '?id=fixture']]) {
    const response = await (fixture.module[method] as unknown as RouteHandler)(new Request(`https://example.invalid/api/ipo${suffix}`, { method }));
    assert.equal(response.status, 409);
    assert.equal((await response.json()).reviewsExecuted, false);
  }
  assert.equal(fixture.calls.length, 0);
  const response = await (fixture.module.GET as unknown as RouteHandler)(new Request('https://example.invalid/api/ipo'));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ipos.length, 1);
  assert.deepEqual(fixture.calls, ['read-custom', 'read-reviews', 'read-ipos']);
  const denied = routeFixture('src/app/api/ipo/route.ts', { VERCEL: '1' }, [], false);
  assert.equal((await (denied.module.POST as unknown as RouteHandler)(new Request('https://example.invalid/api/ipo', { method: 'POST' }))).status, 401);
});

test('local cron reflects every failure and excludes automatic portal overwrites', async () => {
  for (const failures of [[], ['discovery'], ['dart'], ['prices'], ['reviews']]) {
    const fixture = routeFixture('src/app/api/cron/update/route.ts', {}, failures);
    const response = await (fixture.module.GET as unknown as RouteHandler)(new Request('https://example.invalid/api/cron/update'));
    const body = await response.json();
    assert.equal(body.success, failures.length === 0);
    assert.equal(body.reviewsExecuted, true);
    assert.equal(fixture.calls.includes('crosscheck'), false);
    assert.equal(fixture.calls.includes('reviews'), true);
  }
});

test('local explicit portal action remains available and DART discovery failure is not relabeled success', async () => {
  const fixture = routeFixture('src/app/api/ipo/route.ts', {}, ['discovery']);
  const request = (action: string) => new Request('https://example.invalid/api/ipo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
  const response = await (fixture.module.POST as unknown as RouteHandler)(request('sync-dart'));
  assert.equal((await response.json()).success, false);
  assert.equal((await (fixture.module.POST as unknown as RouteHandler)(request('sync-crosscheck'))).status, 200);
  assert.equal(fixture.calls.includes('crosscheck'), true);
});

test('local forceSync excludes implicit portal writes and reflects financial sync failures', async () => {
  for (const failures of [[], ['discovery'], ['prices']]) {
    const fixture = routeFixture('src/app/api/ipo/route.ts', {}, failures);
    const response = await (fixture.module.GET as unknown as RouteHandler)(new Request('https://example.invalid/api/ipo?forceSync=true'));
    assert.equal((await response.json()).success, failures.length === 0);
    assert.equal(fixture.calls.includes('crosscheck'), false);
    assert.equal(fixture.calls.includes('discovery'), true);
    assert.equal(fixture.calls.includes('prices'), true);
  }
});

test('only financial Vercel cron is removed and the existing newsletter schedule is preserved', () => {
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
  assert.equal(config.crons.some((job: { path: string }) => job.path === '/api/cron/update'), false);
  assert.deepEqual(config.crons.find((job: { path: string }) => job.path === '/api/cron/newsletter'), { path: '/api/cron/newsletter', schedule: '35 0 * * 1' });
});
