import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
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
