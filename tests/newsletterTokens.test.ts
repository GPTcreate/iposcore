import assert from 'node:assert/strict';
import test from 'node:test';
import { createHmac } from 'node:crypto';
import { getNewsletterUnsubscribeToken, matchesNewsletterUnsubscribeToken } from '../src/lib/newsletterTokens';

const recipient = { email: 'reader@fixture.invalid' };
const secret = 'fixture-scheduler-secret';

test('legacy unsubscribe tokens normalize email case and surrounding whitespace deterministically', () => {
  const token = getNewsletterUnsubscribeToken(recipient, secret);
  assert(token);
  assert.match(token, /^nu1_[a-f0-9]{64}$/);
  assert.equal(token, getNewsletterUnsubscribeToken({ email: ' READER@fixture.invalid ' }, secret));
  assert.equal(matchesNewsletterUnsubscribeToken(recipient, token, secret), true);
  assert.equal(matchesNewsletterUnsubscribeToken({ email: ' READER@fixture.invalid ' }, token, secret), true);
});

test('an existing stored token of at least 24 characters is preserved even without a signing key', () => {
  for (const unsubscribeToken of ['stored-fixture-token-1234', 'another-stored-fixture-token-123456789']) {
    assert(unsubscribeToken.length >= 24);
    assert.equal(getNewsletterUnsubscribeToken({ ...recipient, unsubscribeToken }, ''), unsubscribeToken);
    assert.equal(getNewsletterUnsubscribeToken({ ...recipient, unsubscribeToken }, secret), unsubscribeToken);
  }
  assert.match(getNewsletterUnsubscribeToken({ ...recipient, unsubscribeToken: 'short-token' }, secret)!, /^nu1_[a-f0-9]{64}$/);
});

test('missing or blank keys cannot create or validate a derived token', () => {
  const token = getNewsletterUnsubscribeToken(recipient, secret)!;
  for (const emptySecret of ['', ' ', '\t\n']) {
    assert.equal(getNewsletterUnsubscribeToken(recipient, emptySecret), null);
    assert.equal(matchesNewsletterUnsubscribeToken(recipient, token, emptySecret), false);
  }
  assert.equal(getNewsletterUnsubscribeToken({ email: ' ' }, secret), null);
  assert.equal(matchesNewsletterUnsubscribeToken({ email: ' ' }, token, secret), false);
});

test('tokens bind the recipient, secret, purpose and version', () => {
  const token = getNewsletterUnsubscribeToken(recipient, secret)!;
  assert.equal(matchesNewsletterUnsubscribeToken({ email: 'other@fixture.invalid' }, token, secret), false);
  assert.equal(matchesNewsletterUnsubscribeToken(recipient, token, 'other-fixture-secret'), false);
  assert.notEqual(token, getNewsletterUnsubscribeToken({ email: 'other@fixture.invalid' }, secret));
  const digest = (purpose: string) => createHmac('sha256', secret).update(`${purpose}${recipient.email}`).digest('hex');
  assert.equal(token, `nu1_${digest('iposcore:newsletter:unsubscribe:v1:')}`);
  for (const wrongPurpose of ['iposcore:newsletter:verify:v1:', 'other-site:newsletter:unsubscribe:v1:', 'iposcore:newsletter:unsubscribe:v2:', '']) {
    assert.equal(matchesNewsletterUnsubscribeToken(recipient, `nu1_${digest(wrongPurpose)}`, secret), false);
  }
});

test('malformed, truncated, extended, tampered and unversioned tokens are rejected safely', () => {
  const token = getNewsletterUnsubscribeToken(recipient, secret)!;
  const flipped = `${token.slice(0, -1)}${token.endsWith('0') ? '1' : '0'}`;
  for (const value of ['', token.slice(1), `${token}0`, `${token}\n`, ` ${token}`, token.toUpperCase(),
    `nu2_${token.slice(4)}`, `nu1_${'g'.repeat(64)}`, token.slice(4), flipped,
    'stored-fixture-token-1234', null, 42, {}]) {
    assert.equal(matchesNewsletterUnsubscribeToken(recipient, value as string, secret), false);
  }
});

test('derived tokens contain no plaintext recipient or secret and do not mutate source records', () => {
  const sub = { ...recipient, unsubscribeToken: '' };
  const before = JSON.stringify(sub);
  const token = getNewsletterUnsubscribeToken(sub, secret)!;
  assert(!token.includes(recipient.email));
  assert(!token.includes('reader'));
  assert(!token.includes(secret));
  assert.equal(token.length, 68);
  assert.equal(JSON.stringify(sub), before);
});

test('default scheduler secret is read at call time and absent configuration fails closed', () => {
  const previous = process.env.CRON_SECRET;
  try {
    process.env.CRON_SECRET = ` ${secret} `;
    const token = getNewsletterUnsubscribeToken(recipient)!;
    assert.equal(token, getNewsletterUnsubscribeToken(recipient, secret));
    assert.equal(matchesNewsletterUnsubscribeToken(recipient, token), true);
    delete process.env.CRON_SECRET;
    assert.equal(getNewsletterUnsubscribeToken(recipient), null);
    assert.equal(matchesNewsletterUnsubscribeToken(recipient, token), false);
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});
