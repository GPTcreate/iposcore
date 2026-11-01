'use client';

import { useEffect } from 'react';

const DAY_MS = 86400000;
const KST_OFFSET_MS = 9 * 3600000;

/** Refresh an open page at the KST date boundary, including after tab suspension. */
export function useKstDayRefresh(refresh: () => void, evaluatedAt?: number): void {
  useEffect(() => {
    const dayNumber = () => Math.floor((Date.now() + KST_OFFSET_MS) / DAY_MS);
    let observedDay = Math.floor(((evaluatedAt ?? Date.now()) + KST_OFFSET_MS) / DAY_MS);
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      const currentDay = dayNumber();
      if (currentDay !== observedDay) {
        observedDay = currentDay;
        refresh();
      }
    };
    const schedule = () => {
      const delay = DAY_MS - ((Date.now() + KST_OFFSET_MS) % DAY_MS) + 50;
      timer = setTimeout(() => { check(); schedule(); }, delay);
    };
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    schedule();
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);
    check();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, evaluatedAt]);
}
