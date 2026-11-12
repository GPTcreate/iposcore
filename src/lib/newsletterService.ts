import { createHash } from 'node:crypto';
import type { Subscriber } from './subscriberStore';
import type { NewsletterPlan } from './newsletterContent';

interface NewsletterDeliveryResult { success: boolean; mode: string; uncertain?: boolean }

// Warm-instance guard only. Resend also receives a stable provider idempotency key;
// SMTP Message-ID and this map are not a durable, cross-instance delivery ledger.
const periods = new Map<string, { running: boolean; accepted: Set<string>; uncertain: Set<string> }>();

export function selectNewsletterSubscribers(subscribers: Subscriber[]) {
  const byEmail = new Map<string, Subscriber>();
  const suppressed = new Set<string>();
  for (const subscriber of subscribers) {
    const email = subscriber.email.trim().toLowerCase();
    if (subscriber.status !== 'ACTIVE') suppressed.add(email);
    if (subscriber.status !== 'ACTIVE' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || /@(iposcore\.kr|example\.com)$/.test(email) || /^(test_|testuser|dummy)/.test(email)
      || email === 'test@test.com') continue;
    byEmail.set(email, { ...subscriber, email });
  }
  const active = [...byEmail.values()].filter(subscriber => !suppressed.has(subscriber.email));
  const ready = active.filter(subscriber => typeof subscriber.unsubscribeToken === 'string'
    && subscriber.unsubscribeToken.length >= 24);
  return { activeCount: active.length, ready, invalidCount: active.length - ready.length };
}

export function newsletterDeliveryKey(period: string, email: string) {
  return `weekly/${period}/${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;
}

export async function runWeeklyNewsletter(options: {
  plan: NewsletterPlan;
  subscribers: Subscriber[];
  dryRun?: boolean;
  send: (subscriber: Subscriber, deliveryKey: string) => Promise<NewsletterDeliveryResult>;
  budgetMs?: number;
}) {
  const { plan, subscribers, dryRun = false, send, budgetMs = 195_000 } = options;
  const selected = selectNewsletterSubscribers(subscribers);
  const counts = {
    activeSubscribersCount: selected.activeCount, readySubscribersCount: selected.ready.length,
    invalidSubscribersCount: selected.invalidCount, eligibleIposCount: plan.eligibleCount,
    sentCount: 0, failedCount: 0, uncertainCount: 0, skippedCount: 0, deferredCount: 0,
  };
  const result = (status: string, success: boolean) => ({ success, status, dryRun, period: plan.period, ...counts });
  if (dryRun) return result(plan.hasContent ? 'ready' : 'no_content', selected.invalidCount === 0);
  if (!plan.hasContent) return result('no_content', true);
  if (!selected.activeCount) return result('no_subscribers', true);
  // The existing Vercel schedule is Monday KST. Diagnostics can run on any day.
  if (new Date(`${plan.today}T00:00:00Z`).getUTCDay() !== 1) return result('not_scheduled_day', true);

  for (const [period, state] of periods) {
    if (period !== plan.period && !state.running) periods.delete(period);
  }
  let state = periods.get(plan.period);
  if (!state) {
    state = { running: false, accepted: new Set(), uncertain: new Set() };
    periods.set(plan.period, state);
  }
  if (state.running) return result('already_running', false);
  state.running = true;
  const started = Date.now();
  let next = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(2, selected.ready.length) }, async () => {
      while (next < selected.ready.length) {
        const subscriber = selected.ready[next++];
        const key = newsletterDeliveryKey(plan.period, subscriber.email);
        if (state.accepted.has(key)) { counts.skippedCount++; continue; }
        if (state.uncertain.has(key)) { counts.uncertainCount++; continue; }
        if (Date.now() - started >= budgetMs) { counts.deferredCount++; continue; }
        // Reserve before awaiting: an exception/ambiguous result must not cause a blind retry.
        state.uncertain.add(key);
        try {
          const delivery = await send(subscriber, key);
          if (delivery.success && ['resend', 'smtp'].includes(delivery.mode)) {
            state.uncertain.delete(key);
            state.accepted.add(key);
            counts.sentCount++;
          } else if (delivery.uncertain || delivery.success) {
            counts.uncertainCount++;
          } else {
            state.uncertain.delete(key);
            counts.failedCount++;
          }
        } catch {
          counts.uncertainCount++;
        }
      }
    }));
  } finally {
    state.running = false;
  }
  const success = !counts.failedCount && !counts.uncertainCount && !counts.deferredCount && !selected.invalidCount;
  return result(success ? 'completed' : 'incomplete', success);
}
