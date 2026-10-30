import { createHash } from 'node:crypto';
import type { IpoItem, IpoFieldEvidence } from '../types/ipo';
import { invalidateChangedIpoEvidence } from './ipoDiscovery';
import { BROKER_PARSER_VERSION, KIS_IPO_INDEX, isIsoDay, isKisNoticeUrl, normalizeCompany, parseKisIndex, parseKisNotice } from './brokerSchedule';
import type { BrokerNotice, OfficialFacts, OfficialField } from './brokerSchedule';
import { DART_SCHEDULE_PARSER_VERSION, fetchDartSchedule } from './dartSchedule';
import { IBK_IPO_INDEX, IBK_PARSER_VERSION, parseIbkIndex, parseIbkNotice } from './ibkSchedule';
import { isIbkNoticeUrl } from './officialSource';

const HOUR = 3_600_000;
const VERSION = 'official-verification-v2';
export const VERIFICATION_VERSION = `${VERSION}:${DART_SCHEDULE_PARSER_VERSION}:${BROKER_PARSER_VERSION}:${IBK_PARSER_VERSION}`;
export interface SourceCheck {
  parser: string; checkedAt: string; nextCheckAt: string; failures: number;
  hash?: string; etag?: string; lastModified?: string; facts?: OfficialFacts; notices?: BrokerNotice[]; error?: string;
}
export interface TargetCheck {
  receiptNo?: string; checkedAt: string; nextCheckAt: string; failures: number; brokerUrl?: string; fingerprint: string; inputHash?: string; parserVersion?: string;
}
export interface VerificationArchive { version: 1; sources: Record<string, SourceCheck>; targets: Record<string, TargetCheck> }
export const emptyVerificationArchive = (): VerificationArchive => ({ version: 1, sources: {}, targets: {} });
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const timestamp = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
export function validateVerificationArchive(value: unknown): VerificationArchive {
  const archive = value as VerificationArchive;
  if (!archive || archive.version !== 1 || !archive.sources || !archive.targets || Array.isArray(archive.sources) || Array.isArray(archive.targets)
    || Object.values(archive.sources).some(item => !item || !timestamp(item.checkedAt) || !timestamp(item.nextCheckAt) || !Number.isInteger(item.failures) || item.failures < 0)
    || Object.keys(archive.sources).length > 2500 || Object.keys(archive.targets).length > 1000
    || Object.entries(archive.sources).some(([url, item]) => !officialUrl(url) || typeof item.parser !== 'string'
      || (item.facts && ((!isValidLinkedSource(url, item.facts)) || !validFacts(item.facts)
        || typeof item.facts.sourceTitle !== 'string' || !item.facts.excerpts
        || Object.values(item.facts.excerpts).some(excerpt => typeof excerpt !== 'string' || excerpt.length > 1000)))
      || (item.notices && (![KIS_IPO_INDEX, IBK_IPO_INDEX].includes(url) || !Array.isArray(item.notices) || item.notices.length > 100
        || item.notices.some(notice => !(isKisNoticeUrl(notice.sourceUrl) || isIbkNoticeUrl(notice.sourceUrl)) || typeof notice.company !== 'string' || typeof notice.title !== 'string' || !timestamp(notice.publishedAt)))))
    || Object.values(archive.targets).some(item => !item || !timestamp(item.checkedAt) || !timestamp(item.nextCheckAt) || !Number.isInteger(item.failures) || item.failures < 0
      || (item.brokerUrl && !(isKisNoticeUrl(item.brokerUrl) || isIbkNoticeUrl(item.brokerUrl))))) {
    throw new Error('공식 검증 이력 형식이 올바르지 않습니다. 이력을 초기화하지 않고 중단합니다.');
  }
  return structuredClone(archive);
}
function officialUrl(value: string): boolean {
  return value === KIS_IPO_INDEX || isKisNoticeUrl(value) || value === IBK_IPO_INDEX || isIbkNoticeUrl(value)
    || /^https:\/\/dart\.fss\.or\.kr\/dsaf001\/main\.do\?rcpNo=\d{14}$/.test(value);
}
function isValidLinkedSource(key: string, facts: OfficialFacts): boolean {
  if (facts.sourceUrl === key) return !facts.linkedFrom;
  const dart = /^https:\/\/dart\.fss\.or\.kr\/dsaf001\/main\.do\?rcpNo=(\d{14})$/;
  const parent = key.match(dart), body = facts.sourceUrl.match(dart);
  return facts.linkedFrom === key && !!parent && !!body && body[1] < parent[1];
}
export function verificationIntervalHours(ipo: IpoItem, now: Date): number {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const days = [ipo.subscriptionStart, ipo.subscriptionEnd, ipo.refundDate, ipo.listingDate]
    .filter(isIsoDay).map(day => (Date.parse(day) - Date.parse(today)) / (24 * HOUR)).filter(days => days >= -1);
  const nearest = days.length ? Math.min(...days) : undefined;
  return nearest === undefined ? 24 : nearest <= 2 ? 6 : nearest <= 7 ? 24 : 72;
}
export function isVerificationDue(ipo: IpoItem, state: TargetCheck | undefined, now: Date): boolean {
  if (ipo.isCancelled || ipo.status === 'LISTED') return false;
  return !state || state.parserVersion !== VERIFICATION_VERSION || state.receiptNo !== ipo.discovery?.receiptNo || Date.parse(state.nextCheckAt) <= now.getTime()
    || (!!state.inputHash && state.inputHash !== targetInputHash(ipo))
    || (!state.failures && Date.parse(state.checkedAt) + verificationIntervalHours(ipo, now) * HOUR <= now.getTime());
}
function targetInputHash(ipo: IpoItem): string {
  return hash([VERSION, DART_SCHEDULE_PARSER_VERSION, BROKER_PARSER_VERSION, ipo.name, ipo.code,
    ipo.subscriptionStart, ipo.subscriptionEnd, ipo.refundDate, ipo.listingDate, ipo.confirmedPrice, ipo.underwriters.map(item => item.name), IBK_PARSER_VERSION]);
}
const nextTime = (now: Date, hours: number) => new Date(now.getTime() + hours * HOUR).toISOString();
const fields: OfficialField[] = ['subscriptionStart', 'subscriptionEnd', 'refundDate', 'listingDate', 'confirmedPrice'];
function validFacts(facts: OfficialFacts): boolean {
  return !!facts.fields && typeof facts.fields === 'object' && !Array.isArray(facts.fields)
    && Object.keys(facts.fields).every(field => fields.includes(field as OfficialField))
    && (!facts.pendingFields || (Array.isArray(facts.pendingFields) && facts.pendingFields.every(field => field === 'listingDate' && facts.fields[field] === undefined)))
    && timestamp(facts.publishedAt) && fields.every(field => facts.fields[field] === undefined
    || (field === 'confirmedPrice' ? typeof facts.fields[field] === 'number' && Number.isFinite(facts.fields[field]) && facts.fields[field]! > 0 : isIsoDay(facts.fields[field])));
}
/** Newer explicit official facts supersede older ones; equal-date disagreements require review. */
export function reconcileOfficialFacts(ipo: IpoItem, facts: OfficialFacts[], checkedAt: string): { ipo: IpoItem; changed: OfficialField[]; conflicts: OfficialField[]; pendingFields: ('listingDate')[] } {
  const incoming = structuredClone(ipo);
  const evidence: Partial<Record<OfficialField, IpoFieldEvidence>> = {};
  const changed: OfficialField[] = [], conflicts: OfficialField[] = [];
  for (const field of fields) {
    const prior = ipo.fieldEvidence?.[field];
    const preserved: OfficialFacts[] = prior?.value !== null && prior?.value === ipo[field] && prior?.publishedAt && prior?.parserVersion ? [{
      sourceUrl: prior.sourceUrl, sourceTitle: prior.sourceTitle, publishedAt: prior.publishedAt,
      fields: { [field]: prior.value }, excerpts: { [field]: prior.excerpt || '' },
    }] : [];
    const candidates = [...facts, ...preserved].filter(item => validFacts(item) && item.fields[field] !== undefined)
      .sort((a, b) => b.publishedAt.slice(0, 10).localeCompare(a.publishedAt.slice(0, 10)));
    if (!candidates.length) continue;
    const latestDay = candidates[0].publishedAt.slice(0, 10);
    const sameDay = candidates.filter(item => item.publishedAt.slice(0, 10) === latestDay)
      .filter((item, _, items) => !items.some(other => isKisNoticeUrl(item.sourceUrl) && isKisNoticeUrl(other.sourceUrl)
        && item.publishedAt.includes('T') && other.publishedAt.includes('T') && Date.parse(other.publishedAt) > Date.parse(item.publishedAt)));
    const newest = sameDay[0];
    if (new Set(sameDay.map(item => item.fields[field])).size !== 1) { conflicts.push(field); continue; }
    const legacyReceiptDate = prior?.sourceUrl.match(/[?&]rcpNo=(\d{4})(\d{2})(\d{2})\d{6}(?:&|$)/);
    const priorDate = prior?.publishedAt?.slice(0, 10) || (legacyReceiptDate ? `${legacyReceiptDate[1]}-${legacyReceiptDate[2]}-${legacyReceiptDate[3]}` : '');
    const knownNewest = [ipo.discovery?.receivedAt || '', priorDate].sort().at(-1)!;
    if ((ipo[field] || prior?.value === null) && ipo[field] !== newest.fields[field]
      && knownNewest > newest.publishedAt.slice(0, 10)) { conflicts.push(field); continue; }
    if (incoming[field] !== newest.fields[field]) {
      if (field === 'confirmedPrice') incoming.confirmedPrice = newest.fields.confirmedPrice as number;
      else incoming[field] = newest.fields[field] as string;
      changed.push(field);
    }
    evidence[field] = prior?.value === newest.fields[field] && prior?.sourceUrl === newest.sourceUrl && prior?.publishedAt === newest.publishedAt ? prior
      : { sourceTitle: newest.sourceTitle, sourceUrl: newest.sourceUrl, checkedAt,
      value: newest.fields[field], publishedAt: newest.publishedAt, excerpt: newest.excerpts[field], parserVersion: VERSION, linkedFrom: newest.linkedFrom };
  }
  const pending = facts.filter(item => validFacts(item) && item.pendingFields?.includes('listingDate'))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
  if (pending) {
    const prior = evidence.listingDate || ipo.fieldEvidence?.listingDate;
    const priorReceipt = prior?.sourceUrl.match(/[?&]rcpNo=(\d{4})(\d{2})(\d{2})\d{6}(?:&|$)/);
    const priorDate = prior?.publishedAt?.slice(0, 10) || (priorReceipt ? `${priorReceipt[1]}-${priorReceipt[2]}-${priorReceipt[3]}` : '');
    const datedFact = facts.some(item => validFacts(item) && item.fields.listingDate
      && item.publishedAt.slice(0, 10) >= pending.publishedAt.slice(0, 10));
    // Explicit same-day/later listing announcements supersede generic "not yet set" wording.
    if (!datedFact && !(incoming.listingDate && priorDate >= pending.publishedAt.slice(0, 10))) {
      if (incoming.listingDate) { delete incoming.listingDate; if (!changed.includes('listingDate')) changed.push('listingDate'); }
      const previous = ipo.fieldEvidence?.listingDate;
      evidence.listingDate = previous?.value === null && previous.sourceUrl === pending.sourceUrl && previous.publishedAt === pending.publishedAt ? previous
        : { sourceTitle: pending.sourceTitle, sourceUrl: pending.sourceUrl, checkedAt, value: null,
          publishedAt: pending.publishedAt, excerpt: pending.excerpts.listingDate, parserVersion: VERSION, linkedFrom: pending.linkedFrom };
    }
  }
  const sequence = [incoming.subscriptionStart, incoming.subscriptionEnd, incoming.refundDate, incoming.listingDate].filter(isIsoDay);
  if (sequence.some((day, i) => i > 0 && day < sequence[i - 1])) {
    // Incomplete or incompatible sources must not create an impossible combined schedule.
    for (const field of fields.filter(field => field !== 'confirmedPrice')) {
      if (changed.includes(field)) { incoming[field] = ipo[field] as string; conflicts.push(field); delete evidence[field]; }
    }
  }
  const acceptedChanges = changed.filter(field => !conflicts.includes(field));
  let next = invalidateChangedIpoEvidence(ipo, incoming);
  next.fieldEvidence = { ...next.fieldEvidence, ...evidence };
  for (const field of conflicts) if (next.fieldEvidence
    && !(next.fieldEvidence[field]?.value === null && next[field] === undefined)) delete next.fieldEvidence[field];
  if (acceptedChanges.length) {
    // Retained free text must not continue advertising a superseded date or price.
    const stale = /(?:청약|환불|상장|공모가|발행가액).*(?:\d|예정|확정)|\d.*(?:청약|환불|상장|공모가)/;
    next = { ...next, aiSummary: { ...next.aiSummary,
      headline: stale.test(next.aiSummary.headline) ? `${next.name} 공모 일정과 공시 자료` : next.aiSummary.headline,
      bulletPoints: next.aiSummary.bulletPoints.filter(line => !stale.test(line)) } };
  }
  if (conflicts.length && next.dataQuality?.status === 'reviewed') next.dataQuality = { ...next.dataQuality, status: 'unverified', reviewedAt: undefined };
  return { ipo: next, changed: acceptedChanges, conflicts: [...new Set(conflicts)],
    pendingFields: !next.listingDate && next.fieldEvidence?.listingDate?.value === null ? ['listingDate'] : [] };
}
export interface VerificationResult {
  ipos: IpoItem[]; archive: VerificationArchive; requestCount: number; checkedCount: number; skippedCount: number;
  changes: { id: string; name: string; fields: OfficialField[] }[];
  notices: { id: string; status: string; conflicts: OfficialField[] }[];
  errorCount: number; coverage: { id: string; status: string }[];
}
/** One sequential, bounded batch. Stores only normalized evidence, never HTML or credentials. */
export async function verifyOfficialSchedules(ipos: IpoItem[], input: VerificationArchive, options: {
  now?: Date; fetcher?: typeof fetch; maxRequests?: number; maxTargets?: number;
} = {}): Promise<VerificationResult> {
  const now = options.now || new Date(), checkedAt = now.toISOString();
  const archive = validateVerificationArchive(input), result: VerificationResult = {
    ipos: structuredClone(ipos), archive, requestCount: 0, checkedCount: 0, skippedCount: 0, changes: [], notices: [], errorCount: 0, coverage: [],
  };
  const maxRequests = options.maxRequests ?? 30, maxTargets = options.maxTargets ?? 12;
  const transport: typeof fetch = async (url, init) => {
    const parsed = new URL(String(url));
    if (parsed.protocol !== 'https:' || parsed.port || parsed.username || parsed.password
      || !['www.truefriend.com', 'dart.fss.or.kr', 'www.ibks.com'].includes(parsed.hostname)) throw new Error('허용되지 않은 공식 원문 주소');
    if (result.requestCount >= maxRequests) throw new Error('REQUEST_BUDGET');
    result.requestCount++;
    return (options.fetcher || fetch)(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(15000), cache: 'no-store' });
  };
  async function brokerSource(url: string, parser: string, parse: (html: string) => { facts?: OfficialFacts; notices?: BrokerNotice[] }, interval: number, encoding = 'utf-8'): Promise<SourceCheck> {
    const old = archive.sources[url];
    if (old?.parser === parser && Date.parse(old.nextCheckAt) > now.getTime()
      && (old.error || Date.parse(old.checkedAt) + interval * HOUR > now.getTime())) return old;
    try {
      const response = await transport(url, { headers: { ...(old?.etag ? { 'If-None-Match': old.etag } : {}), ...(old?.lastModified ? { 'If-Modified-Since': old.lastModified } : {}) } });
      let parsed: Pick<SourceCheck, 'facts' | 'notices'>;
      if (response.status === 304 && old && !old.error) parsed = { facts: old.facts, notices: old.notices };
      else {
        if (!response.ok) throw new Error(`HTTP_${response.status}`);
        if (Number(response.headers.get('content-length')) > 2_000_000) throw new Error('OVERSIZED');
        const reader = response.body?.getReader();
        if (!reader) throw new Error('EMPTY_BODY');
        const chunks: Uint8Array[] = []; let bytes = 0;
        try {
          while (true) { const part = await reader.read(); if (part.done) break;
            bytes += part.value.length; if (bytes > 2_000_000) { await reader.cancel(); throw new Error('OVERSIZED'); } chunks.push(part.value); }
        } finally { reader.releaseLock(); }
        parsed = parse(new TextDecoder(encoding).decode(Buffer.concat(chunks)));
      }
      return archive.sources[url] = { parser, checkedAt, nextCheckAt: nextTime(now, interval), failures: 0,
        etag: response.headers.get('etag') || old?.etag, lastModified: response.headers.get('last-modified') || old?.lastModified,
        hash: hash(parsed), ...parsed };
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_BUDGET') throw error;
      const failures = (old?.failures || 0) + 1;
      return archive.sources[url] = { ...old, parser, checkedAt, nextCheckAt: nextTime(now, Math.min(48, 6 * 2 ** Math.min(failures - 1, 4))), failures,
        error: '공식 원문 조회 또는 파싱 실패. 이전 자료 보존.' };
    }
  }
  const due = result.ipos.filter(ipo => isVerificationDue(ipo, archive.targets[ipo.id], now))
    .sort((a, b) => verificationIntervalHours(a, now) - verificationIntervalHours(b, now)
      || (archive.targets[a.id]?.checkedAt || '').localeCompare(archive.targets[b.id]?.checkedAt || '')).slice(0, maxTargets);
  let brokerIndex: SourceCheck | undefined;
  let ibkIndex: SourceCheck | undefined;
  if (due.some(ipo => ipo.underwriters.some(item => item.name === '한국투자증권'))) {
    brokerIndex = await brokerSource(KIS_IPO_INDEX, BROKER_PARSER_VERSION, html => ({ notices: parseKisIndex(html) }), 6);
  }
  if (due.some(ipo => ipo.underwriters.some(item => /^(?:IBK투자증권|아이비케이투자증권)$/.test(item.name)))) {
    ibkIndex = await brokerSource(IBK_IPO_INDEX, IBK_PARSER_VERSION, html => ({ notices: parseIbkIndex(html) }), 6, 'euc-kr');
  }
  for (const ipo of due) {
    if (result.requestCount >= maxRequests) break;
    const old = archive.targets[ipo.id], facts: OfficialFacts[] = [];
    let failed = false, brokerUrl = old?.brokerUrl;
    const receipt = ipo.discovery?.receiptNo;
    try {
      if (receipt && /^\d{14}$/.test(receipt)) {
        const url = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}`;
        let source = archive.sources[url];
        if (!source || source.parser !== DART_SCHEDULE_PARSER_VERSION || (source.error && Date.parse(source.nextCheckAt) <= now.getTime())) {
          const parsed = await fetchDartSchedule(receipt, { fetcher: transport });
          if (parsed.status === 'error' && result.requestCount >= maxRequests) break;
          const good = parsed.status === 'parsed' || parsed.status === 'pending';
          const failures = good ? 0 : (source?.failures || 0) + 1;
          source = archive.sources[url] = { parser: DART_SCHEDULE_PARSER_VERSION, checkedAt,
            nextCheckAt: nextTime(now, good ? 24 * 365 : Math.min(48, 6 * 2 ** Math.min(failures - 1, 4))), failures,
            ...(good ? { facts: { sourceUrl: parsed.sourceUrl, sourceTitle: `${ipo.name} DART 공시 일정`,
              publishedAt: `${(parsed.bodyReceiptNo || receipt).slice(0, 4)}-${(parsed.bodyReceiptNo || receipt).slice(4, 6)}-${(parsed.bodyReceiptNo || receipt).slice(6, 8)}`,
              ...(parsed.bodyReceiptNo ? { linkedFrom: url } : {}), ...(parsed.pendingFields?.length ? { pendingFields: parsed.pendingFields } : {}),
              fields: parsed.fields, excerpts: Object.fromEntries(Object.entries(parsed.evidence).map(([field, evidence]) => [field, evidence?.excerpt])) } }
              : { error: '최신 DART 일정의 조회 또는 해석 실패. 이전 자료 보존.' }) };
        }
        if (!source.error && source.facts) facts.push(source.facts); else failed = true;
      }
      if (ipo.underwriters.some(item => item.name === '한국투자증권')) {
        const notices = brokerIndex?.notices?.filter(item => item.company === normalizeCompany(ipo.name))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.sourceUrl.localeCompare(a.sourceUrl));
        if (notices?.length && (!brokerUrl || !archive.sources[brokerUrl]?.facts
          || notices[0].publishedAt >= archive.sources[brokerUrl].facts!.publishedAt.slice(0, 10))) brokerUrl = notices[0].sourceUrl;
        if (brokerIndex?.error) failed = true;
        if (brokerUrl) {
          const source = await brokerSource(brokerUrl, BROKER_PARSER_VERSION, html => ({ facts: parseKisNotice(html, brokerUrl!, ipo.name) }), verificationIntervalHours(ipo, now));
          if (!source.error && source.facts) facts.push(source.facts); else failed = true;
        }
      }
      if (ipo.underwriters.some(item => /^(?:IBK투자증권|아이비케이투자증권)$/.test(item.name))) {
        const notices = ibkIndex?.notices?.filter(item => item.company === normalizeCompany(ipo.name))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        if (notices?.length && (!brokerUrl || !archive.sources[brokerUrl]?.facts
          || notices[0].publishedAt >= archive.sources[brokerUrl].facts!.publishedAt)) brokerUrl = notices[0].sourceUrl;
        if (!brokerUrl && ipo.id === 'hana-aerodynamics') brokerUrl = 'https://www.ibks.com/hts/hts_noticeview.do?seq=6125';
        if (ibkIndex?.error) failed = true;
        if (brokerUrl && isIbkNoticeUrl(brokerUrl)) {
          const source = await brokerSource(brokerUrl, IBK_PARSER_VERSION, html => ({ facts: parseIbkNotice(html, brokerUrl!, ipo.name) }), verificationIntervalHours(ipo, now), 'euc-kr');
          if (!source.error && source.facts) facts.push(source.facts); else failed = true;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'REQUEST_BUDGET') break;
      failed = true;
    }
    const reconciled = reconcileOfficialFacts(ipo, facts, checkedAt);
    const coveredFields = fields.filter(field => facts.some(item => validFacts(item) && item.fields[field] !== undefined));
    const status = reconciled.conflicts.length ? 'conflict' : failed ? 'unavailable'
      : ['subscriptionStart', 'subscriptionEnd', 'refundDate', 'listingDate'].every(field => coveredFields.includes(field as OfficialField)) ? 'verified' : 'partial';
    const failures = failed ? (old?.failures || 0) + 1 : 0;
    const interval = failures ? Math.min(48, 6 * 2 ** Math.min(failures - 1, 4)) : verificationIntervalHours(reconciled.ipo, now);
    const nextCheckAt = nextTime(now, interval);
    const fingerprint = hash({ status, conflicts: reconciled.conflicts, pendingFields: reconciled.pendingFields, fields: coveredFields.map(field => [field, reconciled.ipo[field]]) });
    const verification: NonNullable<IpoItem['scheduleVerification']> = { status, checkedAt, conflicts: reconciled.conflicts,
      coveredFields: coveredFields.filter(field => !reconciled.conflicts.includes(field)),
      ...(reconciled.pendingFields.length ? { pendingFields: reconciled.pendingFields } : {}) };
    const previousVerification = ipo.scheduleVerification;
    reconciled.ipo.scheduleVerification = previousVerification && hash({ ...previousVerification, checkedAt: '' }) === hash({ ...verification, checkedAt: '' })
      ? previousVerification : verification;
    result.ipos[result.ipos.findIndex(item => item.id === ipo.id)] = reconciled.ipo;
    archive.targets[ipo.id] = { receiptNo: receipt, checkedAt, nextCheckAt, failures, brokerUrl, fingerprint, inputHash: targetInputHash(reconciled.ipo), parserVersion: VERIFICATION_VERSION };
    result.checkedCount++;
    if (failed) result.errorCount++;
    result.coverage.push({ id: ipo.id, status });
    if (reconciled.changed.length) result.changes.push({ id: ipo.id, name: ipo.name, fields: reconciled.changed });
    if ((failed || reconciled.conflicts.length) && old?.fingerprint !== fingerprint) result.notices.push({ id: ipo.id, status, conflicts: reconciled.conflicts });
  }
  result.skippedCount = ipos.length - result.checkedCount;
  return result;
}
