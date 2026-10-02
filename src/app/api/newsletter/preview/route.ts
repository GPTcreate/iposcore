import { NextResponse } from 'next/server';
import {
  getVerificationEmailTemplate,
  getUnsubscribeEmailTemplate,
  getWeeklyReportEmailTemplate,
} from '@/lib/emailSender';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'verification';
  const dummyEmail = 'subscriber@iposcore.kr';

  let renderedHtml = '';

  switch (template) {
    case 'verification':
    case 'verify':
      renderedHtml = getVerificationEmailTemplate({
        email: dummyEmail,
        verificationToken: 'demo_verification_token',
        unsubscribeToken: 'demo_unsubscribe_token',
      }).html;
      break;

    case 'unsubscribe':
      renderedHtml = getUnsubscribeEmailTemplate({
        email: dummyEmail,
      }).html;
      break;

    case 'report':
    case 'weekly':
    default:
      renderedHtml = getWeeklyReportEmailTemplate({
        email: dummyEmail,
        unsubscribeToken: 'demo_unsubscribe_token',
      }).html;
      break;
  }

  return new NextResponse(renderedHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
