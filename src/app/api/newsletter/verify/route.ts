import { NextRequest, NextResponse } from 'next/server';
import { verifySubscriber } from '@/lib/subscriberStore';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(renderHtml({
      title: '유효하지 않은 요청입니다',
      description: '인증 토큰이 누락되었습니다. 메일함의 링크를 다시 확인해주세요.',
      isSuccess: false,
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let subscriber = null;
  try {
    subscriber = await verifySubscriber(token);
  } catch (err) {
    console.error('[VerifyRoute] 영속 저장소 처리 에러:', err instanceof Error ? err.message : err);
    return new NextResponse(renderHtml({
      title: '일시적인 저장 오류가 발생했습니다',
      description: '구독 인증 정보를 저장소에 갱신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      isSuccess: false,
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!subscriber) {
    return new NextResponse(renderHtml({
      title: '인증 링크가 만료되었거나 올바르지 않습니다',
      description: '이미 인증이 완료되었거나 존재하지 않는 링크입니다. 홈페이지에서 다시 신청해주세요.',
      isSuccess: false,
    }), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new NextResponse(renderHtml({
    title: '뉴스레터 구독 동의가 완료되었습니다!',
    description: `${subscriber.email} 님, 환영합니다! 매주 월요일 아침 이번 주 공모주 핵심 리포트를 가장 먼저 보내드립니다.`,
    isSuccess: true,
  }), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
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
      font-size: 28px;
      background: ${isSuccess ? '#ecfdf5' : '#fef2f2'};
      color: ${isSuccess ? '#059669' : '#dc2626'};
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 20px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
    }
    p {
      margin: 0 0 24px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 13px 20px;
      background-color: #1d4ed8;
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 10px;
      transition: background-color 0.15s;
    }
    .btn:hover {
      background-color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isSuccess ? '✓' : '✕'}</div>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="https://iposcore.kr" class="btn">공모주 알리미 홈으로 가기</a>
  </div>
</body>
</html>
  `;
}
