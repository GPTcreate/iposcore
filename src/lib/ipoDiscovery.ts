import type { IpoEvidenceField, IpoItem } from '../types/ipo';

export interface DartFilingItem {
  corp_code: string;
  corp_name: string;
  stock_code?: string;
  corp_cls: string;
  report_nm: string;
  rcept_no: string;
  flr_nm?: string;
  rcept_dt: string;
  rm?: string;
}

export interface DartListResponse {
  status?: string;
  message?: string;
  total_page?: number;
  list?: DartFilingItem[];
}

export function normalizeIpoCompanyName(name: string): string {
  const compact = name.normalize('NFKC').toLowerCase()
    .replace(/주식회사|유한회사|\(주\)|\(유\)|㈜/g, '')
    .replace(/[\s·ㆍ.,()[\]{}_-]/g, '');
  if (/기업인수목적|스팩|spac/.test(compact)) {
    return `spac:${compact.replace(/기업인수목적|스팩|spac/g, '')
      .replace(/제(?=\d)|호$/g, '').replace(/\d+/g, (digits) => digits.replace(/^0+(?=\d)/, ''))}`;
  }
  return compact;
}

export function isSameIpoIdentity(first: IpoItem, second: IpoItem): boolean {
  return first.id === second.id
    || Boolean(first.code && second.code && first.code === second.code)
    || Boolean(first.discovery?.corpCode && first.discovery.corpCode === second.discovery?.corpCode);
}

function validCompactDate(value: string): boolean {
  if (!/^\d{8}$/.test(value)) return false;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso;
}

export function getDartDiscovery(filing: DartFilingItem): IpoItem['discovery'] | undefined {
  if (!filing || !/^\d{8}$/.test(filing.corp_code) || filing.corp_code === '00000000' || !/^\d{14}$/.test(filing.rcept_no)
    || !validCompactDate(filing.rcept_dt) || filing.rcept_no.slice(0, 8) !== filing.rcept_dt
    || typeof filing.corp_name !== 'string' || !normalizeIpoCompanyName(filing.corp_name)
    || typeof filing.report_nm !== 'string' || !/증권신고서?\s*\(\s*지분증권\s*\)/.test(filing.report_nm)) return undefined;
  return {
    corpCode: filing.corp_code, receiptNo: filing.rcept_no,
    sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${filing.rcept_no}`,
    receivedAt: `${filing.rcept_dt.slice(0, 4)}-${filing.rcept_dt.slice(4, 6)}-${filing.rcept_dt.slice(6, 8)}`,
    reportName: filing.report_nm.trim(),
  };
}

/** C001 also includes listed-company capital increases; those are never new IPOs. */
export function createDiscoveredIpo(filing: DartFilingItem): IpoItem | null {
  const discovery = getDartDiscovery(filing);
  if (!discovery || !['E', 'N'].includes(filing.corp_cls)
    || /유상증자|합병|분할|철회/.test(filing.report_nm) || filing.rm?.includes('철')) return null;
  return {
    id: `dart-${filing.corp_code}`,
    name: filing.corp_name.replace(/주식회사|유한회사|\(주\)|\(유\)|㈜/g, '').trim(),
    code: /^\d{6}$/.test(filing.stock_code || '') && filing.stock_code !== '000000' ? filing.stock_code! : '',
    market: 'UNCONFIRMED', status: 'UPCOMING', discovery,
    dataQuality: { status: 'unverified' },
    subscriptionStart: '', subscriptionEnd: '', refundDate: '',
    priceBandMin: 0, priceBandMax: 0, confirmedPrice: 0, underwriters: [],
    institutionalCompetitionRate: 0, lockupCommitmentRate: 0, circulatingSupplyRate: 0,
    pendingForecastFields: ['institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate'],
    totalOfferingAmount: 0, marketCapAtIpo: 0, aiScore: 0, scoreGrade: 'C',
    aiSummary: { headline: '공시 발견 · 청약 정보 확인 중', bulletPoints: [], positivePoints: [], riskPoints: [] },
    sentimentConsensus: { positiveRatio: null, neutralRatio: null, cautionRatio: null }, expertReviews: [],
  };
}

export function findIpoForDartFiling(ipos: IpoItem[], filing: DartFilingItem): IpoItem | undefined {
  const byCorp = ipos.find((ipo) => ipo.discovery?.corpCode === filing.corp_code || ipo.id === `dart-${filing.corp_code}`);
  if (byCorp) return byCorp;
  if (/^\d{6}$/.test(filing.stock_code || '') && filing.stock_code !== '000000') {
    const byCode = ipos.find((ipo) => ipo.code && ipo.code === filing.stock_code
      && (!ipo.discovery?.corpCode || ipo.discovery.corpCode === filing.corp_code));
    if (byCode) return byCode;
  }
  const name = normalizeIpoCompanyName(filing.corp_name);
  const matches = ipos.filter((ipo) => normalizeIpoCompanyName(ipo.name) === name
    && (!ipo.discovery?.corpCode || ipo.discovery.corpCode === filing.corp_code));
  return matches.length === 1 ? matches[0] : undefined;
}

export interface IpoDiscoveryResult { ipos: IpoItem[]; newIpos: IpoItem[]; updatedIpos: IpoItem[]; ignoredCount: number }

/** Append discoveries without replacing existing schedules, numbers, or lifecycle state. */
export function mergeDartDiscoveries(current: IpoItem[], filings: DartFilingItem[], limit = Number.MAX_SAFE_INTEGER): IpoDiscoveryResult {
  const ipos = structuredClone(current);
  const newIds = new Set<string>();
  const updatedIds = new Set<string>();
  let ignoredCount = 0;
  const ordered = [...filings].sort((a, b) => String(b.rcept_no).localeCompare(String(a.rcept_no)));
  for (const filing of ordered) {
    const discovery = getDartDiscovery(filing);
    if (!discovery) { ignoredCount++; continue; }
    const existing = findIpoForDartFiling(ipos, filing);
    if (existing) {
      if (!existing.discovery || discovery.receiptNo > existing.discovery.receiptNo) {
        existing.discovery = discovery;
        if (!newIds.has(existing.id)) updatedIds.add(existing.id);
      }
      continue;
    }
    const created = createDiscoveredIpo(filing);
    if (!created || newIds.size >= limit) { ignoredCount++; continue; }
    ipos.push(created);
    newIds.add(created.id);
  }
  return { ipos, newIpos: ipos.filter((ipo) => newIds.has(ipo.id)), updatedIpos: ipos.filter((ipo) => updatedIds.has(ipo.id)), ignoredCount };
}

const EVIDENCE_FIELDS: IpoEvidenceField[] = ['institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate',
  'subscriptionStart', 'subscriptionEnd', 'refundDate', 'listingDate', 'confirmedPrice', 'depositRatePercent'];
const REVIEWED_FIELDS: (keyof IpoItem)[] = ['name', 'code', 'market', 'status', ...EVIDENCE_FIELDS, 'priceBandMin', 'priceBandMax',
  'pendingForecastFields',
  'underwriters', 'generalCompetitionRate', 'totalOfferingAmount', 'marketCapAtIpo', 'subscriptionResults',
  'openingPrice', 'openingReturnRate', 'closingPrice', 'closingReturnRate', 'isCancelled', 'cancelReason'];

/** A prior field citation cannot validate a different value after an automated update. */
export function invalidateChangedIpoEvidence(previous: IpoItem | undefined, incoming: IpoItem): IpoItem {
  const next = structuredClone(incoming);
  if (!previous) return next;
  for (const field of EVIDENCE_FIELDS) {
    if (!Object.is(previous[field], next[field]) && next.fieldEvidence) delete next.fieldEvidence[field];
  }
  if (REVIEWED_FIELDS.some((field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]))
    && (previous.dataQuality?.status === 'reviewed' || next.dataQuality?.status === 'reviewed')) {
    next.dataQuality = { ...next.dataQuality, status: 'unverified', reviewedAt: undefined };
  }
  return next;
}
