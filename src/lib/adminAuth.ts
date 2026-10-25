import { timingSafeEqual } from 'node:crypto';
import { verifyLegacyCredential } from './legacyCredential';

/** Configured secrets take precedence. Platform markers alone are not authentication. */
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
  if (typeof inputPin !== 'string' || !inputPin.trim()) return false;
  const input = inputPin.trim();
  const configured = configuredSecret('ADMIN_SECRET');
  return configured ? secretMatches(input, configured) : verifyLegacyCredential(input);
}

export interface AdminAuthResult {
  authorized: boolean;
  type: 'BEARER_TOKEN' | 'ADMIN_KEY' | 'NONE';
  reason?: string;
}

/**
 * Vercel sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET is configured.
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 * Admin requests use the same configured-or-compatibility verifier as the login UI.
 * URL parameters and x-vercel-cron alone never grant access.
 */
export function verifyAdminRequest(request: Request): AdminAuthResult {
  const cronSecret = configuredSecret('CRON_SECRET');
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7);
    if (secretMatches(token, cronSecret) || verifyAdminCredentials(token)) {
      return { authorized: true, type: 'BEARER_TOKEN' };
    }
  }
  const administratorKey = request.headers.get('x-admin-key');
  if (administratorKey && verifyAdminCredentials(administratorKey)) {
    return { authorized: true, type: 'ADMIN_KEY' };
  }
  return { authorized: false, type: 'NONE', reason: '관리자 비밀번호 또는 설정한 스케줄러 인증 토큰이 필요합니다.' };
}
