import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { getAllGuides } from '@/data/guidesData';
import { BookOpen, Clock, Tag, ChevronRight, CheckCircle2, Calculator, ShieldAlert, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: '공모주 청약 가이드: 공시 읽기·배정 계산·자금 관리',
  description:
    '공모주 신청부터 배정·환불, DART 공시 읽기, 대출이자와 상장일 주문까지. 공식 출처와 가상 계산 사례를 함께 제공하는 IPOScore 청약 가이드입니다.',
  keywords: [
    '공모주 가이드',
    '공모주 투자 방법',
    '수요예측 분석법',
    '의무보유확약',
    '비례배정 계산',
    '스팩주 투자',
    '공모주 상장일 매도',
  ],
  alternates: {
    canonical: 'https://www.iposcore.kr/guides',
  },
  openGraph: {
    title: '공모주 청약 가이드: 공시 읽기·배정 계산·자금 관리 | IPOScore',
    description:
      '공식 출처와 계산 사례로 청약 절차, 배정 추정의 한계와 투자 위험을 확인합니다.',
    url: 'https://www.iposcore.kr/guides',
    type: 'website',
    images: ['https://www.iposcore.kr/og-image.png'],
  },
};

export default function GuidesPage() {
  const guides = getAllGuides();

  const guidesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '공모주 청약 가이드 | IPOScore',
    description: '공식 출처와 계산 사례를 바탕으로 청약 절차와 공시 확인 방법을 설명합니다.',
    url: 'https://www.iposcore.kr/guides',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: guides.map((guide, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://www.iposcore.kr/guides/${guide.slug}`,
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
            <span>IPOScore 청약 가이드</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            청약 전에 이해하고, 숫자는 직접 확인하세요
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-2 max-w-2xl leading-relaxed">
            신청·배정·환불의 차이부터 공시를 읽는 순서와 비용 계산까지, 실제로 확인할 항목을 정리했습니다. 각 글의 공식 출처와 가상 계산 사례를 함께 읽어보세요.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-700/50 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>글별 공식 출처 제공</span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400 shrink-0" />
              <span>계산 과정이 있는 예시</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>조건과 한계 함께 확인</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>주제별 {guides.length}편의 가이드</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-300 bg-white p-5 text-sm text-gray-700 space-y-3">
          <h2 className="font-bold text-gray-900">어디서 시작하면 될까요?</h2>
          <p className="leading-relaxed">
            처음 청약한다면 <Link href="/guides/ipo-beginner-complete-guide" className="font-semibold text-blue-700 underline underline-offset-2">신청부터 환불까지</Link>를,
            배정이 궁금하다면 <Link href="/guides/proportional-allocation-and-5-down-6-up-strategy" className="font-semibold text-blue-700 underline underline-offset-2">균등·비례 계산법</Link>을 먼저 읽어보세요.
            신청할 기업을 살펴볼 때는 <Link href="/guides/dart-prospectus-reading-top-3-risk-factors" className="font-semibold text-blue-700 underline underline-offset-2">DART 공시 확인표</Link>를 이용할 수 있습니다.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">작성: IPOScore 편집 · 최근 개정 2026-10-25. 예시의 기업·금리·배정수량은 별도 명시가 없으면 설명을 위한 가정입니다.</p>
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
                <div className="flex flex-wrap gap-1.5 min-w-0">
                  {guide.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 text-gray-500">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
                <span className="font-bold text-blue-700 inline-flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
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
            내용의 오류나 설명이 부족한 부분은 해당 가이드 제목과 함께 <a href="mailto:hanmanju88@gmail.com" className="text-blue-700 underline font-semibold break-all">hanmanju88@gmail.com</a>으로 알려주세요.
            작성 방식과 수정 기준은 <Link href="/about" className="text-blue-700 underline font-semibold">서비스 소개</Link>에서 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
