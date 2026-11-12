import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import type { IpoItem } from '../src/types/ipo';
import { createDiscoveredIpo, findIpoForDartFiling, invalidateChangedIpoEvidence, isSameIpoIdentity,
  mergeDartDiscoveries, normalizeIpoCompanyName } from '../src/lib/ipoDiscovery';
import * as discovery from '../src/lib/ipoDiscovery';
import type { DartFilingItem } from '../src/lib/ipoDiscovery';
import { fetchDiscoveryFilings, loadDiscoverySource, parseDiscoveryArguments, writeDiscoveredIpos } from '../scripts/sync-ipo-discovery';

const filing = (changes: Partial<DartFilingItem> = {}): DartFilingItem => ({
  corp_code: '12345678', corp_name: '새로운기업', corp_cls: 'E', report_nm: '증권신고서(지분증권)',
  rcept_no: '20261023000001', rcept_dt: '20261023', ...changes,
});
const ipo = (changes: Partial<IpoItem> = {}): IpoItem => ({ ...createDiscoveredIpo(filing())!, ...changes });
const fieldSource = { sourceTitle: '확인한 공시', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261023000001', checkedAt: '2026-10-23T10:00:00Z' };

test('discovery contains actual metadata and no invented code, price, schedule, broker or opinion', () => {
  const created = createDiscoveredIpo(filing())!;
  assert.equal(created.id, 'dart-12345678');
  assert.equal(created.code, '');
  assert.equal(created.market, 'UNCONFIRMED');
  for (const field of ['subscriptionStart', 'subscriptionEnd', 'refundDate'] as const) assert.equal(created[field], '');
  for (const field of ['confirmedPrice', 'priceBandMin', 'priceBandMax', 'institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate', 'aiScore'] as const) assert.equal(created[field], 0);
  assert.deepEqual(created.underwriters, []);
  assert.deepEqual(created.expertReviews, []);
  assert.equal(created.sentimentConsensus.positiveRatio, null);
  assert.deepEqual(created.pendingForecastFields, ['institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate']);
  assert.equal(created.discovery!.receivedAt, '2026-10-23');
  assert.equal(created.discovery!.sourceUrl, fieldSource.sourceUrl);
});

test('the 38th and later companies append, including multiple companies without stock codes', () => {
  const seed = Array.from({ length: 37 }, (_, index) => ipo({ id: `seed-${index}`, name: `기존기업${index}`, code: String(100000 + index), discovery: undefined }));
  const next = mergeDartDiscoveries(seed, [filing(), filing({ corp_code: '23456789', corp_name: '또다른기업', rcept_no: '20261023000002' })]);
  assert.equal(next.ipos.length, 39);
  assert.equal(next.newIpos.length, 2);
  assert.equal(isSameIpoIdentity(next.newIpos[0], next.newIpos[1]), false);
  assert.equal(seed.length, 37);
  assert.deepEqual(mergeDartDiscoveries(next.ipos, [filing()]).ipos, next.ipos);
});

test('amended filings update only the latest discovery while retaining financial and lifecycle facts', () => {
  const previous = ipo({ confirmedPrice: 15000, subscriptionStart: '2026-11-01', status: 'LISTED', isCancelled: true,
    underwriters: [{ name: '기존주관사', allocatedShares: 12, fee: 2000 }], dataQuality: { status: 'reviewed', reviewedAt: '2026-10-23', sources: [{ title: '원문', url: fieldSource.sourceUrl }] },
    fieldEvidence: { confirmedPrice: fieldSource } });
  const next = mergeDartDiscoveries([previous], [filing({ corp_name: '사명변경기업', rcept_no: '20261024000002', rcept_dt: '20261024', report_nm: '[기재정정]증권신고서(지분증권)' })]);
  assert.equal(next.newIpos.length, 0);
  assert.equal(next.updatedIpos.length, 1);
  const { discovery: oldDiscovery, ...oldFacts } = previous;
  const { discovery: newDiscovery, ...newFacts } = next.ipos[0];
  assert.deepEqual(newFacts, oldFacts);
  assert.notEqual(newDiscovery!.receiptNo, oldDiscovery!.receiptNo);
  assert.deepEqual(mergeDartDiscoveries(next.ipos, [filing()]).ipos, next.ipos);
});

test('legal entity and SPAC aliases match existing seed names but retain issuer and issue number', () => {
  assert.equal(normalizeIpoCompanyName('(주)한화플러스제6호기업인수목적'), normalizeIpoCompanyName('한화플러스스팩6호'));
  assert.equal(normalizeIpoCompanyName('아이엠제01호기업인수목적 주식회사'), normalizeIpoCompanyName('아이엠기업인수목적1호'));
  assert.notEqual(normalizeIpoCompanyName('아이엠스팩1호'), normalizeIpoCompanyName('아이엠스팩2호'));
  assert.notEqual(normalizeIpoCompanyName('아이엠스팩1호'), normalizeIpoCompanyName('한화스팩1호'));
  assert.notEqual(normalizeIpoCompanyName('호라이즌스팩1호'), normalizeIpoCompanyName('라이즌스팩1호'));
  const existing = ipo({ id: 'seed-spac', name: '아이엠기업인수목적1호', discovery: undefined });
  assert.equal(findIpoForDartFiling([existing], filing({ corp_name: '주식회사 아이엠제1호기업인수목적' }))!.id, existing.id);
  assert.equal(mergeDartDiscoveries([existing], [filing({ corp_name: '아이엠스팩2호' })]).newIpos.length, 1);
});

test('listed-company capital increases and listed SPACs cannot create new IPO cards', () => {
  for (const corp_cls of ['Y', 'K', '']) {
    assert.equal(createDiscoveredIpo(filing({ corp_cls })), null);
    assert.equal(createDiscoveredIpo(filing({ corp_cls, corp_name: '새스팩1호' })), null);
  }
  for (const report_nm of ['유상증자 증권신고서(지분증권)', '증권신고서(채무증권)', '증권신고서(합병등)']) assert.equal(createDiscoveredIpo(filing({ report_nm })), null);
  assert.equal(createDiscoveredIpo(filing({ rm: '철' })), null);
  assert.equal(createDiscoveredIpo(filing({ corp_cls: 'N', stock_code: '123456' }))!.code, '123456');
});

test('malformed dates and receipt/corporation identifiers are not discoveries', () => {
  for (const change of [{ corp_code: '' }, { rcept_no: '20261323000001' }, { rcept_dt: '20260230', rcept_no: '20260230000001' }, { rcept_dt: '20261024' }, { corp_name: '' }]) {
    assert.equal(createDiscoveredIpo(filing(change)), null);
  }
});

test('repeated known filings do not consume the new-company limit', () => {
  const existing = ipo();
  const result = mergeDartDiscoveries([existing], [filing({ rcept_no: '20261024000001', rcept_dt: '20261024' }), filing({ corp_code: '23456789', corp_name: '신규종목' })], 1);
  assert.equal(result.newIpos.length, 1);
  assert.equal(result.updatedIpos.length, 1);
});

test('different known corporation identities cannot be merged by a coincidental company name', () => {
  const existing = ipo();
  assert.equal(findIpoForDartFiling([existing], filing({ corp_code: '23456789' })), undefined);
});

// Actual 2026-11-11 C001 rows: withdrawals arrive in the existing discovery query.
const withdrawalFilings: DartFilingItem[] = [
  filing({ corp_code: '00618173', corp_name: '씨앤엠', report_nm: '철회신고서', rcept_no: '20261111000246', rcept_dt: '20261111', stock_code: '', flr_nm: '씨앤엠', rm: '' }),
  filing({ corp_code: '01403198', corp_name: '제이앤티지', report_nm: '철회신고서', rcept_no: '20261111000314', rcept_dt: '20261111', stock_code: '', flr_nm: '제이앤티지', rm: '' }),
];
function beforeWithdrawal(withdrawal = withdrawalFilings[0], changes: Partial<IpoItem> = {}): IpoItem {
  const previous = filing({ ...withdrawal, report_nm: '[기재정정]증권신고서(지분증권)', rcept_no: '20261103000363', rcept_dt: '20261103' });
  return { ...createDiscoveredIpo(previous)!, id: withdrawal.corp_code === '00618173' ? 'cnm' : 'jntg',
    code: withdrawal.corp_code.slice(2), market: 'KOSDAQ',
    subscriptionStart: '2026-11-12', subscriptionEnd: '2026-11-13', refundDate: '2026-11-17', listingDate: '2026-11-23',
    priceBandMin: 10000, priceBandMax: 12000, confirmedPrice: 0, circulatingSupplyRate: 35,
    totalOfferingAmount: 250, marketCapAtIpo: 1000, depositRatePercent: 50,
    underwriters: [{ name: '기존증권', fee: 2000, allocatedShares: 100000 }],
    fieldEvidence: { circulatingSupplyRate: { ...fieldSource, value: 35 } },
    expertReviews: [{ id: 'saved-review', sourceType: 'BLOG', author: 'fixture writer', title: '기존 보관글',
      url: 'https://example.com/retained-review', publishedAt: '2026-11-10T00:00:00Z', sentiment: 'UNCLASSIFIED', summary: '기존 원문 기록' }],
    ...changes };
}
function retainedWithdrawalFacts(item: IpoItem) {
  const { id, name, code, market, status, subscriptionStart, subscriptionEnd, refundDate, listingDate,
    confirmedPrice, priceBandMin, priceBandMax, depositRatePercent, underwriters, institutionalCompetitionRate,
    lockupCommitmentRate, circulatingSupplyRate, totalOfferingAmount, marketCapAtIpo, fieldEvidence,
    expertReviews, sentimentConsensus, aiScore, scoreGrade } = item;
  return { id, name, code, market, status, subscriptionStart, subscriptionEnd, refundDate, listingDate,
    confirmedPrice, priceBandMin, priceBandMax, depositRatePercent, underwriters, institutionalCompetitionRate,
    lockupCommitmentRate, circulatingSupplyRate, totalOfferingAmount, marketCapAtIpo, fieldEvidence,
    expertReviews, sentimentConsensus, aiScore, scoreGrade };
}

test('actual C001 withdrawal rows cancel the two known equity issuers without replacing their saved facts', () => {
  const current = withdrawalFilings.map(withdrawal => beforeWithdrawal(withdrawal));
  const originals = structuredClone(current);
  const result = mergeDartDiscoveries(current, withdrawalFilings);
  assert.equal(result.newIpos.length, 0);
  assert.equal(result.updatedIpos.length, 2);
  assert.equal(result.ipos.length, 2);
  for (const withdrawal of withdrawalFilings) {
    const previous = current.find(item => item.discovery!.corpCode === withdrawal.corp_code)!;
    const cancelled = result.ipos.find(item => item.id === previous.id)!;
    assert.equal(cancelled.isCancelled, true);
    assert.match(cancelled.cancelReason || '', /철회/);
    assert.equal(cancelled.discovery!.corpCode, withdrawal.corp_code);
    assert.equal(cancelled.discovery!.receiptNo, withdrawal.rcept_no);
    assert.equal(cancelled.discovery!.reportName, '철회신고서');
    assert.equal(cancelled.discovery!.sourceUrl, `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${withdrawal.rcept_no}`);
    assert.deepEqual(retainedWithdrawalFacts(cancelled), retainedWithdrawalFacts(previous));
  }
  assert.deepEqual(current, originals);
});

test('withdrawal cancellation requires a known matching corporation and a prior equity filing, not name/code coincidence', () => {
  const withdrawal = withdrawalFilings[0];
  const normal = beforeWithdrawal(withdrawal);
  for (const previous of [
    { ...normal, discovery: undefined },
    { ...normal, discovery: { ...normal.discovery!, corpCode: '12345678' } },
    { ...normal, discovery: { ...normal.discovery!, reportName: '증권신고서(채무증권)' } },
  ]) {
    const result = mergeDartDiscoveries([previous], [{ ...withdrawal, stock_code: normal.code }]);
    assert.equal(result.ipos[0].isCancelled, previous.isCancelled, previous.discovery?.reportName || 'No prior DART corporation');
    assert.equal(result.newIpos.length, 0);
    assert.deepEqual(result.ipos[0], previous);
  }
});

test('unknown withdrawn issuers never create an active card from an older registration in the same batch', () => {
  const withdrawal = withdrawalFilings[0];
  const older = { ...withdrawal, report_nm: '증권신고서(지분증권)', rcept_no: '20261110000001', rcept_dt: '20261110' };
  for (const filings of [[withdrawal], [older, withdrawal], [withdrawal, older]]) {
    const result = mergeDartDiscoveries([], filings);
    assert.equal(result.ipos.length, 0);
    assert.equal(result.newIpos.length, 0);
  }
});

test('an older withdrawal cannot cancel a newer known equity filing, including reversed batch order', () => {
  const withdrawal = withdrawalFilings[0], normal = beforeWithdrawal(withdrawal);
  const newer = { ...withdrawal, report_nm: '[기재정정]증권신고서(지분증권)', rcept_no: '20261112000001', rcept_dt: '20261112' };
  const alreadyNewer = { ...normal, discovery: { ...normal.discovery!, receiptNo: newer.rcept_no, receivedAt: '2026-11-12' } };
  assert.deepEqual(mergeDartDiscoveries([alreadyNewer], [withdrawal]).ipos[0], alreadyNewer);
  for (const filings of [[withdrawal, newer], [newer, withdrawal]]) {
    const result = mergeDartDiscoveries([normal], filings);
    assert.notEqual(result.ipos[0].isCancelled, true);
    assert.equal(result.ipos[0].discovery!.receiptNo, newer.rcept_no);
  }
});

test('listed or finalized issuers and listed-company capital withdrawals do not cancel an IPO history', () => {
  const withdrawal = withdrawalFilings[0];
  for (const previous of [beforeWithdrawal(withdrawal, { status: 'LISTED' }),
    beforeWithdrawal(withdrawal, { openingPrice: 20000, closingPrice: 19000 })]) {
    const result = mergeDartDiscoveries([previous], [withdrawal]);
    assert.notEqual(result.ipos[0].isCancelled, true);
    assert.deepEqual(retainedWithdrawalFacts(result.ipos[0]), retainedWithdrawalFacts(previous));
  }
  for (const corp_cls of ['K', 'Y']) {
    assert.notEqual(mergeDartDiscoveries([beforeWithdrawal()], [{ ...withdrawal, corp_cls }]).ipos[0].isCancelled, true);
  }
});

test('withdrawals are idempotent and later registration metadata cannot automatically revive a cancelled offering', () => {
  const withdrawal = withdrawalFilings[0];
  const first = mergeDartDiscoveries([beforeWithdrawal(withdrawal)], [withdrawal]);
  assert.equal(first.ipos[0].isCancelled, true);
  const repeated = mergeDartDiscoveries(first.ipos, [withdrawal]);
  assert.deepEqual(repeated.ipos, first.ipos);
  assert.equal(repeated.updatedIpos.length, 0);
  const later = mergeDartDiscoveries(first.ipos, [{ ...withdrawal, report_nm: '증권신고서(지분증권)', rcept_no: '20261112000001', rcept_dt: '20261112' }]);
  assert.equal(later.ipos[0].isCancelled, true);
  assert.equal(later.ipos[0].cancelReason, first.ipos[0].cancelReason);
  assert.deepEqual(retainedWithdrawalFacts(later.ipos[0]), retainedWithdrawalFacts(first.ipos[0]));
});

test('malformed withdrawal receipts, dates, corporation IDs and unrelated titles cannot cancel a known offering', () => {
  const current = beforeWithdrawal();
  for (const changes of [{ rcept_no: '20261311000246' }, { rcept_dt: '20261110' },
    { corp_code: '00000000' }, { report_nm: '철회 관련 안내' }, { report_nm: '증권신고서(지분증권)', rm: '철' }]) {
    assert.notEqual(mergeDartDiscoveries([current], [{ ...withdrawalFilings[0], ...changes }]).ipos[0].isCancelled, true);
  }
});

test('the unchanged validator rejects a due active zero-price offering and accepts its recorded withdrawal', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-withdrawal-validation-'));
  const dataDir = path.join(root, 'src', 'data'), scriptsDir = path.join(root, 'scripts');
  fs.mkdirSync(dataDir, { recursive: true }); fs.mkdirSync(scriptsDir, { recursive: true });
  for (const file of ['audit-content-integrity.mjs', 'ipo-source-records.mjs']) {
    fs.copyFileSync(path.join(process.cwd(), 'scripts', file), path.join(scriptsDir, file));
  }
  fs.writeFileSync(path.join(dataDir, 'mockIpo.ts'), 'export const MOCK_IPOS: IpoItem[] = [];');
  const customFile = path.join(dataDir, 'customIpos.json');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const current = beforeWithdrawal(withdrawalFilings[0], { subscriptionStart: today, subscriptionEnd: today, refundDate: today, listingDate: undefined });
  fs.writeFileSync(customFile, JSON.stringify([current]));
  const validate = () => spawnSync(process.execPath, [path.join(process.cwd(), 'scripts', 'validate-ipo-data.mjs')], { cwd: root, encoding: 'utf8' });
  const active = validate();
  assert.equal(active.status, 1);
  assert.match(active.stdout + active.stderr, /공모가 미확정/);
  const cancelled = mergeDartDiscoveries([current], [withdrawalFilings[0]]).ipos[0];
  assert.equal(cancelled.isCancelled, true);
  fs.writeFileSync(customFile, JSON.stringify([cancelled]));
  const withdrawn = validate();
  assert.equal(withdrawn.status, 0, withdrawn.stdout + withdrawn.stderr);
  // Marking this issuer withdrawn must not exempt another still-active offering.
  fs.writeFileSync(customFile, JSON.stringify([cancelled, { ...current, id: 'still-active', name: '다른 예정기업', code: '999999', discovery: undefined }]));
  const mixed = validate();
  assert.equal(mixed.status, 1);
  assert.match(mixed.stdout + mixed.stderr, /다른 예정기업.*공모가 미확정/);
});

test('changed numerical or date values lose old field evidence and item review', () => {
  const previous = ipo({ confirmedPrice: 10000, depositRatePercent: 50, subscriptionStart: '2026-11-01', dataQuality: { status: 'reviewed', reviewedAt: '2026-10-23' },
    fieldEvidence: { confirmedPrice: fieldSource, depositRatePercent: fieldSource, subscriptionStart: fieldSource, lockupCommitmentRate: fieldSource } });
  const next = invalidateChangedIpoEvidence(previous, { ...previous, confirmedPrice: 12000, depositRatePercent: 100, subscriptionStart: '2026-11-02' });
  assert.equal(next.fieldEvidence!.confirmedPrice, undefined);
  assert.equal(next.fieldEvidence!.subscriptionStart, undefined);
  assert.equal(next.fieldEvidence!.depositRatePercent, undefined);
  assert.deepEqual(next.fieldEvidence!.lockupCommitmentRate, fieldSource);
  assert.equal(next.dataQuality!.status, 'unverified');
  assert.equal(next.dataQuality!.reviewedAt, undefined);
  assert.deepEqual(previous.fieldEvidence!.confirmedPrice, fieldSource);
});

test('discovery-only and derived score changes retain independent financial evidence', () => {
  const previous = ipo({ dataQuality: { status: 'reviewed', reviewedAt: '2026-10-23' }, fieldEvidence: { confirmedPrice: fieldSource } });
  const next = invalidateChangedIpoEvidence(previous, { ...previous, aiScore: 80, discovery: { ...previous.discovery!, receiptNo: '20261024000001' } });
  assert.equal(next.dataQuality!.status, 'reviewed');
  assert.deepEqual(next.fieldEvidence, previous.fieldEvidence);
});

test('atomic source persistence survives a fresh load and repeated discovery stays idempotent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-discovery-test-'));
  const dataDir = path.join(root, 'src', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'mockIpo.ts'), 'export const MOCK_IPOS: IpoItem[] = [];');
  const file = path.join(dataDir, 'customIpos.json');
  fs.writeFileSync(file, '[]');
  const first = mergeDartDiscoveries(loadDiscoverySource(root).combined, [filing()]);
  writeDiscoveredIpos(file, first.newIpos);
  const cold = loadDiscoverySource(root);
  assert.equal(cold.combined.length, 1);
  assert.equal(mergeDartDiscoveries(cold.combined, [filing()]).newIpos.length, 0);
  const currentContent = fs.readFileSync(file, 'utf8');
  const oldVercel = process.env.VERCEL;
  process.env.VERCEL = 'production';
  try { assert.throws(() => writeDiscoveredIpos(file, []), /Vercel/); }
  finally { if (oldVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = oldVercel; }
  assert.equal(fs.readFileSync(file, 'utf8'), currentContent);
  fs.writeFileSync(file, '{broken');
  assert.throws(() => loadDiscoverySource(root));
  assert.equal(fs.readFileSync(file, 'utf8'), '{broken');
});

test('source updates override a seed once while preserving several empty-code discoveries', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-discovery-source-'));
  const dataDir = path.join(root, 'src', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const seed = ipo({ id: 'seed', code: '123456', discovery: undefined });
  fs.writeFileSync(path.join(dataDir, 'mockIpo.ts'), `export const MOCK_IPOS: IpoItem[] = ${JSON.stringify([seed])};`);
  const override = { ...seed, discovery: ipo().discovery };
  fs.writeFileSync(path.join(dataDir, 'customIpos.json'), JSON.stringify([override, ipo({ id: 'second', discovery: undefined }), ipo({ id: 'third', discovery: undefined })]));
  assert.equal(loadDiscoverySource(root).combined.length, 3);
});

test('DART pagination reaches later candidates and page failure is an error', async () => {
  const urls: URL[] = [];
  const fetcher = async (input: URL | RequestInfo) => {
    const url = new URL(String(input)); urls.push(url);
    return Response.json({ status: '000', total_page: 2, list: [filing({ corp_code: url.searchParams.get('page_no') === '1' ? '12345678' : '23456789' })] });
  };
  const filings = await fetchDiscoveryFilings('fixture-key', 30, new Date('2026-10-24T16:00:00Z'), fetcher as typeof fetch);
  assert.equal(filings.length, 2);
  assert.equal(urls[0].searchParams.get('end_de'), '20261025');
  assert.equal(urls[1].searchParams.get('page_no'), '2');
  await assert.rejects(fetchDiscoveryFilings('fixture-key', 30, new Date(), (async () => Response.json({ status: '020' })) as typeof fetch));
});

test('CLI defaults to preview and validates bounded explicit write arguments', () => {
  assert.equal(parseDiscoveryArguments([]).write, false);
  assert.equal(parseDiscoveryArguments(['--write']).write, true);
  for (const args of [['--days', '0'], ['--days', '91'], ['--limit', 'NaN'], ['--write', '--dry-run'], ['--bad']]) assert.throws(() => parseDiscoveryArguments(args));
});

test('actual server sync paginates, appends beyond 37 and acknowledges only a persisted change', async () => {
  const seed = Array.from({ length: 37 }, (_, index) => ipo({ id: `seed-${index}`, name: `기존기업${index}`, code: String(100000 + index), discovery: undefined, confirmedPrice: 12345 }));
  let runtime: IpoItem[] = [];
  let writeCount = 0;
  const customFile = path.join('/fixture', 'src', 'data', 'customIpos.json');
  const files = new Map<string, string>([[customFile, '[]']]);
  const exports: Record<string, unknown> = {};
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'ipoServerStore.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, {
    exports, require: (name: string) => {
      if (name === 'fs') return {
        existsSync: (file: string) => files.has(file) || file === path.dirname(customFile),
        readFileSync: (file: string) => files.get(file),
        writeFileSync: (file: string, content: string) => { writeCount++; files.set(file, content); },
        renameSync: (from: string, to: string) => { files.set(to, files.get(from)!); files.delete(from); },
        unlinkSync: (file: string) => files.delete(file), mkdirSync: () => {},
      };
      if (name === 'path') return path;
      if (name === 'node:crypto') return { randomUUID: () => 'fixture' };
      if (name === './ipoDiscovery') return discovery;
      if (name === './ipoStore') return {
        getAllIpos: () => {
          const combined = structuredClone(seed);
          for (const item of runtime) {
            const index = combined.findIndex((current) => isSameIpoIdentity(current, item));
            if (index >= 0) combined[index] = structuredClone(item); else combined.push(structuredClone(item));
          }
          return combined;
        },
        getStoredCustomIpos: () => runtime,
        setRuntimeCustomIpos: (items: IpoItem[]) => { runtime = items; },
      };
      throw new Error(`Unexpected test import: ${name}`);
    }, process: { cwd: () => '/fixture', env: {} }, structuredClone, console, URL, AbortSignal,
  });
  const fetcher = async (input: URL | RequestInfo) => {
    const page = new URL(String(input)).searchParams.get('page_no');
    return Response.json({ status: '000', total_page: 2, list: page === '1'
      ? [filing({ corp_name: '주식회사 기존기업0', stock_code: '100000' }), filing({ corp_cls: 'K', corp_name: '상장사유상증자', corp_code: '34567890' })]
      : [filing({ corp_name: '새로운기업', corp_code: '45678901' }), filing({ corp_name: '또다른기업', corp_code: '56789012' })] });
  };
  const sync = exports.syncNewIposFromDart as (options: { apiKey: string; now: Date; limit: number; fetcher: typeof fetch }) => Promise<{ newCount: number; updatedCount: number; storageStatus: string }>;
  const options = { apiKey: 'fixture-key', now: new Date('2026-10-25T00:00:00Z'), limit: 2, fetcher: fetcher as typeof fetch };
  const first = await sync(options);
  assert.equal(first.newCount, 2);
  assert.equal(first.updatedCount, 1);
  assert.equal(first.storageStatus, 'local-file-written');
  assert.equal(runtime.length, 3);
  assert.equal(runtime.find((item) => item.id === 'seed-0')!.confirmedPrice, 12345);
  assert.equal(runtime.filter((item) => item.code === '').length, 2);
  assert.equal(writeCount, 1);
  const before = files.get(customFile);
  const second = await sync(options);
  assert.equal(second.newCount, 0);
  assert.equal(second.updatedCount, 0);
  assert.equal(second.storageStatus, 'unchanged');
  assert.equal(files.get(customFile), before);
  assert.equal(writeCount, 1);
});

test('server EROFS and readback failures throw without acknowledging new runtime data', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'ipoServerStore.ts'), 'utf8');
  for (const failure of ['EROFS', 'readback']) {
    let runtime: IpoItem[] = [];
    let temporaryWritten = false;
    const fsStub = {
      existsSync: (file: string) => file.endsWith('data') || (file.endsWith('.tmp') && temporaryWritten),
      writeFileSync: () => { if (failure === 'EROFS') throw new Error('EROFS'); temporaryWritten = true; },
      renameSync: () => { temporaryWritten = false; }, readFileSync: () => 'incorrect readback', unlinkSync: () => { temporaryWritten = false; }, mkdirSync: () => {},
    };
    const exports: Record<string, unknown> = {};
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(js, { exports, require: (name: string) => {
      if (name === 'fs') return fsStub;
      if (name === 'path') return path;
      if (name === 'node:crypto') return { randomUUID: () => 'fixture' };
      if (name === './ipoDiscovery') return discovery;
      if (name === './ipoStore') return { getAllIpos: () => runtime, getStoredCustomIpos: () => runtime, setRuntimeCustomIpos: (items: IpoItem[]) => { runtime = items; } };
      throw new Error(`Unexpected test import: ${name}`);
    }, process: { cwd: () => '/fixture', env: {} }, structuredClone, console, URL, AbortSignal });
    assert.throws(() => (exports.saveServerCustomIpos as (items: IpoItem[]) => void)([ipo()]), failure === 'EROFS' ? /EROFS/ : /저장 확인/);
    assert.equal(runtime.length, 0);
    assert.equal(temporaryWritten, false);
  }
});
