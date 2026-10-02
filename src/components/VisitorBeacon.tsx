'use client';

import { useEffect } from 'react';

export default function VisitorBeacon() {
  useEffect(() => {
    // 세션당 1회 또는 브라우저 방문 시 가볍게 비콘 전송 (admin 페이지 제외)
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      const hasVisitedSession = sessionStorage.getItem('iposcore_visit_logged');
      if (!hasVisitedSession) {
        sessionStorage.setItem('iposcore_visit_logged', '1');
        fetch('/api/visitors', { method: 'POST' }).catch(() => {});
      }
    }
  }, []);

  return null;
}
