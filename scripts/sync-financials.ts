interface FinancialOptions { write: boolean; days: number; help: boolean }
interface DartResult { success: boolean; updatedCount: number; message: string; errors: unknown[] }
interface PriceResult { success: boolean; totalCandidates: number; updatedCount: number; skippedCount: number; errors: unknown[] }
export interface FinancialDependencies {
  load: () => unknown[];
  syncDart: (options: { days: number }) => Promise<DartResult>;
  syncPrices: () => Promise<PriceResult>;
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
  if (!process.env.DART_API_KEY?.trim()) throw new Error('DART_API_KEY 환경변수가 필요합니다.');
  if (process.env.VERCEL) throw new Error('Vercel에서는 파일 영속 저장을 실행하지 않습니다. 저장소 워크플로에서 실행하세요.');
  let services = dependencies;
  if (!services) {
    // Do not import runtime stores/parsers until all execution and credential guards pass.
    const [store, dart, prices] = await Promise.all([
      import('../src/lib/ipoServerStore'), import('../src/lib/dartFilingSync'), import('../src/lib/stockPriceCrawler'),
    ]);
    services = { load: store.loadServerCustomIpos, syncDart: dart.syncExistingIposWithDartFilings, syncPrices: prices.syncListingReturnsForIpos };
  }
  services.load();
  const dart = await services.syncDart({ days: options.days });
  const prices = await services.syncPrices();
  // Every changed record was atomically written by addOrUpdateIpo; reload verifies readable source data.
  const stored = services.load();
  return {
    success: dart.success && prices.success, stage: 'complete', dart, prices, customCount: stored.length,
    storageStatus: dart.updatedCount + prices.updatedCount > 0 ? 'local-file-checked' : 'unchanged', deploymentConfirmed: false,
  };
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseFinancialArguments(args);
  if (options.help || !options.write) {
    console.log('Usage: node scripts/sync-financials.mjs --write [--days 1..90]\nWithout --write: no network requests or data changes. Requires DART_API_KEY. Runs existing DART metrics and matching-date Naver listing-price paths only; no cross-check portal, LLM, email or Telegram. Changes are written to src/data/customIpos.json; repository commit and deployment are separate.');
    return;
  }
  const result = await runFinancialSync(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exitCode = 1;
}

if (require.main === module) main().catch(() => {
  // Never echo raw transport errors: authenticated URLs can contain API credentials.
  console.error('금융 자료 동기화에 실패했습니다. --write·환경변수·DART 응답·파일 권한을 확인하세요. 저장 성공으로 처리하지 않았습니다.');
  process.exitCode = 1;
});
