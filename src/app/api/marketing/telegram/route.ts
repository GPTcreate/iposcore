import { NextResponse } from 'next/server';
import { getAllIpos } from '@/lib/ipoStore';
import { getEffectiveIpo } from '@/lib/ipoUtils';
import { sendTelegramBroadcast, formatIpoTelegramMessage } from '@/lib/telegramNotifier';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { isReviewedIpo } from '@/lib/contentQuality';

export async function POST(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stockCode, customMessage } = body;

    let textToSend = customMessage;

    if (stockCode && !customMessage) {
      const rawIpo = getAllIpos().find((i) => i.code === stockCode || i.id === stockCode || i.name === stockCode);
      if (!rawIpo) {
        return NextResponse.json({ error: '해당 종목을 찾을 수 없습니다.' }, { status: 404 });
      }
      if (!isReviewedIpo(rawIpo)) return NextResponse.json({ error: '공식 원문 검토 전 종목은 배포할 수 없습니다.' }, { status: 409 });
      const ipo = getEffectiveIpo(rawIpo);
      textToSend = formatIpoTelegramMessage(ipo);
    }

    if (!textToSend) {
      return NextResponse.json({ error: '전송할 메시지가 없습니다.' }, { status: 400 });
    }

    const result = await sendTelegramBroadcast(textToSend);

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      isSimulated: result.isSimulated,
      error: result.error,
      configured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '서버 오류' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    botTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    chatIdConfigured: !!process.env.TELEGRAM_CHAT_ID,
  });
}
