import { timingSafeEqual } from 'node:crypto';

/** Only configured secrets grant access. A caller-controlled cron header is not authentication. */
function configuredSecret(name: 'ADMIN_SECRET' | 'CRON_SECRET'): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function secretMatches(value: string | undefined | null, expected: string | undefined): boolean {
  if (!value || !expected) return false;
  const supplied = Buffer.from(value);
  const configured = Buffer.from(expected);
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}

export function getValidAdminKeys(): string[] {
  const secret = configuredSecret('ADMIN_SECRET');
  return secret ? [secret] : [];
}

/** The scheduler secret cannot log into the administrator UI. */
export function verifyAdminCredentials(inputPin: string): boolean {
  return typeof inputPin === 'string' && secretMatches(inputPin.trim(), configuredSecret('ADMIN_SECRET'));
}

export interface AdminAuthResult {
  authorized: boolean;
  type: 'BEARER_TOKEN' | 'ADMIN_KEY' | 'NONE';
  reason?: string;
}

/**
 * Vercel sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET is configured.
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 * Admin requests may use the configured ADMIN_SECRET as a Bearer or x-admin-key.
 * URL parameters and x-vercel-cron alone never grant access.
 */
export function verifyAdminRequest(request: Request): AdminAuthResult {
  const adminSecret = configuredSecret('ADMIN_SECRET');
  const cronSecret = configuredSecret('CRON_SECRET');
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7);
    if (secretMatches(token, adminSecret) || secretMatches(token, cronSecret)) {
      return { authorized: true, type: 'BEARER_TOKEN' };
    }
  }
  if (secretMatches(request.headers.get('x-admin-key'), adminSecret)) {
    return { authorized: true, type: 'ADMIN_KEY' };
  }
  return { authorized: false, type: 'NONE', reason: '환경변수로 설정한 관리자 또는 스케줄러 인증 토큰이 필요합니다.' };
}
