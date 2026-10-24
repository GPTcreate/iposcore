import assert from 'node:assert/strict';
import { isReviewedIpo } from '../src/lib/contentQuality.ts';

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
assert(api.ipos.every(isReviewedIpo), 'Public API may expose only reviewed records.');
for (const headers of [{ 'x-vercel-cron': '1' }, { 'x-admin-key': 'unconfigured-test-key' }]) {
  const response = await fetch(`${base}/api/ipo`, { headers });
  const data = await response.json();
  assert(data.ipos.every(isReviewedIpo), 'Forged headers must not expose pending records.');
}
const held = await get('/ipo/iam-spac1');
assert(/name="robots" content="[^"]*noindex/.test(held));
assert(/name="googlebot" content="[^"]*noindex/.test(held));
assert(!held.includes('공모가 2,000원!'));
assert(!held.includes('data-ad-slot'));
const alias = await fetch(`${base}/ipo/469272`, { redirect: 'manual' });
assert.equal(alias.status, 308);
assert.equal(alias.headers.get('location'), '/ipo/iam-spac1');
assert.equal((await fetch(`${base}/ipo/unknown-nonexistent-record`)).status, 404);
const sitemap1 = await get('/sitemap.xml');
const sitemap2 = await get('/sitemap.xml');
assert.equal(sitemap1, sitemap2, 'lastmod must not change merely because the page was requested.');
assert(sitemap1.includes('/research/iam-spac1-float'));
assert(sitemap1.includes('/methodology'));
assert(!sitemap1.includes('/ipo/iam-spac1'));
assert(!sitemap1.includes('<loc>https://iposcore.kr'));
const rss = await get('/rss.xml');
assert(!rss.includes('/ipo/iam-spac1'));
const guides = await get('/guides');
const queue = [...new Set(Array.from(`${home}${guides}`.matchAll(/href="(\/[^"?#]*)/g), ([, route]) => route))];
const pageRoutes = queue.filter((route) => !route.startsWith('/_next/') && !route.startsWith('/api/') && !/\.[a-z0-9]+$/i.test(route));
for (const route of pageRoutes) {
  const html = await get(route);
  if (!route.endsWith('.xml')) assert(html.includes('https://www.iposcore.kr'), `Canonical missing: ${route}`);
}
assert(/name="robots" content="[^"]*noindex/.test(await get('/admin')));
console.log(`PASS: public/held data, metadata, redirects, 404, stable sitemap, RSS, and ${pageRoutes.length} linked pages.`);
