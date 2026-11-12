import nodemailer from 'nodemailer';
import { createHash } from 'node:crypto';
import { Subscriber } from './subscriberStore';
import { getAllEffectiveIpos } from './ipoUtils';
import { buildNewsletterPlan, renderWeeklyNewsletter, type NewsletterPlan } from './newsletterContent';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'newsletter@iposcore.kr';
const SENDER_NAME = '공모주 알리미 (iposcore.kr)';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
}

export interface SendMailResult {
  success: boolean;
  id?: string;
  mode: string;
  error?: string;
  uncertain?: boolean;
}

/**
 * 실제 외부 이메일 발송 서비스(Resend API 또는 SMTP)가 설정되어 있는지 여부
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY?.trim() || (process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()));
}

/**
 * success는 제공자가 해당 수신자를 수락했을 때만 반환한다. 받은편지함 도착을 의미하지 않는다.
 * Resend의 수락 여부가 불명확하면 SMTP로 재발송하지 않는다 (제공자 간 중복 방지 불가).
 */
export async function sendEmail({ to, subject, html, text, idempotencyKey }: SendMailOptions): Promise<SendMailResult> {
  // 테스트 더미 도메인 안전 차단 (실제 메일 발송 방지)
  const toLower = to.toLowerCase().trim();
  if (
    toLower.endsWith('@iposcore.kr') ||
    toLower.endsWith('@example.com') ||
    toLower === 'test@test.com' ||
    toLower.startsWith('dummy')
  ) {
    return { success: false, mode: 'blocked_test', error: 'test_recipient_blocked' };
  }

  if (!toLower) return { success: false, mode: 'unconfigured', error: 'invalid_recipient' };
  if (idempotencyKey !== undefined && (typeof idempotencyKey !== 'string' || !/^[\x21-\x7e]{1,256}$/.test(idempotencyKey))) {
    return { success: false, mode: 'unconfigured', error: 'invalid_idempotency_key' };
  }

  // 1. Resend API 방식 (RESEND_API_KEY 존재 시)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  let resendFailure: SendMailResult | undefined;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(30_000),
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      });

      if (response.ok) {
        const data: unknown = await response.json();
        const id = data && typeof data === 'object' && 'id' in data ? data.id : undefined;
        if (typeof id === 'string' && id.trim()) {
          return { success: true, id, mode: 'resend' };
        }
        return { success: false, mode: 'resend', error: 'invalid_provider_response', uncertain: true };
      }
      await response.body?.cancel();
      // 408/409 및 서버 오류는 이미 수락되었을 가능성이 있어 다른 제공자로 보내지 않는다.
      if (response.status < 400 || response.status >= 500 || response.status === 408 || response.status === 409) {
        return { success: false, mode: 'resend', error: 'provider_unavailable', uncertain: true };
      }
      resendFailure = { success: false, mode: 'resend', error: 'provider_rejected' };
    } catch {
      return { success: false, mode: 'resend', error: 'provider_request_failed', uncertain: true };
    }
  }

  // 2. SMTP 방식 (Gmail, Naver 등)
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass?.trim()) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    let closeTransport: (() => void) | undefined;
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) === 465 : true),
        connectionTimeout: 30_000,
        greetingTimeout: 30_000,
        socketTimeout: 30_000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      let closed = false;
      closeTransport = () => {
        if (closed) return;
        closed = true;
        try { transporter.close(); } catch { /* Cleanup must not expose or override the delivery result. */ }
      };
      // The socket timeouts above measure inactivity, so also bound the complete SMTP attempt.
      const deadline = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          timedOut = true;
          reject(new Error('SMTP_SEND_TIMEOUT'));
          closeTransport?.();
        }, 45_000);
      });

      const info = await Promise.race([transporter.sendMail({
        from: `"${SENDER_NAME}" <${smtpUser}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
        // SMTP에는 제공자 간 중복 방지 보장이 없지만 같은 작업의 Message-ID는 유지한다.
        ...(idempotencyKey ? { messageId: `<${createHash('sha256').update(idempotencyKey).digest('hex')}@iposcore.kr>` } : {}),
      }), deadline]);

      const containsRecipient = (addresses: unknown): boolean => Array.isArray(addresses) && addresses.some(address => {
        const value = typeof address === 'string' ? address
          : address && typeof address === 'object' && 'address' in address ? address.address : undefined;
        return typeof value === 'string' && value.trim().toLowerCase() === toLower;
      });
      if (!containsRecipient(info.accepted) || containsRecipient(info.rejected)) {
        return { success: false, mode: 'smtp', error: 'recipient_not_accepted' };
      }
      return { success: true, ...(typeof info.messageId === 'string' && info.messageId.trim() ? { id: info.messageId } : {}), mode: 'smtp' };
    } catch {
      return { success: false, mode: 'smtp', error: timedOut ? 'provider_timeout' : 'provider_request_failed', uncertain: true };
    } finally {
      if (timeout !== undefined) clearTimeout(timeout);
      closeTransport?.();
    }
  }

  return resendFailure ?? { success: false, mode: 'unconfigured', error: 'email_not_configured' };
}

/**
 * 1. 수신 동의 / 인증 메일 HTML 템플릿 생성기 (Double Opt-in)
 */
export function getVerificationEmailTemplate(subscriber: { email: string; verificationToken: string; unsubscribeToken: string }) {
  const verifyUrl = `${SITE_URL}/api/newsletter/verify?token=${subscriber.verificationToken}`;
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
  const subject = `[공모주 알리미] 뉴스레터 구독 확인 및 수신 동의 안내`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #111827;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 32px 32px 20px 32px; background-color: #1d4ed8; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">공모주 알리미</h1>
        <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px;">iposcore.kr | 공모주 청약 분석 리포트</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
          공모주 뉴스레터 구독 신청 확인
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
          안녕하세요! <strong>공모주 알리미</strong>에 관심을 가져주셔서 진심으로 감사드립니다.<br/>
          아래 <strong>[구독 동의 및 확인하기]</strong> 버튼을 누르시면 수신 동의가 완료되며, 매주 월요일 아침 이번 주 공모주 핵심 요약 리포트를 받아보실 수 있습니다.
        </p>

        <table align="center" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
          <tr>
            <td align="center" style="border-radius: 10px; background-color: #1d4ed8;">
              <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 10px;">
                구독 동의 및 확인하기 →
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-top: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1f2937;">제공되는 리포트 내용</p>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #6b7280; line-height: 1.6;">
            <li>금융감독원 DART 기관 수요예측 경쟁률 및 의무보유확약 요약</li>
            <li>유튜브 & 블로그 공모주 전문가 여론 컨센서스 분석</li>
            <li>실전 비례 청약 배정 계산기 바로가기</li>
          </ul>
        </div>

        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
          * 본인이 신청하지 않은 경우 본 메일을 무시하시면 구독이 활성화되지 않습니다.<br/>
          * 버튼이 클릭되지 않는 경우 아래 링크를 주소창에 복사해 입력해주세요:<br/>
          <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">
          본 메일은 정보통신망법 규정에 따라 <strong>${subscriber.email}</strong> 님의 요청에 의해 발송된 수신 확인 메일입니다.
        </p>
        <p style="margin: 0;">
          더 이상 메일을 원치 않으시면 언제든 <a href="${unsubscribeUrl}" style="color: #4b5563; text-decoration: underline;">수신거부(구독취소)</a>를 클릭하세요.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/**
 * 2. 수신 거부 완료 안내 메일 HTML 템플릿 생성기
 */
export function getUnsubscribeEmailTemplate(subscriber: { email: string }) {
  const resubscribeUrl = `${SITE_URL}#newsletter-section`;
  const subject = `[공모주 알리미] 수신 거부(구독 취소) 처리가 완료되었습니다`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #111827;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 28px; text-align: center; border-bottom: 1px solid #e5e7eb; background-color: #ffffff;">
        <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 800;">수신 거부 처리 완료</h2>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">공모주 알리미 (iposcore.kr)</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; font-size: 14px; line-height: 1.6; color: #4b5563;">
        <p style="margin: 0 0 12px 0;">
          <strong>${subscriber.email}</strong> 님의 수신 거부 요청이 정상적으로 처리되었습니다.
        </p>
        <p style="margin: 0 0 24px 0;">
          앞으로 공모주 알리미에서 발송되는 정기 리포트 메일이 발송되지 않습니다.<br/>
          그동안 서비스를 이용해 주셔서 감사드리며, 언제든 다시 필요하실 때 홈페이지에서 재신청하실 수 있습니다.
        </p>
        <p style="margin: 0; text-align: center;">
          <a href="${resubscribeUrl}" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: bold; background-color: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 8px;">
            공모주 알리미 홈 바로가기 →
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

/**
 * 3. 공식 근거와 값이 일치하는 주간 일정 리포트
 */
export function getWeeklyReportEmailTemplate(
  subscriber: { email: string; unsubscribeToken?: string },
  plan = buildNewsletterPlan(getAllEffectiveIpos())
) {
  return renderWeeklyNewsletter(plan, subscriber.unsubscribeToken || 'demo_token', SITE_URL);
}

/**
 * 이메일 발송 실행 래퍼들
 */
export async function sendVerificationEmail(subscriber: Subscriber) {
  const { subject, html } = getVerificationEmailTemplate(subscriber);
  return sendEmail({ to: subscriber.email, subject, html });
}

export async function sendUnsubscribeConfirmationEmail(subscriber: Subscriber) {
  const { subject, html } = getUnsubscribeEmailTemplate(subscriber);
  return sendEmail({ to: subscriber.email, subject, html });
}

export async function sendWeeklyReportEmail(
  subscriber: Subscriber,
  options: { plan?: NewsletterPlan; idempotencyKey?: string } = {}
) {
  if (subscriber.status !== 'ACTIVE' || !subscriber.unsubscribeToken || subscriber.unsubscribeToken.length < 24) {
    return { success: false, mode: 'invalid_subscriber', error: 'subscriber_not_ready' };
  }
  const plan = options.plan || buildNewsletterPlan(getAllEffectiveIpos());
  if (!plan.hasContent) return { success: false, mode: 'no_content', error: 'no_verified_schedule' };
  const { subject, html } = getWeeklyReportEmailTemplate(subscriber, plan);
  return sendEmail({ to: subscriber.email, subject, html, idempotencyKey: options.idempotencyKey });
}
