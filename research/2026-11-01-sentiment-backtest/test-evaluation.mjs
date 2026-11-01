import assert from 'node:assert/strict';
import test from 'node:test';
import { averageRanks, comparable, evaluate, positiveReturnAuc, spearman, weightedScore } from './evaluate.mjs';

test('rank statistics handle ties, constant scores and missing comparison classes', () => {
  assert.deepEqual(averageRanks([20, 10, 20]), [2.5, 1, 2.5]);
  assert.equal(spearman([1, 2, 3], [3, 2, 1]), -1);
  assert.equal(spearman([1, 1, 1], [1, 2, 3]), null);
  assert.equal(spearman([1, 2], [1, 2]), null);
  assert.equal(positiveReturnAuc([1, 2, 3], [-1, 0, 1]), 1);
  assert.equal(positiveReturnAuc([1, 1], [-1, 1]), 0.5);
  assert.equal(positiveReturnAuc([1, 2], [1, 2]), null);
});

test('weight changes renormalize quantitative inputs and preserve no-sample fallback', () => {
  assert.equal(weightedScore(85, 15, { sampleSize: 1, positiveRatio: 1 }), 100);
  assert.equal(weightedScore(85, 30, { sampleSize: 1, positiveRatio: 1 }), 100);
  assert.equal(weightedScore(85, 30, { sampleSize: 1, positiveRatio: 0 }), 70);
  assert.equal(weightedScore(85, 30, { sampleSize: 0, positiveRatio: null }), 100);
  assert.equal(weightedScore(null, 15, { sampleSize: 1, positiveRatio: 1 }), null);
  assert.throws(() => weightedScore(85, 30, { sampleSize: 1, positiveRatio: null }));
});

test('all weight comparisons use the same validated records and keep manual labels separate', () => {
  const base = { metricProvenance: 'RECONSTRUCTED_D1_FILING', identityVerified: true, outcomeVerified: true,
    metricIdentityVerified: true, metricPublishedByCutoff: true,
    quantitativeRawScore: 70, openingReturn: 1, closingReturn: -1, cohort: 'OPERATING_COMPANY', automatic: { sampleSize: 0, positiveRatio: null } };
  assert.equal(comparable(base), true);
  assert.equal(comparable({ ...base, metricProvenance: 'MISSING' }), false);
  assert.equal(comparable({ ...base, metricPublishedByCutoff: false }), false);
  assert.equal(comparable({ ...base, metricIdentityVerified: false }), false);
  const records = [
    { ...base, id: 'a', manualReference: { sampleSize: 1, positiveRatio: 1 } },
    { ...base, id: 'b', manualReference: { sampleSize: 0, positiveRatio: null } },
    { ...base, id: 'c', identityVerified: false },
  ];
  const result = evaluate({ records, articles: [], universeAudit: records });
  assert.equal(result.coverage.reconstructedMetricAndOutcomeCases, 2);
  assert.equal(result.coverage.automaticPairedCases, 0);
  assert.equal(result.coverage.manualReferencePairedCases, 1);
  assert(result.operationalAutomatic.every(r => r.ids.join(',') === 'a,b'));
  assert(result.automaticPaired.every(r => r.n === 0 && r.openSpearman === null));
  assert(result.manualReferencePaired.every(r => r.ids.join(',') === 'a'));
});
