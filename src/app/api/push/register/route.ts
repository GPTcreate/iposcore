import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TOKENS_FILE = path.join(process.cwd(), 'src', 'data', 'pushTokens.json');

function loadTokens(): string[] {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTokens(tokens: string[]) {
  try {
    const dir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PushRegister] 토큰 저장 실패:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: '유효한 FCM 토큰이 필요합니다.' }, { status: 400 });
    }

    const currentTokens = loadTokens();
    if (!currentTokens.includes(token)) {
      currentTokens.push(token);
      saveTokens(currentTokens);
    }

    return NextResponse.json({
      success: true,
      message: '앱 푸시 토큰이 정상적으로 등록되었습니다.',
      totalDevices: currentTokens.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '토큰 등록 실패' },
      { status: 500 }
    );
  }
}
