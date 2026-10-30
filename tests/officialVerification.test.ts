import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import type { IpoItem } from '../src/types/ipo';
import { isKisNoticeUrl, KIS_IPO_INDEX, parseKisIndex, parseKisNotice } from '../src/lib/brokerSchedule';
import { emptyVerificationArchive, isVerificationDue, reconcileOfficialFacts, validateVerificationArchive, VERIFICATION_VERSION, verificationIntervalHours, verifyOfficialSchedules } from '../src/lib/officialVerification';
import type { OfficialFacts } from '../src/lib/brokerSchedule';
import { getFieldEvidence } from '../src/lib/contentQuality';
import { parseOfficialArguments } from '../scripts/verify-official';

const url = `${KIS_IPO_INDEX}?cmd=TF09ac010002&num=668`;
const now = new Date('2026-10-30T01:00:00Z');
const ipo = (): IpoItem => ({ id: 'optronics', name: '옵토닉스', code: '485424', status: 'UPCOMING', market: 'KOSDAQ',
  priceBandMin: 10000, priceBandMax: 12000, institutionalCompetitionRate: 0, lockupCommitmentRate: 0, circulatingSupplyRate: 22.71,
  totalOfferingAmount: 264, marketCapAtIpo: 1148, aiScore: 0, scoreGrade: 'C', expertReviews: [],
  sentimentConsensus: { positiveRatio: null, neutralRatio: null, cautionRatio: null },
  aiSummary: { headline: '옵토닉스', bulletPoints: [], positivePoints: [], riskPoints: [] },
  subscriptionStart: '2026-11-05', subscriptionEnd: '2026-11-06', refundDate: '2026-11-10', listingDate: '2026-11-18',
  confirmedPrice: 12000, fieldEvidence: undefined, scheduleVerification: undefined, dataQuality: { status: 'unverified' },
  discovery: { corpCode: '01658035', receiptNo: '20261021000210', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261021000210', receivedAt: '2026-10-21', reportName: '증권신고서(지분증권)' },
  underwriters: [{ name: '한국투자증권', fee: 2000, allocatedShares: 550000 }] });
const title = '(주)옵토닉스 확정발행가액 공지 및 청약 안내';
const index = `<form id="searchForm"><div class="tableDefault"><table><thead><tr>${['번호','제목','작성자','등록일'].map(value => `<th>${value}</th>`).join('')}</tr></thead><tbody><tr><td>659</td><td><a href="javascript:goView('668')">${title}</a></td><td>관리자</td><td>2026.10.29</td></tr></tbody></table></div></form>`;
const article = (body = '확정 발행가액 : 12,000원. 기관투자자는 청약증거금 없음. 납입일 2026년 11월 10일. 옵토닉스의 상장 예정일은 2026년 11월 17일(화)입니다.') => `<dl class="boardView"><dt><table class="board_table"><tr><th>제목</th><td>${title}</td></tr><tr><th>등록일</th><td>2026.10.29 04:10</td></tr></table></dt><dd class="bCon">${body}</dd></dl>`;
const facts = (): OfficialFacts => parseKisNotice(article(), url, '옵토닉스');

test('KIS announcement identity, date and explicit listing/price evidence; institution terms are excluded', () => {
  assert.equal(parseKisIndex(index)[0].sourceUrl, url);
  const parsed = facts();
  assert.deepEqual(parsed.fields, { listingDate: '2026-11-17', confirmedPrice: 12000 });
  assert.equal(parsed.publishedAt, '2026-10-29T04:10:00+09:00');
  assert.equal(parsed.excerpts.refundDate, undefined);
  assert.throws(() => parseKisNotice(article(), url, '옵토닉스2'));
  assert.throws(() => parseKisIndex('<html>차단 안내</html>'));
  for (const bad of [url.replace('www.truefriend.com', 'www.truefriend.com.attacker.com'), url.replace('https://', 'http://'), `${url}&extra=1`, `${KIS_IPO_INDEX}?num=668`, url.replace('https://', 'https://user@')]) assert.equal(isKisNoticeUrl(bad), false);
});

test('conflicting or impossible official dates are rejected', () => {
  assert.throws(() => parseKisNotice(article('상장 예정일은 2026년 11월 17일, 상장 예정일은 2026년 11월 18일'), url, '옵토닉스'));
  assert.throws(() => parseKisNotice(article('상장 예정일은 2026년 2월 30일'), url, '옵토닉스'));
});

test('numbered demand-notice summary supplies dates without deriving a refund from payment-only prose', () => {
  const notice = article('1. 수요예측일: 2026년 10월 22일 2. 청약일: 2026년 11월 03일(화) ~ 11월 04일(수) 3. 납입 및 환불일: 2026년 11월 06일 4. 상장(예정)일: 2026년 11월 12일')
    .replace(title, '(주)옵토닉스 수요예측 공지');
  assert.deepEqual(parseKisNotice(notice, url, '옵토닉스').fields,
    { listingDate: '2026-11-12', subscriptionStart: '2026-11-03', subscriptionEnd: '2026-11-04', refundDate: '2026-11-06' });
});

test('latest dated official notice corrects listing day with value-bound source and removes stale prose', () => {
  const item = ipo(); item.aiSummary.headline = '옵토닉스 11월 18일 상장 예정';
  const old: OfficialFacts = { ...facts(), sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261021000210', publishedAt: '2026-10-21', fields: { listingDate: '2026-11-18' } };
  const result = reconcileOfficialFacts(item, [old, facts()], now.toISOString());
  assert.equal(result.ipo.listingDate, '2026-11-17');
  assert.deepEqual(result.changed, ['listingDate']);
  assert.equal(getFieldEvidence(result.ipo, 'listingDate')?.sourceUrl, url);
  assert.equal(getFieldEvidence({ ...result.ipo, listingDate: '2026-11-19' }, 'listingDate'), undefined);
  assert(!result.ipo.aiSummary.headline.includes('18'));
  assert.equal(result.ipo.dataQuality?.status, 'unverified');
});

test('same-day disagreements and incompatible combined schedules preserve registered values and clear citations', () => {
  const first = facts(), second = { ...facts(), sourceUrl: 'other', fields: { listingDate: '2026-11-18' } };
  const conflict = reconcileOfficialFacts(ipo(), [first, second], now.toISOString());
  assert.equal(conflict.ipo.listingDate, '2026-11-18');
  assert.deepEqual(conflict.conflicts, ['listingDate']);
  assert.equal(conflict.ipo.fieldEvidence?.listingDate, undefined);
  const impossible = reconcileOfficialFacts(ipo(), [{ ...first, fields: { listingDate: '2026-11-01' } }], now.toISOString());
  assert.equal(impossible.ipo.listingDate, '2026-11-18');
  assert(impossible.conflicts.includes('listingDate'));
});

test('bound newer retained evidence cannot regress to an older official notice', () => {
  const first = reconcileOfficialFacts(ipo(), [facts()], now.toISOString()).ipo;
  const second = reconcileOfficialFacts(first, [{ ...facts(), publishedAt: '2026-10-19', fields: { listingDate: '2026-11-16' } }], now.toISOString());
  assert.equal(second.ipo.listingDate, '2026-11-17');
  assert.deepEqual(second.changed, []);
  const newerSameDay = reconcileOfficialFacts(first, [{ ...facts(), publishedAt: '2026-10-29T06:10:00+09:00', fields: { listingDate: '2026-11-19' } }], now.toISOString());
  assert.equal(newerSameDay.ipo.listingDate, '2026-11-19'); assert.deepEqual(newerSameDay.conflicts, []);
  const legacy = ipo(); legacy.listingDate = '2026-11-20'; legacy.fieldEvidence = { listingDate: {
    sourceTitle: '최신 DART 일정', sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261101000100', checkedAt: '2026-11-01T01:00:00Z' } };
  const guarded = reconcileOfficialFacts(legacy, [facts()], '2026-11-01T02:00:00Z');
  assert.equal(guarded.ipo.listingDate, '2026-11-20'); assert(guarded.conflicts.includes('listingDate'));
});

test('explicit unannounced listing dates clear uncited placeholders, while newer official dates remain', () => {
  const unannounced: OfficialFacts = { sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000159',
    sourceTitle: 'DART 현행 본문', publishedAt: '2026-10-16', fields: { subscriptionStart: '2026-11-05', subscriptionEnd: '2026-11-06' },
    pendingFields: ['listingDate'], excerpts: { listingDate: '주권의 신규상장 및 매매개시일은 아직 확정되지 않았으며' } };
  const item = ipo(); item.discovery = undefined;
  const cleared = reconcileOfficialFacts(item, [unannounced], now.toISOString());
  assert.equal(cleared.ipo.listingDate, undefined); assert.equal(cleared.ipo.fieldEvidence?.listingDate?.value, null);
  assert.deepEqual(cleared.pendingFields, ['listingDate']); assert(cleared.changed.includes('listingDate'));
  const sourced = reconcileOfficialFacts(item, [facts()], now.toISOString()).ipo;
  assert.equal(reconcileOfficialFacts(sourced, [unannounced], now.toISOString()).ipo.listingDate, '2026-11-17');
  assert.equal(reconcileOfficialFacts(item, [unannounced, facts()], now.toISOString()).ipo.listingDate, '2026-11-17');
  const sameDay = { ...unannounced, publishedAt: '2026-10-29' };
  assert.equal(reconcileOfficialFacts(item, [sameDay, facts()], now.toISOString()).ipo.listingDate, '2026-11-17');
  const latestPending = reconcileOfficialFacts(item, [sameDay], now.toISOString()).ipo;
  const olderDate = { ...facts(), publishedAt: '2026-10-20' };
  const refused = reconcileOfficialFacts(latestPending, [olderDate], now.toISOString());
  assert.equal(refused.ipo.listingDate, undefined); assert(refused.conflicts.includes('listingDate'));
  assert.equal(refused.ipo.fieldEvidence?.listingDate?.value, null);
  assert.equal(reconcileOfficialFacts(refused.ipo, [olderDate], now.toISOString()).ipo.listingDate, undefined);
});

test('attachment provenance retains the actual body URL and rejects unrelated cached references', () => {
  const archive = emptyVerificationArchive(), parent = 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261029000239';
  const body = 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261028000471';
  archive.sources[parent] = { parser: 'test', checkedAt: now.toISOString(), nextCheckAt: '2026-11-01T01:00:00Z', failures: 0,
    facts: { sourceTitle: '연결 본문', sourceUrl: body, linkedFrom: parent, publishedAt: '2026-10-28', fields: {}, excerpts: {}, pendingFields: ['listingDate'] } };
  assert.equal(validateVerificationArchive(archive).sources[parent].facts?.sourceUrl, body);
  delete archive.sources[parent].facts!.linkedFrom;
  assert.throws(() => validateVerificationArchive(archive));
});

test('targeted verification flags select exact distinct IDs without broadening scope', () => {
  assert.deepEqual(parseOfficialArguments(['--write', '--stock', 'hana-aerodynamics', '--stock', 'dart-01950720']),
    { write: true, help: false, stocks: ['hana-aerodynamics', 'dart-01950720'] });
  for (const args of [['--stock'], ['--stock', 'https://invalid'], ['--stock', 'x', '--stock', 'x'], ['--write', '--dry-run'], ['--force']]) assert.throws(() => parseOfficialArguments(args));
});

test('milestone cadence, new-receipt invalidation, completed IPO skip and backoff', () => {
  assert.equal(verificationIntervalHours(ipo(), now), 24);
  assert.equal(verificationIntervalHours(ipo(), new Date('2026-11-04T01:00:00Z')), 6);
  assert.equal(verificationIntervalHours(ipo(), new Date('2026-10-20T01:00:00Z')), 72);
  const state = { parserVersion: VERIFICATION_VERSION, receiptNo: ipo().discovery!.receiptNo, checkedAt: now.toISOString(), nextCheckAt: '2026-11-01T01:00:00Z', failures: 3, fingerprint: '' };
  assert.equal(isVerificationDue(ipo(), state, new Date('2026-10-31T01:00:00Z')), false);
  assert.equal(isVerificationDue({ ...ipo(), discovery: { ...ipo().discovery!, receiptNo: '20261030000100' } }, state, now), true);
  assert.equal(isVerificationDue({ ...ipo(), status: 'LISTED' }, undefined, now), false);
  assert.throws(() => validateVerificationArchive({ version: 1, sources: { bad: {} }, targets: {} }));
});

test('not-due checks make no requests, immutable DART is reused and unchanged checks cause no data deployment', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async input => {
    const address = String(input); calls.push(address);
    const main = "node1['text']='I. 모집 또는 매출에 관한 일반사항';node1['rcpNo']='20261021000210';node1['dcmNo']='1';node1['eleId']='1';node1['offset']='1';node1['length']='100';node1['dtd']='dart4.xsd';";
    return new Response(address === KIS_IPO_INDEX ? index : address === url ? article()
      : address.includes('viewer.do') ? '<p>청약 일정 미정</p>' : main);
  };
  const first = await verifyOfficialSchedules([ipo()], emptyVerificationArchive(), { now, fetcher });
  assert.equal(first.ipos[0].listingDate, '2026-11-17'); assert.equal(first.requestCount, 4);
  assert.equal(first.ipos[0].scheduleVerification?.status, 'partial');
  const soon = await verifyOfficialSchedules(first.ipos, first.archive, { now: new Date(now.getTime() + 3600000), fetcher });
  assert.equal(soon.requestCount, 0);
  const later = await verifyOfficialSchedules(first.ipos, first.archive, { now: new Date(now.getTime() + 24 * 3600000), fetcher });
  assert.equal(later.requestCount, 2); assert.equal(later.errorCount, 0);
  assert.equal(calls.filter(address => address.includes('dart.fss.or.kr')).length, 2);
  assert.deepEqual(later.ipos, first.ipos);
});

test('transport failures back off, preserve data and suppress duplicate notices; budgets cap requests', async () => {
  const fetcher: typeof fetch = async () => new Response('Unavailable', { status: 503 });
  const first = await verifyOfficialSchedules([ipo()], emptyVerificationArchive(), { now, fetcher });
  assert.equal(first.ipos[0].listingDate, ipo().listingDate);
  assert.equal(first.ipos[0].scheduleVerification?.status, 'unavailable');
  assert.equal(first.notices.length, 1);
  const later = await verifyOfficialSchedules(first.ipos, first.archive, { now: new Date(now.getTime() + 6 * 3600000), fetcher });
  assert.equal(later.notices.length, 0);
  assert.equal(later.archive.targets.optronics.failures, 2);
  const limited = await verifyOfficialSchedules([ipo()], emptyVerificationArchive(), { now, fetcher, maxRequests: 1 });
  assert(limited.requestCount <= 1);
});

test('transient retries share the global HTTP budget and cannot exceed it', async () => {
  let calls = 0;
  const limited = await verifyOfficialSchedules([ipo()], emptyVerificationArchive(), { now, maxRequests: 1,
    fetcher: async () => { calls++; throw new TypeError('fetch failed', { cause: { code: 'ECONNRESET' } }); } });
  assert.equal(calls, 1); assert.equal(limited.requestCount, 1);
  assert.equal(limited.ipos[0].listingDate, ipo().listingDate);
});

test('only healthy caches parsed by the current version can send conditional headers or reuse 304', async () => {
  const item = ipo(); item.discovery = undefined;
  const first = await verifyOfficialSchedules([item], emptyVerificationArchive(), { now, fetcher: async input =>
    new Response(String(input) === KIS_IPO_INDEX ? index : article(), { headers: { etag: 'fixture' } }) });
  for (const state of ['healthy', 'old-parser', 'failed']) {
    const archive = structuredClone(first.archive);
    for (const source of Object.values(archive.sources)) {
      if (state === 'old-parser') source.parser = 'old-parser';
      if (state === 'failed') source.error = 'previous transport failure';
    }
    let requests = 0;
    const next = await verifyOfficialSchedules(first.ipos, archive, { now: new Date(now.getTime() + 72 * 3600000),
      fetcher: async (input, init) => {
        requests++;
        const conditional = new Headers(init?.headers).has('If-None-Match');
        assert.equal(conditional, state === 'healthy');
        return conditional ? new Response(null, { status: 304 }) : new Response(String(input) === KIS_IPO_INDEX ? index : article());
      } });
    assert.equal(requests, 2); assert.equal(next.errorCount, 0);
    assert.equal(next.ipos[0].listingDate, '2026-11-17');
  }
});

test('portal discrepancies do not mutate registered official values', async () => {
  const original = ipo();
  const exported: Record<string, unknown> = {};
  let requests = 0;
  const source = ts.transpileModule(fs.readFileSync('src/lib/crossCheckSync.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const portalList = '<tr><td><a href="/html/fund/index.htm?o=v&no=123">옵토닉스</a></td><td>청약</td><td>12000</td><td>10000</td><td>한국투자</td></tr>';
  vm.runInNewContext(source, { exports: exported, TextDecoder: class extends TextDecoder { constructor() { super('utf-8'); } }, console: { error: () => {} },
    require: (name: string) => { assert.equal(name, './ipoStore'); return { getAllIpos: () => [original] }; },
    fetch: async () => { requests++; return new Response(requests === 1 ? portalList : '신규상장일 2026.11.19'); } });
  const result = await (exported.crossCheckAndSyncIpos as () => Promise<{ updatedCount: number; discrepancies: unknown[]; message: string }>)();
  assert.equal(requests, 2); assert.equal(result.updatedCount, 0); assert.equal(result.discrepancies.length, 1);
  assert.equal(original.listingDate, '2026-11-18'); assert(!result.message.includes('100%'));
});
