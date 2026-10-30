import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { IBK_IPO_INDEX, IBK_PARSER_VERSION, extractIbkStockCode, isIbkNoticeUrl, parseIbkIndex, parseIbkNotice } from '../src/lib/ibkSchedule';

const url = 'https://www.ibks.com/hts/hts_noticeview.do?seq=6125';
const company = '하나에어로다이내믹스';
const html = fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/brokers/ibk-hana-6125.html'), 'utf8');
const title = '(주)하나에어로다이내믹스 코스닥상장 공모주 청약안내';
const indexRow = (name = title, onclick = "ibkisNoticeView('6125');", date = '2026/10/20 08:15') => `<tr><td class="td_type_num"></td><td class="td_type_sub"><a href="#" onclick="${onclick}">${name}</a></td><td class="td_type_day">${date}</td><td class="td_type_num">455</td></tr>`;
const index = (rows = indexRow()) => `<form name="searchForm"><table class="list tbl_type1" summary="공지사항"><thead><tr><th>번호</th><th>제목</th><th>등록일</th><th>조회수</th></tr></thead><tbody>${rows}</tbody></table></form>`;

test('IBK official issuer table supplies exact dates, publication timestamp and excerpts without institution terms', () => {
  assert.equal(IBK_PARSER_VERSION, 'ibk-schedule-v1');
  assert.equal(IBK_IPO_INDEX, 'https://www.ibks.com/hts/hts_noticelist.do?popup=Y');
  const facts = parseIbkNotice(html, url, company);
  assert.equal(facts.sourceTitle, title);
  assert.equal(facts.publishedAt, '2026-10-20T08:15:00+09:00');
  assert.equal(facts.fields.confirmedPrice, undefined);
  assert.deepEqual(facts.fields, { subscriptionStart: '2026-11-10', subscriptionEnd: '2026-11-11', refundDate: '2026-11-13', listingDate: '2026-11-20' });
  assert.match(facts.excerpts.listingDate!, /상장 예정일.*2026년 11월 20일/);
  assert.equal(extractIbkStockCode(html, company), '271160');
  assert.equal(extractIbkStockCode(html.replace('(A271160)', ''), company), undefined);
  assert.throws(() => extractIbkStockCode(html, '다른회사'));
  assert.equal(parseIbkNotice(html.replace('(A271160)', ''), url, company).fields.listingDate, '2026-11-20');
});

test('IBK index handles pinned rows and accepts only exact notice types, timestamps and numeric routes', () => {
  const notices = parseIbkIndex(index(indexRow() + indexRow('하나에어로다이내믹스 관련 소식') + indexRow(title, "ibkisNoticeView('6125');alert(1)") + indexRow(title, undefined, '2026/02/30 08:15')));
  assert.deepEqual(notices, [{ sourceUrl: url, title, publishedAt: '2026-10-20T08:15:00+09:00', company }]);
  assert.throws(() => parseIbkIndex('<html>시스템 점검</html>'));
});

test('IBK notice rejects unrelated companies, malformed identity, timestamps and noncanonical URLs', () => {
  assert.throws(() => parseIbkNotice(html, url, `${company}2`));
  assert.throws(() => parseIbkNotice(html.replace(`주식회사 ${company}(A271160)`, '주식회사 다른회사(A271160)'), url, company));
  assert.throws(() => parseIbkNotice(html.replace('(A271160)', '(A123)'), url, company));
  assert.throws(() => parseIbkNotice(html.replace('2026-10-20 (08:15)', '2026-10-20 (25:15)'), url, company));
  for (const bad of [url.replace('https:', 'http:'), url.replace('www.ibks.com', 'www.ibks.com.attacker.com'), `${url}&extra=1`, `${url}#body`, url.replace('https://', 'https://user@'), `${url}&seq=6126`]) {
    assert.equal(isIbkNoticeUrl(bad), false);
    assert.throws(() => parseIbkNotice(html, bad, company));
  }
});

test('IBK conflicting, invalid and reversed dates fail closed', () => {
  for (const changed of [html.replace('2026년 11월 20일', '2026년 2월 30일'),
    html.replace('2026년 11월 20일', '2026년 11월 9일'),
    html.replace('</tbody>', '<tr><td>상장 예정일</td><td>2026년 11월 21일</td></tr></tbody>'),
    html.replace('11월 11일(수)', '11월 9일(월)')]) assert.throws(() => parseIbkNotice(changed, url, company));
});

test('IBK explicit pending listing does not invent a date or reuse another row date', () => {
  const facts = parseIbkNotice(html.replace('2026년 11월 20일(금) (예정)', '미정'), url, company);
  assert.equal(facts.fields.listingDate, undefined);
  assert.deepEqual(facts.pendingFields, ['listingDate']);
  assert.equal(facts.fields.refundDate, '2026-11-13');
});
