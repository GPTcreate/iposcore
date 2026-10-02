'use client';

import { useEffect } from 'react';

export default function VisitorBeacon() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin')) return;

    // 10초 이내 중복 호출만 가볍게 방지하고 실제 유입 방문을 정확하게 카운트
    const lastHit = sessionStorage.getItem('iposcore_last_visit_time');
    const now = Date.now();
    if (!lastHit || now - parseInt(lastHit, 10) > 10000) {
      sessionStorage.setItem('iposcore_last_visit_time', now.toString());
      fetch('/api/visitors', { method: 'POST', keepalive: true }).catch(() => {});
    }
  }, []);

  return null;
}
