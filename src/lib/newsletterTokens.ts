import { createHmac, timingSafeEqual } from 'node:crypto';

const PURPOSE = 'iposcore:newsletter:unsubscribe:v1:';
const TOKEN_PATTERN = /^nu1_[a-f0-9]{64}$/;

function signedToken(email: string, secret: string | undefined): string | null {
  if (typeof email !== 'string' || typeof secret !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();
  const signingSecret = secret.trim();
  if (!normalizedEmail || !signingSecret) return null;
  return `nu1_${createHmac('sha256', signingSecret).update(PURPOSE + normalizedEmail).digest('hex')}`;
}

/** Preserve durable tokens; legacy rows use the existing scheduler secret without a storage write. */
export function getNewsletterUnsubscribeToken(
  sub: { email: string; unsubscribeToken?: string },
  secret = process.env.CRON_SECRET?.trim()
): string | null {
  if (typeof sub.unsubscribeToken === 'string' && sub.unsubscribeToken.length >= 24) return sub.unsubscribeToken;
  return signedToken(sub.email, secret);
}

/** Only this versioned unsubscribe purpose is accepted; comparisons use equal-size binary digests. */
export function matchesNewsletterUnsubscribeToken(
  sub: { email: string },
  token: string,
  secret = process.env.CRON_SECRET?.trim()
): boolean {
  if (typeof token !== 'string' || token.length !== 68 || !TOKEN_PATTERN.test(token)) return false;
  const expected = signedToken(sub.email, secret);
  if (!expected) return false;
  return timingSafeEqual(Buffer.from(token.slice(4), 'hex'), Buffer.from(expected.slice(4), 'hex'));
}
