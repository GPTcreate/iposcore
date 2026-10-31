import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/** Bump when the confirmed-filing extraction rules change. Receipts are immutable. */
export const DART_METRIC_PARSER_VERSION = 'dart-metrics-v5';
export interface DartMetricParseResult {
  rcpNo: string;
  corpName: string;
  confirmedPrice?: number;
  circulatingSupplyRate?: number;
  institutionalCompetitionRate?: number;
  lockupCommitmentRate?: number;
  offeringShareCount?: number;
  totalOfferingAmount?: number;
  offeringExcerpt?: string;
  publicationPending?: { reason: string; evidence: string; sourceUrl: string };
}
type CacheEntry = { receiptNo: string; parserVersion: string; lastAttemptAt: string } & (
  { status: 'complete'; result: DartMetricParseResult }
  | { status: 'failed'; attempts: number; nextRetryAt: string }
);
interface CacheFile { version: 1; entries: Record<string, CacheEntry> }
export interface DartMetricCacheStats { hits: number; misses: number; backoffSkipped: number; failures: number }

const validTimestamp = (value: unknown): value is string => typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
function validReceipt(value: unknown): value is string {
  if (typeof value !== 'string' || !/^20\d{12}$/.test(value)) return false;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return Number.isFinite(Date.parse(`${iso}T00:00:00Z`)) && new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10) === iso;
}
const versionValid = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9._-]{1,80}$/.test(value);
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const safeText = (value: unknown): value is string => typeof value === 'string' && !!value.trim() && value.length <= 1000
  && !/[\x00-\x08\x0B\x0C\x0E-\x1F]|https?:\/\/|crtfc_key|api[_-]?key|authorization|access[_-]?token/i.test(value);

/** Whitelist only parser facts. Neither request URLs nor exceptions enter storage. */
function sanitizeResult(input: unknown, receiptNo: string): DartMetricParseResult | null {
  if (!isObject(input) || input.rcpNo !== receiptNo) return null;
  const result: DartMetricParseResult = { rcpNo: receiptNo, corpName: '' };
  let facts = 0;
  for (const field of ['confirmedPrice', 'circulatingSupplyRate', 'institutionalCompetitionRate', 'lockupCommitmentRate'] as const) {
    const value = input[field];
    if (value === undefined) continue;
    if (!finite(value) || (field === 'lockupCommitmentRate' ? value < 0 || value > 100
      : value <= 0 || field === 'circulatingSupplyRate' && value > 100)) return null;
    result[field] = value;
    facts++;
  }
  if (input.publicationPending !== undefined) {
    const pending = input.publicationPending;
    if (!isObject(pending) || !safeText(pending.reason) || !safeText(pending.evidence)
      || pending.sourceUrl !== `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receiptNo}`) return null;
    result.publicationPending = { reason: pending.reason, evidence: pending.evidence, sourceUrl: pending.sourceUrl };
  }
  if (input.offeringShareCount !== undefined || input.totalOfferingAmount !== undefined || input.offeringExcerpt !== undefined) {
    if (!Number.isSafeInteger(input.offeringShareCount) || !finite(input.offeringShareCount) || input.offeringShareCount <= 0
      || !finite(input.totalOfferingAmount) || input.totalOfferingAmount <= 0 || !safeText(input.offeringExcerpt)
      || !result.confirmedPrice || Math.abs(input.offeringShareCount * result.confirmedPrice / 100_000_000 - input.totalOfferingAmount) > 0.000001) return null;
    result.offeringShareCount = input.offeringShareCount;
    result.totalOfferingAmount = input.totalOfferingAmount;
    result.offeringExcerpt = input.offeringExcerpt;
  }
  return facts || result.publicationPending ? result : null;
}

function readCache(file: string): CacheFile {
  if (!fs.existsSync(file)) return { version: 1, entries: {} };
  try {
    if (fs.statSync(file).size > 5_000_000) throw new Error('size');
    const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!isObject(parsed) || parsed.version !== 1 || !isObject(parsed.entries) || Object.keys(parsed.entries).length > 4000) throw new Error('shape');
    const entries: Record<string, CacheEntry> = {};
    for (const [key, input] of Object.entries(parsed.entries)) {
      if (!isObject(input) || !validReceipt(input.receiptNo) || !versionValid(input.parserVersion)
        || key !== `${input.parserVersion}:${input.receiptNo}` || !validTimestamp(input.lastAttemptAt)) throw new Error('entry');
      if (input.status === 'complete') {
        const result = sanitizeResult(input.result, input.receiptNo);
        if (!result) throw new Error('result');
        entries[key] = { status: 'complete', receiptNo: input.receiptNo, parserVersion: input.parserVersion, lastAttemptAt: input.lastAttemptAt, result };
      } else if (input.status === 'failed' && Number.isInteger(input.attempts) && Number(input.attempts) >= 1 && Number(input.attempts) <= 999
        && validTimestamp(input.nextRetryAt) && input.nextRetryAt > input.lastAttemptAt) {
        entries[key] = { status: 'failed', receiptNo: input.receiptNo, parserVersion: input.parserVersion,
          lastAttemptAt: input.lastAttemptAt, attempts: Number(input.attempts), nextRetryAt: input.nextRetryAt };
      } else throw new Error('status');
    }
    return { version: 1, entries };
  } catch {
    throw new Error('DART 수치 캐시가 올바르지 않습니다. 기존 파일을 보존하고 실행을 중단합니다.');
  }
}

export function createDartMetricCache(options: {
  parseFiling: (receiptNo: string) => Promise<DartMetricParseResult | null>;
  file?: string;
  parserVersion?: string;
  now?: () => Date;
}) {
  if (typeof options.parseFiling !== 'function') throw new Error('DART 최신 수치 파서가 필요합니다.');
  const parserVersion = options.parserVersion || DART_METRIC_PARSER_VERSION;
  if (!versionValid(parserVersion)) throw new Error('DART 수치 파서 버전이 유효하지 않습니다.');
  const file = options.file || path.join(process.cwd(), '.cache', 'dart-metrics.json');
  const cache = readCache(file);
  const stats: DartMetricCacheStats = { hits: 0, misses: 0, backoffSkipped: 0, failures: 0 };
  const inFlight = new Map<string, Promise<DartMetricParseResult | null>>();
  let dirty = false;
  const parseFiling = async (receiptNo: string): Promise<DartMetricParseResult | null> => {
    if (!validReceipt(receiptNo)) return null;
    const key = `${parserVersion}:${receiptNo}`;
    const previous = cache.entries[key];
    const now = (options.now || (() => new Date()))();
    if (!Number.isFinite(now.getTime())) throw new Error('DART 수치 캐시 시각이 유효하지 않습니다.');
    if (previous?.status === 'complete') { stats.hits++; return structuredClone(previous.result); }
    if (previous?.status === 'failed' && Date.parse(previous.nextRetryAt) > now.getTime()) { stats.backoffSkipped++; return null; }
    const running = inFlight.get(key);
    if (running) { stats.hits++; return structuredClone(await running); }
    const pending = (async () => {
      stats.misses++;
      let result: DartMetricParseResult | null = null;
      try { result = sanitizeResult(await options.parseFiling(receiptNo), receiptNo); } catch { /* Never persist or expose raw transport errors. */ }
      const base = { receiptNo, parserVersion, lastAttemptAt: now.toISOString() };
      if (result) cache.entries[key] = { ...base, status: 'complete', result };
      else {
        stats.failures++;
        const attempts = Math.min(999, previous?.status === 'failed' ? previous.attempts + 1 : 1);
        const hours = Math.min(48, 6 * 2 ** Math.min(3, attempts - 1));
        cache.entries[key] = { ...base, status: 'failed', attempts, nextRetryAt: new Date(now.getTime() + hours * 3_600_000).toISOString() };
      }
      dirty = true;
      return result;
    })();
    inFlight.set(key, pending);
    try { return structuredClone(await pending); } finally { inFlight.delete(key); }
  };
  const flush = () => {
    if (!dirty) return;
    const content = `${JSON.stringify(cache, null, 2)}\n`;
    if (Buffer.byteLength(content, 'utf8') > 5_000_000 || Object.keys(cache.entries).length > 4000) throw new Error('DART 수치 캐시 저장 한도를 초과했습니다.');
    const temporary = `${file}.${randomUUID()}.tmp`;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
      fs.renameSync(temporary, file);
      if (fs.readFileSync(file, 'utf8') !== content) throw new Error('readback');
      dirty = false;
    } catch { throw new Error('DART 수치 캐시를 원자적으로 저장하지 못했습니다.'); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  };
  return { parseFiling, flush, stats };
}
