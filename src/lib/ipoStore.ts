import { IpoItem } from '@/types/ipo';
import { MOCK_IPOS } from '@/data/mockIpo';
import customIposData from '@/data/customIpos.json';
import reviewSnapshotsData from '@/data/reviewSnapshots.json';
import type { ReviewArchive } from '@/types/reviews';
import { normalizeReviewArchive, getReviewSnapshot } from './reviewArchive';
import { isSameIpoIdentity } from './ipoDiscovery';

let runtimeReviewArchive: ReviewArchive = normalizeReviewArchive(reviewSnapshotsData);

export function setRuntimeReviewArchive(archive: ReviewArchive): void {
  runtimeReviewArchive = normalizeReviewArchive(archive);
}

// 런타임 메모리 저장소 (동적으로 추가된 종목 보관)
let runtimeCustomIpos: IpoItem[] = Array.isArray(customIposData) ? (customIposData as IpoItem[]) : [];

/**
 * 런타임 메모리에 커스텀 IPO 목록 갱신
 */
export function setRuntimeCustomIpos(ipos: IpoItem[]): void {
  runtimeCustomIpos = ipos;
}

/**
 * 현재 로드된 커스텀 IPO 목록 반환
 */
export function getStoredCustomIpos(): IpoItem[] {
  return runtimeCustomIpos;
}

/**
 * 기본 목 데이터(MOCK_IPOS)와 동적으로 등록된 신규 IPO를 통합 반환
 * (코드나 ID가 같으면 신규 등록 건이 우선)
 */
export function getAllIpos(): IpoItem[] {
  const accumulated: IpoItem[] = [];
  for (const item of [...MOCK_IPOS, ...runtimeCustomIpos]) {
    const index = accumulated.findIndex((existing) => isSameIpoIdentity(existing, item));
    if (index < 0) accumulated.push(item);
    else accumulated[index] = item;
  }

  return accumulated.map((item) => {
    const copy = structuredClone(item);
    const reviewCollection = getReviewSnapshot(runtimeReviewArchive, copy);
    return reviewCollection ? { ...copy, reviewCollection } : copy;
  });
}

/**
 * 이전 임시 종목코드 호환용 별칭 맵 (이전 북마크나 외부 링크 유입 시 정상 접근 보장)
 */
export const LEGACY_CODE_ALIASES: Record<string, string> = {
  '410250': 'hana-aerodynamics', // IBK 공식 공지의 종목코드는 271160. 이전 링크를 유지합니다.
  '284010': 'dts-tech', // 디티에스의 이전 미확인 코드. 공식 KRX 코드는 0015M0.
  '372100': 'intellivix', // 인텔리빅스 (과거 정정 전 코드)
  '377480': 'melcon',     // 멜콘
  '252540': 'jincostec',  // 진코스텍
  '381980': 'ck-solution',// 씨케이솔루션
  '471900': 'brills',     // 브릴스
  '461230': 'duksan-nepcores', // 덕산넵코어스
  '389200': 'hanul-semi', // 한울반도체
};

/**
 * ID 또는 종목코드, 한글 종목명으로 IPO 검색 (구코드 호환 지원)
 */
export function getIpoByIdOrCode(idOrCode: string): IpoItem | undefined {
  if (!idOrCode) return undefined;
  let decoded = idOrCode;
  try {
    decoded = decodeURIComponent(idOrCode).trim();
  } catch {
    decoded = idOrCode.trim();
  }

  const target = LEGACY_CODE_ALIASES[decoded] || LEGACY_CODE_ALIASES[idOrCode] || decoded;
  const all = getAllIpos();

  return all.find(
    (i) =>
      i.id.toLowerCase() === target.toLowerCase() ||
      i.code === target ||
      i.name === target ||
      i.name === decoded ||
      i.id.toLowerCase() === idOrCode.toLowerCase() ||
      i.code === idOrCode
  );
}
