import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(path.resolve('src/lib/reviewCollector.ts'));
const exports = {};
const compiled = ts.transpileModule(fs.readFileSync('src/lib/reviewCollector.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
vm.runInNewContext(`${compiled}\nexports.readParagraphs = sourceParagraphs;`, {
  exports, module: { exports }, require, URL, AbortController, TextDecoder, Uint8Array, setTimeout, clearTimeout,
  fetch() { throw new Error('Live network is forbidden in review context fixtures.'); },
});
const alpha = { id: 'alpha', name: '별빛테크', subscriptionStart: '2020-10-26' };
const beta = { id: 'beta', name: '바다로봇', subscriptionStart: '2020-10-26' };
const classify = (paragraphs, { target = alpha, title = `${target.name} 공모주 청약분석`, ipos = [alpha, beta] } = {}) =>
  exports.classifyReviewArticle(paragraphs, title, target, ipos);
const stance = (paragraphs, options) => classify(paragraphs, options)?.sentiment;
const html = paragraphs => `<div class="se-main-container">${paragraphs.map(text => `<p>${text}</p>`).join('')}</div>`;

test('reads the bounded article conclusion after paragraph 300 and preserves later repeated headings', () => {
  const paragraphs = exports.readParagraphs(html([
    '별빛테크', ...Array.from({ length: 330 }, (_, i) => `확인한 공모 정보 ${i}`), '별빛테크',
    '개인적으로 이번 별빛테크에 균등청약을 중심으로 참여하되, 비례는 경쟁률이 낮다면 검토하겠습니다.',
  ]));
  assert.equal(paragraphs.length, 333);
  assert.equal(paragraphs.filter(p => p === '별빛테크').length, 2);
  assert.equal(stance(paragraphs), 'POSITIVE');
});

test('recognizes minimum submission, natural non-participation and explicit deferred decisions', () => {
  for (const [decision, expected] of [
    ['우선 나는 균등 배정분만 최소 수량(10주)으로 넣어볼 생각이다.', 'POSITIVE'],
    ['나는 균등 청약도 진행하지 않을 생각이다.', 'CAUTION'],
    ['나는 최종 계좌 수를 확인한 뒤 결정할 계획입니다.', 'NEUTRAL'],
    ['두 증권사의 경쟁률을 보고 청약을 진행해보려고 한다.', 'POSITIVE'],
  ]) assert.equal(stance(['6. 정리', '공모 조건을 비교해 보았습니다.', decision]), expected, decision);
});

test('uses an author decision section without requiring a repeated company name in every paragraph', () => {
  assert.equal(stance(['개인적인 청약결정 및 후기', '별빛테크 공모 조건', '2. 균등',
    '균등 청약은 참여할 계획입니다.', '3. 비례', '비례는 판단을 보류합니다.']), 'POSITIVE');
});

test('binds a weekly article decision only to its explicit neighboring company section', () => {
  const paragraphs = ['별빛테크 사업과 공모개요', '기관 경쟁률은 높습니다.', '개인적으로 우선 검토했습니다.',
    '균등청약에는 참여하는 방향으로 생각하고 있습니다.', '바다로봇 사업과 공모개요', '공모가와 유통정보입니다.'];
  const options = { title: '이번 주 별빛테크와 바다로봇 공모주 일정 비교' };
  assert.equal(stance(paragraphs, options), 'POSITIVE');
  assert.equal(stance(paragraphs, { ...options, target: beta }), 'UNCLASSIFIED');
});

test('equal participation survives a proportional-only decline or a deferred allocation', () => {
  for (const proportional of ['비례 청약은 참여하지 않겠습니다.', '비례는 판단을 보류합니다.',
    '비례는 경쟁률이 낮다면 검토하겠습니다.']) {
    assert.equal(stance(['저는 별빛테크 균등 청약에 참여할 계획입니다. ' + proportional]), 'POSITIVE');
  }
  assert.equal(stance(['저는 별빛테크 균등 청약에 참여합니다. 균등 청약은 하지 않겠습니다.']), 'UNCLASSIFIED');
  assert.equal(stance(['저는 별빛테크 비례 청약은 참여하지 않겠습니다.']), 'UNCLASSIFIED');
});

test('conditions, inverse plans, questions, quotations and institutional opinions stay unclassified', () => {
  for (const paragraphs of [
    ['저는 별빛테크 경쟁률이 낮다면 참여할 생각입니다.'],
    ['만약 경쟁률이 낮다면.', '저는 별빛테크 청약에 참여할 계획입니다.'],
    ['저는 별빛테크 청약에 참여할 생각이 없습니다.'],
    ['저는 별빛테크는 참여할 생각입니다. 현재 참여할 계획은 없습니다.'],
    ['저는 별빛테크 청약을 해봐야겠어요?'],
    ['전문가의 의견을 인용합니다.', '저는 별빛테크 청약에 참여할 계획입니다.'],
    ['전문가는 “저는 별빛테크는 참여합니다”라고 말했습니다.'],
    ['6. 정리', '기관투자자들은 별빛테크의 기술력을 긍정적으로 평가했습니다.'],
    ['개인적인 청약결정 및 후기', '별빛테크 공모조건', '기관이 본 공모주에 참여할 예정입니다.'],
    ['6. 정리', '별빛테크는 좋은 회사로 판단됩니다.'],
  ]) assert.equal(stance(paragraphs), 'UNCLASSIFIED', paragraphs.join(' / '));
});

test('never lends an adjacent decision to another company, including an unknown requested batch member', () => {
  assert.equal(stance(['별빛테크 공모정보', '저는 바다로봇은 참여할 계획입니다.'], { ipos: [alpha] }), 'UNCLASSIFIED');
  assert.equal(stance(['저는 별빛테크는 살펴보고 바다로봇 청약에 참여할 예정입니다.'], { ipos: [alpha] }), 'UNCLASSIFIED');
  assert.equal(stance(['별빛테크 공모정보', '바다로봇 공모정보', '나는 균등 청약에 참여할 계획입니다.'],
    { title: '별빛테크와 바다로봇 비교' }), 'UNCLASSIFIED');
  assert.equal(stance(['별빛테크 공모정보', '새봄에너지 공모정보', '나는 균등 청약에 참여할 계획입니다.'],
    { title: '이번 주 별빛테크와 여러 공모주 일정 비교', ipos: [alpha] }), 'UNCLASSIFIED');
  assert.equal(stance(['6. 정리', '바다로봇은 다음 주 청약을 합니다.', '나는 균등 청약에 참여할 계획입니다.']), 'UNCLASSIFIED');
});

test('an explicit dedicated refusal conclusion can explain alternative subscriptions without changing its subject', () => {
  const decision = '나는 바다로봇과 새봄에너지 두 종목의 동시 청약을 고려해서 균등 청약도 진행하지 않을 생각이다.';
  const paragraphs = ['7. 결론: 균등도 참여 X', '공모 조건을 종합해 보았습니다.', decision];
  assert.equal(stance(paragraphs), 'CAUTION');
  assert.equal(stance(paragraphs, { title: '별빛테크와 바다로봇 주간 비교' }), 'UNCLASSIFIED');
  assert.equal(stance(['7. 결론', decision]), 'UNCLASSIFIED');
  assert.equal(stance(['7. 결론: 비례 참여 X', decision]), 'UNCLASSIFIED');
  assert.equal(stance(['7. 결론: 균등도 참여 X', '나는 공모 조건을 고려해서 바다로봇 균등 청약도 진행하지 않을 생각이다.']), 'UNCLASSIFIED');
  assert.equal(stance(['7. 결론: 균등도 참여 X', '나는 경쟁률이 높다면 다른 종목을 고려해서 균등 청약도 진행하지 않을 생각이다.']), 'UNCLASSIFIED');
  assert.equal(stance(['7. 결론: 균등도 참여 X', '기관이 다른 종목을 고려해서 균등 청약도 진행하지 않을 생각이다.']), 'UNCLASSIFIED');
  assert.equal(stance([...paragraphs, '최종 결정을 정정합니다. 균등 청약에 참여할 계획입니다.']), 'UNCLASSIFIED');
});

test('a later contradiction or correction cancels an earlier decision across paragraphs and long tails', () => {
  for (const paragraphs of [
    ['저는 별빛테크 청약에 참여합니다.', '최종 결정을 정정합니다. 청약하지 않겠습니다.'],
    ['저는 별빛테크 청약에 참여합니다.', ...Array.from({ length: 100 }, (_, i) => `추가 확인 정보 ${i}`),
      '정정합니다. 청약하지 않겠습니다.'],
    ['저는 별빛테크는 패스합니다.', '최종적으로 청약에 참여할 계획입니다.'],
  ]) assert.equal(stance(paragraphs), 'UNCLASSIFIED');
});

test('context evidence contains actual source fragments within the existing public excerpt budget', () => {
  const result = classify(['6. 정리', '나는 균등 배정분만 최소 수량(10주)으로 넣어볼 생각이다.']);
  assert.equal(result.sentiment, 'POSITIVE');
  assert.ok(result.excerpt.includes('별빛테크'));
  assert.ok(result.excerpt.includes('넣어볼 생각이다'));
  assert.ok(result.excerpt.includes('…'));
  assert.ok(result.excerpt.length <= 120);
  assert.ok(result.excerpt.split(/\s+/).length <= 18);
  assert.ok(!/[\uD800-\uDBFF]$/.test(result.excerpt));
});

test('the real collector applies article context with a one-feed one-body mock and no external writes', async () => {
  let calls = 0;
  const channel = { id: 'fixture', name: 'fixture', type: 'BLOG', url: 'https://blog.naver.com/fixture',
    feedUrl: 'https://rss.blog.naver.com/fixture.xml', isActive: true };
  const feed = '<rss version="2.0"><channel><title>fixture</title><item><title>별빛테크 공모주 청약분석</title>'
    + '<link>https://blog.naver.com/fixture/1001</link><pubDate>Sun, 25 Oct 2020 09:00:00 +0900</pubDate>'
    + '<description>별빛테크 청약</description></item></channel></rss>';
  const fetcher = async input => { calls++; return new Response(String(input) === channel.feedUrl ? feed
    : html(['6. 정리', '우선 나는 균등 배정분만 최소 수량으로 넣어볼 생각이다.'])); };
  const [snapshot] = await exports.collectReviewsForIpos([alpha], { channels: [channel], now: new Date('2020-10-25T03:00:00Z'), fetcher });
  assert.equal(calls, 2);
  assert.equal(snapshot.reviews[0].sentiment, 'POSITIVE');
  assert.equal(snapshot.reviews[0].evidence.classification, 'explicit-stance-v1');
  assert.ok(snapshot.reviews[0].evidence.excerpt.length <= 120);
});
