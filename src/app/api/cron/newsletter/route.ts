import { NextResponse } from 'next/server';
import { getAllSubscribersAsync } from '@/lib/subscriberStore';
import { isEmailConfigured, sendWeeklyReportEmail } from '@/lib/emailSender';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';
import { buildNewsletterPlan } from '@/lib/newsletterContent';
import { runWeeklyNewsletter } from '@/lib/newsletterService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Existing weekly schedule: Monday 09:35 KST. dryRun never sends or changes subscribers. */
export async function GET(request: Request) {
  const json = (body: unknown, status = 200) => NextResponse.json(body, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
  if (!verifyAdminRequest(request).authorized) return json({ success: false, error: 'unauthorized' }, 401);
  const schedulerConfigured = !!process.env.CRON_SECRET?.trim();
  if (!isEmailConfigured()) return json({ success: false, status: 'email_not_configured', schedulerConfigured, sentCount: 0 }, 503);
  try {
    // The daily 07:00 pipeline publishes checked data. Avoid another DART crawl
    // or writes to a serverless filesystem during the scheduled email request.
    loadServerCustomIpos();
    const plan = buildNewsletterPlan(getAllEffectiveIpos());
    const subscribers = await getAllSubscribersAsync({ requireRemote: true });
    const result = await runWeeklyNewsletter({
      plan, subscribers, dryRun: new URL(request.url).searchParams.get('dryRun') === '1',
      send: (subscriber, idempotencyKey) => sendWeeklyReportEmail(subscriber, { plan, idempotencyKey }),
    });
    if (result.dryRun && !schedulerConfigured) {
      return json({ ...result, success: false, status: 'scheduler_not_configured', schedulerConfigured }, 503);
    }
    console.info('[Cron:WeeklyNewsletter]', JSON.stringify(result));
    return json({ ...result, schedulerConfigured }, result.success ? 200 : result.status === 'already_running' ? 409 : 502);
  } catch (error) {
    console.error('[Cron:WeeklyNewsletter] 발송 준비 또는 구독자 저장소 확인 실패');
    const storeError = error instanceof Error && error.message === 'SUBSCRIBER_STORE_UNAVAILABLE';
    const reason = storeError && typeof error.cause === 'string'
      && ['request_failed', 'invalid_json', 'invalid_envelope', 'unconfirmed_response', 'invalid_email', 'invalid_status', 'http_error'].includes(error.cause)
      ? error.cause : 'preparation_failed';
    return json({ success: false, status: 'newsletter_unavailable', reason, schedulerConfigured, sentCount: 0 }, 503);
  }
}
