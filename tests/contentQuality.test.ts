import assert from 'node:assert/strict';
import test from 'node:test';
import type { IpoItem } from '../src/types/ipo';
import { hasVerifiedForecast, isReviewedIpo, isSpecificOfficialSourceUrl } from '../src/lib/contentQuality';
import { calculateIpoScore, type ScoringInput } from '../src/lib/scoring';
import { analyzeIpoSentiment, getCollectedReviewsContext } from '../src/lib/sentimentAnalyzer';

const reviewedQuality: IpoItem['dataQuality'] = {
  status: 'reviewed',
  reviewedAt: '2020-01-01',
  sources: [{ title: '공식 공시 검토 테스트', url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20191231000001' }],
};

const complete: ScoringInput = {
  institutionalCompetitionRate: 1200,
  lockupCommitmentRate: 20,
  circulatingSupplyRate: 20,
  priceBandMin: 10000,
  priceBandMax: 12000,
  confirmedPrice: 12000,
  sentimentConsensus: { positiveRatio: 100, neutralRatio: 0, cautionRatio: 0 },
  dataQuality: reviewedQuality,
};

test('legacy records do not inherit reviewed status from complete numerical fields', () => {
  const legacy = { ...complete, dataQuality: undefined };
  assert.equal(isReviewedIpo(legacy), false);
  assert.equal(hasVerifiedForecast(legacy), false);
  assert.equal(calculateIpoScore(legacy).isPendingForecast, true);
  assert.equal(calculateIpoScore(legacy).score, 0);
});

test('review requires a dated editorial assertion and a specific official filing', () => {
  assert.equal(isReviewedIpo(complete), true);
  for (const reviewedAt of [undefined, 'not-a-date', '2020-02-30', '2099-01-01']) {
    assert.equal(isReviewedIpo({ dataQuality: { ...reviewedQuality!, reviewedAt } }), false);
  }
  assert.equal(isReviewedIpo({ dataQuality: { ...reviewedQuality!, sources: [] } }), false);
});

test('home/search pages and lookalike domains cannot provide official provenance', () => {
  for (const url of [
    'https://dart.fss.or.kr/',
    'https://dart.fss.or.kr/dsaf001/main.do',
    'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=00000000000000',
    'https://dart.fss.or.kr.evil.example/dsaf001/main.do?rcpNo=20191231000001',
    'http://dart.fss.or.kr/dsaf001/main.do?rcpNo=20191231000001',
    'https://www.youtube.com/results?search_query=ipo',
  ]) assert.equal(isSpecificOfficialSourceUrl(url), false, url);
  assert.equal(isSpecificOfficialSourceUrl('https://kind.krx.co.kr/common/disclsviewer.do?acptno=20191231000001'), true);
});

test('each missing or invalid forecast metric holds the whole score', () => {
  const invalid = [
    { institutionalCompetitionRate: 0 },
    { institutionalCompetitionRate: NaN },
    { lockupCommitmentRate: -1 },
    { lockupCommitmentRate: 101 },
    { circulatingSupplyRate: 0 },
    { circulatingSupplyRate: 101 },
    { priceBandMin: 0 },
    { priceBandMax: 9999 },
    { confirmedPrice: 0 },
  ];
  for (const change of invalid) {
    const result = calculateIpoScore({ ...complete, ...change });
    assert.equal(result.score, 0, JSON.stringify(change));
    assert.equal(result.isPendingForecast, true, JSON.stringify(change));
    assert.equal(Object.values(result.breakdown).every((value) => value === 0), true);
  }
});

test('disclosed zero lockup is valid and receives no artificial baseline', () => {
  const ipo = { ...complete, lockupCommitmentRate: 0 };
  assert.equal(hasVerifiedForecast(ipo), true);
  const result = calculateIpoScore(ipo);
  assert.equal(result.isPendingForecast, false);
  assert.equal(result.breakdown.lockupScore, 0);
  assert.equal(result.score, 71);
  assert.equal(result.basis, 'QUANTITATIVE');
  assert.equal(result.sampleSize, 0);
});

test('an upcoming IPO with reviewed forecast results can be scored', () => {
  const result = calculateIpoScore({ ...complete, status: 'UPCOMING' });
  assert.equal(result.isPendingForecast, false);
  assert.equal(result.score, 100);
  assert.equal(result.scoreGrade, 'S');
});

test('neither uncollected sentiment nor price above the band adds points', () => {
  const baseline = calculateIpoScore(complete);
  const changed = calculateIpoScore({ ...complete,
    confirmedPrice: 15000,
    sentimentConsensus: { positiveRatio: 0, neutralRatio: 0, cautionRatio: 100 },
  });
  assert.equal(changed.score, baseline.score);
  assert.equal(changed.breakdown.priceBonus, 0);
  assert.equal(changed.breakdown.sentimentScore, 0);
  assert.equal(changed.reviewSummary.positiveRatio, null);
});

test('competition threshold boundary changes only after the disclosed threshold', () => {
  assert.equal(calculateIpoScore({ ...complete, institutionalCompetitionRate: 899.99 }).breakdown.competitionScore, 30);
  assert.equal(calculateIpoScore({ ...complete, institutionalCompetitionRate: 900 }).breakdown.competitionScore, 35);
});

test('missing collected reviews never become attributed reviews or sentiment', async () => {
  assert.deepEqual(getCollectedReviewsContext('테스트기업'), { reviewsText: '', sourceReviews: [] });
  const unreviewed = await analyzeIpoSentiment({ name: '테스트기업' }, 'MANUAL_FORCE');
  assert.equal(unreviewed.publishable, false);
  assert.equal(unreviewed.llmUsed, false);
  assert.equal(unreviewed.aiScore, 0);
  assert.deepEqual(unreviewed.expertReviews, []);
  const reviewed = await analyzeIpoSentiment({ ...complete, name: '테스트기업' }, 'MANUAL_FORCE');
  assert.equal(reviewed.publishable, true);
  assert.deepEqual(reviewed.sentimentConsensus, { positiveRatio: null, neutralRatio: null, cautionRatio: null });
  assert.deepEqual(reviewed.expertReviews, []);
  assert.equal(reviewed.sampleSize, 0);
  assert.equal(reviewed.reviewSummary.neutralRatio, null);
  assert.equal(reviewed.basis, 'QUANTITATIVE');
  assert.deepEqual(reviewed.aiSummary.positivePoints, []);
  assert.equal(reviewed.aiSummary.bulletPoints.some((point) => point.includes('1200:1')), true);
});
