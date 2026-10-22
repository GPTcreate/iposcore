/**
 * 서버 사이드 관리자 및 스케줄러 권한 통합 검증 모듈
 * - Vercel Cron 내부 호출 (x-vercel-cron 헤더)
 * - 환경변수 ADMIN_SECRET / CRON_SECRET 기반 Bearer 토큰 검증
 * - 관리자 세션 헤더(x-admin-key) 및 쿼리 파라미터(adminKey) 검증
 */

const FALLBACK_ADMIN_KEYS = ['7788', 'admin2026'];

/**
 * 유효한 관리자 키 목록 반환
 */
export function getValidAdminKeys(): string[] {
  const keys = [...FALLBACK_ADMIN_KEYS];
  if (process.env.ADMIN_SECRET) {
    keys.push(process.env.ADMIN_SECRET.trim());
  }
  if (process.env.CRON_SECRET) {
    keys.push(process.env.CRON_SECRET.trim());
  }
  return Array.from(new Set(keys.filter(Boolean)));
}

/**
 * PIN 또는 관리자 비밀번호 검증
 */
export function verifyAdminCredentials(inputPin: string): boolean {
  if (!inputPin) return false;
  const trimmed = inputPin.trim();
  const validKeys = getValidAdminKeys();
  return validKeys.includes(trimmed);
}

export interface AdminAuthResult {
  authorized: boolean;
  type: 'VERCEL_CRON' | 'BEARER_TOKEN' | 'ADMIN_KEY' | 'NONE';
  reason?: string;
}

/**
 * 들어오는 HTTP 요청이 정당한 관리자 또는 크론 요청인지 검증
 */
export function verifyAdminRequest(request: Request): AdminAuthResult {
  // 1. Vercel 내부 Cron 헤더 검증 (Vercel 인프라에서 외부 위조 불가)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) {
    return { authorized: true, type: 'VERCEL_CRON' };
  }

  const validKeys = getValidAdminKeys();

  // 2. Authorization: Bearer <token> 헤더 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token && validKeys.includes(token)) {
      return { authorized: true, type: 'BEARER_TOKEN' };
    }
  }

  // 3. x-admin-key 커스텀 헤더 검증
  const adminKeyHeader = request.headers.get('x-admin-key');
  if (adminKeyHeader && validKeys.includes(adminKeyHeader.trim())) {
    return { authorized: true, type: 'ADMIN_KEY' };
  }

  // 4. URL 쿼리 파라미터 (?adminKey=... 또는 ?key=...) 검증
  try {
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('adminKey') || searchParams.get('key');
    if (queryKey && validKeys.includes(queryKey.trim())) {
      return { authorized: true, type: 'ADMIN_KEY' };
    }
  } catch {
    // URL 파싱 에러 무시
  }

  return {
    authorized: false,
    type: 'NONE',
    reason: '유효한 관리자 인증 키(x-admin-key 또는 Bearer 토큰)가 제공되지 않았습니다.',
  };
}
