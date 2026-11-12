import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';

interface MailOptions { to: string; subject: string; html: string; text?: string; idempotencyKey?: string }
interface MailResult { success: boolean; id?: string; mode: string; error?: string; uncertain?: boolean }
const recipient = 'reader@fixture.invalid';
const message: MailOptions = { to: recipient, subject: 'Fixture report', html: '<p>fixture-token</p>' };
const smtpEnv = { SMTP_USER: 'sender@fixture.invalid', SMTP_PASS: 'fixture-password' };

function fixture(options: {
  env?: Record<string, string | undefined>;
  response?: () => Promise<Response>;
  smtp?: () => Promise<Record<string, unknown>>;
  clock?: { setTimeout: typeof setTimeout; clearTimeout: typeof clearTimeout };
} = {}) {
  const exported: Record<string, unknown> = {};
  const fetches: { url: string; init: RequestInit }[] = [];
  const smtpMessages: Record<string, unknown>[] = [];
  const transports: Record<string, unknown>[] = [];
  const printed: unknown[][] = [];
  let closed = 0;
  const capture = (...values: unknown[]) => { printed.push(values); };
  const services: Record<string, unknown> = {
    nodemailer: { createTransport: (config: Record<string, unknown>) => {
      transports.push(config);
      return { close: () => { closed++; }, sendMail: async (mail: Record<string, unknown>) => {
        smtpMessages.push(mail);
        if (!options.smtp) throw new Error('Unexpected SMTP fixture request');
        return options.smtp();
      } };
    } },
    'node:crypto': crypto,
    './subscriberStore': {},
    './newsletterTokens': { getNewsletterUnsubscribeToken: (sub: { unsubscribeToken?: string }) => sub.unsubscribeToken || null },
    './ipoUtils': { getAllEffectiveIpos: () => [] },
    './contentQuality': { isReviewedIpo: () => false, hasVerifiedForecast: () => false },
    './newsletterContent': {
      buildNewsletterPlan: () => { throw new Error('Unexpected newsletter planning in transport test'); },
      renderWeeklyNewsletter: () => { throw new Error('Unexpected newsletter rendering in transport test'); },
    },
  };
  const source = fs.readFileSync('src/lib/emailSender.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(js, {
    exports: exported, module: { exports: exported }, process: { env: options.env ?? {} },
    AbortSignal, setTimeout: options.clock?.setTimeout ?? setTimeout, clearTimeout: options.clock?.clearTimeout ?? clearTimeout,
    console: { log: capture, error: capture, warn: capture, info: capture },
    fetch: async (url: string, init: RequestInit) => {
      assert.equal(url, 'https://api.resend.com/emails');
      fetches.push({ url, init });
      if (!options.response) throw new Error('Unexpected fetch fixture request');
      return options.response();
    },
    require: (name: string) => {
      assert(Object.prototype.hasOwnProperty.call(services, name), `Unexpected import ${name}`);
      return services[name];
    },
  });
  return {
    send: exported.sendEmail as (mail: MailOptions) => Promise<MailResult>,
    configured: exported.isEmailConfigured as () => boolean,
    fetches, smtpMessages, transports, printed, closed: () => closed,
  };
}

test('missing and whitespace-only configuration fail without simulation or transport calls', async () => {
  for (const env of [{}, { RESEND_API_KEY: ' ', SMTP_USER: ' ', SMTP_PASS: '\t' }, { SMTP_USER: 'sender@fixture.invalid' }]) {
    const run = fixture({ env });
    assert.equal(run.configured(), false);
    const result = await run.send(message);
    assert.equal(result.success, false);
    assert.equal(result.mode, 'unconfigured');
    assert.equal(result.id, undefined);
    assert.equal(run.fetches.length + run.transports.length, 0);
    assert.equal(run.printed.length, 0);
  }
});

test('blocked dummy recipients never count as accepted or call a provider', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv } });
  for (const to of ['reader@example.com', 'dummy-reader@fixture.invalid', 'test@test.com', 'Reader@iposcore.kr']) {
    const result = await run.send({ ...message, to });
    assert.equal(result.success, false);
    assert.equal(result.mode, 'blocked_test');
    assert.equal(result.id, undefined);
  }
  assert.equal(run.fetches.length + run.transports.length, 0);
  assert.equal(run.printed.length, 0);
});

test('non-string runtime idempotency keys are rejected rather than coerced or omitted', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv } });
  for (const idempotencyKey of [null, 42, true, {}, ['fixture-key']]) {
    const result = await run.send({ ...message, idempotencyKey: idempotencyKey as unknown as string });
    assert.equal(result.success, false);
    assert.equal(result.error, 'invalid_idempotency_key');
  }
  assert.equal(run.fetches.length + run.transports.length, 0);
  assert.equal(run.printed.length, 0);
});

test('Resend acceptance requires an ID and preserves the idempotency key', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv },
    response: async () => Response.json({ id: 'fixture-email-id' }) });
  assert.equal(run.configured(), true);
  const result = await run.send({ ...message, idempotencyKey: 'weekly/2026-11-16/fixture' });
  assert.equal(result.success, true);
  assert.equal(result.mode, 'resend');
  assert.equal(result.id, 'fixture-email-id');
  assert.equal(run.transports.length, 0);
  const init = run.fetches[0].init;
  assert.equal((init.headers as Record<string, string>)['Idempotency-Key'], 'weekly/2026-11-16/fixture');
  assert.equal(init.redirect, 'error');
  assert(init.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(String(init.body)).to, [recipient]);
  assert.equal(JSON.parse(String(init.body)).text, 'fixture-token');
  assert.equal(run.printed.length, 0);
});

test('malformed successful Resend responses remain uncertain and never fall back to SMTP', async () => {
  for (const response of [() => Response.json({}), () => Response.json({ id: ' ' }),
    () => Response.json({ id: 123 }), () => new Response('not json', { status: 200 }),
    () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('private stream failure')); } }))]) {
    const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv }, response: async () => response() });
    const result = await run.send(message);
    assert.equal(result.success, false);
    assert.equal(result.uncertain, true);
    assert.equal(run.transports.length, 0);
    assert.equal(run.printed.length, 0);
  }
});

test('Resend network/stream failures cannot trigger a second-provider duplicate', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv }, response: async () => {
    throw new Error(`fixture-api-key ${recipient} fixture-token`);
  } });
  const result = await run.send(message);
  assert.equal(result.success, false);
  assert.equal(result.uncertain, true);
  assert.equal(result.error, 'provider_request_failed');
  assert.equal(run.transports.length, 0);
  assert.equal(run.printed.length, 0);
  assert(!JSON.stringify(result).includes('fixture-api-key'));
});

test('ambiguous HTTP failures and in-progress idempotency conflicts never use SMTP fallback', async () => {
  for (const status of [408, 409, 500, 503]) {
    const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv },
      response: async () => Response.json({ error: `private ${recipient} fixture-token` }, { status }) });
    const result = await run.send(message);
    assert.equal(result.success, false);
    assert.equal(result.uncertain, true);
    assert.equal(run.transports.length, 0);
    assert.equal(run.printed.length, 0);
    assert(!JSON.stringify(result).includes('private'));
  }
});

test('explicit Resend rejection fails honestly without an alternative configuration', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key' },
    response: async () => Response.json({ message: 'private provider rejection' }, { status: 422 }) });
  const result = await run.send(message);
  assert.equal(result.success, false);
  assert.equal(result.error, 'provider_rejected');
  assert.equal(result.mode, 'resend');
  assert.equal(result.id, undefined);
  assert.equal(run.printed.length, 0);
});

test('explicit Resend rejection can fall back only to actual SMTP recipient acceptance', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv },
    response: async () => Response.json({ message: 'rejected' }, { status: 401 }),
    smtp: async () => ({ accepted: [recipient], rejected: [], messageId: 'fixture-smtp-id' }) });
  const result = await run.send(message);
  assert.equal(result.success, true);
  assert.equal(result.mode, 'smtp');
  assert.equal(result.id, 'fixture-smtp-id');
  assert.equal(run.fetches.length, 1);
  assert.equal(run.smtpMessages.length, 1);
  assert.equal(run.printed.length, 0);
});

test('SMTP accepts the actual recipient and uses a stable hashed Message-ID when a key is provided', async () => {
  const run = fixture({ env: smtpEnv,
    smtp: async () => ({ accepted: [{ address: recipient.toUpperCase() }], rejected: [], messageId: 'fixture-smtp-id' }) });
  assert.equal(run.configured(), true);
  const first = await run.send({ ...message, idempotencyKey: 'weekly/fixture-token' });
  await run.send({ ...message, idempotencyKey: 'weekly/fixture-token' });
  await run.send({ ...message, idempotencyKey: 'weekly/other-token' });
  assert.equal(first.success, true);
  assert.equal(run.fetches.length, 0);
  assert.equal(run.smtpMessages[0].messageId, run.smtpMessages[1].messageId);
  assert.notEqual(run.smtpMessages[0].messageId, run.smtpMessages[2].messageId);
  assert.match(String(run.smtpMessages[0].messageId), /^<[a-f0-9]{64}@iposcore\.kr>$/);
  assert(!String(run.smtpMessages[0].messageId).includes('fixture-token'));
  assert.equal(run.transports[0].connectionTimeout, 30_000);
  assert.equal(run.printed.length, 0);
});

test('SMTP resolution alone is not success when the target is rejected or never accepted', async () => {
  for (const info of [
    { accepted: [], rejected: [recipient] },
    { accepted: ['other@fixture.invalid'], rejected: [] },
    { accepted: [recipient], rejected: [{ address: recipient }] },
    { messageId: 'fixture-id-without-acceptance' },
  ]) {
    const run = fixture({ env: smtpEnv, smtp: async () => ({ messageId: 'fixture-id', ...info }) });
    const result = await run.send(message);
    assert.equal(result.success, false);
    assert.equal(result.id, undefined);
    assert.equal(result.error, 'recipient_not_accepted');
    assert.equal(run.printed.length, 0);
  }
});

test('SMTP exceptions fail without leaking addresses, credentials or provider errors', async () => {
  const run = fixture({ env: smtpEnv, smtp: async () => {
    throw new Error(`${recipient} fixture-password fixture-token raw-provider-error`);
  } });
  const result = await run.send(message);
  assert.equal(result.success, false);
  assert.equal(result.uncertain, true);
  assert.equal(result.mode, 'smtp');
  assert.equal(result.error, 'provider_request_failed');
  assert(!JSON.stringify(result).includes('fixture-'));
  assert.equal(run.printed.length, 0);
});

test('SMTP absolute deadline closes the transport and never counts a late acceptance as success', async () => {
  const timers: { callback: () => void; delay: number; handle: object }[] = [];
  const cleared: unknown[] = [];
  let accept!: (info: Record<string, unknown>) => void;
  const smtpResponse = new Promise<Record<string, unknown>>(resolve => { accept = resolve; });
  const run = fixture({ env: smtpEnv, smtp: () => smtpResponse,
    clock: {
      setTimeout: ((callback: () => void, delay: number) => {
        const handle = {};
        timers.push({ callback, delay, handle });
        return handle;
      }) as unknown as typeof setTimeout,
      clearTimeout: ((handle: unknown) => { cleared.push(handle); }) as typeof clearTimeout,
    },
  });
  const pending = run.send(message);
  assert.equal(run.smtpMessages.length, 1);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 45_000);
  timers[0].callback();
  const result = await pending;
  assert.equal(result.success, false);
  assert.equal(result.uncertain, true);
  assert.equal(result.error, 'provider_timeout');
  assert.equal(result.id, undefined);
  assert.equal(run.closed(), 1);
  assert.deepEqual(cleared, [timers[0].handle]);
  accept({ accepted: [recipient], rejected: [], messageId: 'late-fixture-id' });
  await smtpResponse;
  assert.equal(result.success, false);
  assert.equal(result.id, undefined);
  assert.equal(run.closed(), 1);
  assert.equal(run.printed.length, 0);
});

test('invalid idempotency keys are rejected before any provider is contacted', async () => {
  const run = fixture({ env: { RESEND_API_KEY: 'fixture-api-key', ...smtpEnv } });
  for (const idempotencyKey of ['', 'a'.repeat(257), 'has\nnewline', 'has\rreturn', 'has space', '한글']) {
    const result = await run.send({ ...message, idempotencyKey });
    assert.equal(result.success, false);
    assert.equal(result.error, 'invalid_idempotency_key');
  }
  assert.equal(run.fetches.length + run.transports.length, 0);
  assert.equal(run.printed.length, 0);
});
