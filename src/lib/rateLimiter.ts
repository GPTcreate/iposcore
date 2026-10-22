/**
 * 인메모리 슬라이딩 윈도우 레이트 리미터 (Rate Limiter)
 * - DoS 공격, 무차별 대입(Brute-force), 이메일 스팸 폭탄 방지
 * - 서버리스 런타임 내 자동 만료 및 메모리 정리
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// 주기적 만료 데이터 자동 정리 (메모리 누수 방지, 5분 주기)
let lastCleanup = Date.now();
function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * 클라이언트의 실제 IP 주소 추출
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
}

/**
 * 요청 빈도 제한 검증
 * @param key 식별자 (예: `subscribe:1.2.3.4`)
 * @param limit 윈도우 내 최대 허용 횟수
 * @param windowMs 제한 시간(밀리초)
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  cleanupExpiredRecords();

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
    };
  }

  if (existing.count >= limit) {
    const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
  };
}
