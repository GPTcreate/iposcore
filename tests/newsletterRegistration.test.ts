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
const staleActive: SubscriberFixture = {
  id: 'sub_stale_fixture', email: 'reader@fixture.invalid', status: 'ACTIVE', frequency: 'ALL',
  verificationToken: 'stale-verification-fixture', unsubscribeToken: 'stale-unsubscribe-fixture',
  subscribedAt: '2026-10-01T01:00:00.000Z', verifiedAt: '2026-10-01T01:05:00.000Z',
};
const remoteSubscriber: SubscriberFixture = {
  ...staleActive, id: 'sub_remote_fixture', frequency: 'WEEKLY',
  verificationToken: 'remote-verification-fixture', unsubscribeToken: 'remote-unsubscribe-fixture',
  subscribedAt: '2026-11-01T01:00:00.000Z', verifiedAt: '2026-11-01T01:05:00.000Z',
};
const remoteUrl = 'https://fixture.invalid/subscriber-store-fixture';

function fixture(options: {
  env?: Record<string, string | undefined>;
  local?: SubscriberFixture[];
  get?: () => Promise<Response>;
} = {}) {
  const exported: Record<string, unknown> = {};
  const requests: RequestInit[] = [];
  const localEffects: string[] = [];
  const written: SubscriberFixture[][] = [];
  const printed: unknown[][] = [];
  let randomCalls = 0;
  const capture = (...values: unknown[]) => { printed.push(values); };
  const services: Record<string, unknown> = {
    fs: {
      existsSync: () => { localEffects.push('exists'); return options.local !== undefined; },
      readFileSync: () => { localEffects.push('read'); return JSON.stringify(options.local ?? []); },
      writeFileSync: (_file: string, data: string) => { localEffects.push('write'); written.push(JSON.parse(data)); },
      mkdirSync: () => { localEffects.push('mkdir'); },
    },
    path,
    crypto: { randomBytes: (size: number) => Buffer.alloc(size, ++randomCalls) },
  };
  const source = fs.readFileSync('src/lib/subscriberStore.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(js, {
    exports: exported, module: { exports: exported },
    process: { env: options.env ?? { NODE_ENV: 'production', GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, cwd: () => 'C:/fixture' },
    AbortSignal, console: { log: capture, warn: capture, error: capture },
    fetch: async (url: string, init: RequestInit) => {
      assert.equal(url, remoteUrl);
      requests.push(init);
      if (init.method === 'GET') {
        assert(options.get, 'Unexpected fixture GET');
        return options.get();
      }
      assert.equal(init.method, 'POST');
      const payload = JSON.parse(String(init.body));
      return Response.json({ result: 'success', action: payload.action, email: payload.email });
    },
    require: (name: string) => {
      assert(Object.prototype.hasOwnProperty.call(services, name), `Unexpected import ${name}`);
      return services[name];
    },
  });
  return {
    register: exported.registerSubscriber as (params: { email: string; frequency?: 'WEEKLY' | 'ALL' }) => Promise<{ subscriber: SubscriberFixture; isNew: boolean }>,
    cached: exported.getAllSubscribers as () => SubscriberFixture[],
    requests, localEffects, written, printed,
    randomCalls: () => randomCalls,
    posts: () => requests.filter(request => request.method === 'POST').map(request => JSON.parse(String(request.body))),
  };
}

test('production registration rejects unavailable fresh remote data before POST, token creation or local mutation', async () => {
  const failures = [
    async () => Response.json({ result: 'success', subscribers: [] }, { status: 503 }),
    async () => Response.json({ result: 'error', subscribers: [staleActive] }),
    async () => Response.json({ result: 'success', subscribers: null }),
    async () => new Response('not JSON', { status: 200 }),
    async () => { throw new Error(`${remoteUrl} ${staleActive.email} ${staleActive.verificationToken}`); },
  ];
  for (const get of failures) {
    const run = fixture({ local: [staleActive], get });
    const cached = run.cached(), before = JSON.stringify(cached);
    const localReads = run.localEffects.length;
    await assert.rejects(run.register({ email: staleActive.email, frequency: 'WEEKLY' }), /SUBSCRIBER_STORE_UNAVAILABLE/);
    assert.deepEqual(run.requests.map(request => request.method), ['GET']);
    assert.equal(run.localEffects.length, localReads);
    assert.equal(JSON.stringify(cached), before);
    assert.equal(run.written.length, 0);
    assert.equal(run.randomCalls(), 0);
    const printed = JSON.stringify(run.printed);
    for (const value of [remoteUrl, staleActive.email, staleActive.verificationToken]) assert(!printed.includes(value));
  }
  const unconfigured = fixture({ env: { NODE_ENV: 'production' }, local: [staleActive] });
  await assert.rejects(unconfigured.register({ email: staleActive.email }), /SUBSCRIBER_STORE_UNCONFIGURED/);
  assert.equal(unconfigured.requests.length, 0);
  assert.equal(unconfigured.localEffects.length, 0);
  assert.equal(unconfigured.randomCalls(), 0);
});

test('an authoritative empty remote list replaces stale local ACTIVE state with a new PENDING registration', async () => {
  const run = fixture({ local: [staleActive], get: async () => Response.json({ result: 'success', subscribers: [] }) });
  assert.equal(run.cached()[0].status, 'ACTIVE');
  const localReads = run.localEffects.length;
  const result = await run.register({ email: ' READER@FIXTURE.INVALID ', frequency: 'WEEKLY' });
  assert.equal(result.isNew, true);
  assert.equal(result.subscriber.status, 'PENDING');
  assert.equal(result.subscriber.email, staleActive.email);
  assert.equal(result.subscriber.frequency, 'WEEKLY');
  assert.notEqual(result.subscriber.id, staleActive.id);
  assert.notEqual(result.subscriber.verificationToken, staleActive.verificationToken);
  assert.notEqual(result.subscriber.unsubscribeToken, staleActive.unsubscribeToken);
  assert.equal(result.subscriber.verifiedAt, undefined);
  assert.equal(run.cached().length, 1);
  assert.equal(run.cached()[0].status, 'PENDING');
  assert.deepEqual(run.requests.map(request => request.method), ['GET', 'POST']);
  assert.equal(run.requests[0].cache, 'no-store');
  assert(run.requests[0].signal instanceof AbortSignal);
  assert.deepEqual(run.localEffects.slice(localReads), ['exists', 'write']);
  const [payload] = run.posts();
  assert.equal(payload.action, 'SUBSCRIBE');
  assert.equal(payload.status, 'PENDING');
  assert.equal(payload.verifiedAt, '');
  assert.equal(payload.id, result.subscriber.id);
  assert.equal(run.written[0][0].status, 'PENDING');
});

test('fresh remote CANCELLED registrations become PENDING rather than inheriting a stale local ACTIVE consent', async () => {
  for (const status of ['CANCELLED', '수신취소']) {
    const run = fixture({ local: [staleActive], get: async () => Response.json({ result: 'success', subscribers: [
      { ...remoteSubscriber, status, unsubscribedAt: '2026-11-11T03:00:00.000Z' },
    ] }) });
    assert.equal(run.cached()[0].status, 'ACTIVE');
    const result = await run.register({ email: staleActive.email, frequency: 'WEEKLY' });
    assert.equal(result.isNew, false);
    assert.equal(result.subscriber.id, remoteSubscriber.id);
    assert.equal(result.subscriber.status, 'PENDING');
    assert.equal(result.subscriber.verificationToken, remoteSubscriber.verificationToken);
    assert.equal(result.subscriber.unsubscribeToken, remoteSubscriber.unsubscribeToken);
    assert.equal(result.subscriber.unsubscribedAt, undefined);
    assert.equal(result.subscriber.verifiedAt, remoteSubscriber.verifiedAt);
    assert.notEqual(result.subscriber.subscribedAt, remoteSubscriber.subscribedAt);
    const [payload] = run.posts();
    assert.equal(payload.action, 'SUBSCRIBE');
    assert.equal(payload.status, 'PENDING');
    assert.equal(payload.unsubscribedAt, '');
    assert.equal(run.randomCalls(), 0);
  }
});

test('existing remote ACTIVE consent is preserved without manufacturing a new verification time or identity', async () => {
  const run = fixture({ local: [staleActive], get: async () => Response.json({ result: 'success', subscribers: [remoteSubscriber] }) });
  run.cached();
  const result = await run.register({ email: staleActive.email, frequency: 'WEEKLY' });
  assert.equal(result.isNew, false);
  assert.equal(result.subscriber.status, 'ACTIVE');
  assert.equal(result.subscriber.id, remoteSubscriber.id);
  assert.equal(result.subscriber.subscribedAt, remoteSubscriber.subscribedAt);
  assert.equal(result.subscriber.verifiedAt, remoteSubscriber.verifiedAt);
  assert.equal(result.subscriber.verificationToken, remoteSubscriber.verificationToken);
  assert.equal(result.subscriber.unsubscribeToken, remoteSubscriber.unsubscribeToken);
  const [payload] = run.posts();
  assert.equal(payload.action, 'VERIFY');
  assert.equal(payload.status, 'ACTIVE');
  assert.equal(payload.verifiedAt, remoteSubscriber.verifiedAt);
  assert.equal(run.randomCalls(), 0);
});

test('remote PENDING stays PENDING and registration refreshes again immediately after an earlier ACTIVE result', async () => {
  let calls = 0;
  const run = fixture({ env: { VERCEL: '1', GOOGLE_SHEET_WEBHOOK_URL: remoteUrl }, local: [staleActive],
    get: async () => Response.json({ result: 'success', subscribers: [
      { ...remoteSubscriber, status: calls++ === 0 ? 'ACTIVE' : 'PENDING', verifiedAt: undefined },
    ] }) });
  const first = await run.register({ email: staleActive.email, frequency: 'WEEKLY' });
  assert.equal(first.subscriber.status, 'ACTIVE');
  const second = await run.register({ email: staleActive.email, frequency: 'WEEKLY' });
  assert.equal(second.isNew, false);
  assert.equal(second.subscriber.status, 'PENDING');
  assert.equal(second.subscriber.verifiedAt, undefined);
  assert.deepEqual(run.requests.map(request => request.method), ['GET', 'POST', 'GET', 'POST']);
  assert.deepEqual(run.posts().map(payload => payload.status), ['ACTIVE', 'PENDING']);
  assert.equal(run.posts()[1].verifiedAt, '');
});
