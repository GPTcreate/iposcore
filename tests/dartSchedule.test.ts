import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { DART_SCHEDULE_PARSER_VERSION, fetchDartSchedule, parseDartScheduleBody } from '../src/lib/dartSchedule';

const receipt = '20261021000210';
const row = (name: string, value: string) => `<tr><th>${name}</th><td>${value}</td></tr>`;
const schedule = `<table>${row('청약기일', '2026년 11월 05일 ~ 2026년 11월 06일')}${row('환불일', '2026.11.10')}${row('상장(예정)일', '2026-11-17')}</table>`;
const node = (title = 'Ⅰ. 모집 또는 매출에 관한 일반사항', extra = '') => `node1['text']='${title}';node1['dcmNo']='12345';node1['eleId']='3';node1['offset']='0';node1['length']='20000';node1['dtd']='dart4.xsd';${extra}`;

test('DART schedule dates carry the receipt and the exact labelled excerpts', () => {
  const result = parseDartScheduleBody(schedule, receipt);
  assert.equal(DART_SCHEDULE_PARSER_VERSION, 'dart-schedule-v2');
  assert.equal(result.status, 'parsed');
  assert.deepEqual(result.fields, { subscriptionStart: '2026-11-05', subscriptionEnd: '2026-11-06', refundDate: '2026-11-10', listingDate: '2026-11-17' });
  assert.match(result.evidence.listingDate!.excerpt, /상장\(예정\)일.*2026-11-17/);
  assert.equal(result.sourceUrl, `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`);
});

test('general-investor subscription dates survive rowspans and exclude employee dates', () => {
  const html = '<table><tr><th rowspan="3">청약기일</th><th>구분</th><th>청약개시일</th><th>청약종료일</th></tr>'
    + '<tr><td>우리사주조합</td><td>2026.11.04</td><td>2026.11.04</td></tr>'
    + '<tr><td>일반청약자</td><td>2026.11.05</td><td>2026.11.06</td></tr></table>';
  const result = parseDartScheduleBody(html, receipt);
  assert.equal(result.status, 'parsed');
  assert.deepEqual(result.fields, { subscriptionStart: '2026-11-05', subscriptionEnd: '2026-11-06' });
});

test('pending, payment-only and share-ratio labels do not manufacture listing/refund dates', () => {
  const result = parseDartScheduleBody(`<table>${row('상장예정일', '미정')}${row('납입기일', '2026.11.10')}${row('상장일 유통가능비율', '2026.11.17 기준 22.71%')}</table>`, receipt);
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.fields, {});
});

test('current sequential amendment section is used and mixed columns are rejected', () => {
  const result = parseDartScheduleBody('<p>정정 전</p>' + schedule.replace('2026-11-17', '2026-11-18') + '<p>정정 후</p>' + schedule, receipt);
  assert.equal(result.fields.listingDate, '2026-11-17');
  const mixed = parseDartScheduleBody(`<table><tr><th>항목</th><th>정정 전</th><th>정정 후</th></tr><tr><td>상장예정일</td><td>2026.11.18</td><td>2026.11.17</td></tr></table>`, receipt);
  assert.equal(mixed.status, 'ambiguous');
  assert.deepEqual(mixed.fields, {});
});

test('conflicting duplicate dates, invalid calendar dates and reversed chronology fail closed', () => {
  for (const html of [schedule + `<table>${row('상장일', '2026.11.18')}</table>`, schedule.replace('2026-11-17', '2026-02-30'),
    schedule.replace('2026-11-17', '2026-11-09'), schedule.replace('2026년 11월 06일', '2026년 11월 04일')]) {
    const result = parseDartScheduleBody(html, receipt);
    assert.equal(result.status, 'ambiguous');
    assert.deepEqual(result.fields, {});
  }
  assert.equal(parseDartScheduleBody(schedule + schedule, receipt).status, 'parsed');
});

test('schedule fetch uses two bounded requests to the same current receipt', async () => {
  const requests: { url: string; options?: RequestInit }[] = [];
  const result = await fetchDartSchedule(receipt, { fetcher: (async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(requests.length === 1 ? node() : schedule);
  }) as typeof fetch });
  assert.equal(result.fields.listingDate, '2026-11-17');
  assert.equal(result.requestCount, 2);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].options!.redirect, 'manual');
  assert(requests[0].options!.signal);
  assert.equal(new URL(requests[1].url).searchParams.get('rcpNo'), receipt);
  assert.equal(new URL(requests[1].url).hostname, 'dart.fss.or.kr');
});

test('redirects, oversize bodies, missing nodes and older receipt nodes never produce dates', async () => {
  const cases = [
    async () => new Response('', { status: 302, headers: { location: 'https://example.invalid' } }),
    async () => new Response('x', { headers: { 'content-length': '1000001' } }),
    async () => new Response('x'.repeat(1_000_001)),
    async () => new Response(node('표지')),
    async () => new Response(node(undefined, "node1['rcpNo']='20261020000001';")),
  ];
  for (const fetcher of cases) {
    const result = await fetchDartSchedule(receipt, { fetcher: fetcher as typeof fetch });
    assert.equal(result.requestCount, 1);
    assert.notEqual(result.status, 'parsed');
    assert.deepEqual(result.fields, {});
  }
});

test('explicit request budget, invalid receipts and duplicate offering nodes prevent excess calls', async () => {
  let calls = 0;
  const fetcher = (async () => { calls++; return new Response(node()); }) as typeof fetch;
  assert.equal((await fetchDartSchedule(receipt, { fetcher, maxRequests: 0 })).requestCount, 0);
  assert.equal(calls, 0);
  const limited = await fetchDartSchedule(receipt, { fetcher, maxRequests: 1 });
  assert.equal(limited.status, 'error');
  assert.equal(calls, 1);
  assert.equal((await fetchDartSchedule('20260230000001', { fetcher })).requestCount, 0);
  const duplicate = await fetchDartSchedule(receipt, { fetcher: (async () => new Response(node() + node().replaceAll('node1', 'node2'))) as typeof fetch });
  assert.equal(duplicate.status, 'ambiguous');
  assert.equal(duplicate.requestCount, 1);
});

test('actual latest DART table excerpts expose only the dates they explicitly contain', () => {
  for (const [name, currentReceipt, start, end] of [
    ['optronics', '20261029000504', '2026-11-05', '2026-11-06'],
    ['enki-whitehat', '20261027000363', '2026-12-01', '2026-12-02'],
    ['iam', '20261022000373', '2026-10-26', '2026-10-27'],
  ]) {
    const html = fs.readFileSync(path.join(process.cwd(), 'tests', 'fixtures', 'dart', `${name}-schedule-current.html`), 'utf8');
    const result = parseDartScheduleBody(html, currentReceipt);
    assert.equal(result.status, 'parsed', name);
    assert.equal(result.fields.refundDate, undefined);
    assert.equal(result.fields.listingDate, undefined);
    assert.deepEqual(result.fields, { subscriptionStart: start, subscriptionEnd: end }, name);
    assert(result.evidence.subscriptionStart!.excerpt.includes('청약'));
  }
});

test('numbered before/after markers exclude obsolete split-row dates', () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'tests', 'fixtures', 'dart', 'optronics-schedule-current.html'), 'utf8');
  const before = html.replace('(주4) 정정 후', '(주4) 정정 전').replaceAll('11월 05일', '11월 03일').replaceAll('11월 06일', '11월 04일');
  const result = parseDartScheduleBody(before + html, '20261029000504');
  assert.equal(result.status, 'parsed');
  assert.equal(result.fields.subscriptionStart, '2026-11-05');
  assert.equal(result.fields.subscriptionEnd, '2026-11-06');
});

test('a unique confirmed-conditions viewer is supported with the same two-request budget', async () => {
  let calls = 0;
  const result = await fetchDartSchedule(receipt, { fetcher: (async () => new Response(++calls === 1 ? node('증권발행조건확정') : schedule)) as typeof fetch });
  assert.equal(result.status, 'parsed');
  assert.equal(result.fields.listingDate, '2026-11-17');
  assert.equal(result.requestCount, 2);
});

test('a main-page block, empty viewer index or unsupported cover is an error eligible for retry', async () => {
  for (const html of ['<html>점검 중입니다.</html>', '<No schedule node>', node('표지')]) {
    const result = await fetchDartSchedule(receipt, { fetcher: (async () => new Response(html)) as typeof fetch });
    assert.equal(result.status, 'error');
    assert.equal(result.requestCount, 1);
    assert.deepEqual(result.fields, {});
  }
});
