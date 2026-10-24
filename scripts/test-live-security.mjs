async function test() {
  console.log('🌐 [Live Security Audit] 프로덕션 iposcore.kr 엔드포인트 보안 검증...\n');

  const tests = [
    { url: 'https://iposcore.kr/api/newsletter/admin', method: 'GET' },
    { url: 'https://iposcore.kr/api/marketing/telegram', method: 'POST' },
    { url: 'https://iposcore.kr/api/ipo', method: 'POST' },
    { url: 'https://iposcore.kr/api/ipo?code=test', method: 'DELETE' },
    { url: 'https://iposcore.kr/api/cron/newsletter', method: 'GET' },
    { url: 'https://iposcore.kr/api/cron/update', method: 'GET' },
  ];

  for (const t of tests) {
    const res = await fetch(t.url, {
      method: t.method,
      headers: { 'Content-Type': 'application/json' },
      body: t.method === 'POST' ? '{}' : undefined,
    });
    const isBlocked = res.status === 401;
    console.log(`${t.method.padEnd(6)} ${t.url} -> ${res.status} [${isBlocked ? '차단 완료 (401 Unauthorized) ✅' : '보안 취약 (경고) ❌'}]`);
  }

  // 관리자 인증 통과 테스트
  if (process.env.ADMIN_SECRET) {
    const authRes = await fetch('https://www.iposcore.kr/api/ipo', {
      headers: { 'x-admin-key': process.env.ADMIN_SECRET },
    });
    console.log(`AUTH configured credential -> ${authRes.status}`);
  } else {
    console.log('AUTH credential check skipped: ADMIN_SECRET is not configured.');
  }

  const publicRes = await fetch('https://iposcore.kr/api/ipo');
  console.log(`PUBLIC https://iposcore.kr/api/ipo -> ${publicRes.status} [${publicRes.ok ? '정상 제공 (200 OK) ✅' : '실패 ❌'}]`);
}

test().catch(console.error);
