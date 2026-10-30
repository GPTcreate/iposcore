import { IpoItem, IpoStatus } from '@/types/ipo';
import { getAllIpos, getIpoByIdOrCode } from './ipoStore';
import { calculateIpoScore } from './scoring';
import { getCollectedReviews, summarizeReviews } from './reviewEvidence';

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

  // Discovery cards stay available while their actual subscription dates are unknown.
  const validDay = (value: string | undefined) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);

  // 1. 이미 상장일이 도래했거나 지난 경우
  if (validDay(ipo.listingDate) && !ipo.scheduleVerification?.conflicts.includes('listingDate') && todayStr >= ipo.listingDate!) {
    return 'LISTED';
  }

  if (!validDay(ipo.subscriptionStart) || !validDay(ipo.subscriptionEnd)) return ipo.status;

  // 2. 청약 마감일이 지났거나, 청약 마감일 당일 16시(청약 마감)가 지난 경우
  const isAfterSubscriptionEnd =
    todayStr > ipo.subscriptionEnd ||
    (todayStr === ipo.subscriptionEnd && kstHour >= 16);

  if (isAfterSubscriptionEnd) {
    return 'WAITING_LISTING';
  }

  // 3. 청약 시작일 ~ 청약 마감일 16시 이전 사이 (단, 토/일 주말은 금융시장 휴장이므로 청약 진행 제외)
  const dayOfWeek = getKstDate(now).getDay(); // 0: 일, 6: 토
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (!isWeekend && todayStr >= ipo.subscriptionStart && todayStr <= ipo.subscriptionEnd) {
    // 자본시장법상 공모가 없이 일반 청약은 불가능하므로, 확정 공모가가 없으면 청약 진행 중으로 전이 불가
    if (!ipo.confirmedPrice || ipo.confirmedPrice <= 0) return 'UPCOMING';
    return 'SUBSCRIPTION';
  }

  // 4. 청약 시작일 이전이거나 주말 대기 중인 경우
  if (todayStr <= ipo.subscriptionStart || (isWeekend && todayStr <= ipo.subscriptionEnd)) {
    return 'UPCOMING';
  }

  return ipo.status;
}

/**
 * 개별 IPO 아이템에 실시간 동적 상태(status)를 반영하여 반환
 */
export function getEffectiveIpo(ipo: IpoItem, now = new Date()): IpoItem {
  const scoring = calculateIpoScore(ipo);
  const reviews = summarizeReviews(ipo, now);
  return {
    ...ipo,
    status: getEffectiveIpoStatus(ipo, now),
    aiScore: scoring.score,
    scoreGrade: scoring.scoreGrade,
    expertReviews: getCollectedReviews(ipo, now),
    sentimentConsensus: { positiveRatio: reviews.positiveRatio, neutralRatio: reviews.neutralRatio, cautionRatio: reviews.cautionRatio },
  };
}

/**
 * 전체 IPO 목록에 실시간 동적 상태를 일괄 적용하여 반환
 */
export function getAllEffectiveIpos(now = new Date()): IpoItem[] {
  return getAllIpos().map((ipo) => getEffectiveIpo(ipo, now));
}

/**
 * ID 또는 코드로 IPO를 찾아 실시간 동적 상태를 적용하여 반환
 */
export function getEffectiveIpoByIdOrCode(idOrCode: string, now = new Date()): IpoItem | undefined {
  const ipo = getIpoByIdOrCode(idOrCode);
  return ipo ? getEffectiveIpo(ipo, now) : undefined;
}
