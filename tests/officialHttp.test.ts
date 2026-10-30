import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchOfficialText, OFFICIAL_RESPONSE_TIMEOUT_MS } from '../src/lib/officialHttp';

const url = 'https://dart.fss.or.kr/report/viewer.do';
test('a transient connection failure retries once with the complete response deadline', async () => {
  let calls = 0;
  const result = await fetchOfficialText(url, { maxBytes: 100, retryDelayMs: 0, fetcher: async (_input, init) => {
    assert(init?.signal); assert.equal(init.signal.aborted, false);
    assert.equal(init.redirect, 'error');
    if (++calls === 1) throw new TypeError('fetch failed', { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } });
    return new Response('complete');
  } });
  assert.equal(calls, 2); assert.equal(result.text, 'complete'); assert.equal(OFFICIAL_RESPONSE_TIMEOUT_MS, 45000);
});
test('an interrupted response body is discarded before one complete retry', async () => {
  let calls = 0, reads = 0;
  const result = await fetchOfficialText(url, { maxBytes: 100, retryDelayMs: 0, fetcher: async () => {
    if (++calls > 1) return new Response('complete');
    return new Response(new ReadableStream<Uint8Array>({ pull(controller) {
      if (reads++ === 0) controller.enqueue(new TextEncoder().encode('partial-'));
      else controller.error(new DOMException('deadline', 'TimeoutError'));
    } }));
  } });
  assert.equal(result.text, 'complete'); assert.equal(calls, 2);
});
test('the deadline also aborts a body stalled after successful headers', async () => {
  let calls = 0;
  await assert.rejects(fetchOfficialText(url, { maxBytes: 100, timeoutMs: 5, retryDelayMs: 0, fetcher: async (_input, init) => {
    calls++;
    return new Response(new ReadableStream({ start(controller) {
      const timer = setTimeout(() => controller.close(), 100);
      init!.signal!.addEventListener('abort', () => { clearTimeout(timer); controller.error(init!.signal!.reason); }, { once: true });
    } }));
  } }), { name: 'TimeoutError' });
  assert.equal(calls, 2);
});
test('persistent network errors stop after two attempts', async () => {
  let calls = 0;
  await assert.rejects(fetchOfficialText(url, { maxBytes: 100, retryDelayMs: 0, fetcher: async () => { calls++; throw new TypeError('fetch failed'); } }));
  assert.equal(calls, 2);
});
test('HTTP rejection, redirects, oversized bodies and certificate errors are not retried', async () => {
  for (const make of [
    () => new Response('unavailable', { status: 503 }),
    () => new Response('', { status: 302, headers: { location: 'https://other.example' } }),
    () => new Response('too large'),
    () => { throw new TypeError('certificate', { cause: { code: 'CERT_HAS_EXPIRED' } }); },
  ]) {
    let calls = 0;
    await assert.rejects(fetchOfficialText(url, { maxBytes: 3, retryDelayMs: 0, fetcher: async () => { calls++; return make(); } }));
    assert.equal(calls, 1);
  }
});
test('conditional cache responses need no body and preserve response metadata', async () => {
  const result = await fetchOfficialText(url, { maxBytes: 100, fetcher: async () => new Response(null, { status: 304, headers: { etag: 'same' } }) });
  assert.equal(result.text, ''); assert.equal(result.response.status, 304); assert.equal(result.response.headers.get('etag'), 'same');
});
