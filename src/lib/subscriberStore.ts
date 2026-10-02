import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type SubscriberStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  frequency: 'WEEKLY' | 'ALL';
  verificationToken: string;
  unsubscribeToken: string;
  subscribedAt: string;
  verifiedAt?: string;
  unsubscribedAt?: string;
  notes?: string;
}

// 로컬 파일 저장 경로 (서버 환경)
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// 메모리 캐시 (서버리스 람다 환경 대비)
let memoryStore: Subscriber[] = [];

// 초기 데이터 로드
function loadStore(): Subscriber[] {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn('[SubscriberStore] 로컬 파일 로드 실패 (메모리 스토어 사용):', err);
  }
  return memoryStore;
}

// 데이터 저장 (로컬 파일)
function saveStore(data: Subscriber[]) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Vercel 등 읽기 전용 런타임일 경우 경고만 출력하고 메모리로 유지
    console.warn('[SubscriberStore] 로컬 파일 저장 불가 (서버리스 메모리 유지):', err);
  }
}

/**
 * 구글 스프레드시트(Google Sheets Apps Script 웹앱)로 실시간 동기화
 * 사용자가 GOOGLE_SHEET_WEBHOOK_URL 환경변수를 설정하면 자동 전송됩니다.
 */
export async function syncToGoogleSheet(action: 'SUBSCRIBE' | 'VERIFY' | 'UNSUBSCRIBE', subscriber: Subscriber): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }

  try {
    const payload = {
      action,
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status,
      statusLabel: subscriber.status === 'ACTIVE' ? '구독중' : subscriber.status === 'PENDING' ? '인증대기' : '수신취소',
      frequency: subscriber.frequency === 'WEEKLY' ? '주 1회 (월요일)' : '모든 청약 실시간',
      subscribedAt: subscriber.subscribedAt,
      verifiedAt: subscriber.verifiedAt || '',
      unsubscribedAt: subscriber.unsubscribedAt || '',
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[GoogleSheetSync] ${action} 동기화 성공: ${subscriber.email}`);
      return true;
    } else {
      console.warn(`[GoogleSheetSync] 응답 실패 (${res.status}): ${subscriber.email}`);
      return false;
    }
  } catch (error) {
    console.error('[GoogleSheetSync] 전송 에러:', error);
    return false;
  }
}

/**
 * 구글 스프레드시트에서 구독자 목록 가져오기 (영구 복원)
 */
export async function fetchSubscribersFromGoogleSheet(): Promise<Subscriber[]> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return [];

  try {
    const res = await fetch(webhookUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.subscribers)) {
        return data.subscribers;
      }
    }
  } catch (err) {
    console.warn('[GoogleSheetSync:GET] 구글 시트에서 목록 불러오기 실패:', err);
  }
  return [];
}

/**
 * 신규 구독 신청 또는 기존 구독자 업데이트
 */
export async function registerSubscriber(params: {
  email: string;
  frequency?: 'WEEKLY' | 'ALL';
  skipDoubleOptIn?: boolean;
}): Promise<{ subscriber: Subscriber; isNew: boolean }> {
  loadStore();
  const normalizedEmail = params.email.trim().toLowerCase();
  const frequency = params.frequency || 'ALL';

  const existingIndex = memoryStore.findIndex((s) => s.email === normalizedEmail);

  if (existingIndex >= 0) {
    const existing = memoryStore[existingIndex];
    // 기존에 취소했던 사람이 다시 신청한 경우 재활성화
    const previousStatus = existing.status;
    existing.frequency = frequency;
    if (params.skipDoubleOptIn) {
      existing.status = 'ACTIVE';
      existing.verifiedAt = new Date().toISOString();
    } else if (existing.status === 'CANCELLED') {
      existing.status = 'PENDING';
      existing.subscribedAt = new Date().toISOString();
      delete existing.unsubscribedAt;
    }

    saveStore(memoryStore);
    await syncToGoogleSheet(previousStatus === 'CANCELLED' ? 'SUBSCRIBE' : 'VERIFY', existing);
    return { subscriber: existing, isNew: false };
  }

  // 신규 등록
  const newSub: Subscriber = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    status: params.skipDoubleOptIn ? 'ACTIVE' : 'PENDING',
    frequency,
    verificationToken: crypto.randomBytes(24).toString('hex'),
    unsubscribeToken: crypto.randomBytes(24).toString('hex'),
    subscribedAt: new Date().toISOString(),
    verifiedAt: params.skipDoubleOptIn ? new Date().toISOString() : undefined,
  };

  memoryStore.unshift(newSub);
  saveStore(memoryStore);

  await syncToGoogleSheet('SUBSCRIBE', newSub);
  return { subscriber: newSub, isNew: true };
}

/**
 * 이메일 인증/동의 완료 처리 (Double Opt-in)
 */
export async function verifySubscriber(token: string): Promise<Subscriber | null> {
  loadStore();
  const target = memoryStore.find((s) => s.verificationToken === token);
  if (!target) return null;

  target.status = 'ACTIVE';
  target.verifiedAt = new Date().toISOString();

  saveStore(memoryStore);
  await syncToGoogleSheet('VERIFY', target);
  return target;
}

/**
 * 수신 거부 / 구독 취소 처리 (토큰 또는 이메일 기반)
 */
export async function unsubscribeSubscriber(identifier: string): Promise<Subscriber | null> {
  loadStore();
  const target = memoryStore.find(
    (s) => s.unsubscribeToken === identifier || s.verificationToken === identifier || s.email === identifier.toLowerCase()
  );

  if (!target) return null;

  target.status = 'CANCELLED';
  target.unsubscribedAt = new Date().toISOString();

  saveStore(memoryStore);
  await syncToGoogleSheet('UNSUBSCRIBE', target);
  return target;
}

/**
 * 전체 구독자 목록 조회
 */
export function getAllSubscribers(): Subscriber[] {
  return loadStore();
}

/**
 * 이메일로 구독자 조회
 */
export function getSubscriberByEmail(email: string): Subscriber | null {
  loadStore();
  return memoryStore.find((s) => s.email === email.trim().toLowerCase()) || null;
}
