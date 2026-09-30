'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Calculator, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 서비스 로고 - 증권 뉴스/포털 느낌의 단정하고 직관적인 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm">
            공
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                공모주 알리미 <span className="text-blue-700 font-extrabold text-base">리포트</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              전문가 분석 요약 & 청약 일정 안내
            </p>
          </div>
        </Link>

        {/* 네비게이션 - 큰 글씨와 읽기 편한 라벨 */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>청약 일정</span>
          </Link>
          <Link
            href="/calculator"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition-colors"
          >
            <Calculator className="w-4 h-4 text-gray-500" />
            <span>비례 계산기</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title="관리자 설정"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">관리자</span>
          </Link>
          <a
            href="#newsletter-section"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>청약 알림 신청</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
