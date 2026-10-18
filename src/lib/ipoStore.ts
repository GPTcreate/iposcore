import { IpoItem } from '@/types/ipo';
import { MOCK_IPOS } from '@/data/mockIpo';
import customIposData from '@/data/customIpos.json';

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
  const map = new Map<string, IpoItem>();

  for (const item of MOCK_IPOS) {
    const key = item.code || item.id;
    map.set(key, item);
  }

  for (const item of runtimeCustomIpos) {
    const key = item.code || item.id;
    map.set(key, item);
  }

  return Array.from(map.values());
}

/**
 * 이전 임시 종목코드 호환용 별칭 맵 (이전 북마크나 외부 링크 유입 시 정상 접근 보장)
 */
export const LEGACY_CODE_ALIASES: Record<string, string> = {
  '377480': '179880', // 멜콘
  '252540': '250030', // 진코스텍
  '381980': '480370', // 씨케이솔루션
  '471900': '468670', // 브릴스
  '461230': '266690', // 덕산넵코어스
  '389200': '320000', // 한울반도체
};

/**
 * ID 또는 종목코드로 IPO 검색 (구코드 호환 지원)
 */
export function getIpoByIdOrCode(idOrCode: string): IpoItem | undefined {
  const target = LEGACY_CODE_ALIASES[idOrCode] || idOrCode;
  const all = getAllIpos();
  return all.find((i) => i.code === target || i.id === target || i.code === idOrCode || i.id === idOrCode);
}
