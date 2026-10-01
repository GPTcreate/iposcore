'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import IpoCard from '@/components/IpoCard';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import NewsletterBanner from '@/components/NewsletterBanner';
import { MOCK_IPOS } from '@/data/mockIpo';
import { IpoStatus } from '@/types/ipo';
import { ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Home() {
  const [filter, setFilter] = useState<'ALL' | IpoStatus>('SUBSCRIPTION');
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const filteredIpos = MOCK_IPOS.filter((ipo) => {
    if (filter === 'ALL') return true;
    return ipo.status === filter;
  });

  // 필터 변경 시 표시 개수 리셋
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  const displayedIpos = filteredIpos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredIpos.length;
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // 스크롤 감지 자동 더보기 (무한 스크롤 & 렉 방지)
  React.useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIpos.length));
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, filteredIpos.length]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 상단 안내 헤더 */}
        <div className="bg-white rounded-xl border border-gray-300 p-5 sm:p-7 shadow-2xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2 border border-blue-200">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>실시간 공모주 청약 안내</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                공모주 청약 일정 & 전문가 분석 요약
              </h1>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                전자공시(DART) 기관 수요예측 결과와 공모주 전문 분석가들의 의견을 종합 분석하여 핵심만 요약해 드립니다.
              </p>
            </div>

            <div className="text-left md:text-right shrink-0">
              <span className="text-xs text-gray-500 block">이번 주 청약 가능 종목</span>
              <span className="text-2xl font-black text-blue-700">
                총 {MOCK_IPOS.filter(i => i.status === 'SUBSCRIPTION').length}건 진행 중
              </span>
            </div>
          </div>
        </div>

        {/* 필터 탭 (모바일 터치 최적화 가로 스크롤 & 지난 공모주 탭 추가) */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-200/90 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none touch-pan-x">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
              }`}
            >
              전체 ({MOCK_IPOS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('SUBSCRIPTION')}
              className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'SUBSCRIPTION'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
              }`}
            >
              청약 진행 중 ({MOCK_IPOS.filter(i => i.status === 'SUBSCRIPTION').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UPCOMING')}
              className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'UPCOMING'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
              }`}
            >
              청약 예정 ({MOCK_IPOS.filter(i => i.status === 'UPCOMING').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('WAITING_LISTING')}
              className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'WAITING_LISTING'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
              }`}
            >
              상장 대기 ({MOCK_IPOS.filter(i => i.status === 'WAITING_LISTING').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('LISTED')}
              className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                filter === 'LISTED'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-300/60'
              }`}
            >
              지난 공모주 ({MOCK_IPOS.filter(i => i.status === 'LISTED').length})
            </button>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span>
              현재 보기: <strong className="text-blue-800 font-bold">{
                filter === 'ALL' ? '전체 일정' :
                filter === 'SUBSCRIPTION' ? '청약 진행 중' :
                filter === 'UPCOMING' ? '청약 예정' :
                filter === 'WAITING_LISTING' ? '상장 대기' : '지난 공모주 (상장 완료)'
              }</strong> ({filteredIpos.length}개 종목)
            </span>
            <span className="hidden sm:inline">* 매 영업일 최신 공시 기준 업데이트</span>
          </div>
        </div>

        {/* 공모주 카드 목록 (페이징 & 점진적 로딩으로 렉 방지) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedIpos.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} />
          ))}
        </div>

        {/* 더보기 및 스크롤 로딩 트리거 (렉 방지) */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-6 text-center">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIpos.length))}
              className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              공모주 더보기 ({filteredIpos.length - visibleCount}개 남음) ↓
            </button>
          </div>
        )}

        {/* 광고 영역 - 페이지당 딱 1개만 단정하게 배치 */}
        <GoogleAdSlot label="스폰서 안내" className="my-8" />

        {/* 평가 기준 안내 섹션 (신뢰도 확보 및 애드센스 심사용) */}
        <section className="my-8 p-6 rounded-xl border border-gray-300 bg-white shadow-2xs">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            공모주 투자 매력도 점수 산출 기준 안내
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            단순 의견 취합이 아닌 금융감독원 공시 정량 지표(70%)와 전문가 여론 분석(30%)을 종합하여 100점 만점으로 표기합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>1. 기관 수요예측 결과 (40점)</span>
              </span>
              <p className="text-gray-600">
                기관 투자자 경쟁률 및 공모가 밴드 상단 초과 여부를 백분위로 객관 반영합니다.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>2. 의무확약 및 유통물량 (30점)</span>
              </span>
              <p className="text-gray-600">
                상장 당일 쏟아질 수 있는 매도 물량과 의무보유확약 비율을 바탕으로 안전성을 평가합니다.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>3. 전문가 여론 컨센서스 (30점)</span>
              </span>
              <p className="text-gray-600">
                공모주 전문 유튜브 및 블로그 분석가들의 긍정/신중 의견 비율을 종합 가산합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 주간 리포트 이메일 알림 신청 */}
        <NewsletterBanner />

        {/* 하단 투자 유의사항 및 법적 면책 조항 */}
        <footer className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center gap-1 font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>투자 유의사항</span>
          </div>
          <p className="leading-relaxed">
            본 사이트에서 제공하는 모든 수치 및 요약 정보는 공시 자료와 공개된 전문가 의견을 종합한 단순 참고용 자료입니다. 종목 추천이나 매수 권유가 아니며, 청약에 따른 최종 투자 책임은 투자자 본인에게 있습니다.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-gray-600">
            <a href="/about" className="hover:text-blue-700 underline">서비스 소개</a>
            <a href="/privacy" className="hover:text-blue-700 underline">개인정보처리방침</a>
            <a href="/terms" className="hover:text-blue-700 underline">이용약관</a>
            <a href="mailto:hanmanju88@gmail.com" className="hover:text-blue-700 underline">문의: hanmanju88@gmail.com</a>
          </div>
          <p className="text-[11px] text-gray-400 pt-1">
            © 2026 공모주 알리미 리포트. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
