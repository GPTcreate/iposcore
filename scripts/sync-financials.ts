interface FinancialOptions { write: boolean; days: number; help: boolean }
interface PendingFiling { name: string; receiptNo: string; sourceUrl: string; reason: string; evidence: string }
interface DartResult { success: boolean; updatedCount: number; message: string; errors: unknown[]; pendingCount?: number; pendingStocks?: PendingFiling[] }
interface PriceResult { success: boolean; totalCandidates: number; updatedCount: number; skippedCount: number; deferredCount?: number; errors: unknown[] }
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
  const success = dart.success && prices.success;
  const pendingCount = (dart.pendingCount || 0) + (prices.deferredCount || 0);
  return {
    success, stage: 'complete', dataStatus: !success ? 'failed' : pendingCount > 0 ? 'pending' : 'complete',
    pendingCount, dart, prices, customCount: stored.length,
    storageStatus: dart.updatedCount + prices.updatedCount > 0 ? 'local-file-checked' : 'unchanged', deploymentConfirmed: false,
  };
}

/** Expected publication waits are visible separately from transport, parsing and storage failures. */
export function formatFinancialSummary(result: Awaited<ReturnType<typeof runFinancialSync>>): string {
  const cell = (value: string) => value.replace(/[|\r\n<>]/g, ' ').trim();
  const lines = ['## 금융 자료 갱신', '',
    `실행: ${result.success ? '정상' : '실패'} · 자료 상태: ${result.dataStatus}`,
    `갱신 ${result.dart.updatedCount + result.prices.updatedCount}건 · 공시 발표 대기 ${result.dart.pendingCount || 0}건 · 장 마감 대기 ${result.prices.deferredCount || 0}건 · 오류 ${result.dart.errors.length + result.prices.errors.length}건`,
    ''];
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
    console.log('Usage: node scripts/sync-financials.mjs --write [--days 1..90]\nWithout --write: no network requests or data changes. Requires DART_API_KEY. Runs existing DART metrics and matching-date Naver listing-price paths only; no cross-check portal, LLM, email or Telegram. Changes are written to src/data/customIpos.json; repository commit and deployment are separate.');
    return;
  }
  const result = await runFinancialSync(options);
  console.log(JSON.stringify(result, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY || process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, formatFinancialSummary(result), 'utf8');
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT,
      `financial_data_status=${result.dataStatus}\nfinancial_pending_count=${result.pendingCount}\nfinancial_error_count=${result.dart.errors.length + result.prices.errors.length}\n`, 'utf8');
  }
  if (!result.success) process.exitCode = 1;
}

if (require.main === module) main().catch(() => {
  // Never echo raw transport errors: authenticated URLs can contain API credentials.
  console.error('금융 자료 동기화에 실패했습니다. --write·환경변수·DART 응답·파일 권한을 확인하세요. 저장 성공으로 처리하지 않았습니다.');
  process.exitCode = 1;
});
