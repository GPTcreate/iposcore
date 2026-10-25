import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { aliasMatch, collectReviewsForIpos } from '../src/lib/reviewCollector';
import type { ReviewChannel } from '../src/types/reviews';

const fixture = (name: string) => readFileSync(path.join(process.cwd(), 'tests/fixtures/reviews', name), 'utf8');
const now = new Date('2020-10-25T03:00:00Z');
const iam = { id: 'iam-spac1', name: '아이엠기업인수목적1호', subscriptionStart: '2020-10-26' };
const melcon = { id: 'melcon', name: '멜콘', subscriptionStart: '2020-10-26' };
const channel: ReviewChannel = { id: 'naver-msql', name: '설정의 임의 명칭', type: 'BLOG', url: 'https://blog.naver.com/msql', feedUrl: 'https://rss.blog.naver.com/msql.xml', isActive: true };
const xml = (title: string, description = title, date = 'Sat, 24 Oct 2020 15:00:00 +0900', url = 'https://blog.naver.com/msql/1001') => `<?xml version="1.0"?><rss version="2.0"><channel><title>실제 RSS 제목</title><item><title><![CDATA[${title}]]></title><link><![CDATA[${url}]]></link><pubDate>${date}</pubDate><description><![CDATA[${description}]]></description></item></channel></rss>`;
const html = (text: string) => `<div class="se-main-container"><p class="se-text-paragraph">${text}</p></div>`;

function mockNetwork(feed: string = fixture('normal.xml'), article: string = fixture('post.html')) {
  const calls: { url: string; redirect?: RequestRedirect }[] = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, redirect: init?.redirect });
    if (url === channel.feedUrl) return new Response(feed, { headers: { 'content-type': 'application/rss+xml' } });
    if (url.startsWith('https://blog.naver.com/PostView.naver?blogId=msql&logNo=')) return new Response(article, { headers: { 'content-type': 'text/html' } });
    throw new Error(`Unexpected request: ${url}`);
  }) as typeof fetch;
  return { fetcher, calls };
}

test('matches full names, reordered SPAC variants and the actual spaced alias', () => {
  for (const alias of ['아이엠기업인수목적1호', '아이엠1호스팩', '아이엠스팩1호', '아이엠스팩', '아이엠 스팩']) {
    assert.equal(aliasMatch(`오늘 ${alias} 청약`, iam.name), alias);
  }
  assert.equal(aliasMatch('관련 없는 회사', iam.name), null);
});

test('company boundaries reject longer issuers and wrong SPAC numbers while preserving attached IPO keywords', () => {
  assert.equal(aliasMatch('영광와이케이엠씨 공모주 분석', '영광'), null);
  assert.equal(aliasMatch('새영광 공모주 분석', '영광'), null);
  assert.equal(aliasMatch('영광은 청약 조건을 확인합니다.', '영광'), '영광');
  assert.equal(aliasMatch('영광와이케이엠씨와 영광 청약을 비교합니다.', '영광'), '영광');
  for (const wrong of ['아이엠스팩2호청약', '아이엠스팩11호 청약', '아이엠스팩 제2호', '아이엠기업인수목적11호', '아이엠11호스팩']) {
    assert.equal(aliasMatch(wrong, iam.name), null, wrong);
  }
  assert.equal(aliasMatch('아이엠스팩1호청약', iam.name), '아이엠스팩1호');
  assert.equal(aliasMatch('아이엠스팩청약', iam.name), '아이엠스팩');
  assert.equal(aliasMatch('아이엠스팩1호청약', '아이엠기업인수목적2호'), null);
  assert.equal(aliasMatch('아이엠스팩2호청약', '아이엠기업인수목적2호'), '아이엠스팩2호');
});

test('a related longer company article is not assigned to a shorter company card', async () => {
  const network = mockNetwork(xml('영광와이케이엠씨 공모주 분석'), html('영광와이케이엠씨 공모 조건을 확인합니다.'));
  const [snapshot] = await collectReviewsForIpos([{ id: 'yeonggwang', name: '영광', subscriptionStart: iam.subscriptionStart }], { channels: [channel], now, fetcher: network.fetcher });
  assert.equal(snapshot.reviews.length, 0);
  assert.equal(network.calls.length, 1);
});

test('reuses one feed for multiple IPOs, canonicalizes duplicates and keeps real source authorship', async () => {
  const network = mockNetwork();
  const snapshots = await collectReviewsForIpos([iam, melcon], { channels: [channel], now, fetcher: network.fetcher });
  assert.equal(network.calls.filter((call) => call.url === channel.feedUrl).length, 1);
  assert.equal(snapshots[0].reviews.length, 1);
  assert.equal(snapshots[0].reviews[0].url, 'https://blog.naver.com/msql/1001');
  assert.equal(snapshots[0].reviews[0].author, '원문 작성자');
  assert.equal(snapshots[1].reviews[0].author, '원문에 기록된 테스트 블로그');
  assert.equal(snapshots[0].channels[0].fetchedCount, 3);
  assert.equal(snapshots[0].channels[0].matchedCount, 1);
  assert.ok(network.calls.every((call) => call.redirect === 'manual'));
});

test('classifies only an explicit author stance about the matching stock', async () => {
  const network = mockNetwork();
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
  const review = snapshot.reviews[0];
  assert.equal(review.sentiment, 'POSITIVE');
  assert.equal(review.evidence?.classification, 'explicit-stance-v1');
  assert.equal(review.publishedAt, '2020-10-24T06:00:00.000Z');
  assert.match(review.evidence!.contentHash, /^[a-f0-9]{64}$/);
  assert.ok(review.evidence!.excerpt.includes(review.evidence!.matchedAlias));
  assert.ok(review.evidence!.excerpt.length <= 120);
  assert.ok(review.evidence!.excerpt.split(/\s+/).length <= 18);
  assert.ok(!JSON.stringify(review).includes('<html>'));
});

test('explicit non-participation and a decision to wait are distinct from missing evidence', async () => {
  for (const [text, expected] of [
    ['저는 아이엠스팩 청약에 참여하지 않겠습니다.', 'CAUTION'],
    ['저는 아이엠스팩은 패스합니다.', 'CAUTION'],
    ['저는 아이엠스팩은 판단을 보류합니다.', 'NEUTRAL'],
    ['아이엠스팩은 좋은 회사라는 분석입니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩이 좋아 보입니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩 경쟁률이 낮다면 참여합니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩에 참여하지 않을까 합니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩 청약에 참여할 계획이 없습니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩은 패스할 예정이 없습니다.', 'UNCLASSIFIED'],
    ['저는 아이엠스팩은 판단을 보류하지 않겠습니다.', 'UNCLASSIFIED'],
    ['전문가는 “저는 아이엠스팩은 참여합니다”라고 말했습니다.', 'UNCLASSIFIED'],
  ]) {
    const network = mockNetwork(xml('아이엠스팩 분석'), html(text));
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
    assert.equal(snapshot.reviews[0].sentiment, expected, text);
  }
});

test('bounds evidence with emoji and long source text without persisting the article', async () => {
  const network = mockNetwork(xml('아이엠스팩 분석'), html(`저는 아이엠스팩은 참여합니다. ${'추가 설명 😀 '.repeat(100)}`));
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
  const evidence = snapshot.reviews[0].evidence!;
  assert.ok(evidence.excerpt.length <= 120);
  assert.ok(evidence.excerpt.split(/\s+/).length <= 18);
  assert.ok(!/[\uD800-\uDBFF]$/.test(evidence.excerpt));
  assert.ok(evidence.excerpt.includes(evidence.matchedAlias));
  assert.ok(JSON.stringify(snapshot).length < 4000);
});

test('does not transfer a later company stance to the target, even if only one IPO is requested', async () => {
  const network = mockNetwork(xml('아이엠스팩과 멜콘'), fixture('multi-stock.html'));
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
  assert.equal(snapshot.reviews[0].sentiment, 'UNCLASSIFIED');
});

test('rejects multi-company paragraphs and inverse negation instead of guessing sentiment', async () => {
  for (const body of [fixture('multi-stock.html'), fixture('negation.html'), html('저는 아이엠스팩과 멜콘 청약에 참여합니다.')]) {
    const network = mockNetwork(xml('아이엠스팩 청약'), body);
    const [snapshot] = await collectReviewsForIpos([iam, melcon], { channels: [channel], now, fetcher: network.fetcher });
    assert.equal(snapshot.reviews[0].sentiment, 'UNCLASSIFIED');
  }
});

test('later contradictory or corrected stances do not leave the earlier opinion classified', async () => {
  for (const text of [
    '저는 아이엠스팩은 참여합니다. 하지만 최종 결정은 청약하지 않겠습니다.',
    '저는 아이엠스팩은 패스합니다. 이후 판단을 바꿔 청약에 참여합니다.',
    '저는 아이엠스팩은 판단을 보류합니다. 최종적으로는 청약합니다.',
    `저는 아이엠스팩은 참여합니다. ${'확인할 세부 조건이 있습니다. '.repeat(15)}정정합니다. 청약하지 않겠습니다.`,
  ]) {
    const network = mockNetwork(xml('아이엠스팩 분석'), html(text));
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
    assert.equal(snapshot.reviews[0].sentiment, 'UNCLASSIFIED', text);
    assert.equal(snapshot.reviews[0].evidence?.classification, 'unclassified');
  }
});

test('only article content paragraphs contribute: navigation and script stances are ignored', async () => {
  const network = mockNetwork(xml('아이엠스팩 분석'), '<nav>저는 아이엠스팩은 참여합니다.</nav><script>"저는 아이엠스팩은 참여합니다."</script><div class="se-main-container"><p>아이엠스팩 공모 조건을 살펴봅니다.</p></div>');
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
  assert.equal(snapshot.reviews[0].sentiment, 'UNCLASSIFIED');
});

test('invalid, stale, future and post-subscription publication dates do not become reviews', async () => {
  for (const date of ['not-a-date', '2020-02-30T00:00:00Z', '30 Feb 2020 00:00:00 +0900', 'Fri, 25 Sep 2020 15:00:00 +0900', 'Mon, 26 Oct 2020 15:00:00 +0900', 'Tue, 27 Oct 2020 15:00:00 +0900']) {
    const network = mockNetwork(xml('아이엠스팩 분석', '아이엠스팩 관련 내용', date));
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
    assert.equal(snapshot.reviews.length, 0, date);
    assert.equal(network.calls.length, 1);
  }
  const boundary = mockNetwork(xml('아이엠스팩 분석', '아이엠스팩 관련 내용', 'Sat, 26 Sep 2020 00:00:00 +0900'));
  assert.equal((await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: boundary.fetcher }))[0].reviews.length, 1);
});

test('an empty actual RSS is reported as empty with zero items and no synthetic reviews', async () => {
  const network = mockNetwork(fixture('empty.xml'));
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
  assert.equal(snapshot.status, 'empty');
  assert.equal(snapshot.channels[0].status, 'empty');
  assert.equal(snapshot.channels[0].fetchedCount, 0);
  assert.deepEqual(snapshot.reviews, []);
});

test('404 and transport timeouts are failures rather than successful zero-item collections', async () => {
  const missing = (async () => new Response('missing', { status: 404 })) as typeof fetch;
  const [failed] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: missing });
  assert.equal(failed.status, 'failed');
  assert.match(failed.channels[0].error!, /404/);
  const neverResolves = (() => new Promise<Response>(() => {})) as typeof fetch;
  const [timeout] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: neverResolves, timeoutMs: 15 });
  assert.equal(timeout.status, 'failed');
  assert.match(timeout.channels[0].error!, /시간/);
});

test('one failed channel produces a partial snapshot while successful evidence remains', async () => {
  const network = mockNetwork();
  const second = { ...channel, id: 'missing-channel', feedUrl: 'https://rss.blog.naver.com/missing.xml' };
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel, second], now, fetcher: network.fetcher });
  assert.equal(snapshot.status, 'partial');
  assert.equal(snapshot.reviews.length, 1);
  assert.equal(snapshot.channels[1].status, 'failed');
});

test('rejects private hosts, credentials, ports and lookalike RSS hosts before fetching', async () => {
  for (const feedUrl of ['http://127.0.0.1/rss', 'https://127.0.0.1/rss', 'https://rss.blog.naver.com.evil.test/msql.xml', 'https://user:secret@rss.blog.naver.com/msql.xml', 'https://rss.blog.naver.com:8443/msql.xml', 'https://rss.blog.naver.com/msql.xml?url=http://localhost']) {
    const network = mockNetwork();
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [{ ...channel, feedUrl }], now, fetcher: network.fetcher });
    assert.equal(snapshot.status, 'failed', feedUrl);
    assert.equal(network.calls.length, 0, feedUrl);
  }
});

test('a malicious feed redirect is checked before any follow-up request', async () => {
  const calls: string[] = [];
  const fetcher = (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' } });
  }) as typeof fetch;
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher });
  assert.equal(snapshot.status, 'failed');
  assert.equal(calls.length, 1);
});

test('ignores article URLs outside the feed blog, including same-platform impersonation', async () => {
  for (const url of ['https://blog.naver.com/another_author/1001', 'https://blog.naver.com.evil.test/msql/1001', 'https://localhost/1001', 'javascript:alert(1)']) {
    const network = mockNetwork(xml('아이엠스팩 분석', '아이엠스팩 관련 내용', undefined, url));
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher: network.fetcher });
    assert.equal(snapshot.reviews.length, 0, url);
    assert.equal(network.calls.length, 1, url);
  }
});

test('an unsafe article redirect cannot cause an external fetch or invented stance', async () => {
  const calls: string[] = [];
  const fetcher = (async (input: string | URL | Request) => {
    const url = String(input); calls.push(url);
    return url === channel.feedUrl ? new Response(xml('아이엠스팩 분석')) : new Response(null, { status: 302, headers: { location: 'https://evil.test/article' } });
  }) as typeof fetch;
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher });
  assert.equal(snapshot.status, 'partial');
  assert.equal(snapshot.reviews[0].sentiment, 'UNCLASSIFIED');
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => !url.includes('evil.test')));
});

test('caps declared and streamed response bytes and rejects XML entity declarations', async () => {
  for (const response of [
    new Response('small', { headers: { 'content-length': String(1024 * 1024 + 1) } }),
    new Response('x'.repeat(1024 * 1024 + 1)),
    new Response('<?xml version="1.0"?><!DOCTYPE rss [<!ENTITY x "huge">]><rss><channel><title>&x;</title></channel></rss>'),
  ]) {
    const fetcher = (async () => response) as typeof fetch;
    const [snapshot] = await collectReviewsForIpos([iam], { channels: [channel], now, fetcher });
    assert.equal(snapshot.status, 'failed');
    assert.equal(snapshot.reviews.length, 0);
  }
});

test('supports a same-blog Tistory numeric article and never uses the configured display name as author', async () => {
  const tistory = { ...channel, id: 'tistory', url: 'https://example-blog.tistory.com', feedUrl: 'https://example-blog.tistory.com/rss' };
  const feed = xml('아이엠스팩 분석', '아이엠스팩 관련 내용', undefined, 'https://example-blog.tistory.com/123?category=1');
  const fetcher = (async (input: string | URL | Request) => String(input).endsWith('/rss') ? new Response(feed) : new Response('<div class="entry-content"><p>저는 아이엠스팩은 패스합니다.</p></div>')) as typeof fetch;
  const [snapshot] = await collectReviewsForIpos([iam], { channels: [tistory], now, fetcher });
  assert.equal(snapshot.reviews[0].url, 'https://example-blog.tistory.com/123');
  assert.equal(snapshot.reviews[0].author, '실제 RSS 제목');
  assert.equal(snapshot.reviews[0].sentiment, 'CAUTION');
});

test('inactive sources make no requests and invalid calendar dates fail the IPO snapshot', async () => {
  const network = mockNetwork();
  const [empty] = await collectReviewsForIpos([iam], { channels: [{ ...channel, isActive: false }], now, fetcher: network.fetcher });
  assert.equal(empty.status, 'empty');
  assert.equal(network.calls.length, 0);
  const [invalid] = await collectReviewsForIpos([{ ...iam, subscriptionStart: '2020-02-30' }], { channels: [], now, fetcher: network.fetcher });
  assert.equal(invalid.status, 'failed');
});
