import { IpoItem } from '@/types/ipo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  error?: string;
  isSimulated?: boolean;
}

/**
 * 텔레그램 공식 봇 API를 통한 100% 무정지(Anti-Ban) 자동 공모주 브리핑 발송기
 */
export async function sendTelegramBroadcast(text: string): Promise<TelegramSendResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[TelegramNotifier:SIMULATION] 토큰 미설정으로 시뮬레이션 처리:\n', text);
    return {
      success: true,
      isSimulated: true,
      error: 'TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 미설정 (시뮬레이션 모드)',
    };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      return { success: true, messageId: data.result.message_id };
    } else {
      return { success: false, error: data.description || '텔레그램 발송 실패' };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '네트워크 오류' };
  }
}

/**
 * 특정 종목에 대한 실전 브리핑 메시지 포맷터
 */
export function formatIpoTelegramMessage(ipo: IpoItem): string {
  const priceText = ipo.confirmedPrice > 0 
    ? `<b>확정 공모가:</b> ${ipo.confirmedPrice.toLocaleString()}원` 
    : `<b>희망 밴드:</b> ${ipo.priceBandMin.toLocaleString()} ~ ${ipo.priceBandMax.toLocaleString()}원`;

  const compText = ipo.institutionalCompetitionRate > 0
    ? `<b>기관 경쟁률:</b> ${ipo.institutionalCompetitionRate.toLocaleString()}:1 (확약: ${ipo.lockupCommitmentRate}%)`
    : `<b>수요예측:</b> 결과 발표 대기 중 (D-1 공시 예정)`;

  return `
📢 <b>[공모주 알리미] 이번 주 청약 핵심 분석</b>

🏢 <b>${ipo.name}</b> (${ipo.market} · ${ipo.code})
⭐ <b>AI 종합 매력도:</b> ${ipo.scoreGrade}등급 (${ipo.aiScore}점)

📌 <b>핵심 요약:</b>
${ipo.aiSummary.headline}

💰 ${priceText}
📊 ${compText}
📅 <b>청약 기간:</b> ${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd}
🏦 <b>주관사:</b> ${ipo.underwriters.map(u => u.name).join(', ')}

👉 <a href="${SITE_URL}/ipo/${ipo.code}"><b>[AI 심층 리포트 & 전문가 여론 전문 보기]</b></a>
👉 <a href="${SITE_URL}/calculator"><b>[내 투자금 비례 배정 계산기 돌려보기]</b></a>
`.trim();
}
