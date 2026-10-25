import fs from 'fs';
import path from 'path';
import { randomUUID } from 'node:crypto';
import type { IpoItem } from '@/types/ipo';
import { getAllIpos, setRuntimeCustomIpos, getStoredCustomIpos } from './ipoStore';
import { createDiscoveredIpo, invalidateChangedIpoEvidence, isSameIpoIdentity, mergeDartDiscoveries } from './ipoDiscovery';
import type { DartFilingItem, DartListResponse } from './ipoDiscovery';
export type { DartFilingItem, DartListResponse } from './ipoDiscovery';

export interface PendingDartFiling {
  companyName: string;
  reportName: string;
  receivedAt: string;
  receiptNo: string;
  sourceUrl: string;
  reason: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CUSTOM_IPOS_FILE = path.join(DATA_DIR, 'customIpos.json');

export function loadServerCustomIpos(): IpoItem[] {
  if (fs.existsSync(CUSTOM_IPOS_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(CUSTOM_IPOS_FILE, 'utf-8'));
    if (!Array.isArray(parsed) || parsed.some((item) => !item || typeof item.id !== 'string' || typeof item.name !== 'string')) {
      throw new Error('기존 추가 종목 파일 형식이 올바르지 않습니다. 기존 파일을 유지합니다.');
    }
    setRuntimeCustomIpos(structuredClone(parsed));
    return parsed;
  }
  return structuredClone(getStoredCustomIpos());
}

export function saveServerCustomIpos(data: IpoItem[]): void {
  if (process.env.VERCEL) throw new Error('Vercel 파일 저장은 영속화되지 않습니다. 저장소의 신규 공시 수집·배포 경로를 사용하세요.');
  const temporary = `${CUSTOM_IPOS_FILE}.${randomUUID()}.tmp`;
  const content = `${JSON.stringify(data, null, 2)}\n`;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, CUSTOM_IPOS_FILE);
    if (fs.readFileSync(CUSTOM_IPOS_FILE, 'utf8') !== content) throw new Error('추가 종목 파일의 저장 확인에 실패했습니다.');
    setRuntimeCustomIpos(structuredClone(data));
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

/** Source/content edits invalidate the prior review; a metadata-only review is allowed. */
export function addOrUpdateIpo(ipo: IpoItem): { success: boolean; ipo: IpoItem } {
  const custom = loadServerCustomIpos();
  const existing = getAllIpos().find((item) => isSameIpoIdentity(item, ipo));
  const savedIpo = invalidateChangedIpoEvidence(existing, ipo);
  const index = custom.findIndex((item) => isSameIpoIdentity(item, savedIpo));
  if (index >= 0) custom[index] = savedIpo;
  else custom.unshift(savedIpo);
  saveServerCustomIpos(custom);
  return { success: true, ipo: savedIpo };
}

export function deleteCustomIpo(idOrCode: string): boolean {
  const custom = loadServerCustomIpos();
  const filtered = custom.filter((item) => item.code !== idOrCode && item.id !== idOrCode);
  if (filtered.length === custom.length) return false;
  saveServerCustomIpos(filtered);
  return true;
}

/**
 * Discovery supplies only actual filing metadata. Unknown IPO values stay empty.
 * Listed-company capital increases and malformed filings are not new IPO cards.
 */
export async function createIpoFromDartFiling(filing: DartFilingItem): Promise<IpoItem | null> {
  return createDiscoveredIpo(filing);
}

/** Discover filings for review without guessing values or changing published facts. */
export async function syncNewIposFromDart(options?: {
  days?: number;
  apiKey?: string;
  limit?: number;
  now?: Date;
  fetcher?: typeof fetch;
}): Promise<{
  success: boolean;
  newCount: number;
  newIpos: IpoItem[];
  existingCount: number;
  filingsCount: number;
  pendingCount: number;
  pendingFilings: PendingDartFiling[];
  message: string;
  updatedCount: number;
  storageStatus: 'unchanged' | 'local-file-written';
}> {
  const dartApiKey = options?.apiKey || process.env.DART_API_KEY;
  const days = Math.max(1, Math.min(90, options?.days || 30));
  const limit = Math.max(1, Math.min(50, options?.limit || 10));
  loadServerCustomIpos();
  const allCurrentIpos = getAllIpos();
  const emptyResult = {
    success: false,
    newCount: 0,
    newIpos: [] as IpoItem[],
    existingCount: allCurrentIpos.length,
    filingsCount: 0,
    pendingCount: 0,
    pendingFilings: [] as PendingDartFiling[],
    updatedCount: 0,
    storageStatus: 'unchanged' as const,
  };
  if (!dartApiKey) return { ...emptyResult, message: 'DART_API_KEY가 설정되지 않았습니다.' };

  const today = options?.now || new Date();
  const endDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(today).replace(/-/g, '');
  const fromDate = new Date(`${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}T00:00:00Z`);
  fromDate.setUTCDate(fromDate.getUTCDate() - days);
  const startDate = fromDate.toISOString().slice(0, 10).replace(/-/g, '');
  const filings: DartFilingItem[] = [];
  try {
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page++) {
      const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${encodeURIComponent(dartApiKey)}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&sort=date&sort_mth=desc&page_no=${page}&page_count=100`;
      const response = await (options?.fetcher || fetch)(dartUrl, { next: { revalidate: 0 }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) return { ...emptyResult, message: `DART 서버 응답 오류: HTTP ${response.status}. 기존 자료를 유지합니다.` };
      const data = await response.json() as DartListResponse;
      if (data.status === '013' && page === 1) break;
      if (data.status !== '000' || !Array.isArray(data.list)) return { ...emptyResult, message: 'DART 공시 목록 응답이 정상적이지 않습니다. 기존 자료를 유지합니다.' };
      totalPages = Number(data.total_page) || 1;
      if (!Number.isInteger(totalPages) || totalPages < 1 || totalPages > 100) return { ...emptyResult, message: 'DART 조회 범위를 처리하지 못했습니다. 기간을 줄여 다시 실행하세요. 기존 자료를 유지합니다.' };
      filings.push(...data.list);
    }
  } catch {
    return { ...emptyResult, message: 'DART 공시 목록을 가져오지 못했습니다. 기존 자료를 유지합니다.' };
  }
  const merged = mergeDartDiscoveries(allCurrentIpos, filings, limit);
  const changed = [...merged.updatedIpos, ...merged.newIpos];
  if (changed.length > 0) {
    const custom = loadServerCustomIpos();
    for (const ipo of changed) {
      const index = custom.findIndex((item) => isSameIpoIdentity(item, ipo));
      if (index >= 0) custom[index] = ipo;
      else custom.push(ipo);
    }
    saveServerCustomIpos(custom);
  }
  const pendingFilings = changed.map((ipo) => {
    const discovery = ipo.discovery!;
    return { companyName: ipo.name, reportName: discovery.reportName, receivedAt: discovery.receivedAt,
      receiptNo: discovery.receiptNo, sourceUrl: discovery.sourceUrl,
      reason: '실제 공시 발견 기록입니다. 청약 일정·가격·주관사·수요예측은 원문 확인 후 별도로 갱신합니다.' };
  });
  return {
    ...emptyResult,
    success: true,
    newCount: merged.newIpos.length,
    newIpos: merged.newIpos,
    updatedCount: merged.updatedIpos.length,
    storageStatus: changed.length > 0 ? 'local-file-written' : 'unchanged',
    filingsCount: filings.length,
    pendingCount: pendingFilings.length,
    pendingFilings,
    message: pendingFilings.length > 0
      ? `새 공시 발견 카드 ${merged.newIpos.length}개 추가, 기존 종목 공시 링크 ${merged.updatedIpos.length}개 갱신. 미확인 일정과 금융 수치는 채우지 않았습니다.`
      : '조회 범위에서 새 발견·최신 공시 변경이 없습니다. 기존 종목을 유지합니다.',
  };
}
