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

export type SafeSubscriber = Omit<Subscriber, 'verificationToken' | 'unsubscribeToken'>;

/**
 * 클라이언트 또는 외부 로그에 민감한 인증/해지 토큰이 노출되지 않도록 제거
 */
export function sanitizeSubscriber(sub: Subscriber): SafeSubscriber {
  const { verificationToken, unsubscribeToken, ...safe } = sub;
  return safe;
}

// 로컬 파일 저장 경로 (개발/로컬 환경)
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// 메모리 캐시 (서버리스 인스턴스 런타임 캐시)
let memoryStore: Subscriber[] = [];
let isStoreLoaded = false;
let lastRemoteFetchTime = 0;
const REMOTE_CACHE_TTL_MS = 30 * 1000; // 30초 캐시 유효

// 초기 로컬 파일 로드
function loadLocalStore(): Subscriber[] {
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

// 로컬 파일 저장
function saveLocalStore(data: Subscriber[]): boolean {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('[SubscriberStore] 로컬 파일 쓰기 불가 (서버리스 읽기 전용 환경):', err);
    return false;
  }
}

/**
 * 환경이 영속 저장소 제약이 필요한 프로덕션(또는 Vercel)인지 판별
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

/**
 * 구글 스프레드시트(Google Sheets Apps Script 웹앱)로 실시간 동기화
 * (verificationToken과 unsubscribeToken을 포함하여 영구 보존 및 복원 지원)
 */
export async function syncToGoogleSheet(
  action: 'SUBSCRIBE' | 'VERIFY' | 'UNSUBSCRIBE',
  subscriber: Subscriber
): Promise<boolean> {
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
      statusLabel:
        subscriber.status === 'ACTIVE'
          ? '구독중'
          : subscriber.status === 'PENDING'
          ? '인증대기'
          : '수신취소',
      frequency: subscriber.frequency === 'WEEKLY' ? '주 1회 (월요일)' : '모든 청약 실시간',
      verificationToken: subscriber.verificationToken,
      unsubscribeToken: subscriber.unsubscribeToken,
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
      // 보안: 민감한 토큰은 절대 로그에 출력하지 않음
      console.log(`[GoogleSheetSync] ${action} 동기화 성공: ${subscriber.email}`);
      return true;
    } else {
      console.warn(`[GoogleSheetSync] 응답 실패 (${res.status}): ${subscriber.email}`);
      return false;
    }
  } catch (error) {
    console.error('[GoogleSheetSync] 전송 에러:', error instanceof Error ? error.message : error);
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
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.subscribers)) {
        return data.subscribers.map((item: any) => ({
          id: item.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: String(item.email || '').trim().toLowerCase(),
          status: (item.status === 'ACTIVE' || item.status === '구독중'
            ? 'ACTIVE'
            : item.status === 'CANCELLED' || item.status === '수신취소'
            ? 'CANCELLED'
            : 'PENDING') as SubscriberStatus,
          frequency:
            item.frequency === 'WEEKLY' || String(item.frequency).includes('월요일')
              ? 'WEEKLY'
              : 'ALL',
          verificationToken: String(item.verificationToken || ''),
          unsubscribeToken: String(item.unsubscribeToken || ''),
          subscribedAt: item.subscribedAt || new Date().toISOString(),
          verifiedAt: item.verifiedAt || undefined,
          unsubscribedAt: item.unsubscribedAt || undefined,
        }));
      }
    }
  } catch (err) {
    console.warn('[GoogleSheetSync:GET] 구글 시트에서 목록 불러오기 실패:', err);
  }
  return [];
}

/**
 * 저장소가 준비되었는지 확인하고 구글 시트가 설정되어 있다면 원격 목록과 동기화
 */
export async function ensureStoreLoaded(forceRefresh = false): Promise<Subscriber[]> {
  const now = Date.now();
  if (!isStoreLoaded) {
    loadLocalStore();
  }

  // 구글 시트가 구성되어 있고, 강제 갱신이거나 TTL이 지난 경우 원격 동기화
  if (
    process.env.GOOGLE_SHEET_WEBHOOK_URL &&
    (forceRefresh || now - lastRemoteFetchTime > REMOTE_CACHE_TTL_MS)
  ) {
    try {
      const remoteSubs = await fetchSubscribersFromGoogleSheet();
      if (remoteSubs.length > 0) {
        const map = new Map<string, Subscriber>();
        for (const s of memoryStore) {
          if (s.email) map.set(s.email.toLowerCase(), s);
        }
        for (const s of remoteSubs) {
          if (s.email) {
            const local = map.get(s.email.toLowerCase());
            const verificationToken =
              s.verificationToken || local?.verificationToken || crypto.randomBytes(24).toString('hex');
            const unsubscribeToken =
              s.unsubscribeToken || local?.unsubscribeToken || crypto.randomBytes(24).toString('hex');
            map.set(s.email.toLowerCase(), {
              ...local,
              ...s,
              verificationToken,
              unsubscribeToken,
            });
          }
        }
        memoryStore = Array.from(map.values());
        saveLocalStore(memoryStore);
      }
      lastRemoteFetchTime = now;
    } catch (err) {
      console.warn('[SubscriberStore] 원격 영속 저장소 로드 실패 (로컬/메모리 캐시 유지):', err);
    }
  }

  isStoreLoaded = true;
  return memoryStore;
}

/**
 * 구독자 변경 사항을 영속 저장소에 보장하며 저장
 * - 프로덕션 환경에서 저장 실패 시 에러를 던져 상위 API에서 성공으로 응답하지 않게 함
 */
async function persistSubscriber(
  action: 'SUBSCRIBE' | 'VERIFY' | 'UNSUBSCRIBE',
  subscriber: Subscriber
): Promise<void> {
  const localSaved = saveLocalStore(memoryStore);
  const webhookConfigured = !!process.env.GOOGLE_SHEET_WEBHOOK_URL;

  let remoteSaved = false;
  if (webhookConfigured) {
    remoteSaved = await syncToGoogleSheet(action, subscriber);
  }

  // 프로덕션 환경 검증:
  // Vercel 등 서버리스 환경에서는 로컬 파일 쓰기가 영구 지속되지 않으므로,
  // GOOGLE_SHEET_WEBHOOK_URL이 설정되어 있고 동기화가 성공해야 영속 저장 성공으로 간주.
  if (isProductionEnvironment()) {
    if (!webhookConfigured) {
      throw new Error(
        '운영(프로덕션) 환경에서는 영속 저장소(GOOGLE_SHEET_WEBHOOK_URL) 설정이 필수입니다.'
      );
    }
    if (!remoteSaved) {
      throw new Error('영속 저장소(Google Sheet) 동기화에 실패했습니다.');
    }
  } else {
    // 개발/테스트 환경에서는 로컬 파일 쓰기나 웹훅 중 하나라도 성공하면 허용
    if (!localSaved && !remoteSaved) {
      throw new Error('로컬 파일 쓰기 및 영속 저장소 동기화에 모두 실패했습니다.');
    }
  }
}

/**
 * 신규 구독 신청 또는 기존 구독자 업데이트
 */
export async function registerSubscriber(params: {
  email: string;
  frequency?: 'WEEKLY' | 'ALL';
  skipDoubleOptIn?: boolean;
}): Promise<{ subscriber: Subscriber; isNew: boolean }> {
  await ensureStoreLoaded();
  const normalizedEmail = params.email.trim().toLowerCase();
  const frequency = params.frequency || 'ALL';

  const existingIndex = memoryStore.findIndex((s) => s.email === normalizedEmail);

  if (existingIndex >= 0) {
    const existing = memoryStore[existingIndex];
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

    const action = previousStatus === 'CANCELLED' ? 'SUBSCRIBE' : 'VERIFY';
    await persistSubscriber(action, existing);
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
  await persistSubscriber('SUBSCRIBE', newSub);
  return { subscriber: newSub, isNew: true };
}

/**
 * 이메일 인증/동의 완료 처리 (Double Opt-in)
 */
export async function verifySubscriber(token: string): Promise<Subscriber | null> {
  await ensureStoreLoaded();
  const trimmedToken = token.trim();
  let target = memoryStore.find((s) => s.verificationToken === trimmedToken);

  // 메모리에 없으면, 다른 인스턴스에서 등록되었을 수 있으므로 원격 강제 동기화 시도
  if (!target && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
    await ensureStoreLoaded(true);
    target = memoryStore.find((s) => s.verificationToken === trimmedToken);
  }

  if (!target) return null;

  target.status = 'ACTIVE';
  target.verifiedAt = new Date().toISOString();

  await persistSubscriber('VERIFY', target);
  return target;
}

/**
 * 이메일 기반 수동 인증 완료 처리 (관리자용 - 토큰 불필요)
 */
export async function verifySubscriberByEmail(email: string): Promise<Subscriber | null> {
  await ensureStoreLoaded();
  const normalizedEmail = email.trim().toLowerCase();
  let target = memoryStore.find((s) => s.email === normalizedEmail);

  if (!target && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
    await ensureStoreLoaded(true);
    target = memoryStore.find((s) => s.email === normalizedEmail);
  }

  if (!target) return null;

  target.status = 'ACTIVE';
  target.verifiedAt = new Date().toISOString();

  await persistSubscriber('VERIFY', target);
  return target;
}

/**
 * 수신 거부 / 구독 취소 처리 (토큰 또는 이메일 기반)
 */
export async function unsubscribeSubscriber(identifier: string): Promise<Subscriber | null> {
  await ensureStoreLoaded();
  const trimmed = identifier.trim();
  let target = memoryStore.find(
    (s) =>
      s.unsubscribeToken === trimmed ||
      s.verificationToken === trimmed ||
      s.email === trimmed.toLowerCase()
  );

  // 메모리에 없으면 원격 강제 동기화 시도
  if (!target && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
    await ensureStoreLoaded(true);
    target = memoryStore.find(
      (s) =>
        s.unsubscribeToken === trimmed ||
        s.verificationToken === trimmed ||
        s.email === trimmed.toLowerCase()
    );
  }

  if (!target) return null;

  target.status = 'CANCELLED';
  target.unsubscribedAt = new Date().toISOString();

  await persistSubscriber('UNSUBSCRIBE', target);
  return target;
}

/**
 * 전체 구독자 목록 동기 조회 (기존 메모리 캐시 반환)
 */
export function getAllSubscribers(): Subscriber[] {
  if (!isStoreLoaded) {
    loadLocalStore();
  }
  return memoryStore;
}

/**
 * 전체 구독자 목록 비동기 조회 (원격 영속 저장소 동기화 보장)
 */
export async function getAllSubscribersAsync(): Promise<Subscriber[]> {
  return await ensureStoreLoaded();
}

/**
 * 이메일로 구독자 조회
 */
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  await ensureStoreLoaded();
  return memoryStore.find((s) => s.email === email.trim().toLowerCase()) || null;
}
