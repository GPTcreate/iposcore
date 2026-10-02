import nodemailer from 'nodemailer';
import { Subscriber } from './subscriberStore';
import { MOCK_IPOS } from '@/data/mockIpo';

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
 * 3. 주간 정기 공모주 핵심 요약 리포트 메일 HTML 템플릿 생성기
 * [전략: 점수는 간단히 뱃지/등급으로 호기심을 자극하고, 웹사이트 방문(CTR)을 극대화]
 */
export function getWeeklyReportEmailTemplate(subscriber: { email: string; unsubscribeToken?: string }) {
  const unsubToken = subscriber.unsubscribeToken || 'demo_token';
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubToken}`;
  const calculatorUrl = `${SITE_URL}/calculator`;
  const subject = `[공모주 알리미] 이번 주 청약 핵심 리포트 & 실전 배정 공략`;

  const activeIpos = MOCK_IPOS.filter((i) => i.status === 'SUBSCRIPTION').slice(0, 2);
  const upcomingIpos = MOCK_IPOS.filter((i) => i.status === 'UPCOMING').slice(0, 3);

  const activeCards = activeIpos.map((ipo) => `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 17px; font-weight: 800; color: #0f172a;">
          ${ipo.name} <span style="font-size: 12px; font-weight: 600; color: #64748b;">(${ipo.market} · ${ipo.code})</span>
        </span>
        <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 800; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;">
          ${ipo.scoreGrade}등급 · ${ipo.aiScore}점
        </span>
      </div>

      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.5;">
        ${ipo.aiSummary.headline}
      </p>

      <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 14px;">
        • <strong>확정 공모가:</strong> ${ipo.confirmedPrice.toLocaleString()}원 (${ipo.underwriters.map(u => u.name).join(', ')})<br/>
        • <strong>청약 마감일:</strong> ~ ${ipo.subscriptionEnd}까지
      </div>

      <div style="text-align: center;">
        <a href="${SITE_URL}/ipo/${ipo.code}" target="_blank" style="display: block; padding: 11px 16px; background-color: #1d4ed8; color: #ffffff; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 8px;">
          👉 ${ipo.name} AI 심층 분석 & 전문가 여론 리포트 전문 보기
        </a>
      </div>
    </div>
  `).join('');

  const upcomingList = upcomingIpos.map((ipo) => `
    <li style="margin-bottom: 10px; font-size: 13px; color: #334155; line-height: 1.5;">
      <strong>${ipo.name}</strong> (${ipo.subscriptionStart} 청약 예정)
      <span style="display: inline-block; font-size: 11px; padding: 1px 6px; border-radius: 4px; background-color: #f1f5f9; color: #475569; font-weight: bold; margin-left: 4px;">
        ${ipo.scoreGrade}등급 (사전평가)
      </span>
      <br/>
      <span style="color: #64748b; font-size: 12px;">${ipo.aiSummary.headline.slice(0, 42)}...</span>
    </li>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- 메일 헤더 -->
    <tr>
      <td style="padding: 28px 24px 20px 24px; background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); text-align: center;">
        <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; background-color: rgba(255,255,255,0.2); color: #ffffff; margin-bottom: 8px;">
          매주 월요일 아침 배달되는 핵심 인사이트
        </span>
        <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900; letter-spacing: -0.5px;">
          공모주 알리미 주간 핵심 리포트
        </h1>
        <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px;">
          이번 주 필수 청약 종목 & 실전 배정 전략
        </p>
      </td>
    </tr>

    <!-- 메인 본문 -->
    <tr>
      <td style="padding: 24px;">
        
        <!-- 섹션 1: 이번 주 청약 종목 -->
        <div style="margin-bottom: 24px;">
          <h2 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            🔥 이번 주 청약 진행 종목 (핵심 요약)
          </h2>
          ${activeCards}
        </div>

        <!-- 섹션 2: 배정 계산기 유도 박스 (높은 클릭율) -->
        <div style="background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <strong style="display: block; font-size: 15px; color: #1e40af; margin-bottom: 4px;">
            🧮 내 투자금으로 몇 주 배정받을까?
          </strong>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569; line-height: 1.5;">
            비례 경쟁률 및 마통 대출 이자 기회비용을 1초 만에 무료로 계산해 보세요.
          </p>
          <a href="${calculatorUrl}" target="_blank" style="display: inline-block; padding: 10px 24px; font-size: 13px; font-weight: 800; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 8px;">
            실전 비례 배정 계산기 바로가기 →
          </a>
        </div>

        <!-- 섹션 3: 다음 주 청약 예정 기대주 -->
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #0f172a;">
            📅 다음 주 청약 예정 기대주
          </h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${upcomingList}
          </ul>
        </div>

        <!-- 전체 캘린더 방문 유도 버튼 -->
        <div style="text-align: center; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          <a href="${SITE_URL}/?tab=UPCOMING" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 13px; font-weight: 800; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 10px;">
            📊 10월 공모주 전체 캘린더 & D-Day 알림 확인하기 →
          </a>
        </div>

      </td>
    </tr>

    <!-- 메일 푸터 -->
    <tr>
      <td style="padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
        <p style="margin: 0 0 4px 0;">
          본 메일은 <strong>${subscriber.email}</strong> 님의 수신 동의에 따라 <strong>매주 월요일 아침 9시 35분</strong>에 발송되는 정기 리포트입니다.
        </p>
        <p style="margin: 0;">
          더 이상 메일을 원치 않으시면 <a href="${unsubscribeUrl}" style="color: #475569; text-decoration: underline;">수신거부(구독취소)</a>를 클릭하세요. | © iposcore.kr
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;

  return { subject, html };
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

export async function sendWeeklyReportEmail(subscriber: Subscriber) {
  const { subject, html } = getWeeklyReportEmailTemplate(subscriber);
  return sendEmail({ to: subscriber.email, subject, html });
}
