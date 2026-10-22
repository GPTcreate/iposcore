/**
 * 시스템 보안 취약점 전수 검증 테스트 스크립트
 */
import { verifyAdminCredentials, verifyAdminRequest } from '../src/lib/adminAuth.ts';
import { checkRateLimit } from '../src/lib/rateLimiter.ts';

async function runSecurityAuditTests() {
  console.log('🔒 [Security Audit] 보안 취약점 패치 전수 검증 시작...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. 관리자 인증 검증 테스트
  assert(verifyAdminCredentials('7788') === true, '올바른 PIN (7788) 인증 성공');
  assert(verifyAdminCredentials('admin2026') === true, '올바른 PIN (admin2026) 인증 성공');
  assert(verifyAdminCredentials('wrong1234') === false, '잘못된 PIN 인증 거부');
  assert(verifyAdminCredentials('') === false, '빈 PIN 인증 거부');

  // 2. 요청별 권한 검증 테스트
  const unauthReq = new Request('https://iposcore.kr/api/newsletter/admin');
  assert(verifyAdminRequest(unauthReq).authorized === false, '인증 헤더 없는 요청 차단 (401)');

  const cronReq = new Request('https://iposcore.kr/api/cron/newsletter', {
    headers: { 'x-vercel-cron': '1' },
  });
  assert(verifyAdminRequest(cronReq).authorized === true, 'Vercel 정식 크론 헤더 인증 허용');

  const adminHeaderReq = new Request('https://iposcore.kr/api/newsletter/admin', {
    headers: { 'x-admin-key': '7788' },
  });
  assert(verifyAdminRequest(adminHeaderReq).authorized === true, 'x-admin-key 헤더 인증 허용');

  const fakeHeaderReq = new Request('https://iposcore.kr/api/newsletter/admin', {
    headers: { 'x-admin-key': 'attacker_fake_key' },
  });
  assert(verifyAdminRequest(fakeHeaderReq).authorized === false, '위조된 x-admin-key 헤더 차단');

  const bearerReq = new Request('https://iposcore.kr/api/marketing/telegram', {
    headers: { authorization: 'Bearer 7788' },
  });
  assert(verifyAdminRequest(bearerReq).authorized === true, 'Bearer 토큰 인증 허용');

  // 3. 레이트 리미터 동작 테스트
  const testIp = `test-ip-${Date.now()}`;
  let rateLimitPassed = true;
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(`test:${testIp}`, 5, 60000);
    if (!res.allowed) rateLimitPassed = false;
  }
  const exceeded = checkRateLimit(`test:${testIp}`, 5, 60000);
  assert(rateLimitPassed && !exceeded.allowed, '레이트 리미터 임계치 초과 차단 (429 Too Many Requests)');

  console.log(`\n==================================================`);
  console.log(`📊 보안 테스트 결과: 총 ${passed + failed}개 중 ${passed}개 통과 / ${failed}개 실패`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('테스트 실행 에러:', err);
  process.exit(1);
});
