import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { getAllGuides } from '@/data/guidesData';
import { BookOpen, Clock, Tag, ChevronRight, CheckCircle2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: '공모주 실전 투자 가이드 & 분석 칼럼 라이브러리',
  description:
    '초보자를 위한 계좌 개설법부터 기관 수요예측·의무보유확약 분석, 비례배정 5사6입 법칙, 마이너스통장 대출이자 계산까지 공모주 투자의 모든 노하우를 무료로 확인하세요.',
  keywords: [
    '공모주 가이드',
    '공모주 투자 방법',
    '수요예측 분석법',
    '의무보유확약',
    '비례배정 5사6입',
    '스팩주 투자',
    '공모주 상장일 매도',
  ],
  alternates: {
    canonical: 'https://iposcore.kr/guides',
  },
  openGraph: {
    title: '공모주 실전 투자 가이드 & 분석 칼럼 라이브러리 | IPOScore',
    description:
      '초보자 가이드부터 기관 경쟁률·확약 분석, 비례 5사6입, 대출이자 계산까지 공모주 투자의 모든 노하우 총정리',
    url: 'https://iposcore.kr/guides',
    type: 'website',
    images: ['https://iposcore.kr/og-image.png'],
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();

  const guidesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '공모주 실전 투자 가이드 & 분석 칼럼 라이브러리 | IPOScore',
    description: '공모주 청약의 기초부터 고급 전략까지 체계적으로 정리한 실전 투자 지식 센터',
    url: 'https://iposcore.kr/guides',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: guides.map((guide, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://iposcore.kr/guides/${guide.slug}`,
        name: guide.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesJsonLd) }}
      />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* 상단 타이틀 배너 */}
        <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm border border-blue-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/60 text-blue-200 text-xs font-bold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>IPOScore 투자 아카데미 & 지식 센터</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            공모주 실전 투자 가이드 & 분석 칼럼
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-2 max-w-2xl leading-relaxed">
            공시 용어가 어렵거나 청약 전략이 막막하셨나요? 계좌 개설부터 DART 전자공시 팩트체크, 비례 5사6입 최적 배분, 상장일 최고가 매도 타이밍까지 검증된 실전 노하우를 엄선하여 제공합니다.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-700/50 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% 무료 공모주 가이드</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
              <span>실전 데이터 기반 분석</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>리스크 팩트체크 중심</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>총 {guides.length}편의 심층 칼럼</span>
            </div>
          </div>
        </div>

        {/* 아티클 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group p-6 rounded-xl bg-white border border-gray-300 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>읽는 시간 {guide.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {guide.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  {guide.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {guide.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 text-gray-500">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
                <span className="font-bold text-blue-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>자세히 읽기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 하단 질문 해결 섹션 */}
        <div className="p-6 sm:p-7 rounded-xl bg-white border border-gray-300 shadow-2xs text-xs sm:text-sm space-y-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <span>원하는 공모주 분석 정보를 찾지 못하셨나요?</span>
          </h3>
          <p className="text-gray-600 leading-relaxed">
            IPOScore는 매주 업데이트되는 신규 공시 및 시장 트렌드에 발맞추어 최신 투자 가이드를 지속적으로 연재하고 있습니다. 궁금한 공모주 용어나 추가 분석을 원하시는 주제가 있으시면 언제든지 <a href="mailto:hanmanju88@gmail.com" className="text-blue-700 underline font-semibold">hanmanju88@gmail.com</a>으로 의견을 남겨주세요.
          </p>
        </div>
      </main>
    </div>
  );
}
