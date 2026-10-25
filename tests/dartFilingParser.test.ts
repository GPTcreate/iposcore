import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as cheerio from 'cheerio';

interface Parsed { confirmedPrice?: number; institutionalCompetitionRate?: number; lockupCommitmentRate?: number; circulatingSupplyRate?: number }
const receipt = '20261022000373';
const fixture = (name: string) => fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/dart', name), 'utf8');
const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dartFilingSync.ts'), 'utf8');
const parserExports: Record<string, unknown> = {};
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(js, { exports: parserExports, module: { exports: parserExports }, require: (name: string) => {
  if (name === 'cheerio') return cheerio;
  if (name === './ipoStore' || name === './ipoServerStore' || name === './ipoDiscovery') return {};
  throw new Error(`Unexpected import ${name}`);
}, AbortSignal, Response, Date, Intl, URL, console, fetch: () => { throw new Error('Live network forbidden in fixtures'); }, process: { env: {} } });
const body = parserExports.parseDartFilingBody as (html: string, receipt: string) => Parsed | null;
const parse = parserExports.parseConfirmedFilingDetails as (receipt: string, options: { fetcher: typeof fetch }) => Promise<Parsed | null>;
const node = (title: string, id: number, extra = '') => `node1['text']='${title}';node1['dcmNo']='12345';node1['eleId']='${id}';node1['offset']='10';node1['length']='1000';node1['dtd']='dart4.xsd';${extra}`;

test('offering body is selected instead of an amendment cover or issuer attachment', async () => {
  const calls: string[] = [];
  const result = await parse(receipt, { fetcher: (async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(calls.length === 1 ? node('정 정 신 고 (보고)', 1) + node('제1부 모집 또는 매출에 관한 사항', 8) + node('제2부 발행인에 관한 사항', 23) : fixture('float-current.html'));
  }) as typeof fetch });
  assert.equal(result?.circulatingSupplyRate, 95.42);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /eleId=8&/);
});

test('actual demand-table shape chooses total competition and disclosed zero commitments', () => {
  const result = body(fixture('confirmed-current.html'), receipt);
  assert.equal(result?.confirmedPrice, 2000);
  assert.equal(result?.institutionalCompetitionRate, 1266.52);
  assert.equal(result?.lockupCommitmentRate, 0);
});

test('share-count arithmetic identifies tradable 95.42 rather than protected 4.58 percent', () => {
  assert.equal(body(fixture('float-current.html'), receipt)?.circulatingSupplyRate, 95.42);
  assert.equal(body(fixture('float-current.html').replace('5,000,000주는', '240,000주는'), receipt), null);
  assert.equal(body('<p>보호예수 비율 4.58%이며 유통가능 여부는 별도입니다.</p>', receipt), null);
});

test('separate amendment markers exclude old price, lockup and circulation', () => {
  const result = body('<p>정정 전</p><p>확정공모가액 10,000원</p><p>의무보유확약 비율 5%</p><p>상장일 유통가능비율 25%</p><p>정정 후</p><p>확정공모가액 20,000원</p><p>의무보유확약 비율 20%</p><p>상장일 유통가능비율 30%</p>', receipt);
  assert.equal(result?.confirmedPrice, 20000);
  assert.equal(result?.lockupCommitmentRate, 20);
  assert.equal(result?.circulatingSupplyRate, 30);
});

test('side-by-side amendments and mixed single paragraphs fail closed', () => {
  assert.equal(body('<table><tr><th>정정 전</th><th>정정 후</th></tr><tr><td><p>확정공모가액 10,000원</p></td><td><p>확정공모가액 20,000원</p></td></tr></table>', receipt), null);
  assert.equal(body('<p>정정 전 확정공모가액 10,000원 의무보유확약 비율 5% 정정 후 확정공모가액 20,000원 의무보유확약 비율 20%</p>', receipt), null);
});

test('conflicting current values are not resolved by pattern order or last occurrence', () => {
  assert.equal(body('<p>상장일 유통가능비율 25%</p><p>상장일 유통가능비율 30%</p>', receipt), null);
  assert.equal(body('<p>유통가능물량 25% 정정 후 상장일 유통가능비율 30%</p>', receipt)?.circulatingSupplyRate, 30);
});

test('general-subscription tables and unlabelled numeric text cannot supply institutional competition', () => {
  assert.equal(body('<p>일반 청약 결과</p><table><tr><th>구분</th><th>일반청약자</th><th>합계</th></tr><tr><td>경쟁률</td><td>100</td><td>200</td></tr></table>', receipt), null);
  assert.equal(body('<p>합계 경쟁률 1,266.52</p>', receipt), null);
});

test('commitment templates or nonzero period quantities cannot manufacture a zero result', () => {
  const html = fixture('confirmed-current.html').replace(/<p>1주당[\s\S]*?<\/table>/, '');
  assert.equal(body(html.replace('<td>15일 확약</td><td>-</td>', '<td>15일 확약</td><td>1</td>'), receipt), null);
  assert.equal(body(html.replace(/<td>7<\/td>/g, '<td>0</td>'), receipt), null);
});

test('an exact tradable-ratio column is distinct from a protection-ratio column', () => {
  const result = body('<table><tr><th>구분</th><th>보호예수비율</th><th>상장일유통가능비율</th></tr><tr><td>합계</td><td>4.58%</td><td>95.42%</td></tr></table>', receipt);
  assert.equal(result?.circulatingSupplyRate, 95.42);
});

test('unknown viewer metadata and unsuccessful document responses return no values', async () => {
  assert.equal(await parse(receipt, { fetcher: (async () => new Response("node1['dcmNo']='12345';")) as typeof fetch }), null);
  assert.equal(await parse(receipt, { fetcher: (async () => new Response('missing', { status: 404 })) as typeof fetch }), null);
});
