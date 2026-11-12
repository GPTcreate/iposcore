import type { IpoEvidenceField, IpoItem } from '../types/ipo';
import { getFieldEvidence } from './contentQuality';

export interface NewsletterPlan {
  period: string;
  today: string;
  active: IpoItem[];
  upcoming: IpoItem[];
  waiting: IpoItem[];
  eligibleCount: number;
  hasContent: boolean;
}
const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const validDay = (value: unknown): value is string => typeof value === 'string' && dayPattern.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** Automatic emails need evidence bound to the exact field, never an item-wide review flag. */
export function hasNewsletterEvidence(ipo: IpoItem, field: IpoEvidenceField): boolean {
  const evidence = getFieldEvidence(ipo, field), value = ipo[field];
  return value !== undefined && value !== null && !!evidence && evidence.value === value;
}

export function buildNewsletterPlan(ipos: IpoItem[], now = new Date()): NewsletterPlan {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const monday = new Date(`${today}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const eligible = ipos.filter(ipo => !ipo.isCancelled && ipo.status !== 'LISTED'
    && !['conflict', 'unavailable'].includes(ipo.scheduleVerification?.status || '')
    && !ipo.scheduleVerification?.conflicts.length
    && validDay(ipo.subscriptionStart) && validDay(ipo.subscriptionEnd) && ipo.subscriptionStart <= ipo.subscriptionEnd
    && hasNewsletterEvidence(ipo, 'subscriptionStart') && hasNewsletterEvidence(ipo, 'subscriptionEnd')
    && (ipo.status !== 'WAITING_LISTING' || (validDay(ipo.listingDate) && ipo.listingDate >= today
      && hasNewsletterEvidence(ipo, 'listingDate'))));
  const active = eligible.filter(ipo => ipo.status === 'SUBSCRIPTION'
    && ipo.subscriptionStart <= today && ipo.subscriptionEnd >= today
    && Number.isFinite(ipo.confirmedPrice) && ipo.confirmedPrice > 0 && hasNewsletterEvidence(ipo, 'confirmedPrice'))
    .sort((a, b) => a.subscriptionEnd.localeCompare(b.subscriptionEnd)).slice(0, 4);
  const upcoming = eligible.filter(ipo => ipo.subscriptionStart > today)
    .sort((a, b) => a.subscriptionStart.localeCompare(b.subscriptionStart)).slice(0, 6);
  const waiting = eligible.filter(ipo => ipo.status === 'WAITING_LISTING')
    .sort((a, b) => a.listingDate!.localeCompare(b.listingDate!)).slice(0, 3);
  return { period: monday.toISOString().slice(0, 10), today, active, upcoming, waiting,
    eligibleCount: eligible.length, hasContent: active.length + upcoming.length + waiting.length > 0 };
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

/** Render only checked dates and the exact official price. No unverified narrative or investment score. */
export function renderWeeklyNewsletter(plan: NewsletterPlan, unsubscribeToken: string, siteUrl = 'https://www.iposcore.kr') {
  const origin = new URL(siteUrl);
  if (origin.protocol !== 'https:' || !['www.iposcore.kr', 'iposcore.kr'].includes(origin.hostname)
    || origin.username || origin.password || origin.port) throw new Error('NEWSLETTER_SITE_URL');
  const site = origin.origin;
  const card = (ipo: IpoItem, listing = false) => {
    const start = getFieldEvidence(ipo, 'subscriptionStart')!;
    const listingEvidence = listing ? getFieldEvidence(ipo, 'listingDate') : undefined;
    const price = Number.isFinite(ipo.confirmedPrice) && ipo.confirmedPrice > 0 && hasNewsletterEvidence(ipo, 'confirmedPrice')
      ? `${ipo.confirmedPrice.toLocaleString('ko-KR')}원` : '확정 공모가 원문 확인 중';
    const refund = validDay(ipo.refundDate) && hasNewsletterEvidence(ipo, 'refundDate') ? ipo.refundDate : '원문 확인 중';
    return `<div style="border:1px solid #dbe3ee;border-radius:10px;padding:18px;margin:12px 0">
      <h3 style="margin:0 0 12px">${escapeHtml(ipo.name)}</h3>
      <p>${listing ? `상장일 ${escapeHtml(ipo.listingDate!)}` : `청약 ${escapeHtml(ipo.subscriptionStart)} ~ ${escapeHtml(ipo.subscriptionEnd)}`}</p>
      <p>환불일 ${escapeHtml(refund)} · ${escapeHtml(price)}</p>
      <a href="${escapeHtml((listingEvidence || start).sourceUrl)}">공식 일정 원문</a>
      · <a href="${site}/ipo/${encodeURIComponent(ipo.id)}">종목 자료 보기</a>
    </div>`;
  };
  const section = (title: string, items: IpoItem[], listing = false) => items.length
    ? `<h2 style="font-size:18px;margin-top:26px">${title}</h2>${items.map(ipo => card(ipo, listing)).join('')}` : '';
  const subject = '[공모주 알리미] 이번 주 청약 일정 리포트';
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${subject}</title></head>
    <body style="margin:0;padding:24px 12px;background:#f3f4f6;font-family:Arial,sans-serif;color:#172033">
    <main style="max-width:600px;margin:auto;padding:24px;background:white;border-radius:12px">
      <h1 style="font-size:23px;color:#1d4ed8">공모주 알리미 주간 리포트</h1>
      <p>${plan.today} 기준 · 항목별 공식 근거가 확인된 일정입니다.</p>
      ${section('청약 기간', plan.active)}${section('다가오는 청약', plan.upcoming)}${section('상장 예정', plan.waiting, true)}
      ${plan.hasContent ? '' : '<p>이번 발송에 포함할 확인된 일정이 없습니다.</p>'}
      <p style="font-size:12px;color:#526071">자동 일정 대조는 기업 전체 검토나 투자 추천을 뜻하지 않습니다. 신청 전 주관사의 최종 공고를 확인하세요.</p>
      <p><a href="${site}">IPOScore에서 전체 자료 보기</a></p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin-top:28px">
      <p style="font-size:12px;color:#64748b">수신에 동의한 구독자에게 매주 월요일 발송합니다.
      <a href="${site}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}">수신 거부</a></p>
    </main></body></html>`;
  return { subject, html };
}
