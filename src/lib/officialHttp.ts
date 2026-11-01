/** Bounded reads include the response body; retry only transient transport failures once. */
export const OFFICIAL_RESPONSE_TIMEOUT_MS = 45_000;
export class OfficialResponseError extends Error {
  constructor(public readonly code: 'HTTP' | 'REDIRECT' | 'SIZE' | 'EMPTY_BODY', public readonly status?: number) {
    super(`OFFICIAL_${code}${status === undefined ? '' : `_${status}`}`);
    this.name = 'OfficialResponseError';
  }
}
export function isTransientOfficialError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'TimeoutError' || error.name === 'AbortError') return true;
  const code = (error.cause as { code?: string } | undefined)?.code;
  return error instanceof TypeError && (!code || ['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(code));
}
export async function fetchOfficialText(url: string | URL, options: {
  fetcher?: typeof fetch; init?: RequestInit; maxBytes: number; encoding?: string;
  timeoutMs?: number; retryDelayMs?: number;
  maxAttempts?: 1 | 2;
}): Promise<{ response: Response; text: string }> {
  const maxAttempts = options.maxAttempts ?? 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await (options.fetcher || fetch)(url, { ...options.init,
        redirect: options.init?.redirect || 'error', signal: AbortSignal.timeout(options.timeoutMs ?? OFFICIAL_RESPONSE_TIMEOUT_MS) });
      if (response.headers.get('location') || (response.url && response.url !== String(url))) {
        await response.body?.cancel(); throw new OfficialResponseError('REDIRECT', response.status);
      }
      if (response.status === 304) return { response, text: '' };
      if (!response.ok) {
        await response.body?.cancel(); throw new OfficialResponseError('HTTP', response.status);
      }
      if (Number(response.headers.get('content-length')) > options.maxBytes) {
        await response.body?.cancel(); throw new OfficialResponseError('SIZE', response.status);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new OfficialResponseError('EMPTY_BODY', response.status);
      const chunks: Uint8Array[] = []; let bytes = 0;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          bytes += part.value.byteLength;
          if (bytes > options.maxBytes) throw new OfficialResponseError('SIZE', response.status);
          chunks.push(part.value);
        }
      } catch (error) { await reader.cancel().catch(() => {}); throw error; }
      finally { reader.releaseLock(); }
      const body = new Uint8Array(bytes); let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
      return { response, text: new TextDecoder(options.encoding || 'utf-8').decode(body) };
    } catch (error) {
      if (attempt + 1 === maxAttempts || !isTransientOfficialError(error)) throw error;
      await new Promise(resolve => setTimeout(resolve, options.retryDelayMs ?? 500));
    }
  }
  throw new Error('OFFICIAL_ATTEMPTS_EXHAUSTED');
}
