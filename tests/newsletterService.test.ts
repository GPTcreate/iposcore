import assert from 'node:assert/strict';
import test from 'node:test';
import { newsletterDeliveryKey, runWeeklyNewsletter, selectNewsletterSubscribers } from '../src/lib/newsletterService';
import type { Subscriber } from '../src/lib/subscriberStore';
import type { NewsletterPlan } from '../src/lib/newsletterContent';

const plan: NewsletterPlan = { today: '2030-01-07', period: '2030-01-07', active: [], upcoming: [], waiting: [], eligibleCount: 3, hasContent: true };
const subscriber = (name: string, status: Subscriber['status'] = 'ACTIVE'): Subscriber => ({
  id: `fixture-${name}`, email: `${name}@fixture.invalid`, status, frequency: 'WEEKLY',
  verificationToken: 'verification-token-fixture', unsubscribeToken: 'unsubscribe-token-fixture-1234', subscribedAt: '2030-01-01',
});
const noSend = async () => { throw new Error('Must not send'); };

test('select only consented addresses, normalize and deduplicate, suppress cancelled duplicate rows', () => {
  const active = subscriber('reader');
  const selected = selectNewsletterSubscribers([active, { ...active, email: ' READER@fixture.invalid ' },
    subscriber('pending', 'PENDING'), subscriber('cancelled', 'CANCELLED'),
    subscriber('suppressed'), subscriber('suppressed', 'CANCELLED'), subscriber('dummy-reader'),
    { ...subscriber('example'), email: 'reader@example.com' }, { ...subscriber('missing-token'), unsubscribeToken: '' }]);
  assert.equal(selected.activeCount, 2);
  assert.equal(selected.ready.length, 1);
  assert.equal(selected.ready[0].email, active.email);
  assert.equal(selected.invalidCount, 1);
});

test('stable weekly delivery keys depend on normalized address, never a regenerated subscriber id', () => {
  const key = newsletterDeliveryKey(plan.period, ' READER@fixture.invalid ');
  assert.equal(key, newsletterDeliveryKey(plan.period, 'reader@fixture.invalid'));
  assert.notEqual(key, newsletterDeliveryKey('2030-01-14', 'reader@fixture.invalid'));
  assert(!key.includes('reader@'));
});

test('dry run computes readiness without sending or reserving a delivery', async () => {
  const subscribers = [subscriber('dry-run')];
  const before = JSON.stringify(subscribers);
  const result = await runWeeklyNewsletter({ plan, subscribers, dryRun: true, send: noSend });
  assert.equal(result.status, 'ready');
  assert.equal(result.sentCount, 0);
  assert.equal(result.readySubscribersCount, 1);
  assert.equal(JSON.stringify(subscribers), before);
  const real = await runWeeklyNewsletter({ plan, subscribers, send: async () => ({ success: true, mode: 'smtp' }) });
  assert.equal(real.sentCount, 1);
});

test('no verified content, empty subscriber list, or non-Monday never calls a provider', async () => {
  assert.equal((await runWeeklyNewsletter({ plan: { ...plan, hasContent: false }, subscribers: [subscriber('empty')], send: noSend })).status, 'no_content');
  assert.equal((await runWeeklyNewsletter({ plan, subscribers: [], send: noSend })).status, 'no_subscribers');
  assert.equal((await runWeeklyNewsletter({ plan: { ...plan, today: '2030-01-08' }, subscribers: [subscriber('tuesday')], send: noSend })).status, 'not_scheduled_day');
});

test('partial failure and legacy simulated success cannot produce successful batch', async () => {
  const result = await runWeeklyNewsletter({ plan, subscribers: [subscriber('accepted'), subscriber('rejected'), subscriber('simulation')],
    send: async sub => sub.email.startsWith('accepted') ? { success: true, mode: 'resend' }
      : sub.email.startsWith('simulation') ? { success: true, mode: 'simulation' } : { success: false, mode: 'smtp' } });
  assert.equal(result.success, false);
  assert.equal(result.sentCount, 1);
  assert.equal(result.failedCount, 1);
  assert.equal(result.uncertainCount, 1);
  assert.equal(result.status, 'incomplete');
  assert(!JSON.stringify(result).includes('@'));
});

test('warm-instance repeat skips accepted recipients and never blindly retries ambiguous results', async () => {
  const subscribers = [subscriber('repeat-ok'), subscriber('repeat-unknown')];
  const first = await runWeeklyNewsletter({ plan, subscribers, send: async sub => {
    if (sub.email.startsWith('repeat-ok')) return { success: true, mode: 'smtp' };
    throw new Error('timeout');
  } });
  assert.equal(first.sentCount, 1);
  assert.equal(first.uncertainCount, 1);
  const repeat = await runWeeklyNewsletter({ plan, subscribers, send: noSend });
  assert.equal(repeat.sentCount, 0);
  assert.equal(repeat.skippedCount, 1);
  assert.equal(repeat.uncertainCount, 1);
  assert.equal(repeat.success, false);
});

test('overlapping run is rejected while the initial batch is awaiting provider', async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const subscribers = [subscriber('concurrent')];
  const initial = runWeeklyNewsletter({ plan, subscribers, send: async () => { await gate; return { success: true, mode: 'smtp' }; } });
  const overlap = await runWeeklyNewsletter({ plan, subscribers, send: noSend });
  assert.equal(overlap.status, 'already_running');
  assert.equal(overlap.success, false);
  release();
  assert.equal((await initial).sentCount, 1);
});

test('time budget and missing unsubscribe token report incomplete rather than silent success', async () => {
  const result = await runWeeklyNewsletter({ plan, subscribers: [subscriber('deferred'), { ...subscriber('no-unsubscribe'), unsubscribeToken: '' }], budgetMs: 0, send: noSend });
  assert.equal(result.success, false);
  assert.equal(result.deferredCount, 1);
  assert.equal(result.invalidSubscribersCount, 1);
  assert.equal(result.sentCount, 0);
});
