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
 * ID 또는 종목코드로 IPO 검색
 */
export function getIpoByIdOrCode(idOrCode: string): IpoItem | undefined {
  const all = getAllIpos();
  return all.find((i) => i.code === idOrCode || i.id === idOrCode);
}
