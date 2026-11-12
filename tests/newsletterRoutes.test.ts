import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { runWeeklyNewsletter } from '../src/lib/newsletterService';
import type { Subscriber } from '../src/lib/subscriberStore';
import type { NewsletterPlan } from '../src/lib/newsletterContent';

const plan: NewsletterPlan = { today: '2030-02-04', period: '2030-02-04', active: [], upcoming: [], waiting: [], hasContent: true, eligibleCount: 2 };
const subscriber: Subscriber = { id: 'fixture', email: 'route-reader@fixture.invalid', status: 'ACTIVE', frequency: 'ALL',
  verificationToken: 'verify-fixture-token-12345', unsubscribeToken: 'unsubscribe-fixture-token-12345', subscribedAt: '2030-01-01' };

function load(filename: string, services: Record<string, unknown>, env: Record<string, string> = { CRON_SECRET: 'fixture-scheduler-secret' }) {
  const exported: Record<string, unknown> = {};
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(js, {
    exports: exported, module: { exports: exported }, URL, Request, Response, process: { env },
    console: { info() {}, error() {}, warn() {} },
    require: (name: string) => {
      if (name === 'next/server') return { NextResponse: { json: (body: unknown, init: ResponseInit) => Response.json(body, init) } };
      assert(Object.prototype.hasOwnProperty.call(services, name), `Unexpected import ${name}`);
      return services[name];
    },
  });
  return exported;
}

function cron(options: { authorized?: boolean; configured?: boolean; storeFails?: boolean; deliveryFails?: boolean; schedulerMissing?: boolean } = {}) {
  let reads = 0, sends = 0;
  const exported = load('src/app/api/cron/newsletter/route.ts', {
    '@/lib/adminAuth': { verifyAdminRequest: () => ({ authorized: options.authorized ?? true }) },
    '@/lib/emailSender': { isEmailConfigured: () => options.configured ?? true,
      sendWeeklyReportEmail: async (_sub: Subscriber, opts: { plan: NewsletterPlan; idempotencyKey: string }) => {
        sends++; assert.equal(opts.plan, plan); assert(opts.idempotencyKey.startsWith(`weekly/${plan.period}/`));
        return { success: !options.deliveryFails, mode: 'smtp' };
      } },
    '@/lib/subscriberStore': { getAllSubscribersAsync: async (opts: { requireRemote: boolean }) => {
      reads++; assert.equal(opts.requireRemote, true);
      if (options.storeFails) throw new Error('store-secret-value');
      return [subscriber];
    } },
    '@/lib/ipoUtils': { getAllEffectiveIpos: () => [] },
    '@/lib/ipoServerStore': { loadServerCustomIpos() {} },
    '@/lib/newsletterContent': { buildNewsletterPlan: () => plan },
    '@/lib/newsletterService': { runWeeklyNewsletter },
  }, options.schedulerMissing ? {} : undefined);
  return { get: exported.GET as (request: Request) => Promise<Response>, counts: () => ({ reads, sends }) };
}
const request = (query = '') => new Request(`https://fixture.invalid/api/cron/newsletter${query}`);

test('newsletter cron requires authorization even for diagnostics, with no state or delivery work', async () => {
  const fixture = cron({ authorized: false });
  const response = await fixture.get(request('?dryRun=1'));
  assert.equal(response.status, 401);
  assert.deepEqual(fixture.counts(), { reads: 0, sends: 0 });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('missing provider and unavailable subscriber store return errors instead of simulated success', async () => {
  const missing = cron({ configured: false });
  assert.equal((await missing.get(request('?dryRun=1'))).status, 503);
  assert.equal(missing.counts().sends, 0);
  const failed = cron({ storeFails: true });
  const response = await failed.get(request('?dryRun=1'));
  assert.equal(response.status, 503);
  assert(!(await response.text()).includes('store-secret-value'));
  assert.equal(failed.counts().sends, 0);
});

test('authenticated dry run uses fresh authoritative subscribers and never sends', async () => {
  const fixture = cron();
  const response = await fixture.get(request('?dryRun=1'));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.status, 'ready');
  assert.equal(result.readySubscribersCount, 1);
  assert.equal(result.sentCount, 0);
  assert.deepEqual(fixture.counts(), { reads: 1, sends: 0 });
  assert(!JSON.stringify(result).includes(subscriber.email));
});

test('dry run reports a missing scheduler secret as not ready without weakening authentication', async () => {
  const fixture = cron({ schedulerMissing: true });
  const response = await fixture.get(request('?dryRun=1'));
  const result = await response.json();
  assert.equal(response.status, 503);
  assert.equal(result.success, false);
  assert.equal(result.status, 'scheduler_not_configured');
  assert.equal(result.schedulerConfigured, false);
  assert.equal(fixture.counts().sends, 0);
});

test('provider rejection returns non-success HTTP and accepted delivery counts accurately', async () => {
  const failed = cron({ deliveryFails: true });
  const failedResponse = await failed.get(request());
  assert.equal(failedResponse.status, 502);
  assert.equal((await failedResponse.json()).failedCount, 1);
  const accepted = cron();
  const response = await accepted.get(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).sentCount, 1);
});

function subscribe(options: { configured?: boolean; accepted?: boolean; existing?: boolean } = {}) {
  let registrations = 0, sends = 0;
  const exported = load('src/app/api/newsletter/subscribe/route.ts', {
    '@/lib/rateLimiter': { getClientIp: () => '192.0.2.1', checkRateLimit: () => ({ allowed: true }) },
    '@/lib/emailValidator': { validateEmail: () => ({ isValid: true, normalizedEmail: subscriber.email }) },
    '@/lib/subscriberStore': { registerSubscriber: async (opts: { skipDoubleOptIn: boolean }) => {
      registrations++; assert.equal(opts.skipDoubleOptIn, false);
      return { subscriber: { ...subscriber, status: options.existing ? 'ACTIVE' : 'PENDING' }, isNew: !options.existing };
    } },
    '@/lib/emailSender': { isEmailConfigured: () => options.configured ?? true,
      sendVerificationEmail: async () => { sends++; return { success: options.accepted ?? true, mode: 'smtp' }; } },
  });
  return { post: exported.POST as (request: Request) => Promise<Response>, counts: () => ({ registrations, sends }) };
}
const subscribeRequest = () => new Request('https://fixture.invalid/api/newsletter/subscribe', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: subscriber.email }),
});

test('subscription cannot activate without a mail provider or report rejected verification as sent', async () => {
  const missing = subscribe({ configured: false });
  assert.equal((await missing.post(subscribeRequest())).status, 503);
  assert.deepEqual(missing.counts(), { registrations: 0, sends: 0 });
  const rejected = subscribe({ accepted: false });
  const response = await rejected.post(subscribeRequest());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, false);
});

test('new subscription remains pending until opt-in; existing active address needs no new verification', async () => {
  const pending = subscribe();
  const response = await pending.post(subscribeRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'PENDING');
  const existing = subscribe({ existing: true });
  assert.equal((await existing.post(subscribeRequest())).status, 200);
  assert.equal(existing.counts().sends, 0);
});

test('administrator subscriber read reports unavailable remote store instead of a successful empty list', async () => {
  const exported = load('src/app/api/newsletter/admin/route.ts', {
    '@/lib/adminAuth': { verifyAdminRequest: () => ({ authorized: true }) },
    '@/lib/emailSender': {},
    '@/lib/subscriberStore': { getAllSubscribersAsync: async (options: { requireRemote: boolean }) => {
      assert.equal(options.requireRemote, true);
      throw new Error('private-store-error');
    } },
  });
  const response = await (exported.GET as (request: Request) => Promise<Response>)(request());
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.stats, undefined);
  assert(!JSON.stringify(body).includes('private-store-error'));
});
