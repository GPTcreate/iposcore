import nodemailer from 'nodemailer';
import { Subscriber } from './subscriberStore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'newsletter@iposcore.kr';
const SENDER_NAME = '공모주 알리미 (iposcore.kr)';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 이메일 전송 발송기 (Resend API -> SMTP -> 시뮬레이션 콘솔 순 자동 처리)
 */
export async function sendEmail({ to, subject, html, text }: SendMailOptions): Promise<{ success: boolean; id?: string; mode: string }> {
  // 1. Resend API 방식 (RESEND_API_KEY 존재 시)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[EmailSender:Resend] 발송 성공 -> ${to} (ID: ${data.id})`);
        return { success: true, id: data.id, mode: 'resend' };
      } else {
        console.error('[EmailSender:Resend] 실패 응답:', data);
      }
    } catch (err) {
      console.error('[EmailSender:Resend] 에러 발생:', err);
    }
  }

  // 2. SMTP 방식 (Gmail, Naver 등)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) === 465 : true),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${smtpUser}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      });

      console.log(`[EmailSender:SMTP] 발송 성공 -> ${to} (MessageId: ${info.messageId})`);
      return { success: true, id: info.messageId, mode: 'smtp' };
    } catch (err) {
      console.error('[EmailSender:SMTP] 에러 발생:', err);
    }
  }

  // 3. 테스트 / 시뮬레이션 모드 (API 키 미설정 시 안전 폴백)
  console.log(`
========================================================================
[EmailSender:SIMULATION] 실제 발송 환경변수(RESEND_API_KEY 또는 SMTP)가 설정되지 않아 가상 발송 처리되었습니다.
- 수신자: ${to}
- 제목: ${subject}
- 사이트 URL: ${SITE_URL}
========================================================================
  `);
  return { success: true, id: `sim_${Date.now()}`, mode: 'simulation' };
}

/**
 * 1. 수신 동의 / 인증 메일 발송 (Double Opt-in)
 */
export async function sendVerificationEmail(subscriber: Subscriber) {
  const verifyUrl = `${SITE_URL}/api/newsletter/verify?token=${subscriber.verificationToken}`;
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;

  const subject = `[공모주 알리미] 뉴스레터 구독 확인 및 수신 동의 안내`;
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #111827;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- 헤더 -->
    <tr>
      <td style="padding: 32px 32px 20px 32px; background-color: #1d4ed8; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">공모주 알리미</h1>
        <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px;">iposcore.kr | 공모주 청약 분석 리포트</p>
      </td>
    </tr>

    <!-- 본문 -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
          공모주 뉴스레터 구독 신청 확인
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
          안녕하세요! <strong>공모주 알리미</strong>에 관심을 가져주셔서 진심으로 감사드립니다.<br/>
          아래 <strong>[구독 동의 및 확인하기]</strong> 버튼을 누르시면 수신 동의가 완료되며, 매주 월요일 아침 이번 주 공모주 핵심 요약 리포트를 받아보실 수 있습니다.
        </p>

        <!-- 확인 버튼 -->
        <table align="center" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
          <tr>
            <td align="center" style="border-radius: 10px; background-color: #1d4ed8;">
              <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 10px;">
                구독 동의 및 확인하기 →
              </a>
            </td>
          </tr>
        </table>

        <!-- 혜택 안내 -->
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

    <!-- 푸터 및 수신 거부 -->
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
</html>
  `;

  return sendEmail({ to: subscriber.email, subject, html });
}

/**
 * 2. 수신 거부 완료 안내 메일
 */
export async function sendUnsubscribeConfirmationEmail(subscriber: Subscriber) {
  const resubscribeUrl = `${SITE_URL}#newsletter-section`;
  const subject = `[공모주 알리미] 수신 거부(구독 취소) 처리가 완료되었습니다`;
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #111827;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
    <tr>
      <td style="padding: 28px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 18px;">수신 거부 처리 완료</h2>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">공모주 알리미 (iposcore.kr)</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; font-size: 14px; line-height: 1.6; color: #4b5563;">
        <p style="margin: 0 0 12px 0;">
          <strong>${subscriber.email}</strong> 님의 수신 거부 요청이 정상적으로 처리되었습니다.
        </p>
        <p style="margin: 0 0 20px 0;">
          앞으로 공모주 알리미에서 발송되는 정기 리포트 메일이 발송되지 않습니다.<br/>
          그동안 서비스를 이용해 주셔서 감사드리며, 언제든 다시 필요하실 때 홈페이지에서 재신청하실 수 있습니다.
        </p>
        <p style="margin: 0; text-align: center;">
          <a href="${resubscribeUrl}" style="display: inline-block; padding: 10px 20px; font-size: 13px; font-weight: bold; background-color: #f3f4f6; color: #1f2937; text-decoration: none; border-radius: 8px; border: 1px solid #d1d5db;">
            홈페이지 바로가기
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: subscriber.email, subject, html });
}
