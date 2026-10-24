import fs from 'fs';
import path from 'path';
import { isDeepStrictEqual } from 'node:util';
import type { IpoItem } from '@/types/ipo';
import { getAllIpos, setRuntimeCustomIpos, getStoredCustomIpos } from './ipoStore';

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
  list?: DartFilingItem[];
}

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
  try {
    if (fs.existsSync(CUSTOM_IPOS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CUSTOM_IPOS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        setRuntimeCustomIpos(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[IpoServerStore] 로컬 파일 로드 실패 (런타임 메모리 사용):', err);
  }
  return getStoredCustomIpos();
}

export function saveServerCustomIpos(data: IpoItem[]): void {
  setRuntimeCustomIpos(data);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CUSTOM_IPOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[IpoServerStore] 파일 저장 불가 (서버리스 런타임 메모리 유지):', err);
  }
}

/** Source/content edits invalidate the prior review; a metadata-only review is allowed. */
export function addOrUpdateIpo(ipo: IpoItem): { success: boolean; ipo: IpoItem } {
  const custom = loadServerCustomIpos();
  const existing = getAllIpos().find((item) => item.code === ipo.code || item.id === ipo.id);
  const content = (item: IpoItem) => {
    const { dataQuality, ...fields } = item;
    void dataQuality;
    return fields;
  };
  const changed = existing && !isDeepStrictEqual(content(existing), content(ipo));
  const savedIpo: IpoItem = changed && (existing.dataQuality?.status === 'reviewed' || ipo.dataQuality?.status === 'reviewed')
    ? { ...ipo, dataQuality: { ...ipo.dataQuality, status: 'unverified', reviewedAt: undefined } }
    : ipo;
  const index = custom.findIndex((item) => item.code === savedIpo.code || item.id === savedIpo.id);
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
 * The DART list API supplies filing metadata, not the IPO's verified schedule,
 * offering price, underwriter or forecast results. Do not create a public record
 * from it. The nullable result preserves the discovery workflow until a document
 * parser and editorial review can supply those fields.
 */
export async function createIpoFromDartFiling(filing: DartFilingItem): Promise<IpoItem | null> {
  void filing;
  return null;
}

/** Discover filings for review without guessing values or changing published facts. */
export async function syncNewIposFromDart(options?: {
  days?: number;
  apiKey?: string;
  limit?: number;
}): Promise<{
  newCount: number;
  newIpos: IpoItem[];
  existingCount: number;
  filingsCount: number;
  pendingCount: number;
  pendingFilings: PendingDartFiling[];
  message: string;
}> {
  const dartApiKey = options?.apiKey || process.env.DART_API_KEY;
  const days = Math.max(1, Math.min(90, options?.days || 30));
  const limit = Math.max(1, Math.min(50, options?.limit || 10));
  const allCurrentIpos = getAllIpos();
  const emptyResult = {
    newCount: 0,
    newIpos: [] as IpoItem[],
    existingCount: allCurrentIpos.length,
    filingsCount: 0,
    pendingCount: 0,
    pendingFilings: [] as PendingDartFiling[],
  };
  if (!dartApiKey) return { ...emptyResult, message: 'DART_API_KEY가 설정되지 않았습니다.' };

  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startDate = new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const dartUrl = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${encodeURIComponent(dartApiKey)}&bgn_de=${startDate}&end_de=${endDate}&pblntf_detail_ty=C001&page_no=1&page_count=50`;

  let data: DartListResponse;
  try {
    const response = await fetch(dartUrl, { next: { revalidate: 0 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return { ...emptyResult, message: `DART 서버 응답 오류: HTTP ${response.status}` };
    data = await response.json();
  } catch {
    return { ...emptyResult, message: 'DART 공시 목록을 가져오지 못했습니다. 기존 자료를 유지합니다.' };
  }
  if (data.status !== '000' || !Array.isArray(data.list)) {
    return { ...emptyResult, message: `DART 응답: ${data.message || '데이터 없음'}` };
  }

  const pendingFilings: PendingDartFiling[] = [];
  for (const filing of data.list) {
    if (pendingFilings.length >= limit) break;
    if (!/^\d{14}$/.test(filing.rcept_no) || !filing.corp_name) continue;
    const cleanName = filing.corp_name.replace(/(주식회사|\(주\)|\(유\)|주\s)/g, '').trim();
    const existing = allCurrentIpos.some((item) => item.name === cleanName
      || Boolean(filing.stock_code && item.code === filing.stock_code));
    const candidate = existing || filing.corp_cls === 'E' || filing.corp_cls === 'N'
      || cleanName.includes('스팩') || cleanName.includes('기업인수목적');
    if (!candidate) continue;
    pendingFilings.push({
      companyName: cleanName,
      reportName: filing.report_nm,
      receivedAt: filing.rcept_dt,
      receiptNo: filing.rcept_no,
      sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${filing.rcept_no}`,
      reason: '공시 원문에서 공모 해당 여부·일정·가격·주관사·수요예측을 확인해야 합니다.',
    });
  }

  return {
    ...emptyResult,
    filingsCount: data.list.length,
    pendingCount: pendingFilings.length,
    pendingFilings,
    message: pendingFilings.length > 0
      ? `DART 공시 ${pendingFilings.length}건을 검토 대상으로 찾았습니다. 원문 확인 전 종목 생성과 수치 갱신을 보류했습니다.`
      : '조회 범위에서 새 검토 대상을 찾지 못했습니다. 공시 전체 검증을 의미하지 않습니다.',
  };
}
