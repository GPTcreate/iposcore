import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const receipt = '20261015000345';
const pending = { name: '발표 대기 기업', receiptNo: receipt,
  sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`,
  reason: '수요예측 및 확정 공모가 발표 전', evidence: '수요예측 결과를 반영하여 최종 결정할 예정입니다.' };

function fixture(dartFailure = false, priceFailure = false, unreadable = false, missingParser = false) {
  const moduleExports: Record<string, unknown> = {};
  const writes: Record<string, string> = {};
  const calls: string[] = [];
  const printed: string[] = [];
  const processMock: { env: Record<string, string>; argv: string[]; exitCode?: number } = {
    env: { DART_API_KEY: 'fixture-only', GITHUB_STEP_SUMMARY: 'summary.md', GITHUB_OUTPUT: 'output.txt' }, argv: [],
  };
  let loads = 0;
  let cacheCreations = 0;
  let cacheFlushes = 0;
  const imports: string[] = [];
  const services: Record<string, unknown> = {
    '../src/lib/ipoServerStore': { loadServerCustomIpos: () => {
      if (++loads === 2 && unreadable) throw new Error('Unreadable saved data');
      return [];
    } },
    '../src/lib/dartFilingSync': { ...(missingParser ? {} : { parseConfirmedFilingDetails: async () => null }), syncExistingIposWithDartFilings: async (options: { parseFiling?: unknown }) => {
      assert.equal(typeof options.parseFiling, 'function');
      calls.push('dart');
      return { success: !dartFailure, updatedCount: 0, message: 'fixture',
        errors: dartFailure ? [{ error: 'DART request failed' }] : [], pendingCount: 1, pendingStocks: [pending] };
    } },
    '../src/lib/dartMetricCache': { createDartMetricCache: (options: { parseFiling: unknown }) => {
      assert.equal(typeof options.parseFiling, 'function');
      cacheCreations++;
      return { parseFiling: options.parseFiling, flush: () => { cacheFlushes++; },
        stats: { hits: 4, misses: 1, backoffSkipped: 2, failures: 0 } };
    } },
    '../src/lib/stockPriceCrawler': { syncListingReturnsForIpos: async () => {
      calls.push('prices');
      return { success: !priceFailure, totalCandidates: 0, updatedCount: 0, skippedCount: 0, deferredCount: 0,
        errors: priceFailure ? [{ error: 'Stock request failed' }] : [] };
    } },
    '../src/lib/ipoStore': { getAllIpos: () => [] },
    '../src/lib/krxListings': { syncKrxListingIdentities: async () => {
      calls.push('listings');
      return { success: true, updatedCount: 0, pendingCount: 0, errors: [] };
    } },
    'node:fs': { appendFileSync: (file: string, content: string) => { writes[file] = (writes[file] || '') + content; } },
  };
  const source = fs.readFileSync('scripts/sync-financials.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { exports: moduleExports, module: { exports: moduleExports }, process: processMock,
    console: { log: (value: string) => printed.push(value), error: () => {} },
    require: (name: string) => {
      imports.push(name);
      assert(Object.prototype.hasOwnProperty.call(services, name), `Unexpected import ${name}`);
      return services[name];
    },
  });
  return { main: moduleExports.main as (args: string[]) => Promise<void>,
    runFinancialSync: moduleExports.runFinancialSync as (options: { write: boolean; days: number; help: boolean }) => Promise<unknown>,
    writes, calls, printed, processMock, imports, effects: () => ({ loads, cacheCreations, cacheFlushes }) };
}

test('documented publication waits complete normally and remain visible in runner output', async () => {
  const run = fixture();
  await run.main(['--write']);
  const result = JSON.parse(run.printed[0]);
  assert.equal(result.success, true);
  assert.equal(result.dataStatus, 'pending');
  assert.equal(result.pendingCount, 1);
  assert.equal(result.dart.updatedCount, 0);
  assert.equal(result.deploymentConfirmed, false);
  assert.equal(result.dart.pendingStocks[0].evidence, pending.evidence);
  assert.deepEqual(result.metricCache, { hits: 4, misses: 1, backoffSkipped: 2, failures: 0 });
  assert.deepEqual(run.effects(), { loads: 2, cacheCreations: 1, cacheFlushes: 1 });
  assert.deepEqual(run.calls, ['listings', 'dart', 'prices']);
  assert.equal(run.processMock.exitCode, undefined);
  assert.match(run.writes['summary.md'], /공시 발표 대기 1건/);
  assert(run.writes['summary.md'].includes(pending.sourceUrl));
  assert.match(run.writes['output.txt'], /financial_data_status=pending\nfinancial_pending_count=1\nfinancial_error_count=0/);
  assert(!JSON.stringify(run.writes).includes('fixture-only'));
});

test('publication waits never mask a real DART or price failure', async () => {
  for (const [dartFailure, priceFailure] of [[true, false], [false, true], [true, true]]) {
    const run = fixture(dartFailure, priceFailure);
    await run.main(['--write']);
    const result = JSON.parse(run.printed[0]);
    assert.equal(result.success, false);
    assert.equal(result.dataStatus, 'failed');
    assert.equal(run.processMock.exitCode, 1);
    assert.deepEqual(run.calls, ['listings', 'dart', 'prices']);
    assert.match(run.writes['summary.md'], /실행: 실패/);
    assert(run.writes['output.txt'].includes(`financial_error_count=${Number(dartFailure) + Number(priceFailure)}`));
  }
});

test('failed file readback rejects before writing a successful runner summary', async () => {
  const run = fixture(false, false, true);
  await assert.rejects(run.main(['--write']), /Unreadable saved data/);
  assert.equal(run.writes['summary.md'], undefined);
});

test('help and missing explicit write remain free of data requests or report writes', async () => {
  for (const args of [[], ['--help']]) {
    const run = fixture();
    await run.main(args);
    assert.equal(run.calls.length, 0);
    assert.equal(Object.keys(run.writes).length, 0);
    assert.equal(run.imports.length, 0);
    assert.deepEqual(run.effects(), { loads: 0, cacheCreations: 0, cacheFlushes: 0 });
  }
});

test('write, credentials and Vercel guards run before cache imports, disk loads or network services', async () => {
  for (const guard of ['write', 'credentials', 'vercel']) {
    const run = fixture();
    if (guard === 'credentials') delete run.processMock.env.DART_API_KEY;
    if (guard === 'vercel') run.processMock.env.VERCEL = '1';
    await assert.rejects(run.runFinancialSync({ write: guard !== 'write', days: 14, help: false }));
    assert.equal(run.imports.length, 0);
    assert.equal(run.calls.length, 0);
    assert.deepEqual(run.effects(), { loads: 0, cacheCreations: 0, cacheFlushes: 0 });
  }
});

test('an unavailable latest parser stops before cache access or synchronization', async () => {
  const run = fixture(false, false, false, true);
  await assert.rejects(run.main(['--write']), /최신 수치 파서/);
  assert(!run.imports.includes('../src/lib/dartMetricCache'));
  assert.deepEqual(run.effects(), { loads: 0, cacheCreations: 0, cacheFlushes: 0 });
  assert.equal(run.calls.length, 0);
});
