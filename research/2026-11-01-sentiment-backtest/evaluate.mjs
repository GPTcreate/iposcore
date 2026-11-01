import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function averageRanks(values) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);
  for (let first = 0; first < sorted.length;) {
    let end = first + 1;
    while (end < sorted.length && sorted[end].value === sorted[first].value) end++;
    const rank = (first + 1 + end) / 2;
    for (let i = first; i < end; i++) ranks[sorted[i].index] = rank;
    first = end;
  }
  return ranks;
}

export function spearman(x, y) {
  if (x.length !== y.length || x.length < 3) return null;
  const a = averageRanks(x), b = averageRanks(y), mean = (x.length + 1) / 2;
  const cross = a.reduce((sum, value, i) => sum + (value - mean) * (b[i] - mean), 0);
  const left = a.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  const right = b.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return left && right ? cross / Math.sqrt(left * right) : null;
}

export function positiveReturnAuc(scores, returns) {
  const positive = scores.filter((_, i) => returns[i] > 0);
  const negative = scores.filter((_, i) => returns[i] <= 0);
  if (!positive.length || !negative.length) return null;
  let points = 0;
  for (const p of positive) for (const n of negative) points += p > n ? 1 : p === n ? 0.5 : 0;
  return points / (positive.length * negative.length);
}

export function weightedScore(raw, weight, summary) {
  if (!Number.isFinite(raw) || raw < 0 || raw > 85) return null;
  if (![0, 15, 25, 30].includes(weight)) throw new Error('Undeclared weight');
  if (weight === 0 || !summary || summary.sampleSize === 0) return raw / 85 * 100;
  if (!Number.isInteger(summary.sampleSize) || summary.sampleSize < 1
    || !Number.isFinite(summary.positiveRatio) || summary.positiveRatio < 0 || summary.positiveRatio > 1) throw new Error('Invalid observed opinion sample');
  return raw * (100 - weight) / 85 + weight * summary.positiveRatio;
}

export function comparable(record) {
  return record.metricProvenance === 'RECONSTRUCTED_D1_FILING'
    && record.identityVerified === true && record.outcomeVerified === true
    && record.metricIdentityVerified === true && record.metricPublishedByCutoff === true
    && Number.isFinite(record.quantitativeRawScore) && record.quantitativeRawScore >= 0 && record.quantitativeRawScore <= 85 && Number.isFinite(record.openingReturn)
    && Number.isFinite(record.closingReturn);
}

function describe(records, summaryKey, weight) {
  const scores = records.map(record => weightedScore(record.quantitativeRawScore, weight, record[summaryKey]));
  const displayedScores = scores.map(score => Math.round(score));
  const open = records.map(record => record.openingReturn), close = records.map(record => record.closingReturn);
  return { weight, n: records.length,
    ids: records.map(record => record.id), scores,
    displayedScores,
    openSpearman: spearman(scores, open), closeSpearman: spearman(scores, close),
    displayedOpenSpearman: spearman(displayedScores, open), displayedCloseSpearman: spearman(displayedScores, close),
    openPositiveAuc: positiveReturnAuc(scores, open), closePositiveAuc: positiveReturnAuc(scores, close),
    positiveOpen: open.filter(x => x > 0).length, positiveClose: close.filter(x => x > 0).length };
}

export function evaluate(dataset) {
  const ready = dataset.records.filter(comparable);
  const automaticPaired = ready.filter(record => record.automatic.sampleSize > 0);
  const manualPaired = ready.filter(record => record.manualReference?.sampleSize > 0);
  const weights = [0, 15, 25, 30];
  const ordinary = ready.filter(record => record.cohort === 'OPERATING_COMPANY');
  const readyIds = new Set(ready.map(record => record.id));
  return {
    generatedAt: new Date().toISOString(), design: 'Retrospective reconstruction; descriptive only; no weight selected or deployed.',
    outcomeDefinition: 'Verified original offer price to exact listing-day provider opening/closing price; fees and allocation excluded.',
    strictArchivedPointInTimeSamples: 0,
    coverage: { auditedUniverse: dataset.universeAudit.length, dateIdentityCandidates: dataset.records.length,
      uniqueArticles: dataset.articles.length, reconstructedMetricAndOutcomeCases: ready.length,
      comparisonUniqueArticles: dataset.articles.filter(article => article.eligibleTargetIds?.some(id => readyIds.has(id))).length,
      comparisonArticleTargetLinks: ready.reduce((sum, record) => sum + (record.automatic.validArticles || 0), 0),
      automaticPairedCases: automaticPaired.length, manualReferencePairedCases: manualPaired.length },
    operationalAutomatic: weights.map(weight => describe(ready, 'automatic', weight)),
    operationalAutomaticParserOnly: weights.map(weight => describe(ready.filter(r => r.metricExtraction === 'PRODUCTION_PARSER'), 'automatic', weight)),
    operationalAutomaticOrdinary: weights.map(weight => describe(ordinary, 'automatic', weight)),
    automaticPaired: weights.map(weight => describe(automaticPaired, 'automatic', weight)),
    manualReferencePaired: weights.map(weight => describe(manualPaired, 'manualReference', weight)),
    manualReferenceOrdinary: weights.map(weight => describe(manualPaired.filter(r => r.cohort === 'OPERATING_COMPANY'), 'manualReference', weight)),
    limitations: [
      'Current pages were fetched after listing: unexposed later edits cannot be excluded.',
      'No preserved original D-1 fetch exists for these articles. Publication cutoff is not immutable historical content.',
      'Weight scenarios use the identical issuer set. Missing opinions retain the quantitative score, not an invented neutral score.',
      'Manual reference labels are diagnostic human readings, not the production classifier or independently validated ground truth.',
      'A narrow, small sample mixing SPACs and operating companies cannot establish predictive improvement.',
      'No chronological holdout or weight optimization was performed; no optimal weight is established.',
    ],
  };
}

const directory = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dataset = JSON.parse(fs.readFileSync(path.join(directory, 'dataset.json'), 'utf8'));
  const result = evaluate(dataset);
  fs.writeFileSync(path.join(directory, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  const rows = dataset.records.map(r => [r.id, r.name, r.cohort, r.subscriptionStart, r.metricProvenance,
    r.quantitativeRawScore, r.automatic.sampleSize, r.automatic.positiveRatio,
    r.manualReference?.sampleSize ?? '', r.manualReference?.positiveRatio ?? '', r.openingReturn, r.closingReturn]);
  const csv = [['id', 'name', 'cohort', 'subscription_start', 'metric_provenance', 'quantitative_raw', 'automatic_n', 'automatic_positive_ratio', 'manual_reference_n', 'manual_reference_positive_ratio', 'offer_to_open_pct', 'offer_to_close_pct'], ...rows]
    .map(row => row.map(value => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(',')).join('\n');
  fs.writeFileSync(path.join(directory, 'cases.csv'), '\uFEFF' + csv + '\n');
  console.log(JSON.stringify({ coverage: result.coverage, automatic: result.operationalAutomatic.map(({ ids, scores, displayedScores, ...r }) => r), manualReference: result.manualReferencePaired.map(({ ids, scores, displayedScores, ...r }) => r) }, null, 2));
}
