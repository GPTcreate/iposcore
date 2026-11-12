import assert from 'node:assert/strict';
import test from 'node:test';
import type { IpoFieldEvidence, IpoItem } from '../src/types/ipo';
import { buildNewsletterPlan, hasNewsletterEvidence, renderWeeklyNewsletter } from '../src/lib/newsletterContent';

const now = new Date('2026-11-12T03:00:00Z');
const sourceUrl = 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261103000363';
const proof = (value: string | number): IpoFieldEvidence => ({ sourceTitle: '공식 일정 공시', sourceUrl,
  checkedAt: '2026-11-05T01:00:00Z', publishedAt: '2026-11-03', value });

function ipo(changes: Partial<IpoItem> = {}): IpoItem {
  const item: IpoItem = { id: 'newsletter-fixture', name: '공시확인기업', code: '123456', market: 'KOSDAQ',
    status: 'SUBSCRIPTION', subscriptionStart: '2026-11-12', subscriptionEnd: '2026-11-13', refundDate: '2026-11-17',
    priceBandMin: 10000, priceBandMax: 12000, confirmedPrice: 12000,
    underwriters: [], institutionalCompetitionRate: 0, lockupCommitmentRate: 0, circulatingSupplyRate: 0,
    totalOfferingAmount: 0, marketCapAtIpo: 0, aiScore: 0, scoreGrade: 'C', expertReviews: [],
    sentimentConsensus: { positiveRatio: null, neutralRatio: null, cautionRatio: null },
    aiSummary: { headline: '등록 자료', bulletPoints: [], positivePoints: [], riskPoints: [] },
    dataQuality: { status: 'unverified' },
    scheduleVerification: { status: 'partial', checkedAt: '2026-11-05T01:00:00Z', conflicts: [],
      coveredFields: ['subscriptionStart', 'subscriptionEnd'] }, ...changes };
  if (!Object.prototype.hasOwnProperty.call(changes, 'fieldEvidence')) {
    item.fieldEvidence = { subscriptionStart: proof(item.subscriptionStart), subscriptionEnd: proof(item.subscriptionEnd),
      refundDate: proof(item.refundDate), confirmedPrice: proof(item.confirmedPrice),
      ...(item.listingDate ? { listingDate: proof(item.listingDate) } : {}) };
  }
  return item;
}

const visibleIds = (plan: ReturnType<typeof buildNewsletterPlan>) => [...plan.active, ...plan.upcoming, ...plan.waiting].map(item => item.id);

test('newsletter eligibility needs exact field-bound official evidence, independently of a whole-company review', () => {
  const verified = ipo();
  assert.equal(hasNewsletterEvidence(verified, 'subscriptionStart'), true);
  assert.equal(buildNewsletterPlan([verified], now).hasContent, true);
  const wholeReview = { status: 'reviewed' as const, reviewedAt: '2026-11-05', sources: [{ title: '전체 검토 공시', url: sourceUrl }] };
  const invalidProofs: (IpoFieldEvidence | undefined)[] = [undefined,
    { ...proof(verified.subscriptionStart), value: undefined },
    { ...proof(verified.subscriptionStart), value: null },
    proof('2026-11-11'),
    { ...proof(verified.subscriptionStart), sourceUrl: 'https://example.invalid/notice' },
    { ...proof(verified.subscriptionStart), checkedAt: 'not-a-date' },
  ];
  for (const evidence of invalidProofs) {
    const item = ipo({ dataQuality: wholeReview, fieldEvidence: { ...verified.fieldEvidence, subscriptionStart: evidence } });
    assert.equal(hasNewsletterEvidence(item, 'subscriptionStart'), false);
    assert.equal(buildNewsletterPlan([item], now).hasContent, false);
  }
  const changed = { ...verified, subscriptionStart: '2026-11-11' };
  assert.equal(hasNewsletterEvidence(changed, 'subscriptionStart'), false);
  assert.equal(buildNewsletterPlan([changed], now).hasContent, false);
});

test('cancelled, listed, unavailable and conflicted records never enter any newsletter section', () => {
  const accepted = ipo({ id: 'accepted' });
  const rejected = [
    ipo({ id: 'cancelled', isCancelled: true }),
    ipo({ id: 'listed', status: 'LISTED' }),
    ipo({ id: 'unavailable', scheduleVerification: { status: 'unavailable', checkedAt: '2026-11-05T01:00:00Z', conflicts: [], coveredFields: [] } }),
    ipo({ id: 'conflict', scheduleVerification: { status: 'conflict', checkedAt: '2026-11-05T01:00:00Z', conflicts: [], coveredFields: [] } }),
    ipo({ id: 'partial-conflict', scheduleVerification: { status: 'partial', checkedAt: '2026-11-05T01:00:00Z', conflicts: ['listingDate'], coveredFields: [] } }),
  ];
  const plan = buildNewsletterPlan([accepted, ...rejected], now);
  assert.deepEqual(visibleIds(plan), ['accepted']);
  assert.equal(plan.eligibleCount, 1);
});

test('active subscription cards require the active status, a positive finite final price and its exact official proof', () => {
  const accepted = ipo({ id: 'active' });
  const rejected = [
    ipo({ id: 'upcoming-today', status: 'UPCOMING' }),
    ipo({ id: 'zero', confirmedPrice: 0 }),
    ipo({ id: 'negative', confirmedPrice: -100 }),
    ipo({ id: 'infinite', confirmedPrice: Number.POSITIVE_INFINITY }),
    ipo({ id: 'no-price-proof', fieldEvidence: { subscriptionStart: proof('2026-11-12'), subscriptionEnd: proof('2026-11-13') } }),
    ipo({ id: 'stale-price-proof', confirmedPrice: 13000, fieldEvidence: { subscriptionStart: proof('2026-11-12'), subscriptionEnd: proof('2026-11-13'), confirmedPrice: proof(12000) } }),
    ipo({ id: 'not-started', subscriptionStart: '2026-11-13', subscriptionEnd: '2026-11-14' }),
    ipo({ id: 'finished', subscriptionStart: '2026-11-10', subscriptionEnd: '2026-11-11' }),
  ];
  const plan = buildNewsletterPlan([accepted, ...rejected], now);
  assert.deepEqual(plan.active.map(item => item.id), ['active']);
});

test('waiting cards need an exact current listing date and never appear a second time as active cards', () => {
  const waiting = ipo({ id: 'waiting', status: 'WAITING_LISTING', listingDate: '2026-11-20' });
  const missing = ipo({ id: 'no-listing', status: 'WAITING_LISTING' });
  const stale = ipo({ id: 'stale-listing', status: 'WAITING_LISTING', listingDate: '2026-11-20', fieldEvidence: {
    subscriptionStart: proof('2026-11-12'), subscriptionEnd: proof('2026-11-13'), listingDate: proof('2026-11-19') } });
  const past = ipo({ id: 'past-listing', status: 'WAITING_LISTING', listingDate: '2026-11-11' });
  const plan = buildNewsletterPlan([waiting, missing, stale, past], now);
  assert.deepEqual(plan.waiting.map(item => item.id), ['waiting']);
  assert.deepEqual(plan.active, []);
  assert.deepEqual(visibleIds(plan), ['waiting']);
});

test('invalid and reversed calendar dates cannot supply newsletter content', () => {
  for (const item of [ipo({ subscriptionStart: '2026-02-30' }),
    ipo({ subscriptionStart: '2026-11-14', subscriptionEnd: '2026-11-13' }),
    ipo({ subscriptionStart: '', subscriptionEnd: '' })]) {
    const plan = buildNewsletterPlan([item], now);
    assert.equal(plan.eligibleCount, 0);
    assert.equal(plan.hasContent, false);
  }
});

test('weekly keys switch on Monday midnight in Korea, including a year boundary', () => {
  const beforeMonday = buildNewsletterPlan([], new Date('2026-11-15T14:59:59Z'));
  const monday = buildNewsletterPlan([], new Date('2026-11-15T15:00:00Z'));
  assert.equal(beforeMonday.today, '2026-11-15');
  assert.equal(beforeMonday.period, '2026-11-09');
  assert.equal(monday.today, '2026-11-16');
  assert.equal(monday.period, '2026-11-16');
  assert.equal(buildNewsletterPlan([], new Date('2027-01-03T14:59:59Z')).period, '2026-12-28');
  assert.equal(buildNewsletterPlan([], new Date('2027-01-03T15:00:00Z')).period, '2027-01-04');
});

test('newsletter sections sort by relevant dates, honor the 4/6/3 caps and leave source records unchanged', () => {
  const date = (day: number) => `2026-11-${String(day).padStart(2, '0')}`;
  const active = Array.from({ length: 6 }, (_, index) => ipo({ id: `active-${index}`, subscriptionEnd: date(13 + index), refundDate: date(20 + index) }));
  const upcoming = Array.from({ length: 8 }, (_, index) => ipo({ id: `upcoming-${index}`, status: 'UPCOMING', subscriptionStart: date(14 + index), subscriptionEnd: date(15 + index), refundDate: date(17 + index) }));
  const waiting = Array.from({ length: 5 }, (_, index) => ipo({ id: `waiting-${index}`, status: 'WAITING_LISTING',
    subscriptionStart: '2026-11-05', subscriptionEnd: '2026-11-06', refundDate: '2026-11-10', listingDate: date(14 + index) }));
  const input = [...active, ...upcoming, ...waiting].reverse(), original = structuredClone(input);
  const plan = buildNewsletterPlan(input, now);
  assert.deepEqual(plan.active.map(item => item.id), ['active-0', 'active-1', 'active-2', 'active-3']);
  assert.deepEqual(plan.upcoming.map(item => item.id), ['upcoming-0', 'upcoming-1', 'upcoming-2', 'upcoming-3', 'upcoming-4', 'upcoming-5']);
  assert.deepEqual(plan.waiting.map(item => item.id), ['waiting-0', 'waiting-1', 'waiting-2']);
  assert.equal(plan.eligibleCount, input.length);
  assert.equal(plan.hasContent, true);
  assert.deepEqual(input, original);
});

test('newsletter HTML escapes issuer names and links and encodes the unsubscribe token and record path', () => {
  const item = ipo({ id: 'fixture/id?x="<&', name: '<img src=x onerror="alert(1)"> & \'IPO\'', fieldEvidence: {
    subscriptionStart: { ...proof('2026-11-12'), sourceUrl: `${sourceUrl}&dcmNo=123` },
    subscriptionEnd: proof('2026-11-13'), confirmedPrice: proof(12000) } });
  const token = 'unsub&"><img/';
  const { html } = renderWeeklyNewsletter(buildNewsletterPlan([item], now), token);
  assert(!html.includes(item.name));
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;IPO&#39;'));
  assert(html.includes(`${sourceUrl}&amp;dcmNo=123`));
  assert(html.includes(`/ipo/${encodeURIComponent(item.id)}`));
  assert(html.includes(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`));
  for (const bad of ['http://www.iposcore.kr', 'https://www.iposcore.kr.attacker.invalid', 'https://user@www.iposcore.kr', 'https://www.iposcore.kr:8443']) {
    assert.throws(() => renderWeeklyNewsletter(buildNewsletterPlan([item], now), token, bad));
  }
});

test('newsletter renders only individually proved optional dates and prices, without raw narratives or metrics', () => {
  const item = ipo({ id: 'upcoming-with-raw-values', status: 'UPCOMING', subscriptionStart: '2026-11-18', subscriptionEnd: '2026-11-19',
    refundDate: '2026-11-23', confirmedPrice: 98765, priceBandMin: 12345, priceBandMax: 65432,
    institutionalCompetitionRate: 8765.43, lockupCommitmentRate: 33.21, circulatingSupplyRate: 44.32,
    aiScore: 99, scoreGrade: 'S', underwriters: [{ name: 'UNVERIFIED_BROKER_SENTINEL', fee: 0, allocatedShares: 0 }],
    aiSummary: { headline: 'UNVERIFIED_SUMMARY_SENTINEL', bulletPoints: ['UNVERIFIED_BULLET'], positivePoints: [], riskPoints: [] },
    fieldEvidence: { subscriptionStart: proof('2026-11-18'), subscriptionEnd: proof('2026-11-19'), refundDate: proof('2026-11-24'), confirmedPrice: proof(98000) } });
  const plan = buildNewsletterPlan([item], now);
  const { html } = renderWeeklyNewsletter(plan, 'fixture-unsubscribe');
  assert(html.includes('2026-11-18 ~ 2026-11-19'));
  assert(html.includes('확정 공모가 원문 확인 중'));
  assert(!html.includes('2026-11-23'));
  for (const raw of ['98,765', '98765', '12,345', '65,432', '8765.43', '8,765.43', '33.21', '44.32', '참고 점수', '참고 구간',
    'UNVERIFIED_BROKER_SENTINEL', 'UNVERIFIED_SUMMARY_SENTINEL', 'UNVERIFIED_BULLET']) assert(!html.includes(raw), raw);
  const checked = ipo({ status: 'UPCOMING', subscriptionStart: '2026-11-18', subscriptionEnd: '2026-11-19', refundDate: '2026-11-23' });
  const verifiedHtml = renderWeeklyNewsletter(buildNewsletterPlan([checked], now), 'fixture-unsubscribe').html;
  assert(verifiedHtml.includes('12,000원'));
  assert(verifiedHtml.includes('2026-11-23'));
  const nonFinite = ipo({ status: 'UPCOMING', subscriptionStart: '2026-11-18', subscriptionEnd: '2026-11-19', confirmedPrice: Number.POSITIVE_INFINITY });
  const nonFiniteHtml = renderWeeklyNewsletter(buildNewsletterPlan([nonFinite], now), 'fixture-unsubscribe').html;
  assert(nonFiniteHtml.includes('확정 공모가 원문 확인 중'));
  assert(!nonFiniteHtml.includes('∞'));
});

test('an empty or entirely excluded plan exposes no sendable content', () => {
  for (const records of [[], [ipo({ isCancelled: true })]]) {
    const plan = buildNewsletterPlan(records, now);
    assert.equal(plan.eligibleCount, 0);
    assert.equal(plan.hasContent, false);
    assert.deepEqual(visibleIds(plan), []);
    const rendered = renderWeeklyNewsletter(plan, 'fixture-unsubscribe');
    assert(rendered.html.includes('이번 발송에 포함할 확인된 일정이 없습니다.'));
    assert(!rendered.html.includes('공시확인기업'));
  }
});
