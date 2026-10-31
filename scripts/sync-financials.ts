interface FinancialOptions { write: boolean; days: number; help: boolean }
interface PendingFiling { name: string; receiptNo: string; sourceUrl: string; reason: string; evidence: string }
interface DartResult { success: boolean; updatedCount: number; message: string; errors: unknown[]; pendingCount?: number; pendingStocks?: PendingFiling[];
  deferredCount?: number; deferredStocks?: { name: string; code: string; receiptNo: string; reason: string }[] }
interface PriceResult { success: boolean; totalCandidates: number; updatedCount: number; skippedCount: number; deferredCount?: number;
  deferredStocks?: { name: string; reason: string }[]; errors: unknown[] }
interface ListingResult { success: boolean; updatedCount: number; pendingCount: number; errors: unknown[] }
export interface FinancialDependencies {
  load: () => unknown[];
  syncDart: (options: { days: number }) => Promise<DartResult>;
  syncPrices: (options?: { deferCodes?: string[] }) => Promise<PriceResult>;
  syncListings?: () => Promise<ListingResult>;
  flushMetricCache?: () => void;
  metricCacheStats?: { hits: number; misses: number; backoffSkipped: number; failures: number };
}

export function parseFinancialArguments(args: string[]): FinancialOptions {
  const options = { write: false, days: 14, help: false };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (seen.has(argument)) throw new Error(`중복 옵션: ${argument}`);
    seen.add(argument);
    if (argument === '--write') options.write = true;
    else if (argument === '--help') options.help = true;
    else if (argument === '--days') {
      const value = args[++index];
      if (!value || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 90) throw new Error('--days 값은 1~90 정수여야 합니다.');
      options.days = Number(value);
    } else throw new Error(`지원하지 않는 옵션: ${argument}`);
  }
  return options;
}

/** Existing parsers write through the same atomic custom-file store used by discovery. */
export async function runFinancialSync(options: FinancialOptions, dependencies?: FinancialDependencies) {
  if (!options.write) throw new Error('실행하려면 --write를 명시하세요. 읽기 전용 실행에서 기존 동기화 함수를 호출하지 않습니다.');
  if (process.env.VERCEL) throw new Error('Vercel에서는 파일 영속 저장을 실행하지 않습니다. 저장소 워크플로에서 실행하세요.');
  let services = dependencies;
  if (!services) {
    // Do not import runtime stores/parsers until all execution and credential guards pass.
    const [store, dart, prices, listings, ipoStore] = await Promise.all([
      import('../src/lib/ipoServerStore'), import('../src/lib/dartFilingSync'), import('../src/lib/stockPriceCrawler'),
      import('../src/lib/krxListings'), import('../src/lib/ipoStore'),
    ]);
    if (typeof dart.parseConfirmedFilingDetails !== 'function') throw new Error('DART 최신 수치 파서를 사용할 수 없습니다.');
    const { createDartMetricCache } = await import('../src/lib/dartMetricCache');
    // A corrupt DART cache must not prevent public exchange/price recovery.
    let cache: ReturnType<typeof createDartMetricCache> | undefined;
    services = { load: store.loadServerCustomIpos,
      syncListings: () => listings.syncKrxListingIdentities(ipoStore.getAllIpos(), { save: incoming => {
        // This collector's evidence binds the corrected value; generic edits intentionally invalidate it.
        const custom = store.loadServerCustomIpos(), index = custom.findIndex(item => item.id === incoming.id);
        if (index < 0) custom.push(incoming); else custom[index] = incoming;
        store.saveServerCustomIpos(custom);
      } }),
      syncDart: (syncOptions) => {
        cache = createDartMetricCache({ parseFiling: dart.parseConfirmedFilingDetails });
        return dart.syncExistingIposWithDartFilings({ ...syncOptions, parseFiling: cache.parseFiling });
      },
      syncPrices: (priceOptions) => prices.syncListingReturnsForIpos({ requireVerifiedListingDate: true, ...priceOptions }),
      flushMetricCache: () => cache?.flush(), get metricCacheStats() { return cache?.stats; } };
  }
  services.load();
  const error = (message: string) => ({ error: message });
  let listings: ListingResult | undefined;
  if (services.syncListings) {
    try { listings = await services.syncListings(); }
    catch { listings = { success: false, updatedCount: 0, pendingCount: 0, errors: [error('거래소 상장정보 처리 실패. 기존 자료를 보존했습니다.')] }; }
  }
  const collectPrices = async (deferCodes: string[]): Promise<PriceResult> => {
    try { return await services.syncPrices({ deferCodes }); }
    catch { return { success: false, totalCandidates: 0, updatedCount: 0, skippedCount: 0,
      errors: [error('상장일 시세 처리 실패. 기존 자료를 보존했습니다.')] }; }
  };
  const dartFailure = (): DartResult => ({ success: false, updatedCount: 0, message: 'DART 수치 처리 실패',
    errors: [error('DART 설정·원문·캐시 처리 실패. 기존 수치를 보존했습니다.')] });
  let dart: DartResult = dartFailure();
  if (process.env.DART_API_KEY?.trim()) {
    try { dart = await services.syncDart({ days: options.days }); }
    catch { /* Use a fixed message: raw exceptions can contain authenticated URLs. */ }
    finally {
      try { services.flushMetricCache?.(); }
      catch { dart = { ...dart, success: false, errors: [...dart.errors, error('DART 수치 캐시 저장 실패. 정상 저장으로 처리하지 않았습니다.')] }; }
    }
  }
  // Use the latest offer price as the return denominator before freezing first-day prices.
  // Filing work has its own time budget; any filing/cache failure still reaches this stage.
  const prices = await collectPrices((dart.deferredStocks || []).map(item => item.code));
  // Every changed record was atomically written by addOrUpdateIpo; reload verifies readable source data.
  const stored = services.load();
  const success = dart.success && prices.success && listings?.success !== false;
  const pendingCount = (dart.pendingCount || 0) + (prices.deferredCount || 0) + (listings?.pendingCount || 0);
  return {
    success, stage: 'complete', dataStatus: !success ? 'failed' : pendingCount > 0 ? 'pending' : 'complete',
    pendingCount, dart, prices, ...(listings ? { listings } : {}), customCount: stored.length,
    ...(services.metricCacheStats ? { metricCache: { ...services.metricCacheStats } } : {}),
    storageStatus: dart.updatedCount + prices.updatedCount + (listings?.updatedCount || 0) > 0 ? 'local-file-checked' : 'unchanged', deploymentConfirmed: false,
  };
}

/** Expected publication waits are visible separately from transport, parsing and storage failures. */
export function formatFinancialSummary(result: Awaited<ReturnType<typeof runFinancialSync>>): string {
  const cell = (value: string) => value.replace(/[|\r\n<>]/g, ' ').trim();
  const lines = ['## 금융 자료 갱신', '',
    `실행: ${result.success ? '정상' : '실패'} · 자료 상태: ${result.dataStatus}`,
    `갱신 ${result.dart.updatedCount + result.prices.updatedCount + (result.listings?.updatedCount || 0)}건 · 공시 발표 대기 ${result.dart.pendingCount || 0}건 · 시간 예산 보류 ${result.dart.deferredCount || 0}건 · 시세 저장 대기 ${result.prices.deferredCount || 0}건 · 오류 ${result.dart.errors.length + result.prices.errors.length + (result.listings?.errors.length || 0)}건`,
    ''];
  if (result.metricCache) lines.push(`수치 원문: 캐시 ${result.metricCache.hits}건 · 새 조회 ${result.metricCache.misses}건 · 재시도 대기 ${result.metricCache.backoffSkipped}건`, '');
  if (result.listings) lines.push(`거래소 상장정보: 보완 ${result.listings.updatedCount}건 · 상장 확인 대기 ${result.listings.pendingCount}건 · 오류 ${result.listings.errors.length}건`, '');
  for (const pending of result.prices.deferredStocks || []) lines.push(`- ${cell(pending.name)}: ${cell(pending.reason)}`);
  for (const deferred of result.dart.deferredStocks || []) lines.push(`- ${cell(deferred.name)}: ${cell(deferred.reason)}`);
  if (result.dart.pendingStocks?.length) {
    lines.push('발표 대기는 공시 본문의 미확정 안내를 확인한 상태이며, 미발표 값을 만들지 않습니다.', '', '| 종목 | 상태 | 원문 |', '| --- | --- | --- |');
    for (const pending of result.dart.pendingStocks) {
      const receipt = /^\d{14}$/.test(pending.receiptNo) ? pending.receiptNo : '';
      const url = receipt ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}` : '';
      lines.push(`| ${cell(pending.name)} | ${cell(pending.reason)} | ${url ? `[공시](${url})` : '확인 필요'} |`);
    }
    lines.push('');
  }
  if (!result.success) lines.push('실패 항목은 로그에서 확인하세요. 기존 값을 보존했으며 정상 갱신으로 처리하지 않았습니다.', '');
  return `${lines.join('\n')}\n`;
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseFinancialArguments(args);
  if (options.help || !options.write) {
    console.log('Usage: node scripts/sync-financials.mjs --write [--days 1..90]\nWithout --write: no cache, network requests or data changes. Requires DART_API_KEY. Runs DART metrics with receipt/version caching and matching-date Naver listing prices; no cross-check portal, LLM, email or Telegram. Changes are written to src/data/customIpos.json; repository commit and deployment are separate.');
    return;
  }
  const result = await runFinancialSync(options);
  console.log(JSON.stringify(result, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY || process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, formatFinancialSummary(result), 'utf8');
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT,
      `financial_data_status=${result.dataStatus}\nfinancial_pending_count=${result.pendingCount}\nfinancial_error_count=${result.dart.errors.length + result.prices.errors.length + (result.listings?.errors.length || 0)}\n`, 'utf8');
  }
  if (!result.success) process.exitCode = 1;
}

if (require.main === module) main().catch(() => {
  // Never echo raw transport errors: authenticated URLs can contain API credentials.
  console.error('금융 자료 동기화에 실패했습니다. --write·환경변수·DART 응답·파일 권한을 확인하세요. 저장 성공으로 처리하지 않았습니다.');
  process.exitCode = 1;
});
