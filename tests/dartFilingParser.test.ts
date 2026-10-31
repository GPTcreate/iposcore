import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as cheerio from 'cheerio';
import { fetchOfficialText } from '../src/lib/officialHttp';
import { fetchDartDocumentOffering } from '../src/lib/dartDocument';

interface Parsed { confirmedPrice?: number; institutionalCompetitionRate?: number; lockupCommitmentRate?: number; circulatingSupplyRate?: number; publicationPending?: { reason: string; evidence: string; sourceUrl: string } }
const receipt = '20261022000373';
const fixture = (name: string) => fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/dart', name), 'utf8');
const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/dartFilingSync.ts'), 'utf8');
const parserExports: Record<string, unknown> = {};
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(js, { exports: parserExports, module: { exports: parserExports }, require: (name: string) => {
  if (name === 'cheerio') return cheerio;
  if (name === './officialHttp') return { fetchOfficialText };
  if (name === './dartDocument') return { fetchDartDocumentOffering };
  if (name === './ipoStore' || name === './ipoServerStore' || name === './ipoDiscovery') return {};
  throw new Error(`Unexpected import ${name}`);
}, AbortSignal, Response, Date, Intl, URL, console, fetch: () => { throw new Error('Live network forbidden in fixtures'); }, process: { env: {} } });
const body = parserExports.parseDartFilingBody as (html: string, receipt: string) => Parsed | null;
const parse = parserExports.parseConfirmedFilingDetails as (receipt: string, options: { fetcher: typeof fetch }) => Promise<Parsed | null>;
const node = (title: string, id: number, extra = '') => `node1['text']='${title}';node1['dcmNo']='12345';node1['eleId']='${id}';node1['offset']='10';node1['length']='1000';node1['dtd']='dart4.xsd';${extra}`;

test('authenticated offering bodies use strict metrics, retain conflicts, and fall back only after API failure', async () => {
  for (const mode of ['normal', 'transport', 'conflict']) {
    const loaded: Record<string, unknown> = {}, calls: string[] = [];
    vm.runInNewContext(js, { exports: loaded, module: { exports: loaded }, require: (name: string) => {
      if (name === 'cheerio') return cheerio;
      if (name === './officialHttp') return { fetchOfficialText };
      if (name === './dartDocument') return { fetchDartDocumentOffering: async (_receipt: string, options: { apiKey: string }) => {
        assert.equal(_receipt, receipt); assert.equal(options.apiKey, 'fixture-only'); calls.push('document');
        if (mode === 'transport') throw new Error('API unavailable');
        return [mode === 'conflict' ? '<p>확정공모가액 10,000원</p><p>확정공모가액 20,000원</p>' : fixture('confirmed-current.html')];
      } };
      if (name === './ipoStore' || name === './ipoServerStore' || name === './ipoDiscovery') return {};
      throw new Error('Unexpected fixture import');
    }, AbortSignal, Response, Date, Intl, URL, console, process: { env: {} } });
    const run = loaded.parseConfirmedFilingDetails as (receipt: string, options: { apiKey: string; fetcher: typeof fetch }) => Promise<Parsed | null>;
    const result = await run(receipt, { apiKey: 'fixture-only', fetcher: async () => {
      calls.push('viewer');
      return new Response(calls.length === 2 ? node('제1부 모집 또는 매출에 관한 사항', 8) : fixture('confirmed-current.html'));
    } });
    if (mode === 'conflict') assert.equal(result, null);
    else {
      assert.equal(result?.confirmedPrice, 2000);
      assert.equal(result?.institutionalCompetitionRate, 1266.52);
    }
    assert.deepEqual(calls, mode === 'transport' ? ['document', 'viewer', 'viewer'] : ['document']);
  }
});

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
  const html = fixture('confirmed-current.html');
  assert.equal(body(html.replace('<td>15일 확약</td><td>-</td><td>-</td>', '<td>15일 확약</td><td>1</td><td>100</td>'), receipt)?.lockupCommitmentRate, undefined);
  assert.equal(body(html.replace(/<td>4,749,432,000<\/td>/g, '<td>0</td>'), receipt)?.lockupCommitmentRate, undefined);
});

test('an exact tradable-ratio column is distinct from a protection-ratio column', () => {
  const result = body('<table><tr><th>구분</th><th>보호예수비율</th><th>상장일유통가능비율</th></tr><tr><td>합계</td><td>4.58%</td><td>95.42%</td></tr></table>', receipt);
  assert.equal(result?.circulatingSupplyRate, 95.42);
});

test('unknown viewer metadata and unsuccessful document responses return no values', async () => {
  assert.equal(await parse(receipt, { fetcher: (async () => new Response("node1['dcmNo']='12345';")) as typeof fetch }), null);
  assert.equal(await parse(receipt, { fetcher: (async () => new Response('missing', { status: 404 })) as typeof fetch }), null);
});

test('oversized part one falls back to the matching small general and risk chapters', async () => {
  const calls: string[] = [];
  const result = await parse(receipt, { fetcher: (async (url: string | URL | Request) => {
    calls.push(String(url));
    if (calls.length === 1) return new Response(node('제1부 모집 또는 매출에 관한 사항', 6).replace("length']='1000'", "length']='2200000'") + node('I. 모집 또는 매출에 관한 일반사항', 7) + node('III. 투자위험요소', 14));
    return new Response(calls.length === 2 ? '<p>확정 공모가액을 15,300원으로 최종 결정하였습니다.</p>' : fixture('post-offering-float.html'));
  }) as typeof fetch });
  assert.equal(calls.length, 3);
  assert.match(calls[1], /eleId=7&/);
  assert.match(calls[2], /eleId=14&/);
  assert.equal(result?.confirmedPrice, 15300);
  assert.equal(result?.circulatingSupplyRate, 30);
});

test('publication pending requires explicit current evidence and never substitutes zero metrics', () => {
  const evidence = '<p>확정공모가액은 수요예측 결과를 반영하여 발행회사와 주관회사가 협의하여 최종 결정할 예정입니다.</p>';
  const result = body(evidence, receipt);
  assert.equal(result?.confirmedPrice, undefined);
  assert.equal(result?.institutionalCompetitionRate, undefined);
  assert.equal(result?.lockupCommitmentRate, undefined);
  assert.ok(result?.publicationPending?.evidence.includes('최종 결정할 예정'));
  assert.equal(result?.publicationPending?.sourceUrl, `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`);
  assert.equal(body('<p>수요예측을 실시합니다.</p>', receipt), null);
  assert.equal(body('<p>정정 전</p>' + evidence + '<p>정정 후</p><p>공모 조건 별도 확인</p>', receipt), null);
  assert.equal(body(evidence + '<p>확정 공모가액을 15,300원으로 최종 결정하였습니다.</p>', receipt)?.publicationPending, undefined);
});

test('an explicit pre-pricing wait preserves conflicting float as unknown without failing the filing', async () => {
  // Reduced actual KMF layout: the same total and tradable counts have different disclosed percentages.
  const narrative = '<p>당사의 상장예정주식수 8,483,285주 중 38.31%에 해당하는 3,250,187주는 상장 직후 유통가능 물량에 해당합니다.</p>';
  const table = fixture('post-offering-float.html').replace('1,000,000', '8,483,285')
    .replace('300,000', '3,250,187').replace('30.00%', '38.32%');
  const pending = '<p>확정공모가액은 수요예측 결과를 반영하여 대표주관회사와 발행회사가 협의하여 최종 결정할 예정입니다.</p>';
  const html = pending + narrative + table;
  const parsed = body(html, receipt);
  assert.ok(parsed?.publicationPending);
  assert.equal(parsed?.circulatingSupplyRate, undefined);
  assert.equal(parsed?.confirmedPrice, undefined);
  assert.equal(parsed?.institutionalCompetitionRate, undefined);
  assert.equal(parsed?.lockupCommitmentRate, undefined);
  const throughViewer = async (contents: string) => {
    let calls = 0;
    return parse(receipt, { fetcher: (async () => new Response(++calls === 1
      ? node('제1부 모집 또는 매출에 관한 사항', 8) : contents)) as typeof fetch });
  };
  assert.ok((await throughViewer(html))?.publicationPending);
  assert.equal(await throughViewer(narrative + table), null);
  for (const published of [
    '<p>확정 공모가액 15,300원</p>',
    '<p>의무보유확약 비율 20%</p>',
    fixture('confirmed-current.html'),
  ]) assert.equal(await throughViewer(html + published), null);
  assert.equal(await throughViewer(pending + '<p>확정 공모가액 15,300원</p><p>확정 공모가액 16,000원</p>'), null);
});

test('confirmed filings retry transient transport failures through the bounded official reader', async () => {
  let calls = 0;
  const result = await parse(receipt, { fetcher: (async (_url, init) => {
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.cache, 'no-store');
    assert.ok(init?.signal);
    if (++calls === 1) throw new TypeError('fetch failed', { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } });
    return new Response(calls === 2 ? node('제1부 모집 또는 매출에 관한 사항', 8) : fixture('confirmed-current.html'));
  }) as typeof fetch });
  assert.equal(calls, 3);
  assert.equal(result?.confirmedPrice, 2000);
});

test('an oversized streamed main page is rejected without parsing a plausible prefix', async () => {
  let calls = 0;
  assert.equal(await parse(receipt, { fetcher: (async () => {
    calls++;
    return new Response(node('제1부 모집 또는 매출에 관한 사항', 8) + ' '.repeat(1_000_001));
  }) as typeof fetch }), null);
  assert.equal(calls, 1);
});

test('a Korean offering body within the character limit may exceed two megabytes in UTF-8', async () => {
  const contents = fixture('confirmed-current.html') + '<!--' + '가'.repeat(700_000) + '-->';
  assert.ok(contents.length < 2_000_000);
  assert.ok(Buffer.byteLength(contents, 'utf8') > 2_000_000);
  let calls = 0;
  const result = await parse(receipt, { fetcher: (async () => new Response(++calls === 1
    ? node('제1부 모집 또는 매출에 관한 사항', 8) : contents)) as typeof fetch });
  assert.equal(calls, 2);
  assert.equal(result?.confirmedPrice, 2000);
  assert.equal(result?.institutionalCompetitionRate, 1266.52);
});

test('grouped post-offering headers select tradable shares and reconcile with issued shares', () => {
  const html = fixture('post-offering-float.html');
  assert.equal(body(html, receipt)?.circulatingSupplyRate, 30);
  assert.equal(body(html.replace('300,000', '400,000'), receipt), null);
  assert.equal(body(html.replace('공모 후', '상장 후 1개월'), receipt), null);
});

test('parenthetical total shares distinguish listing-day float from later cumulative float', () => {
  const html = '<p>상장예정주식수 12,048,564주(의무인수분 포함) 중 상장일 유통가능 물량은 4,218,360주(상장일 기준 35.01%), 상장 후 1개월 뒤 누적 유통가능 비율은 42.32%입니다.</p>';
  assert.equal(body(html, receipt)?.circulatingSupplyRate, 35.01);
  assert.equal(body(html.replace('4,218,360', '880,484'), receipt), null);
});

test('parenthetical description between expected shares and count resolves listing-day float', () => {
  const html = '<p>당사의 상장예정주식수(금번 공모주식 및 의무인수분 포함) 10,598,414주 중 37.95%에 해당하는 4,021,887주는 상장 직후 유통가능 물량에 해당하며 당사의 최대주주 등의 보유주식 등은 상장 후 일정기간 동안 매각이 제한됩니다.</p>';
  assert.equal(body(html, receipt)?.circulatingSupplyRate, 37.95);
});

test('domestic-only commitment data cannot establish the global commitment rate', () => {
  assert.equal(body(fixture('confirmed-current.html').replace('<th colspan="3">합계</th>', '<th colspan="3">국내 기관투자자</th>'), receipt)?.lockupCommitmentRate, undefined);
});

test('IAM-style unlabelled foreign continuation reconciles its global zero with demand totals', () => {
  const initial = fixture('confirmed-current.html');
  const demand = initial.slice(0, initial.indexOf('<p>의무보유확약'));
  const continuation = fixture('commitment-continuation.html');
  assert.equal(body(demand + continuation, receipt)?.lockupCommitmentRate, 0);
  assert.equal(body(demand + continuation.replace(/4,749,432,000/g, '4,000,000,000'), receipt)?.lockupCommitmentRate, undefined);
});
