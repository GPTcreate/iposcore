/**
 * Subscriber Storage & Persistence Regression Tests
 * 
 * 검증 항목:
 * 1. 구독(register) -> 인증(verify) -> 해지(unsubscribe) -> 조회(getAll)가 동일한 영속 저장소를 사용하는지
 * 2. Google Sheet 동기화 payload에 verificationToken과 unsubscribeToken이 정상 포함되는지
 * 3. 원격 복원 시 토큰을 포함한 전체 필드가 정상 복원되는지
 * 4. 클라이언트 노출 시 sanitizeSubscriber가 토큰을 완벽하게 제거하는지
 * 5. 프로덕션 환경에서 저장소 실패 시 성공으로 처리되지 않고 예외/오류를 반환하는지
 */

import assert from 'assert';
import {
  registerSubscriber,
  verifySubscriber,
  verifySubscriberByEmail,
  unsubscribeSubscriber,
  getAllSubscribersAsync,
  sanitizeSubscriber,
  syncToGoogleSheet,
  fetchSubscribersFromGoogleSheet,
  Subscriber,
} from '../src/lib/subscriberStore';

async function runTests() {
  console.log('--- [1] Sanitize Subscriber Token Strip Test ---');
  const dummy: Subscriber = {
    id: 'sub_test_1',
    email: 'test@example.com',
    status: 'PENDING',
    frequency: 'ALL',
    verificationToken: 'secret_verify_token_123',
    unsubscribeToken: 'secret_unsub_token_456',
    subscribedAt: new Date().toISOString(),
  };

  const sanitized = sanitizeSubscriber(dummy);
  assert.strictEqual((sanitized as any).verificationToken, undefined, 'verificationToken must be stripped');
  assert.strictEqual((sanitized as any).unsubscribeToken, undefined, 'unsubscribeToken must be stripped');
  assert.strictEqual(sanitized.email, 'test@example.com');
  console.log('✓ Token stripping passed: tokens are not exposed to client');

  console.log('\n--- [2] Register -> Verify -> Unsubscribe Lifecycle Test ---');
  const testEmail = `test_${Date.now()}@testdomain.com`;
  const { subscriber: regSub, isNew } = await registerSubscriber({
    email: testEmail,
    frequency: 'WEEKLY',
    skipDoubleOptIn: false,
  });

  assert.strictEqual(isNew, true);
  assert.strictEqual(regSub.status, 'PENDING');
  assert.ok(regSub.verificationToken.length >= 24);
  assert.ok(regSub.unsubscribeToken.length >= 24);
  console.log('✓ Registration passed with generated tokens');

  // Verify by token
  const verifiedSub = await verifySubscriber(regSub.verificationToken);
  assert.ok(verifiedSub, 'Subscriber should be found by verification token');
  assert.strictEqual(verifiedSub?.status, 'ACTIVE');
  assert.ok(verifiedSub?.verifiedAt, 'verifiedAt should be set');
  console.log('✓ Verification by token passed');

  // Verify list contains active subscriber
  const allSubs = await getAllSubscribersAsync();
  const found = allSubs.find(s => s.email === testEmail);
  assert.ok(found, 'Subscriber must exist in persistent store');
  assert.strictEqual(found?.status, 'ACTIVE');
  console.log('✓ getAllSubscribersAsync contains updated subscriber');

  // Unsubscribe by token
  const unsubbed = await unsubscribeSubscriber(regSub.unsubscribeToken);
  assert.ok(unsubbed, 'Subscriber should be found by unsubscribe token');
  assert.strictEqual(unsubbed?.status, 'CANCELLED');
  assert.ok(unsubbed?.unsubscribedAt, 'unsubscribedAt should be set');
  console.log('✓ Unsubscribe passed');

  console.log('\n--- [3] Verify by Email (Admin Flow) Test ---');
  const adminTestEmail = `admin_test_${Date.now()}@testdomain.com`;
  const { subscriber: adminSub } = await registerSubscriber({
    email: adminTestEmail,
    frequency: 'ALL',
    skipDoubleOptIn: false,
  });
  assert.strictEqual(adminSub.status, 'PENDING');

  const adminVerified = await verifySubscriberByEmail(adminTestEmail);
  assert.ok(adminVerified);
  assert.strictEqual(adminVerified?.status, 'ACTIVE');
  console.log('✓ Verify by email without exposing token passed');

  console.log('\n--- [4] Google Sheet Sync Payload Token Preservation Test ---');
  // Mock global fetch to inspect webhook payload
  const originalFetch = global.fetch;
  let capturedPayload: any = null;

  global.fetch = async (url: any, init?: any) => {
    if (String(url).includes('mock-google-sheet')) {
      if (init?.method === 'POST') {
        capturedPayload = JSON.parse(init.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({ result: 'success' }),
        } as any;
      }
      if (init?.method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            result: 'success',
            subscribers: [
              {
                id: 'sub_remote_1',
                email: 'remote@example.com',
                status: '구독중',
                frequency: '주 1회 (월요일)',
                subscribedAt: '2026-10-01T00:00:00.000Z',
                verifiedAt: '2026-10-01T01:00:00.000Z',
                verificationToken: 'remote_v_token_111',
                unsubscribeToken: 'remote_u_token_222',
              },
            ],
          }),
        } as any;
      }
    }
    return originalFetch(url, init);
  };

  process.env.GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/mock-google-sheet/exec';

  const testSyncSub: Subscriber = {
    id: 'sub_sync_test',
    email: 'synctest@example.com',
    status: 'ACTIVE',
    frequency: 'WEEKLY',
    verificationToken: 'v_tok_999',
    unsubscribeToken: 'u_tok_888',
    subscribedAt: '2026-10-07T00:00:00.000Z',
  };

  const syncResult = await syncToGoogleSheet('SUBSCRIBE', testSyncSub);
  assert.strictEqual(syncResult, true, 'syncToGoogleSheet should succeed');
  assert.strictEqual(capturedPayload.verificationToken, 'v_tok_999', 'Payload must preserve verificationToken');
  assert.strictEqual(capturedPayload.unsubscribeToken, 'u_tok_888', 'Payload must preserve unsubscribeToken');
  assert.strictEqual(capturedPayload.email, 'synctest@example.com');
  console.log('✓ Google Sheet payload preserves verificationToken and unsubscribeToken');

  // Test fetchSubscribersFromGoogleSheet restoration
  const restored = await fetchSubscribersFromGoogleSheet();
  assert.ok(restored.length > 0, 'Must restore remote subscribers');
  const remoteFound = restored.find(s => s.email === 'remote@example.com');
  assert.ok(remoteFound);
  assert.strictEqual(remoteFound?.status, 'ACTIVE');
  assert.strictEqual(remoteFound?.frequency, 'WEEKLY');
  assert.strictEqual(remoteFound?.verificationToken, 'remote_v_token_111');
  assert.strictEqual(remoteFound?.unsubscribeToken, 'remote_u_token_222');
  console.log('✓ Remote restoration correctly maps status, frequency, and tokens');

  console.log('\n--- [5] Production Storage Failure Guard Test ---');
  // Set production environment and simulate failing webhook
  const origNodeEnv = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = 'production';
  process.env.GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/mock-google-sheet-fail/exec';

  global.fetch = async (url: any) => {
    return {
      ok: false,
      status: 500,
    } as any;
  };

  let caughtError: Error | null = null;
  try {
    await registerSubscriber({
      email: `fail_${Date.now()}@example.com`,
      frequency: 'ALL',
    });
  } catch (err: any) {
    caughtError = err;
  }

  assert.ok(caughtError, 'In production, storage failure must throw error');
  assert.ok(caughtError.message.includes('영속 저장소'), 'Error message must identify storage failure');
  console.log('✓ In production, storage failure throws and prevents false success response');

  // Restore env
  (process.env as any).NODE_ENV = origNodeEnv;
  delete process.env.GOOGLE_SHEET_WEBHOOK_URL;
  global.fetch = originalFetch;

  console.log('\n=======================================');
  console.log('ALL 5 REGRESSION TESTS PASSED SUCCESSFULLY!');
  console.log('=======================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
