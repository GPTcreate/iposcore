'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('iposcore_cookie_consent');
      if (!consent) {
        // 1초 뒤 부드럽게 노출
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iposcore_cookie_consent', 'accepted');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="쿠키 및 개인정보 이용 안내"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-gray-900/95 text-white backdrop-blur-md border-t border-gray-700 shadow-2xl transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-gray-300 leading-relaxed text-xs">
            본 사이트는 공모주 분석 리포트 제공, 서비스 품질 개선 및 맞춤형 광고(Google AdSense) 송출을 위해 브라우저 쿠키를 사용합니다.{' '}
            <Link href="/privacy" className="text-blue-400 underline hover:text-blue-300 font-semibold ml-1">
              개인정보처리방침 확인
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            동의 및 닫기
          </button>
          <button
            onClick={handleAccept}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
