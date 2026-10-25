import assert from 'node:assert/strict';
import test from 'node:test';
import type { IpoItem } from '../src/types/ipo';
import { getFieldEvidence, hasScorableForecast, hasScorableMetrics, hasVerifiedField, hasVerifiedForecast, isReviewedIpo, isSpecificOfficialSourceUrl, type FieldEvidenceMap } from '../src/lib/contentQuality';
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

test('registered valid metrics are calculable without inheriting verified provenance', () => {
  const legacy = { ...complete, dataQuality: undefined };
  assert.equal(isReviewedIpo(legacy), false);
  assert.equal(hasVerifiedForecast(legacy), false);
  assert.equal(hasScorableForecast(legacy), true);
  assert.equal(hasScorableMetrics(legacy), true);
  const result = calculateIpoScore(legacy);
  assert.equal(result.isPendingForecast, false);
  assert.equal(result.score, 100);
  assert.equal(result.isVerified, false);
  assert.equal(result.coverage.quantitative, true);
  assert.equal(result.coverage.verifiedQuantitative, false);
});

test('review requires a dated editorial assertion and a specific official filing', () => {
  assert.equal(isReviewedIpo(complete), true);
  for (const reviewedAt of [undefined, 'not-a-date', '2020-02-30', '2099-01-01', '2020-01-01T24:00:00Z']) {
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

test('each missing or invalid scoring metric holds the score without an invented baseline', () => {
  const invalid = [
    { institutionalCompetitionRate: 0 },
    { institutionalCompetitionRate: NaN },
    { lockupCommitmentRate: -1 },
    { lockupCommitmentRate: 101 },
    { circulatingSupplyRate: 0 },
    { circulatingSupplyRate: 101 },
  ];
  for (const change of invalid) {
    const result = calculateIpoScore({ ...complete, ...change });
    assert.equal(result.score, 0, JSON.stringify(change));
    assert.equal(result.isPendingForecast, true, JSON.stringify(change));
    assert.equal(Object.values(result.breakdown).every((value) => value === 0), true);
  }
});

test('price-band and confirmed-price fields do not gate a formula that never uses them', () => {
  for (const priceFields of [
    { priceBandMin: 0, priceBandMax: 0, confirmedPrice: 0 },
    { priceBandMin: 20000, priceBandMax: 10000, confirmedPrice: Number.NaN },
  ]) {
    const ipo = { ...complete, ...priceFields };
    assert.equal(hasScorableForecast(ipo), true);
    assert.equal(hasVerifiedForecast(ipo), true);
    assert.equal(calculateIpoScore(ipo).score, 100);
  }
  const minimal = { institutionalCompetitionRate: 950, lockupCommitmentRate: 12, circulatingSupplyRate: 27 };
  assert.equal(calculateIpoScore(minimal).score, 79);
  assert.equal(calculateIpoScore(minimal).isVerified, false);
});

const fieldSource = {
  sourceTitle: '수요예측 결과 공시 확인 테스트',
  sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20191231000001',
  checkedAt: '2020-01-01T00:00:00Z',
};

test('all three scoring fields can be verified individually without marking the whole record reviewed', () => {
  const fieldEvidence: FieldEvidenceMap = {
    institutionalCompetitionRate: fieldSource, lockupCommitmentRate: fieldSource, circulatingSupplyRate: fieldSource,
  };
  const ipo = { ...complete, dataQuality: undefined, fieldEvidence };
  assert.equal(isReviewedIpo(ipo), false);
  assert.equal(hasVerifiedField(ipo, 'institutionalCompetitionRate'), true);
  assert.equal(hasVerifiedForecast(ipo), true);
  assert.equal(calculateIpoScore(ipo).isVerified, true);
  assert.equal(hasVerifiedField(ipo, 'confirmedPrice'), false);
  assert.equal(getFieldEvidence(ipo, 'confirmedPrice'), undefined);
  assert.equal(hasVerifiedForecast({ ...ipo, fieldEvidence: { institutionalCompetitionRate: fieldSource, lockupCommitmentRate: fieldSource } }), false);
  assert.equal(hasVerifiedForecast({ ...ipo, institutionalCompetitionRate: 0 }), false);
});

test('1266.52 competition, zero lockup and 95.42 float produce 53 with independent field verification', async () => {
  // Reproducible scoring fixture. Source verification is an explicit assertion
  // here, not a live fetch or a claim that the fixture's URL verifies these values.
  const metrics = { institutionalCompetitionRate: 1266.52, lockupCommitmentRate: 0, circulatingSupplyRate: 95.42 };
  const registered = calculateIpoScore(metrics);
  assert.equal(registered.quantitativeRawScore, 45);
  assert.equal(registered.score, 53);
  assert.equal(registered.isVerified, false);
  assert.equal(registered.isPendingForecast, false);
  const fieldEvidence = { institutionalCompetitionRate: fieldSource, lockupCommitmentRate: fieldSource, circulatingSupplyRate: fieldSource };
  const verified = calculateIpoScore({ ...metrics, fieldEvidence });
  assert.equal(verified.score, 53);
  assert.equal(verified.isVerified, true);
  assert.equal(verified.coverage.verifiedQuantitative, true);
  const summary = await analyzeIpoSentiment({ ...metrics, fieldEvidence, name: '산식 테스트' }, 'MANUAL_FORCE');
  assert.equal(summary.aiScore, 53);
  assert.equal(summary.isVerified, true);
  assert.equal(summary.aiSummary.bulletPoints.some((point) => point.includes('공시 확인') && point.includes('1266.52')), true);
  assert.equal(summary.aiSummary.bulletPoints.some((point) => point.includes('공모가')), false);
});

test('field evidence needs a specific official source, a real check timestamp, and a valid field value', () => {
  for (const change of [
    { sourceTitle: '' }, { sourceUrl: 'https://dart.fss.or.kr/' },
    { sourceUrl: 'https://dart.fss.or.kr.evil.example/dsaf001/main.do?rcpNo=20191231000001' },
    { checkedAt: 'not-a-date' }, { checkedAt: '2020-02-30T00:00:00Z' },
    { checkedAt: '2020-01-01T24:00:00Z' }, { checkedAt: '2099-01-01T00:00:00Z' },
    { checkedAt: '2020-01-01' },
  ]) {
    const ipo = { ...complete, dataQuality: undefined, fieldEvidence: { institutionalCompetitionRate: { ...fieldSource, ...change } } };
    assert.equal(getFieldEvidence(ipo, 'institutionalCompetitionRate'), undefined, JSON.stringify(change));
    assert.equal(hasVerifiedField(ipo, 'institutionalCompetitionRate'), false, JSON.stringify(change));
  }
  const dates = { subscriptionStart: '2030-01-01', fieldEvidence: { subscriptionStart: fieldSource } };
  assert.equal(hasVerifiedField(dates, 'subscriptionStart'), true);
  assert.equal(hasVerifiedField({ ...dates, subscriptionStart: '2030-02-30' }, 'subscriptionStart'), false);
  assert.equal(hasVerifiedField({ ...dates, subscriptionStart: '' }, 'subscriptionStart'), false);
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
