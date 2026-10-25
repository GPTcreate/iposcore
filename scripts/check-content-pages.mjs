import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';

const base = process.env.CONTENT_TEST_URL || 'http://127.0.0.1:3185';
assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Use a local preview, never production.');
const get = async (route) => {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200, route);
  return response.text();
};
const home = await get('/');
assert(home.includes('같은 경쟁률, 다른 청약 비용'));
assert(!home.includes('75/20/5'));
assert(!home.includes('data-ad-slot="1234567890"'));
assert(!home.includes('수요예측 대기 (기대주)'));
const api = JSON.parse(await get('/api/ipo'));
const source = fs.readFileSync('src/data/mockIpo.ts', 'utf8');
const marker = 'export const MOCK_IPOS: IpoItem[] = ';
const seed = JSON.parse(source.slice(source.indexOf(marker) + marker.length).trim().replace(/;$/, ''));
const ids = new Set(api.ipos.map(ipo => ipo.id));
for (const ipo of seed) assert(ids.has(ipo.id), `Registered company must remain accessible: ${ipo.id}`);
assert(api.ipos.length >= seed.length, 'Initial data is a minimum, never a cap.');
const isSafePublic = ipo => ipo.expertReviews.every(review => review.evidence?.contentHash && review.url.startsWith('https://'));
assert(api.ipos.every(isSafePublic), 'Only actual collected evidence may be attributed as external reviews.');
assert(api.ipos.some(ipo => ipo.aiScore > 0), 'Core scoring cannot be globally hidden by missing editorial flags.');
const liveReviews = api.ipos.find(ipo => ipo.id === 'iam-spac1');
assert(liveReviews?.expertReviews.length > 0, 'Actual saved D-1 evidence must survive loading.');
assert.equal(liveReviews.confirmedPrice, 2000);
assert.equal(liveReviews.aiScore, 53, 'Use the corrected official inputs, not the old assumed score.');
assert.equal(liveReviews.depositRatePercent, 100);
assert.equal(liveReviews.sentimentConsensus.positiveRatio, null, 'An unclassified sample is not positive 0%.');
const incomplete = api.ipos.find(ipo => ipo.confirmedPrice > 0 && ipo.pendingForecastFields?.includes('lockupCommitmentRate'));
if (incomplete) {
  assert.equal(incomplete.aiScore, 0, 'An unannounced zero commitment must not produce a score.');
  const page = await get(`/ipo/${incomplete.id}`);
  assert(/name="robots" content="[^"]*noindex/.test(page));
  const $ = load(page);
  const commitment = $('dt').filter((_, node) => $(node).text().includes('의무보유확약 비율')).next('dd').text();
  assert.equal(commitment, '결과 확인 중');
}
for (const headers of [{ 'x-vercel-cron': '1' }, { 'x-admin-key': 'unconfigured-test-key' }]) {
  const response = await fetch(`${base}/api/ipo`, { headers });
  const data = await response.json();
  assert(data.ipos.every(isSafePublic));
  assert.equal(data.customCount, undefined, 'Forged credentials cannot obtain administrator-only metadata.');
}
const held = await get('/ipo/al-robot');
assert(!/name="robots" content="[^"]*noindex/.test(held));
assert(held.includes('id="ipo-schedule"'));
assert(held.includes('id="ipo-calculator"'));
assert(!held.includes('공모가 2,000원!'));
assert(!held.includes('data-ad-slot'));
const detail = await get('/ipo/iam-spac1');
assert(detail.includes('id="blog-reviews"'));
for (const review of liveReviews.expertReviews) assert(detail.includes(review.url), 'Saved original must render in the lower detail panel.');
assert(detail.includes('의견 미분류'));
assert(!/name="robots" content="[^"]*noindex/.test(detail));
assert(!detail.includes('원금 및 연복리 반환예치 이자가 보장'));
assert(detail.includes('53'));
assert(detail.includes('링크 복사'));
assert(detail.includes('주관사'));
for (const route of ['/api/reviews/collect?key=fake', '/api/reviews/channels?key=fake']) {
  const response = await fetch(`${base}${route}`, { method: route.includes('collect') ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-vercel-cron': '1' }, body: route.includes('collect') ? '{}' : undefined });
  assert.equal(response.status, 401);
}
const alias = await fetch(`${base}/ipo/469272`, { redirect: 'manual' });
assert.equal(alias.status, 308);
assert.equal(alias.headers.get('location'), '/ipo/iam-spac1');
assert.equal((await fetch(`${base}/ipo/unknown-nonexistent-record`)).status, 404);
const sitemap1 = await get('/sitemap.xml');
const sitemap2 = await get('/sitemap.xml');
assert.equal(sitemap1, sitemap2, 'lastmod must not change merely because the page was requested.');
assert(sitemap1.includes('/research/iam-spac1-float'));
assert(sitemap1.includes('/methodology'));
assert(sitemap1.includes('/ipo/iam-spac1'));
assert(sitemap1.includes('/ipo/al-robot'));
for (const ipo of seed) assert(sitemap1.includes(`/ipo/${ipo.id}`));
assert(!sitemap1.includes('Invalid Date'));
assert(!sitemap1.includes('<loc>https://iposcore.kr'));
const rss = await get('/rss.xml');
assert(rss.includes('/ipo/iam-spac1'));
assert(rss.includes('/ipo/al-robot'));
assert(!rss.includes('Invalid Date'));
const guides = await get('/guides');
const queue = [...new Set(Array.from(`${home}${guides}`.matchAll(/href="(\/[^"?#]*)/g), ([, route]) => route))];
const pageRoutes = queue.filter((route) => !route.startsWith('/_next/') && !route.startsWith('/api/') && !/\.[a-z0-9]+$/i.test(route));
for (const route of pageRoutes) {
  const html = await get(route);
  if (!route.endsWith('.xml')) assert(html.includes('https://www.iposcore.kr'), `Canonical missing: ${route}`);
}
assert(/name="robots" content="[^"]*noindex/.test(await get('/admin')));
console.log(`PASS: all ${seed.length} initial companies retained, uncapped listing, score/detail/calculator/reviews, auth boundary, metadata, redirects, 404, stable sitemap/RSS and ${pageRoutes.length} linked pages.`);
