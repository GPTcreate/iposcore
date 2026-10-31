import assert from 'node:assert/strict';
import test from 'node:test';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import { inspectDartOfferingTerms } from '../src/lib/dartOffering';

const labels = ['증권의 종류', '증권수량', '액면가액', '모집(매출)가액', '모집(매출)총액', '모집(매출)방법'];
const row = (values = ['보통주', '5,000,000', '500', '8,000', '40,000,000,000', '일반공모']) => `<tr>${values.map(value => `<td>${value}</td>`).join('')}</tr>`;
const table = (body = row(), headers = labels) => `<table><thead><tr>${headers.map(value => `<th>${value}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
function inspect(html: string, price: number | undefined = 8000, predicate?: (node: AnyNode) => boolean) {
  const $ = load(html, { xml: { xmlMode: false, decodeEntities: true, withStartIndices: true } });
  return inspectDartOfferingTerms($, predicate || (() => true), price);
}

test('the actual six-column thead/tbody shape supplies 5 million shares and 400억원 at the confirmed 8,000원 price', () => {
  const result = inspect('<p>(단위: 주, 원)</p>' + table());
  assert.equal(result.ambiguous, false);
  assert.equal(result.offeringShareCount, 5_000_000);
  assert.equal(result.confirmedPrice, 8000);
  assert.equal(result.totalOfferingAmount, 400);
  assert.match(result.excerpt!, /5,000,000주/);
  assert.match(result.excerpt!, /8,000원/);
  assert.match(result.excerpt!, /40,000,000,000원/);
});

test('the reduced latest Nexi 20261030000472 table preserves its colgroup, header layout and highlighted confirmed values', () => {
  // Reduced public numeric table only; current report, not the earlier mixed before/after condition sheet.
  const html = `<p>1. 공모개요</p><p></p><table>
    <colgroup><col width="58"/><col width="87"/><col width="73"/><col width="87"/><col width="130"/><col width="229"/></colgroup>
    <thead><tr><th width="49" height="46">증권의 종류</th><th width="78" height="46">증권수량</th>
      <th width="64" height="46">액면가액</th><th width="78" height="46">모집(매출)가액</th>
      <th width="121" height="46">모집(매출)총액</th><th width="220" height="46">모집(매출)방법</th></tr></thead>
    <tbody><tr><td width="49" height="46" align="CENTER">보통주</td><td width="78" height="46" align="RIGHT">5,000,000</td>
      <td width="64" height="46" align="RIGHT">500</td>
      <td width="78" height="46" align="RIGHT" style="font-weight:bold;color:#FF0000;">8,000</td>
      <td width="121" height="46" align="RIGHT" style="font-weight:bold;color:#FF0000;">40,000,000,000</td>
      <td width="220" height="46" align="CENTER">일반공모</td></tr></tbody></table>`;
  const result = inspect(html);
  assert.equal(result.ambiguous, false);
  assert.equal(result.confirmedPrice, 8000);
  assert.equal(result.offeringShareCount, 5_000_000);
  assert.equal(result.totalOfferingAmount, 400);
});

test('spaces, line breaks and full-width parentheses normalize without weakening the required column identities', () => {
  const result = inspect(table(row(), ['증권의\n종류', '증권 수량', '액면 가액', '모집（매출）가액', '모집(매출) 총액', '모집 (매출) 방법']));
  assert.equal(result.totalOfferingAmount, 400);
  assert.equal(result.ambiguous, false);
  for (const changes of [labels.map((label, index) => index === 1 ? '일반청약 배정주식수' : label),
    [...labels.slice(0, 4), '공모 후 시가총액', labels[5]], [labels[1], labels[0], ...labels.slice(2)]]) {
    assert.deepEqual(inspect(table(row(), changes)), { ambiguous: false });
  }
});

test('the caller supplies the current/amended selection and rejected old tables never contribute terms', () => {
  const old = table(row(['보통주', '5,000,000', '500', '13,000', '65,000,000,000', '일반공모']));
  const html = `<section data-old="yes">${old}</section><section>${table()}</section>`;
  const $ = load(html, { xml: { xmlMode: false, decodeEntities: true, withStartIndices: true } });
  const seen: AnyNode[] = [];
  const result = inspectDartOfferingTerms($, node => { seen.push(node); return $(node).closest('[data-old]').length === 0; }, 8000);
  assert.equal(result.totalOfferingAmount, 400);
  assert.equal(result.ambiguous, false);
  assert(seen.length > 0);
  assert.deepEqual(inspectDartOfferingTerms($, () => false, 8000), { ambiguous: false });
});

test('a current row rejected by the caller is ignored independently of its table', () => {
  const $ = load(table(row(['보통주', '5,000,000', '500', '13,000', '65,000,000,000', '일반공모']).replace('<tr>', '<tr data-old="yes">') + row()));
  const result = inspectDartOfferingTerms($, node => $(node).attr('data-old') !== 'yes', 8000);
  assert.equal(result.totalOfferingAmount, 400);
  assert.equal(result.ambiguous, false);
});

test('a valid arithmetic total is still unconfirmed without the callers current confirmed price', () => {
  for (const price of [undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, 8000.5]) {
    const $ = load(table());
    assert.deepEqual(inspectDartOfferingTerms($, () => true, price), { ambiguous: false });
  }
  const pending = table(row(['보통주', '5,000,000', '500', '10,500 ~ 13,000', '-', '일반공모']));
  assert.deepEqual(inspect(pending), { ambiguous: false });
});

test('an offer-price disagreement or shares-times-price disagreement is explicit ambiguity and never a partial amount', () => {
  for (const values of [
    ['보통주', '5,000,000', '500', '8,000', '65,000,000,000', '일반공모'],
    ['보통주', '5,000,000', '500', '13,000', '65,000,000,000', '일반공모'],
    ['보통주', '5,000,000', '500', '8,000', '39,999,999,999', '일반공모'],
  ]) assert.deepEqual(inspect(table(row(values))), { ambiguous: true });
});

test('conflicting current offering rows or tables fail closed while identical repeated disclosures are accepted', () => {
  const smaller = row(['보통주', '4,000,000', '500', '8,000', '32,000,000,000', '일반공모']);
  assert.deepEqual(inspect(table() + table(smaller)), { ambiguous: true });
  assert.deepEqual(inspect(table(row() + smaller)), { ambiguous: true });
  assert.deepEqual(inspect(table() + table(row(['보통주', '5,000,000', '500', '13,000', '65,000,000,000', '일반공모']))), { ambiguous: true });
  const duplicate = inspect(table() + table());
  assert.equal(duplicate.ambiguous, false);
  assert.equal(duplicate.totalOfferingAmount, 400);
});

test('천원, 백만원 and other non-won declarations cannot silently rescale an otherwise matching table', () => {
  for (const unit of ['천원', '백만원', '억원', '주, 천원', 'USD', '달러']) {
    assert.deepEqual(inspect(`<p>(단위 : ${unit})</p>${table()}`), { ambiguous: true });
  }
  assert.deepEqual(inspect(table().replace('<table>', '<table><caption>(단위: 백만원)</caption>')), { ambiguous: true });
  const $ = load(`<p data-old="yes">(단위: 백만원)</p>${table()}`);
  assert.equal(inspectDartOfferingTerms($, node => $(node).attr('data-old') !== 'yes', 8000).totalOfferingAmount, 400);
});

test('general-subscription allocation tables, private placement and preferred stock cannot masquerade as the whole public offering', () => {
  const allocations = ['구분', '일반청약 배정주식수', '청약한도', '청약증거금', '납입금액', '청약방법'];
  assert.deepEqual(inspect(table(row(), allocations)), { ambiguous: false });
  for (const values of [
    ['보통주', '1,250,000', '500', '8,000', '10,000,000,000', '일반청약'],
    ['보통주', '5,000,000', '500', '8,000', '40,000,000,000', '사모'],
    ['우선주', '5,000,000', '500', '8,000', '40,000,000,000', '일반공모'],
  ]) assert.deepEqual(inspect(table(row(values))), { ambiguous: false });
});

test('unsafe integer products, malformed numeric grouping and incomplete numeric cells do not create confirmed facts', () => {
  assert.deepEqual(inspect(table(row(['보통주', '9007199254740991', '500', '8,000', '9007199254740991', '일반공모']))), { ambiguous: true });
  for (const values of [
    ['보통주', '9,007,199,254,740,992', '500', '8,000', '40,000,000,000', '일반공모'],
    ['보통주', '5,00,000', '500', '8,000', '40,000,000,000', '일반공모'],
    ['보통주', '', '500', '8,000', '40,000,000,000', '일반공모'],
    ['보통주', '5,000,000', '500', '8,000', '-', '일반공모'],
    ['보통주', '5,000,000', '500', '8,000', '40,000,000,000원', '일반공모'],
  ]) assert.deepEqual(inspect(table(row(values))), { ambiguous: false });
});

test('unrecognized colspan/rowspan layouts are ignored instead of shifting totals into the wrong column', () => {
  assert.deepEqual(inspect(table().replace('<th>증권의 종류</th>', '<th colspan="2">증권의 종류</th>')), { ambiguous: false });
  assert.deepEqual(inspect(table().replace('<td>보통주</td>', '<td rowspan="2">보통주</td>')), { ambiguous: false });
});
