import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = process.cwd();
const modules = new Map();
function loadServerModule(filename) {
  const file = path.resolve(filename);
  if (modules.has(file)) return modules.get(file).exports;
  const moduleObject = { exports: {} };
  modules.set(file, moduleObject);
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const dependencies = (name) => {
    // Next.js enforces this boundary in the real build. This test executes server modules only.
    if (name === 'server-only') return {};
    if (name === 'next/server') return { NextResponse: { json: (body, options) => Response.json(body, options) } };
    if (name.startsWith('@/')) return loadServerModule(path.join(root, 'src', `${name.slice(2)}.ts`));
    if (name.startsWith('.')) return loadServerModule(path.resolve(path.dirname(file), `${name}.ts`));
    return require(name);
  };
  vm.runInNewContext(`(function(require, module, exports) { ${compiled}\n})`, { process, Buffer, Request, Response, Headers, URL })(dependencies, moduleObject, moduleObject.exports);
  return moduleObject.exports;
}

// Read the preserved credentials into process memory only. Do not log or persist their values.
const baseline = execFileSync('git', ['show', '9e3b99d:src/lib/adminAuth.ts'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const originalArray = baseline.match(/const\s+FALLBACK_ADMIN_KEYS\s*=\s*(\[[\s\S]*?\]);/);
if (!originalArray) throw new Error('Preserved compatibility credentials were not found.');
const legacy = Array.from(originalArray[1].matchAll(/'([^']*)'/g), (match) => match[1]);
if (!legacy.length) throw new Error('Preserved compatibility credentials could not be parsed.');

const { verifyAdminCredentials, verifyAdminRequest, getValidAdminKeys } = loadServerModule(path.join(root, 'src/lib/adminAuth.ts'));
const { POST: login } = loadServerModule(path.join(root, 'src/app/api/admin/auth/route.ts'));
const { checkRateLimit } = loadServerModule(path.join(root, 'src/lib/rateLimiter.ts'));
const priorAdminSecret = process.env.ADMIN_SECRET;
const priorCronSecret = process.env.CRON_SECRET;
const request = (headers = {}, query = '') => new Request(`https://example.invalid/api/ipo${query}`, { headers });
let checks = 0;
function check(value, message) { assert.equal(value, true, message); checks++; }
let loginIp = 1;
const loginRequest = (pin, ip = `198.51.100.${loginIp++}`) => new Request('https://example.invalid/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify({ pin }) });

try {
  delete process.env.ADMIN_SECRET;
  delete process.env.CRON_SECRET;
  check(!verifyAdminCredentials(''), 'Empty credential is rejected');
  check(getValidAdminKeys().length === 0, 'Compatibility credentials are not exposed as plaintext keys');
  check(!verifyAdminRequest(request()).authorized, 'Missing token is rejected');
  check(!verifyAdminRequest(request({ 'x-vercel-cron': '1' })).authorized, 'Caller-controlled cron marker does not authenticate');
  check(!verifyAdminRequest(request({ authorization: 'Bearer undefined' })).authorized, 'Missing configuration cannot become a token');
  check(!verifyAdminCredentials('unrelated-test-password'), 'Incorrect compatibility password is rejected');

  for (const value of legacy) {
    check(verifyAdminCredentials(value), 'Preserved password authenticates through the UI verifier');
    check(verifyAdminRequest(request({ 'x-admin-key': value })).authorized, 'Preserved password authenticates through the administrator header');
    check(verifyAdminRequest(request({ authorization: `Bearer ${value}` })).authorized, 'Preserved password authenticates as a Bearer token');
    check(!verifyAdminRequest(request({}, `?adminKey=${encodeURIComponent(value)}`)).authorized, 'URL credentials remain rejected');
    const response = await login(loginRequest(value));
    check(response.status === 200, 'Preserved password authenticates through the actual login route');
    const payload = await response.json();
    check(payload.success === true && payload.adminKey === value, 'Login route returns the existing header-compatible session credential');
    check(response.headers.get('cache-control') === 'no-store', 'Login response cannot be cached');
  }

  for (const relative of ['src/lib/legacyCredential.ts', 'src/lib/adminAuth.ts', 'scripts/test-security.mjs']) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    check(legacy.every((value) => !source.includes(value)), 'Current verification source contains no original plaintext credential');
  }
  check(fs.readFileSync(path.join(root, 'src/lib/legacyCredential.ts'), 'utf8').startsWith("import 'server-only'"), 'Compatibility hashes are guarded from client imports');

  const adminTestSecret = 'unit-test-admin-secret-never-used-in-production';
  const cronTestSecret = 'unit-test-cron-secret-never-used-in-production';
  process.env.CRON_SECRET = cronTestSecret;
  check(!verifyAdminCredentials(cronTestSecret), 'Scheduler secret does not authenticate the UI when compatibility mode is active');
  check(!verifyAdminRequest(request({ 'x-admin-key': cronTestSecret })).authorized, 'Scheduler secret does not authenticate administrator headers');
  check(verifyAdminRequest(request({ authorization: `Bearer ${cronTestSecret}` })).authorized, 'Scheduler Bearer token authenticates');

  process.env.ADMIN_SECRET = adminTestSecret;
  check(verifyAdminCredentials(adminTestSecret), 'Configured administrator secret has priority');
  check(getValidAdminKeys().length === 1, 'Only configured administrator secrets are enumerable');
  check(!verifyAdminCredentials(cronTestSecret), 'Scheduler secret cannot log into the administrator UI');
  check(!verifyAdminCredentials('wrong-test-secret'), 'Wrong configured administrator secret is rejected');
  for (const value of legacy) {
    check(!verifyAdminCredentials(value), 'Configured administrator secret disables compatibility UI fallback');
    check(!verifyAdminRequest(request({ 'x-admin-key': value })).authorized, 'Configured administrator secret disables compatibility header fallback');
    check(!verifyAdminRequest(request({ authorization: `Bearer ${value}` })).authorized, 'Configured administrator secret disables compatibility Bearer fallback');
  }
  check(verifyAdminRequest(request({ 'x-admin-key': adminTestSecret })).authorized, 'Configured administrator header authenticates');
  check(verifyAdminRequest(request({ authorization: `Bearer ${adminTestSecret}` })).authorized, 'Configured administrator Bearer token authenticates');
  check(!verifyAdminRequest(request({ 'x-vercel-cron': '1', 'x-admin-key': 'wrong-test-secret' })).authorized, 'Spoofed cron marker cannot bypass a wrong token');
  check(!verifyAdminRequest(request({}, `?adminKey=${adminTestSecret}`)).authorized, 'Configured URL administrator secret remains rejected');
  check(!verifyAdminRequest(request({}, `?key=${cronTestSecret}`)).authorized, 'Configured URL scheduler secret remains rejected');
  check(!verifyAdminRequest(request({ authorization: `Basic ${adminTestSecret}` })).authorized, 'Unsupported authentication scheme is rejected');
  check((await login(loginRequest(adminTestSecret))).status === 200, 'Configured password authenticates through the login route');
  check((await login(loginRequest(cronTestSecret))).status === 401, 'Scheduler token is rejected by the login route');
  check((await login(loginRequest({ unexpected: true }))).status === 400, 'Malformed login credentials are rejected');

  const limitedIp = '198.51.100.240';
  for (let index = 0; index < 5; index++) check((await login(loginRequest('wrong-rate-limit-test', limitedIp))).status === 401, 'Login failures remain bounded by the existing rate limit');
  check((await login(loginRequest(adminTestSecret, limitedIp))).status === 429, 'The login route blocks a sixth attempt within the rate window');

  const rateKey = `security-unit-test-${Date.now()}`;
  for (let count = 0; count < 5; count++) check(checkRateLimit(rateKey, 5, 60000).allowed, 'Requests inside the domain rate threshold are allowed');
  check(!checkRateLimit(rateKey, 5, 60000).allowed, 'Domain rate limiter rejects the next request');
  console.log(`PASS: ${checks} authentication, compatibility, source-privacy and rate-limit checks; no network requests sent.`);
} finally {
  if (priorAdminSecret === undefined) delete process.env.ADMIN_SECRET;
  else process.env.ADMIN_SECRET = priorAdminSecret;
  if (priorCronSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = priorCronSecret;
  legacy.fill('');
}
