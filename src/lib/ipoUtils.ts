import { IpoItem, IpoStatus } from '@/types/ipo';
import { MOCK_IPOS } from '@/data/mockIpo';

/**
 * 한국 시간(KST, UTC+9) 현재 Date 객체 반환
 */
export function getKstDate(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kstOffset = 9 * 60 * 60000;
  return new Date(utc + kstOffset);
}

/**
 * 한국 시간(KST) 기준 YYYY-MM-DD 날짜 문자열 반환
 */
export function getKstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 한국 시간(KST) 현재 시각(0~23) 반환
 */
export function getKstHour(date = new Date()): number {
  const str = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    hour12: false,
  }).format(date);
  return parseInt(str, 10);
}

/**
 * 날짜 및 공모 일정을 기반으로 실시간 IPO 상태 자동 계산
 * 
 * [자동 전이 룰]
 * 1. 공모 취소(isCancelled) 종목: 원본 상태 유지
 * 2. 오늘 >= 상장일(listingDate): 'LISTED' (상장 완료)
 * 3. 오늘 > 청약 마감일(subscriptionEnd) OR (오늘 === 청약 마감일 AND 16시 이후): 'WAITING_LISTING' (상장 대기)
 * 4. 청약 시작일 <= 오늘 <= 청약 마감일(16시 이전): 'SUBSCRIPTION' (청약 진행 중)
 * 5. 오늘 < 청약 시작일: 'UPCOMING' (청약 예정)
 */
export function getEffectiveIpoStatus(ipo: IpoItem, now = new Date()): IpoStatus {
  if (ipo.isCancelled) {
    return ipo.status;
  }

  const todayStr = getKstDateString(now);
  const kstHour = getKstHour(now);

  // 1. 이미 상장일이 도래했거나 지난 경우
  if (ipo.listingDate && todayStr >= ipo.listingDate) {
    return 'LISTED';
  }

  // 2. 청약 마감일이 지났거나, 청약 마감일 당일 16시(청약 마감)가 지난 경우
  const isAfterSubscriptionEnd =
    todayStr > ipo.subscriptionEnd ||
    (todayStr === ipo.subscriptionEnd && kstHour >= 16);

  if (isAfterSubscriptionEnd) {
    return 'WAITING_LISTING';
  }

  // 3. 청약 시작일 ~ 청약 마감일 16시 이전 사이
  if (todayStr >= ipo.subscriptionStart && todayStr <= ipo.subscriptionEnd) {
    return 'SUBSCRIPTION';
  }

  // 4. 청약 시작일 이전
  if (todayStr < ipo.subscriptionStart) {
    return 'UPCOMING';
  }

  return ipo.status;
}

/**
 * 개별 IPO 아이템에 실시간 동적 상태(status)를 반영하여 반환
 */
export function getEffectiveIpo(ipo: IpoItem, now = new Date()): IpoItem {
  const dynamicStatus = getEffectiveIpoStatus(ipo, now);
  if (dynamicStatus === ipo.status) {
    return ipo;
  }
  return {
    ...ipo,
    status: dynamicStatus,
  };
}

/**
 * 전체 IPO 목록에 실시간 동적 상태를 일괄 적용하여 반환
 */
export function getAllEffectiveIpos(now = new Date()): IpoItem[] {
  return MOCK_IPOS.map((ipo) => getEffectiveIpo(ipo, now));
}
