import assert from 'node:assert/strict';
import { verifyAdminCredentials, verifyAdminRequest } from '../src/lib/adminAuth.ts';
import { checkRateLimit } from '../src/lib/rateLimiter.ts';

const priorAdminSecret = process.env.ADMIN_SECRET;
const priorCronSecret = process.env.CRON_SECRET;
const request = (headers = {}, query = '') => new Request(`https://example.invalid/api/ipo${query}`, { headers });
let checks = 0;
function check(value, message) { assert.equal(value, true, message); checks++; }

try {
  delete process.env.ADMIN_SECRET;
  delete process.env.CRON_SECRET;
  check(!verifyAdminCredentials('7788'), 'Legacy numeric PIN must not authenticate');
  check(!verifyAdminCredentials('admin2026'), 'Legacy default password must not authenticate');
  check(!verifyAdminCredentials(''), 'Empty credential must not authenticate');
  check(!verifyAdminRequest(request()).authorized, 'Missing token must fail closed');
  check(!verifyAdminRequest(request({ 'x-vercel-cron': '1' })).authorized, 'Caller-supplied cron header must not authenticate');
  check(!verifyAdminRequest(request({ authorization: 'Bearer undefined' })).authorized, 'Missing environment value cannot become a token');

  const adminTestSecret = 'unit-test-admin-secret-never-used-in-production';
  const cronTestSecret = 'unit-test-cron-secret-never-used-in-production';
  process.env.ADMIN_SECRET = adminTestSecret;
  process.env.CRON_SECRET = cronTestSecret;
  check(verifyAdminCredentials(adminTestSecret), 'Configured administrator secret authenticates');
  check(!verifyAdminCredentials(cronTestSecret), 'Scheduler secret cannot log into administrator UI');
  check(!verifyAdminCredentials('wrong-test-secret'), 'Wrong administrator secret is rejected');
  check(!verifyAdminCredentials('7788') && !verifyAdminCredentials('admin2026'), 'Configuring secrets does not restore legacy defaults');
  check(verifyAdminRequest(request({ 'x-admin-key': adminTestSecret })).authorized, 'Administrator header accepts configured administrator secret');
  check(!verifyAdminRequest(request({ 'x-admin-key': cronTestSecret })).authorized, 'Scheduler secret is not an administrator header credential');
  check(verifyAdminRequest(request({ authorization: `Bearer ${adminTestSecret}` })).authorized, 'Bearer administrator secret authenticates');
  check(verifyAdminRequest(request({ authorization: `Bearer ${cronTestSecret}` })).authorized, 'Vercel Bearer scheduler secret authenticates');
  check(!verifyAdminRequest(request({ 'x-vercel-cron': '1', 'x-admin-key': 'wrong-test-secret' })).authorized, 'Spoofed cron marker cannot bypass a wrong token');
  check(!verifyAdminRequest(request({ authorization: 'Bearer 7788' })).authorized, 'Bearer legacy PIN is rejected');
  check(!verifyAdminRequest(request({}, `?adminKey=${adminTestSecret}`)).authorized, 'URL administrator secret is rejected');
  check(!verifyAdminRequest(request({}, `?key=${cronTestSecret}`)).authorized, 'URL scheduler secret is rejected');
  check(!verifyAdminRequest(request({ authorization: `Basic ${adminTestSecret}` })).authorized, 'Unsupported authentication scheme is rejected');
  process.env.ADMIN_SECRET = ' ';
  process.env.CRON_SECRET = ' ';
  check(!verifyAdminRequest(request({ authorization: 'Bearer ' })).authorized, 'Blank environment secrets fail closed');

  const rateKey = `security-unit-test-${Date.now()}`;
  for (let count = 0; count < 5; count++) check(checkRateLimit(rateKey, 5, 60000).allowed, 'Requests within the configured rate limit are allowed');
  check(!checkRateLimit(rateKey, 5, 60000).allowed, 'Rate limit rejects the request after the configured threshold');
  console.log(`PASS: ${checks} authentication and rate-limit checks (temporary test secrets only; no requests sent).`);
} finally {
  if (priorAdminSecret === undefined) delete process.env.ADMIN_SECRET;
  else process.env.ADMIN_SECRET = priorAdminSecret;
  if (priorCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = priorCronSecret;
}
