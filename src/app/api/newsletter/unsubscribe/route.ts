import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeSubscriber } from '@/lib/subscriberStore';
import { sendUnsubscribeConfirmationEmail } from '@/lib/emailSender';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const auth = verifyAdminRequest(request);

  // 일반 사용자는 오직 메일의 고유 보안 토큰(token)으로만 수신 거부 가능
  // 관리자 권한이 있는 경우에만 plain email 기반 수신 거부 허용
  const identifier = token || (auth.authorized ? emailParam : null);

  if (!identifier) {
    return new NextResponse(renderHtml({
      title: '수신 거부 보안 토큰이 필요합니다',
      description: '보안을 위해 수신 거부는 메일 하단 전용 링크(보안 토큰)를 통해서만 처리하실 수 있습니다.',
      isSuccess: false,
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let subscriber = null;
  try {
    subscriber = await unsubscribeSubscriber(identifier, { allowEmailMatch: auth.authorized });
  } catch (err) {
    console.error('[Unsubscribe GET] 영속 저장소 처리 에러:', err instanceof Error ? err.message : err);
    return new NextResponse(renderHtml({
      title: '일시적인 저장 오류가 발생했습니다',
      description: '수신 거부 처리 중 저장소 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      isSuccess: false,
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!subscriber) {
    return new NextResponse(renderHtml({
      title: '이미 수신 거부되었거나 등록되지 않은 이메일입니다',
      description: '더 이상 정기 리포트 메일이 발송되지 않습니다.',
      isSuccess: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 수신 거부 완료 확인 메일 발송
  try {
    await sendUnsubscribeConfirmationEmail(subscriber);
  } catch (err) {
    console.warn('[Unsubscribe] 확인 메일 발송 생략:', err);
  }

  return new NextResponse(renderHtml({
    title: '수신 거부(구독 취소) 처리가 완료되었습니다',
    description: `<strong>${subscriber.email}</strong> 님의 수신 거부 처리가 정상 완료되었습니다. 앞으로 공모주 정기 리포트 메일이 발송되지 않습니다.`,
    isSuccess: true,
  }), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAdminRequest(request);
    const body = await request.json().catch(() => ({}));
    const token = body.token;
    const emailParam = body.email;

    // 일반 사용자는 고유 보안 토큰(token) 필수
    const identifier = token || (auth.authorized ? emailParam : null);

    if (!identifier) {
      return NextResponse.json(
        { error: '보안을 위해 수신 거부 보안 토큰(token)이 필요합니다.' },
        { status: 400 }
      );
    }

    const subscriber = await unsubscribeSubscriber(identifier, { allowEmailMatch: auth.authorized });

    if (!subscriber) {
      return NextResponse.json({ error: '해당 구독자를 찾을 수 없거나 이미 취소되었습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '수신 거부 처리가 완료되었습니다.',
      email: subscriber.email,
      status: subscriber.status,
    });
  } catch (err) {
    console.error('[Unsubscribe POST] 에러:', err);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

function renderHtml({ title, description, isSuccess }: { title: string; description: string; isSuccess: boolean }) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | 공모주 알리미</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f3f4f6;
      color: #111827;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }
    .icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      background: ${isSuccess ? '#f3f4f6' : '#fef2f2'};
      color: ${isSuccess ? '#4b5563' : '#dc2626'};
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 19px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
    }
    p {
      margin: 0 0 24px 0;
      font-size: 13.5px;
      line-height: 1.6;
      color: #4b5563;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 12px 20px;
      background-color: #1f2937;
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 10px;
      transition: background-color 0.15s;
    }
    .btn:hover {
      background-color: #111827;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isSuccess ? '✓' : '✕'}</div>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="https://iposcore.kr" class="btn">공모주 알리미 홈으로 이동</a>
  </div>
</body>
</html>
  `;
}
