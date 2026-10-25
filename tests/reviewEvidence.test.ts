import assert from 'node:assert/strict';
import test from 'node:test';
import type { ExpertReview, IpoItem } from '../src/types/ipo';
import type { ReviewSnapshot } from '../src/types/reviews';
import { canonicalizeReviewUrl, getCollectedReviews, summarizeReviews } from '../src/lib/reviewEvidence';
import { calculateIpoScore } from '../src/lib/scoring';
import { analyzeIpoSentiment, getCollectedReviewsContext } from '../src/lib/sentimentAnalyzer';

const now = new Date('2020-01-03T12:00:00Z');
const identity = { id: 'test-ipo', name: '테스트기업', subscriptionStart: '2020-01-03' };

function article(blog = 'writer1', sentiment: ExpertReview['sentiment'] = 'POSITIVE', changes: Partial<ExpertReview> = {}): ExpertReview {
  return {
    id: blog + '-article', sourceType: 'BLOG', author: blog,
    title: '테스트기업 청약 검토', url: 'https://blog.naver.com/' + blog + '/222000000001',
    publishedAt: '2020-01-02T00:00:00Z', sentiment, summary: '원문 짧은 발췌',
    evidence: {
      feedUrl: 'https://rss.blog.naver.com/' + blog + '.xml', fetchedAt: '2020-01-03T01:00:00Z',
      contentHash: 'a'.repeat(64), matchedAlias: '테스트기업', excerpt: '저는 테스트기업 공모주에 청약하겠습니다.',
      classification: sentiment === 'UNCLASSIFIED' ? 'unclassified' : 'explicit-stance-v1',
    },
    ...changes,
  };
}

function snapshot(reviews: ExpertReview[], changes: Partial<ReviewSnapshot> = {}): ReviewSnapshot {
  return {
    ipoId: identity.id, stockName: identity.name, subscriptionStart: identity.subscriptionStart,
    collectedAt: '2020-01-03T02:00:00Z', status: 'success', reviews,
    channels: [{ channelId: 'test-channel', feedUrl: 'https://rss.blog.naver.com/writer1.xml',
      status: 'success', fetchedCount: reviews.length, matchedCount: reviews.length }],
    ...changes,
  };
}

function collected(reviews: ExpertReview[], changes: Partial<ReviewSnapshot> = {}): Partial<IpoItem> {
  return { ...identity, reviewCollection: snapshot(reviews, changes) };
}

const forecast = {
  institutionalCompetitionRate: 1200, lockupCommitmentRate: 20, circulatingSupplyRate: 20,
  priceBandMin: 10000, priceBandMax: 12000, confirmedPrice: 12000,
  sentimentConsensus: { positiveRatio: 100, neutralRatio: 0, cautionRatio: 0 },
  dataQuality: { status: 'reviewed' as const, reviewedAt: '2020-01-01',
    sources: [{ title: '공식 공시 검토 테스트', url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20191231000001' }] },
};

test('legacy attributed reviews and percentages never become collected evidence', () => {
  const legacy = { ...identity, expertReviews: [article()], sentimentConsensus: { positiveRatio: 100, neutralRatio: 0, cautionRatio: 0 } };
  assert.deepEqual(getCollectedReviews(legacy, now), []);
  assert.equal(summarizeReviews(legacy, now).positiveRatio, null);
});

test('no classified sample is distinct from a genuinely neutral sample', () => {
  const unclassified = summarizeReviews(collected([article('writer1', 'UNCLASSIFIED')]), now);
  assert.equal(unclassified.totalReviews, 1);
  assert.equal(unclassified.sampleSize, 0);
  assert.equal(unclassified.unclassifiedCount, 1);
  assert.equal(unclassified.neutralRatio, null);
  const neutral = summarizeReviews(collected([article('writer1', 'NEUTRAL')]), now);
  assert.equal(neutral.sampleSize, 1);
  assert.equal(neutral.neutralCount, 1);
  assert.equal(neutral.neutralRatio, 100);
  assert.equal(neutral.positiveRatio, 0);
});

test('snapshot identity includes the exact IPO, name and subscription schedule', () => {
  for (const changes of [{ ipoId: 'another-ipo' }, { stockName: '다른기업' }, { subscriptionStart: '2019-01-03' }]) {
    assert.deepEqual(getCollectedReviews(collected([article()], changes), now), [], JSON.stringify(changes));
  }
});

test('only supported canonical blog articles with same-publisher feeds count', () => {
  for (const url of [
    'https://blog.naver.com/writer1', 'https://search.naver.com/search.naver?query=테스트기업',
    'https://www.youtube.com/watch?v=123', 'https://blog.naver.com.evil.example/writer1/222000000001',
    'http://blog.naver.com/writer1/222000000001', 'https://writer1.tistory.com/search/테스트기업',
  ]) assert.deepEqual(getCollectedReviews(collected([article('writer1', 'POSITIVE', { url })]), now), [], url);
  const wrongFeed = article();
  wrongFeed.evidence!.feedUrl = 'https://rss.blog.naver.com/anotherwriter.xml';
  assert.deepEqual(getCollectedReviews(collected([wrongFeed]), now), []);
  assert.equal(canonicalizeReviewUrl('https://m.blog.naver.com/writer1/222000000001?tracking=1'), 'https://blog.naver.com/writer1/222000000001');
  assert.equal(canonicalizeReviewUrl('https://blog.naver.com/PostView.naver?blogId=writer1&logNo=222000000001'), 'https://blog.naver.com/writer1/222000000001');
  const tistory = article('writer2', 'UNCLASSIFIED', { url: 'https://writer2.tistory.com/entry/test-ipo?tracking=1' });
  tistory.evidence!.feedUrl = 'https://writer2.tistory.com/rss';
  assert.equal(getCollectedReviews(collected([tistory]), now)[0].url, 'https://writer2.tistory.com/entry/test-ipo');
});

test('missing hash, alias mismatch and another company article are rejected', () => {
  const invalid: ExpertReview[] = [];
  for (const hash of ['', 'not-a-hash', 'a'.repeat(63)]) {
    const review = article(); review.evidence!.contentHash = hash; invalid.push(review);
  }
  const otherStock = article('writer1', 'POSITIVE', { title: '다른기업 청약 검토' });
  otherStock.evidence!.matchedAlias = '다른기업';
  otherStock.evidence!.excerpt = '저는 다른기업에 청약합니다.';
  invalid.push(otherStock);
  const absentAlias = article('writer1', 'POSITIVE', { title: '다른기업 청약 검토' });
  absentAlias.evidence!.excerpt = '저는 다른기업에 청약합니다.';
  invalid.push(absentAlias);
  invalid.push(article('writer1', 'POSITIVE', { evidence: undefined }));
  for (const review of invalid) assert.deepEqual(getCollectedReviews(collected([review]), now), []);
});

test('SPAC aliases allow actual punctuation but not unrelated issuer names', () => {
  const spac = article('writer1', 'UNCLASSIFIED', { title: '아이엠 스팩 청약 안내' });
  spac.evidence!.matchedAlias = '아이엠 스팩';
  spac.evidence!.excerpt = '아이엠 스팩 청약 조건을 확인합니다.';
  const ipo = { ...collected([]), name: '아이엠기업인수목적1호' };
  ipo.reviewCollection = { ...snapshot([spac]), stockName: ipo.name };
  assert.equal(getCollectedReviews(ipo, now).length, 1);
  spac.evidence!.matchedAlias = '삼성스팩';
  spac.evidence!.excerpt = '삼성스팩 청약 조건을 확인합니다.';
  assert.equal(getCollectedReviews(ipo, now).length, 0);
});

test('a short company name cannot match the prefix of another company or a joined prefix', () => {
  const review = article('writer1', 'UNCLASSIFIED', { title: '영광와이케이엠씨 청약 검토' });
  review.evidence!.matchedAlias = '영광';
  review.evidence!.excerpt = '영광와이케이엠씨 공모주를 확인합니다.';
  const ipo = { ...collected([]), name: '영광', reviewCollection: { ...snapshot([review]), stockName: '영광' } };
  assert.equal(getCollectedReviews(ipo, now).length, 0);
  review.title = '신영광 청약';
  review.evidence!.excerpt = '신영광 공모주를 확인합니다.';
  assert.equal(getCollectedReviews(ipo, now).length, 0);
  review.title = '영광와이케이엠씨와 별도로 영광 청약 분석';
  review.evidence!.excerpt = '영광은 청약 조건을 확인합니다.';
  assert.equal(getCollectedReviews(ipo, now).length, 1);
  review.title = '영광청약 분석';
  assert.equal(getCollectedReviews(ipo, now).length, 1);
});

test('a generic SPAC alias cannot transfer another numbered offering into this snapshot', () => {
  const review = article('writer1', 'UNCLASSIFIED');
  review.evidence!.matchedAlias = '아이엠스팩';
  const ipo = { ...collected([]), name: '아이엠기업인수목적1호',
    reviewCollection: { ...snapshot([review]), stockName: '아이엠기업인수목적1호' } };
  for (const wrongName of ['아이엠스팩2호', '아이엠스팩11호', '아이엠 스팩 제2호', '아이엠스팩 2']) {
    review.title = wrongName + ' 청약';
    review.evidence!.excerpt = wrongName + '의 공시를 확인합니다.';
    assert.equal(getCollectedReviews(ipo, now).length, 0, wrongName);
  }
  review.title = '아이엠 스팩 1호청약';
  review.evidence!.excerpt = '아이엠 스팩 1호 청약 조건';
  assert.equal(getCollectedReviews(ipo, now).length, 1);
});

test('invalid calendar dates, future evidence and dates outside this offering window are rejected', () => {
  for (const publishedAt of ['2020-02-30', 'not-a-date', '2020-01-02T25:00:00Z', '2020-01-04', '2019-12-03']) {
    assert.deepEqual(getCollectedReviews(collected([article('writer1', 'POSITIVE', { publishedAt })]), now), [], publishedAt);
  }
  const futureFetch = article(); futureFetch.evidence!.fetchedAt = '2020-01-04T00:00:00Z';
  assert.deepEqual(getCollectedReviews(collected([futureFetch]), now), []);
  const afterFetch = article('writer1', 'POSITIVE', { publishedAt: '2020-01-03T01:30:00Z' });
  assert.deepEqual(getCollectedReviews(collected([afterFetch]), now), []);
  assert.deepEqual(getCollectedReviews(collected([article()], { collectedAt: '2020-02-30T00:00:00Z' }), now), []);
  assert.deepEqual(getCollectedReviews(collected([article()], { collectedAt: '2020-01-04T00:00:00Z' }), now), []);
  assert.equal(getCollectedReviews(collected([article('writer1', 'POSITIVE', { publishedAt: '2019-12-04' })]), now).length, 1);
  const impossibleSubscription = collected([article()]);
  impossibleSubscription.subscriptionStart = '2020-02-30';
  impossibleSubscription.reviewCollection!.subscriptionStart = '2020-02-30';
  assert.deepEqual(getCollectedReviews(impossibleSubscription, now), []);
});

test('canonical duplicates are displayed once and each blog supplies only its latest consensus', () => {
  const older = article();
  const duplicate = article('writer1', 'POSITIVE', { url: 'https://m.blog.naver.com/writer1/222000000001?ref=feed' });
  duplicate.evidence!.fetchedAt = '2020-01-03T01:30:00Z';
  const newer = article('writer1', 'CAUTION', { author: '다른작성자', url: 'https://blog.naver.com/writer1/222000000002', publishedAt: '2020-01-02T12:00:00Z' });
  const ipo = collected([older, duplicate, newer]);
  assert.equal(getCollectedReviews(ipo, now).length, 2);
  const summary = summarizeReviews(ipo, now);
  assert.equal(summary.totalReviews, 2);
  assert.equal(summary.sampleSize, 1);
  assert.equal(summary.cautionCount, 1);
  assert.equal(summary.positiveCount, 0);
});

test('the full offering window uses Korean midnight, even when RSS dates are normalized to UTC', () => {
  const atBoundary = (publishedAt: string) => {
    const review = article('writer1', 'POSITIVE', { publishedAt });
    review.evidence!.fetchedAt = '2020-01-04T00:00:00Z';
    return getCollectedReviews(collected([review], { collectedAt: '2020-01-04T00:30:00Z' }), new Date('2020-01-04T01:00:00Z'));
  };
  // Jan 3 00:00 KST minus 30 days = Dec 3 15:00 UTC.
  assert.equal(atBoundary('2019-12-03T14:59:59.999Z').length, 0);
  assert.equal(atBoundary('2019-12-03T15:00:00.000Z').length, 1);
  // Jan 3 23:59:59.999 KST is the last valid instant, not UTC midnight.
  assert.equal(atBoundary('2020-01-03T14:59:59.999Z').length, 1);
  assert.equal(atBoundary('2020-01-03T15:00:00.000Z').length, 0);
  assert.equal(atBoundary('2020-01-04T08:00:00+09:00').length, 0);
});

test('unclassified is never silently neutral or an older resurrected stance', () => {
  const unclassified = article('writer1', 'UNCLASSIFIED', {
    url: 'https://blog.naver.com/writer1/222000000002', publishedAt: '2020-01-02T12:00:00Z',
  });
  assert.equal(summarizeReviews(collected([article(), unclassified]), now).sampleSize, 0);
  const forgedPositive = article(); forgedPositive.evidence!.classification = 'unclassified';
  assert.equal(getCollectedReviews(collected([forgedPositive]), now)[0].sentiment, 'UNCLASSIFIED');
  assert.equal(summarizeReviews(collected([forgedPositive]), now).positiveRatio, null);
});

test('failed refresh keeps original evidence visible but contributes no current consensus', () => {
  const ipo = collected([article()], { status: 'failed', channels: [] });
  assert.equal(getCollectedReviews(ipo, now).length, 1);
  const summary = summarizeReviews(ipo, now);
  assert.equal(summary.stale, true);
  assert.equal(summary.totalReviews, 1);
  assert.equal(summary.sampleSize, 0);
  assert.equal(summary.positiveCount, 0);
  assert.equal(summary.positiveRatio, null);
  assert.equal(summarizeReviews(collected([article()], { status: 'partial' }), now).sampleSize, 1);
});

test('review contribution comes from classified collected evidence, excluding unclassified denominator', () => {
  const ipo = { ...forecast, ...collected([
    article('writer1', 'POSITIVE'), article('writer2', 'NEUTRAL'), article('writer3', 'CAUTION'), article('writer4', 'UNCLASSIFIED'),
  ]) };
  const result = calculateIpoScore(ipo);
  assert.equal(result.basis, 'COMBINED');
  assert.equal(result.sampleSize, 3);
  assert.equal(result.quantitativeRawScore, 85);
  assert.equal(result.quantitativeScore, 100);
  assert.ok(Math.abs(result.breakdown.sentimentScore - 5) < 0.0001);
  assert.equal(result.score, 90);
  assert.equal(result.coverage.collectedReviews, 4);
  assert.equal(result.reviewSummary.unclassifiedCount, 1);
  const neutral = calculateIpoScore({ ...forecast, ...collected([article('writer1', 'NEUTRAL')]) });
  assert.equal(neutral.basis, 'COMBINED');
  assert.equal(neutral.score, 85);
  const absent = calculateIpoScore({ ...forecast, ...collected([]) });
  assert.equal(absent.basis, 'QUANTITATIVE');
  assert.equal(absent.score, 100);
  assert.equal(absent.sampleSize, 0);
});

test('partial refresh displays retained failed-channel articles but counts only successful channels', async () => {
  const ipo = { ...forecast, ...identity, ...collected([
    article('writer1', 'CAUTION'), article('writer2', 'POSITIVE'), article('writer3', 'UNCLASSIFIED'),
  ], {
    status: 'partial',
    channels: [
      { channelId: 'failed', feedUrl: 'https://rss.blog.naver.com/writer1.xml', status: 'failed', fetchedCount: 0, matchedCount: 0 },
      { channelId: 'success', feedUrl: 'https://rss.blog.naver.com/writer2.xml', status: 'success', fetchedCount: 1, matchedCount: 1 },
      { channelId: 'unclassified', feedUrl: 'https://rss.blog.naver.com/writer3.xml', status: 'success', fetchedCount: 1, matchedCount: 1 },
    ],
  }) };
  assert.equal(getCollectedReviews(ipo, now).length, 3);
  const summary = summarizeReviews(ipo, now);
  assert.equal(summary.stale, true);
  assert.equal(summary.totalReviews, 3);
  assert.equal(summary.sampleSize, 1);
  assert.equal(summary.positiveCount, 1);
  assert.equal(summary.cautionCount, 0);
  assert.equal(summary.positiveRatio, 100);
  const score = calculateIpoScore(ipo);
  assert.equal(score.basis, 'COMBINED');
  assert.equal(score.breakdown.sentimentScore, 15);
  assert.equal(score.coverage.stale, true);
  const output = await analyzeIpoSentiment(ipo, 'MANUAL_FORCE');
  assert.match(output.aiSummary.riskPoints[0], /일부 채널/);
  assert.equal(output.sentimentConsensus.positiveRatio, 100);
});

test('real reviews do not verify registered metrics, and missing metrics still leave reviews available', async () => {
  const ipo = { ...identity, ...collected([article()]) };
  const result = calculateIpoScore({ ...forecast, ...ipo, dataQuality: undefined });
  assert.equal(result.basis, 'COMBINED');
  assert.equal(result.score, 100);
  assert.equal(result.isVerified, false);
  assert.equal(result.sampleSize, 1);
  assert.equal(result.coverage.quantitative, true);
  assert.equal(result.coverage.verifiedQuantitative, false);
  assert.equal(result.coverage.reviews, true);
  const output = await analyzeIpoSentiment(ipo, 'MANUAL_FORCE');
  assert.equal(output.publishable, true);
  assert.equal(output.basis, 'PENDING');
  assert.equal(output.aiScore, 0);
  assert.equal(output.expertReviews.length, 1);
  assert.equal(output.sentimentConsensus.positiveRatio, 100);
  assert.equal(output.llmUsed, false);
  assert.match(getCollectedReviewsContext(ipo).reviewsText, /https:\/\/blog\.naver\.com\/writer1/);
  const pending = calculateIpoScore({ ...forecast, ...ipo, institutionalCompetitionRate: 0 });
  assert.equal(pending.basis, 'PENDING');
  assert.equal(pending.score, 0);
  assert.equal(pending.sampleSize, 1);
});

test('a failed refresh excludes the preserved positive stance from the score', () => {
  const result = calculateIpoScore({ ...forecast, ...collected([article()], { status: 'failed' }) });
  assert.equal(result.basis, 'QUANTITATIVE');
  assert.equal(result.breakdown.sentimentScore, 0);
  assert.equal(result.reviewSummary.totalReviews, 1);
  assert.equal(result.coverage.stale, true);
});

test('analysis preserves null consensus when no explicit source stance is available', async () => {
  for (const reviews of [[], [article('writer1', 'UNCLASSIFIED')]]) {
    const output = await analyzeIpoSentiment({ ...identity, ...collected(reviews) }, 'MANUAL_FORCE');
    assert.deepEqual(output.sentimentConsensus, { positiveRatio: null, neutralRatio: null, cautionRatio: null });
    assert.equal(output.sampleSize, 0);
  }
  const measured = await analyzeIpoSentiment({ ...identity, ...collected([article('writer1', 'NEUTRAL')]) }, 'MANUAL_FORCE');
  assert.deepEqual(measured.sentimentConsensus, { positiveRatio: 0, neutralRatio: 100, cautionRatio: 0 });
});
