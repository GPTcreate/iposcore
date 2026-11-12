import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

interface SubscriberFixture {
  id: string; email: string; status: string; frequency: string;
  verificationToken: string; unsubscribeToken: string; subscribedAt: string;
  verifiedAt?: string; unsubscribedAt?: string;
}
const active: SubscriberFixture = {
  id: 'sub_fixture', email: 'reader@fixture.invalid', status: 'ACTIVE', frequency: 'WEEKLY',
  verificationToken: 'fixture-verification-token', unsubscribeToken: 'fixture-unsubscribe-token',
  subscribedAt: '2026-11-01T01:00:00.000Z', verifiedAt: '2026-11-01T01:05:00.000Z',
};
const remoteUrl = 'https://fixture.invalid/private-store-token';

function fixture(options: {
  env?: Record<string, string | undefined>;
  local?: SubscriberFixture[];
  response?: (init: RequestInit) => Promise<Response>;
} = {}) {
  const exported: Record<string, unknown> = {};
  const requests: RequestInit[] = [];
  const localEffects: string[] = [];
  const printed: unknown[][] = [];
  const capture = (...values: unknown[]) => { printed.push(values); };
  const services: Record<string, unknown> = {
    fs: {
      existsSync: () => { localEffects.push('exists'); return options.local !== undefined; },
      readFileSync: () => { localEffects.push('read'); return JSON.stringify(options.local ?? []); },
      writeFileSync: () => { localEffects.push('write'); },
      mkdirSync: () => { localEffects.push('mkdir'); },
    },
    path,
    crypto: { randomBytes: (size: number) => Buffer.alloc(size, 7) },
  };
  const source = fs.readFileSync('src/lib/subscriberStore.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(js, {
    exports: exported, module: { exports: exported },
    process: { env: options.env ?? {}, cwd: () => 'C:/fixture' }, AbortSignal,
    console: { log: capture, warn: capture, error: capture },
    fetch: async (url: string, init: RequestInit) => {
      assert.equal(url, remoteUrl);
      requests.push(init);
      if (!options.response) throw new Error('Unexpected fixture request');
      return options.response(init);
    },
    require: (name: string) => {
      assert(Object.prototype.hasOwnProperty.call(services, name), `Unexpected import ${name}`);
      return services[name];
    },
  });
  return {
    list: exported.getAllSubscribersAsync as (options?: { requireRemote?: boolean }) => Promise<SubscriberFixture[]>,
    cached: exported.getAllSubscribers as () => SubscriberFixture[],
    fetchRemote: exported.fetchSubscribersFromGoogleSheet as (options?: { required?: boolean }) => Promise<SubscriberFixture[]>,
    sync: exported.syncToGoogleSheet as (action: 'SUBSCRIBE' | 'VERIFY' | 'UNSUBSCRIBE', subscriber: SubscriberFixture) => Promise<boolean>,
    requests, localEffects, printed,
  };
}

test('required subscriber reads reject missing configuration without consulting local ACTIVE rows', async () => {
  const run = fixture({ local: [active] });
  await assert.rejects(run.list({ requireRemote: true }), /SUBSCRIBER_STORE_UNCONFIGURED/);
  await assert.rejects(run.fetchRemote({ required: true }), /SUBSCRIBER_STORE_UNCONFIGURED/);
  assert.equal(run.requests.length, 0);
  assert.equal(run.localEffects.length, 0);
});

test('legacy subscriber array envelope is accepted while explicit failure flags are rejected', async () => {
  const legacy = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl },
    response: async () => Response.json({ subscribers: [active] }) });
  assert.equal((await legacy.list({ requireRemote: true }))[0].email, active.email);
  for (const data of [{ subscribers: [active], error: 'private-error' },
    { subscribers: [active], success: false }, { subscribers: [active], status: 'error' },
    { subscribers: [active], result: 'error' }]) {
    const failed = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, response: async () => Response.json(data) });
    await assert.rejects(failed.list({ requireRemote: true }), /SUBSCRIBER_STORE_UNAVAILABLE/);
  }
});

test('HTTP 200 error envelopes and invalid subscriber list shapes fail required reads', async () => {
  for (const data of [
    { result: 'error', subscribers: [active], message: 'private provider details' },
    { result: 'success' }, { result: 'success', subscribers: null },
    { subscribers: {} }, { subscribers: 'not an array' }, null, [active],
  ]) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, local: [active],
      response: async () => Response.json(data) });
    await assert.rejects(run.list({ requireRemote: true }), /SUBSCRIBER_STORE_UNAVAILABLE/);
    assert.equal(run.localEffects.length, 0);
    assert(!JSON.stringify(run.printed).includes('private provider details'));
  }
});

test('malformed rows cannot be converted into accepted ACTIVE subscriber records', async () => {
  for (const subscribers of [[null], [42], [{ ...active, email: '' }], [active, { ...active, email: null }]]) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl },
      response: async () => Response.json({ result: 'success', subscribers }) });
    await assert.rejects(run.list({ requireRemote: true }), /SUBSCRIBER_STORE_UNAVAILABLE/);
    assert.equal(run.localEffects.length, 0);
  }
});

test('HTTP rejection, malformed JSON and network failures never fall back to local ACTIVE rows', async () => {
  for (const response of [
    async () => Response.json({ subscribers: [active] }, { status: 503 }),
    async () => new Response('not JSON', { status: 200 }),
    async () => { throw new Error(`${remoteUrl} ${active.email} ${active.unsubscribeToken}`); },
  ]) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, local: [active], response });
    assert.equal(run.cached()[0].status, 'ACTIVE');
    const localReads = run.localEffects.length;
    await assert.rejects(run.list({ requireRemote: true }), /SUBSCRIBER_STORE_UNAVAILABLE/);
    assert.equal(run.localEffects.length, localReads);
    const printed = JSON.stringify(run.printed);
    for (const secret of [remoteUrl, active.email, active.unsubscribeToken]) assert(!printed.includes(secret));
  }
});

test('an empty authoritative list does not resurrect cached or local ACTIVE subscriptions', async () => {
  const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, local: [active],
    response: async () => Response.json({ result: 'success', subscribers: [] }) });
  assert.equal(run.cached().length, 1);
  const localReads = run.localEffects.length;
  const list = await run.list({ requireRemote: true });
  assert.equal(list.length, 0);
  assert.equal(run.localEffects.length, localReads);
  assert.equal(run.requests[0].method, 'GET');
  assert.equal(run.requests[0].cache, 'no-store');
  assert(run.requests[0].signal instanceof AbortSignal);
});

test('fresh remote cancellations remain cancelled even when the local copy is ACTIVE', async () => {
  for (const status of ['CANCELLED', '수신취소']) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, local: [active],
      response: async () => Response.json({ result: 'success', subscribers: [
        { ...active, status, unsubscribedAt: '2026-11-11T03:00:00.000Z' },
      ] }) });
    assert.equal(run.cached()[0].status, 'ACTIVE');
    const list = await run.list({ requireRemote: true });
    assert.equal(list.length, 1);
    assert.equal(list[0].status, 'CANCELLED');
    assert.equal(list.filter(subscriber => subscriber.status === 'ACTIVE').length, 0);
    assert.equal(list[0].unsubscribedAt, '2026-11-11T03:00:00.000Z');
    assert.equal(run.localEffects.filter(effect => effect === 'write').length, 0);
  }
});

test('required reads remain fresh across calls and cannot use an old ACTIVE cache after cancellation', async () => {
  let call = 0;
  const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl },
    response: async () => Response.json({ result: 'success', subscribers: [{ ...active, status: call++ ? 'CANCELLED' : 'ACTIVE' }] }) });
  assert.equal((await run.list({ requireRemote: true }))[0].status, 'ACTIVE');
  assert.equal((await run.list({ requireRemote: true }))[0].status, 'CANCELLED');
  assert.equal(run.requests.length, 2);
  assert.equal(run.localEffects.length, 0);
});

test('POST synchronization requires a successful acknowledgement for the exact action and email', async () => {
  for (const data of [
    { result: 'error', action: 'VERIFY', email: active.email },
    { result: 'success' },
    { result: 'success', action: 'SUBSCRIBE', email: active.email },
    { result: 'success', action: 'VERIFY', email: 'other@fixture.invalid' },
    { success: true, action: 'VERIFY', email: active.email }, null,
  ]) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, response: async () => Response.json(data) });
    assert.equal(await run.sync('VERIFY', active), false);
    assert.equal(run.localEffects.length, 0);
  }
  const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl },
    response: async () => Response.json({ result: 'success', action: 'VERIFY', email: active.email.toUpperCase() }) });
  assert.equal(await run.sync('VERIFY', active), true);
  const request = run.requests[0];
  assert.equal(request.method, 'POST');
  assert(request.signal instanceof AbortSignal);
  const payload = JSON.parse(String(request.body));
  assert.equal(payload.action, 'VERIFY');
  assert.equal(payload.id, active.id);
  assert.equal(payload.email, active.email);
  assert.equal(payload.verificationToken, active.verificationToken);
  assert.equal(payload.unsubscribeToken, active.unsubscribeToken);
  assert.equal(run.localEffects.length, 0);
});

test('POST missing configuration, HTTP rejection and provider failure cannot report durable success', async () => {
  const unconfigured = fixture();
  assert.equal(await unconfigured.sync('SUBSCRIBE', active), false);
  assert.equal(unconfigured.requests.length, 0);
  for (const response of [
    async () => Response.json({ result: 'success', action: 'VERIFY', email: active.email }, { status: 500 }),
    async () => new Response('not JSON', { status: 200 }),
    async () => { throw new Error(`${remoteUrl} ${active.email} ${active.verificationToken}`); },
  ]) {
    const run = fixture({ env: { GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, response });
    assert.equal(await run.sync('VERIFY', active), false);
    assert.equal(run.localEffects.length, 0);
    const printed = JSON.stringify(run.printed);
    for (const secret of [remoteUrl, active.email, active.verificationToken]) assert(!printed.includes(secret));
  }
});
