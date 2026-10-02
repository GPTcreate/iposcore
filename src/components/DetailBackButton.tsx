'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DetailBackButton() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      const savedTab = typeof window !== 'undefined' ? sessionStorage.getItem('iposcore_active_tab') : null;
      router.push(savedTab ? `/?tab=${savedTab}` : '/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-700 transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>← 전체 청약 일정 목록으로 돌아가기</span>
    </button>
  );
}
