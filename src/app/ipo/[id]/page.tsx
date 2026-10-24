import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ScoreBadge from '@/components/ScoreBadge';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import IpoCalculator from '@/components/IpoCalculator';
import NewsletterBanner from '@/components/NewsletterBanner';
import ShareButtons from '@/components/ShareButtons';
import DetailBackButton from '@/components/DetailBackButton';
import { getEffectiveIpoByIdOrCode, getAllEffectiveIpos } from '@/lib/ipoUtils';
import { LEGACY_CODE_ALIASES } from '@/lib/ipoStore';
import {
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Video,
  PieChart,
  ShieldAlert,
  BookOpen,
  TrendingUp,
  HelpCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ipo = getEffectiveIpoByIdOrCode(id);
  if (!ipo) {
    return {
      title: '공모주 정보를 찾을 수 없습니다 | 공모주 알리미',
    };
  }

  const underwriterNames = ipo.underwriters.map((u) => u.name).join(', ');
  const priceText =
    ipo.confirmedPrice > 0
      ? `${ipo.confirmedPrice.toLocaleString()}원 (확정)`
      : `${ipo.priceBandMin.toLocaleString()}~${ipo.priceBandMax.toLocaleString()}원 (희망)`;

  const title = `${ipo.name} (${ipo.code}) 공모주 청약 분석 리포트 - 공모가·경쟁률·AI점수`;
  const description = `${ipo.name} (${ipo.code}, ${ipo.market}) 공모주 청약 일정(${ipo.subscriptionStart}~${ipo.subscriptionEnd}), 공모가 ${priceText}, 주관사 ${underwriterNames}. 기관 수요예측 경쟁률 ${ipo.institutionalCompetitionRate}:1 및 전문가 AI 요약 분석.`;

  return {
    title,
    description,
    keywords: [
      ipo.name,
      ipo.code,
      `${ipo.name} 공모주`,
      `${ipo.code} 공모주`,
      `${ipo.name} 청약`,
      `${ipo.name} 상장일`,
      `${ipo.name} 수요예측`,
      `${ipo.name} 공모가`,
      ...ipo.underwriters.map((u) => u.name),
    ],
    alternates: {
      canonical: `https://iposcore.kr/ipo/${ipo.id}`,
    },
    openGraph: {
      title: `${ipo.name} (${ipo.code}) 공모주 청약 분석 리포트 | IPOScore`,
      description,
      url: `https://iposcore.kr/ipo/${ipo.id}`,
      type: 'article',
      images: [
        {
          url: 'https://iposcore.kr/og-image.png',
          width: 1200,
          height: 630,
          alt: `${ipo.name} 공모주 청약 분석 리포트`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ipo.name} (${ipo.code}) 공모주 청약 분석 리포트 | IPOScore`,
      description,
      images: ['https://iposcore.kr/og-image.png'],
    },
  };
}

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  for (const ipo of getAllEffectiveIpos()) {
    // 1. 불변 영문 슬러그 우선 표준 라우팅 (예: /ipo/intellivix, /ipo/melcon)
    params.push({ id: ipo.id });
    // 2. 증권코드(6자리 숫자) 호환성 유지 (예: /ipo/420610, /ipo/179880)
    if (ipo.code && ipo.code !== ipo.id) {
      params.push({ id: ipo.code });
    }
  }
  // 3. 기존 레거시 코드 별칭(Alias) 사전 정적 생성 (예: /ipo/372100, /ipo/377480)
  for (const alias of Object.keys(LEGACY_CODE_ALIASES)) {
    params.push({ id: alias });
  }
  return params;
}

export default async function IpoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ipo = getEffectiveIpoByIdOrCode(id);

  if (!ipo) {
    notFound();
  }

  const ipoJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${ipo.name} (${ipo.code}) 공모주 청약 분석 리포트 - 공모가·수요예측·AI점수`,
      description: `${ipo.name} (${ipo.code}) 공모주 청약 일정, 기관 경쟁률 ${ipo.institutionalCompetitionRate}:1, 공모가 ${ipo.confirmedPrice > 0 ? ipo.confirmedPrice.toLocaleString() + '원' : '미정'}, 주관사 ${ipo.underwriters.map(u => u.name).join(', ')}.`,
      datePublished: new Date(ipo.subscriptionStart).toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'IPOScore',
        url: 'https://iposcore.kr',
      },
      publisher: {
        '@type': 'Organization',
        name: 'IPOScore',
        logo: {
          '@type': 'ImageObject',
          url: 'https://iposcore.kr/og-image.png',
        },
      },
      image: 'https://iposcore.kr/og-image.png',
      mainEntityOfPage: `https://iposcore.kr/ipo/${ipo.id}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: `${ipo.name} 공모주`,
      description: `${ipo.name} (${ipo.code}, ${ipo.market}) 신규 상장 공모주`,
      offers: {
        '@type': 'Offer',
        price: ipo.confirmedPrice || ipo.priceBandMax,
        priceCurrency: 'KRW',
        priceValidUntil: ipo.subscriptionEnd,
        availability:
          ipo.status === 'SUBSCRIPTION'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: 'https://iposcore.kr',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '공모주 청약 일정',
          item: 'https://iposcore.kr',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${ipo.name} (${ipo.code})`,
          item: `https://iposcore.kr/ipo/${ipo.id}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ipoJsonLd) }}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 뒤로 가기 링크 & 공유 버튼 */}
        <div className="flex items-center justify-between">
          <DetailBackButton />
          <ShareButtons stockName={ipo.name} aiScore={ipo.aiScore} />
        </div>

        {/* 상단 종목 타이틀 카드 */}
        <div className="p-6 sm:p-7 rounded-xl bg-white border border-gray-300 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  ipo.isCancelled
                    ? 'bg-rose-700 text-white'
                    : ipo.status === 'WAITING_LISTING'
                    ? 'bg-gray-800 text-white'
                    : ipo.status === 'SUBSCRIPTION'
                    ? 'bg-red-600 text-white'
                    : ipo.status === 'LISTED'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-blue-700 text-white'
                }`}>
                  {ipo.isCancelled
                    ? '공모 취소'
                    : ipo.status === 'WAITING_LISTING'
                    ? '상장 대기'
                    : ipo.status === 'SUBSCRIPTION'
                    ? '청약 진행 중'
                    : ipo.status === 'LISTED'
                    ? '상장 완료'
                    : '청약 예정'}
                </span>
                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                  {ipo.market}
                </span>
                <span className="text-xs font-semibold text-gray-500">종목코드 {ipo.code}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {ipo.name} <span className="text-blue-700 font-bold">공모주 청약 분석 리포트</span>
              </h1>
              <p className="text-sm font-semibold text-gray-700 max-w-2xl leading-relaxed">
                {ipo.aiSummary.headline}
              </p>
            </div>

            {/* 종합 점수 배지 */}
            <div className="w-full md:w-auto shrink-0">
              <ScoreBadge
                score={ipo.aiScore}
                grade={ipo.scoreGrade}
                size="lg"
                isPendingForecast={ipo.status === 'UPCOMING'}
              />
            </div>
          </div>

          {/* 주요 일정 요약 바 (상장 완료 종목은 실전 시초가·종가 수익률로 즉시 대체 표시) */}
          {!ipo.isCancelled && ipo.status === 'LISTED' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">확정 공모가</span>
                <span className="font-black text-emerald-700 text-sm">
                  {ipo.confirmedPrice.toLocaleString()}원
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">상장일</span>
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  {ipo.listingDate || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">상장일 시초가</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-gray-900 text-sm">
                    {ipo.openingPrice ? `${ipo.openingPrice.toLocaleString()}원` : '상장일 집계 중'}
                  </span>
                  {ipo.openingReturnRate !== undefined && (
                    <span
                      className={`text-[11px] font-black px-1.5 py-0.5 rounded border ${
                        ipo.openingReturnRate > 0
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : ipo.openingReturnRate < 0
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-gray-700 bg-gray-100 border-gray-200'
                      }`}
                    >
                      {ipo.openingReturnRate > 0 ? `+${ipo.openingReturnRate.toFixed(1)}%` : `${ipo.openingReturnRate.toFixed(1)}%`}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">상장일 종가</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-gray-900 text-sm">
                    {ipo.closingPrice ? `${ipo.closingPrice.toLocaleString()}원` : '장 마감 후 집계'}
                  </span>
                  {ipo.closingReturnRate !== undefined && (
                    <span
                      className={`text-[11px] font-black px-1.5 py-0.5 rounded border ${
                        ipo.closingReturnRate > 0
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : ipo.closingReturnRate < 0
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-gray-700 bg-gray-100 border-gray-200'
                      }`}
                    >
                      {ipo.closingReturnRate > 0 ? `+${ipo.closingReturnRate.toFixed(1)}%` : `${ipo.closingReturnRate.toFixed(1)}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">청약 기간</span>
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  {ipo.subscriptionStart} ~ {ipo.subscriptionEnd.slice(5)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">환불일</span>
                <span className="font-bold text-gray-900 text-sm">
                  {ipo.refundDate}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">상장일</span>
                <span className={`font-bold text-sm ${ipo.isCancelled ? 'text-rose-700' : 'text-blue-700'}`}>
                  {ipo.isCancelled ? '공모 철회 (취소)' : ipo.listingDate || '추후 공시 예정'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-medium">
                  {ipo.confirmedPrice > 0 ? '확정 공모가' : '희망 공모가 (미확정)'}
                </span>
                <span className="font-black text-gray-900 text-sm">
                  {ipo.isCancelled ? (
                    <span className="text-rose-700 font-bold">공모 취소</span>
                  ) : ipo.confirmedPrice > 0 ? (
                    <span className="text-emerald-700 font-black">{ipo.confirmedPrice.toLocaleString()}원</span>
                  ) : (
                    <span className="text-amber-700 font-bold text-xs">
                      {ipo.priceBandMin.toLocaleString()} ~ {ipo.priceBandMax.toLocaleString()}원 (수요예측 전)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 공모 취소/철회 종목 사유 안내 배너 */}
        {ipo.isCancelled && (
          <div className="p-5 rounded-xl bg-rose-50 border border-rose-300 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-600 text-white">공모 취소</span>
              <span className="text-xs font-bold text-rose-700">증권신고서 철회 완료</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">공모 추진 철회 및 일정 취소 안내</h3>
            <p className="text-xs text-gray-700 mt-1 leading-relaxed">
              {ipo.cancelReason || '기관 수요예측 결과 및 시장 피드백을 감안하여 상장 일정을 철회하였습니다. 일반 투자자 청약은 진행되지 않았으며, 추후 공모 구조 개편 후 재도전할 예정입니다.'}
            </p>
          </div>
        )}

        {/* 상장 완료 종목 실전 수익률 상세 카드 (시초가 & 종가 손익 분석) */}
        {!ipo.isCancelled && ipo.status === 'LISTED' && (ipo.openingReturnRate !== undefined || ipo.closingReturnRate !== undefined) && (() => {
          const openingProfit = ipo.openingPrice && ipo.confirmedPrice ? ipo.openingPrice - ipo.confirmedPrice : null;
          const closingProfit = ipo.closingPrice && ipo.confirmedPrice ? ipo.closingPrice - ipo.confirmedPrice : null;
          const openToCloseDiff = ipo.openingPrice && ipo.closingPrice ? ipo.closingPrice - ipo.openingPrice : null;
          const openToCloseRate = ipo.openingPrice && ipo.closingPrice ? ((ipo.closingPrice - ipo.openingPrice) / ipo.openingPrice) * 100 : null;

          return (
            <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-blue-50/60 border border-emerald-300 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-700 text-white shadow-xs">
                    상장일 실전 수익률 결과
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    확정 공모가 <strong>{ipo.confirmedPrice.toLocaleString()}원</strong> 대비 청약 실현 수익률
                  </span>
                </div>
                {ipo.listingDate && (
                  <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>상장일: <strong>{ipo.listingDate}</strong></span>
                  </div>
                )}
              </div>

              {/* 시초가 & 종가 2단 핵심 성과 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. 상장일 시초가 */}
                <div className="p-4 rounded-xl bg-white/95 border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>상장일 시초가 (09:00 체결가)</span>
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">공모가 대비</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-gray-900">
                      {ipo.openingPrice ? `${ipo.openingPrice.toLocaleString()}원` : '-'}
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-black px-2.5 py-0.5 rounded-lg border ${
                        ipo.openingReturnRate && ipo.openingReturnRate > 0
                          ? 'text-rose-600 bg-rose-50 border-rose-200'
                          : ipo.openingReturnRate && ipo.openingReturnRate < 0
                          ? 'text-blue-600 bg-blue-50 border-blue-200'
                          : 'text-gray-900 bg-gray-50 border-gray-200'
                      }`}
                    >
                      {ipo.openingReturnRate !== undefined
                        ? (ipo.openingReturnRate > 0 ? `+${ipo.openingReturnRate.toFixed(1)}%` : `${ipo.openingReturnRate.toFixed(1)}%`)
                        : '-'}
                    </span>
                  </div>
                  {openingProfit !== null && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">1주당 실현 손익</span>
                      <span
                        className={`font-black ${
                          openingProfit > 0 ? 'text-rose-600' : openingProfit < 0 ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {openingProfit > 0 ? `+${openingProfit.toLocaleString()}원` : `${openingProfit.toLocaleString()}원`} / 주
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. 상장일 종가 */}
                <div className="p-4 rounded-xl bg-white/95 border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>상장일 종가 (15:30 마감가)</span>
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">공모가 대비</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-gray-900">
                      {ipo.closingPrice ? `${ipo.closingPrice.toLocaleString()}원` : '-'}
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-black px-2.5 py-0.5 rounded-lg border ${
                        ipo.closingReturnRate && ipo.closingReturnRate > 0
                          ? 'text-rose-600 bg-rose-50 border-rose-200'
                          : ipo.closingReturnRate && ipo.closingReturnRate < 0
                          ? 'text-blue-600 bg-blue-50 border-blue-200'
                          : 'text-gray-900 bg-gray-50 border-gray-200'
                      }`}
                    >
                      {ipo.closingReturnRate !== undefined
                        ? (ipo.closingReturnRate > 0 ? `+${ipo.closingReturnRate.toFixed(1)}%` : `${ipo.closingReturnRate.toFixed(1)}%`)
                        : '-'}
                    </span>
                  </div>
                  {closingProfit !== null && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">1주당 실현 손익</span>
                      <span
                        className={`font-black ${
                          closingProfit > 0 ? 'text-rose-600' : closingProfit < 0 ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {closingProfit > 0 ? `+${closingProfit.toLocaleString()}원` : `${closingProfit.toLocaleString()}원`} / 주
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 인사이트: 장중 시초가 대비 종가 등락 비교 & 매도 전략 요약 */}
              {openToCloseDiff !== null && openToCloseRate !== null && (
                <div className="p-3 rounded-lg bg-white/90 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-gray-800 font-medium">
                      {openToCloseDiff > 0 ? (
                        <>
                          시초가 대비 장중 <strong className="text-rose-600 font-bold">+{openToCloseRate.toFixed(1)}% (+{openToCloseDiff.toLocaleString()}원)</strong> 추가 상승 마감하여 종가 매도가 더 유리했습니다.
                        </>
                      ) : openToCloseDiff < 0 ? (
                        <>
                          시초가 대비 장중 <strong className="text-blue-600 font-bold">{openToCloseRate.toFixed(1)}% ({openToCloseDiff.toLocaleString()}원)</strong> 하락하여 시초가 즉시 매도가 더 유리했습니다.
                        </>
                      ) : (
                        <>시초가와 동일한 가격으로 첫날 장을 마감했습니다.</>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0">
                    * 단순 수익률 기준 (증권사 거래수수료 및 제세금 별도)
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* 1. 핵심 요약 3가지 & 호재 vs 리스크 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-xl bg-white border border-gray-300 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
              <span>전문가 의견 및 공시 핵심 체크포인트 3가지</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-800">
              {ipo.aiSummary.bulletPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{point}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* 주요 호재 */}
              <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-xs">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>주요 호재 요인</span>
                </span>
                <ul className="space-y-1.5 text-gray-700">
                  {ipo.aiSummary.positivePoints.map((p, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">• {p}</li>
                  ))}
                </ul>
              </div>

              {/* 리스크 */}
              <div className="p-3.5 rounded-lg bg-rose-50/80 border border-rose-300 text-xs">
                <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>유의해야 할 리스크</span>
                </span>
                <ul className="space-y-1.5 text-gray-700">
                  {ipo.aiSummary.riskPoints.map((r, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 전문가 여론 컨센서스 비율 */}
          <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1 border-b border-gray-200 pb-2">
                <PieChart className="w-4 h-4 text-blue-700" />
                <span>전문가 여론 비율</span>
              </h2>
              <p className="text-xs text-gray-500 mb-4 mt-2">
                공모주 전문 유튜브 및 블로그 분석 종합
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700">적극 청약 추천</span>
                    <span className="text-emerald-700">{ipo.sentimentConsensus.positiveRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${ipo.sentimentConsensus.positiveRatio}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-blue-700">균등만 추천 (신중)</span>
                    <span className="text-blue-700">{ipo.sentimentConsensus.neutralRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${ipo.sentimentConsensus.neutralRatio}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-700">청약 패스 / 유의</span>
                    <span className="text-rose-700">{ipo.sentimentConsensus.cautionRatio}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full"
                      style={{ width: `${ipo.sentimentConsensus.cautionRatio}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-200 text-[11px] text-gray-500 leading-relaxed">
              * 전문가들의 공개된 리뷰를 요약 분석한 통계 자료입니다.
            </div>
          </div>
        </div>

        {/* 2. DART 전자공시 정량 핵심 지표 */}
        <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
            <Building className="w-4 h-4 text-blue-700" />
            <span>전자공시(DART) 주요 정량 지표</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">
                기관 수요예측 경쟁률 {ipo.confirmedPrice === 0 && <span className="text-amber-600 font-bold">(미확정)</span>}
              </span>
              <span className="text-base font-black text-gray-900">
                {ipo.institutionalCompetitionRate > 0 ? (
                  `${ipo.institutionalCompetitionRate.toLocaleString()} : 1`
                ) : (
                  <span className="text-xs text-amber-700 font-bold">수요예측 전 (공시 예정)</span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">
                의무보유확약 비율 {ipo.confirmedPrice === 0 && <span className="text-amber-600 font-bold">(미확정)</span>}
              </span>
              <span className="text-base font-black text-gray-900">
                {ipo.confirmedPrice > 0 ? (
                  `${ipo.lockupCommitmentRate}%`
                ) : (
                  <span className="text-xs text-amber-700 font-bold">수요예측 전 (공시 예정)</span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">
                상장일 유통가능비율 {ipo.confirmedPrice === 0 && <span className="text-amber-600 font-bold">(예정)</span>}
              </span>
              <span className="text-base font-black text-gray-900">
                {ipo.confirmedPrice > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span>{ipo.circulatingSupplyRate}%</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">DART 확정</span>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    <span>약 {ipo.circulatingSupplyRate}%</span>
                    <span className="text-[10px] font-medium text-amber-700">신고서 기준 (확정 전)</span>
                  </span>
                )}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">
                상장 시 시가총액 {ipo.confirmedPrice === 0 && <span className="text-amber-600 font-bold">(예상)</span>}
              </span>
              <span className="text-base font-black text-gray-900">
                약 {ipo.marketCapAtIpo.toLocaleString()}억원
              </span>
            </div>
          </div>

          {/* 주관사 정보 */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-2">
              주관 증권사별 배정 수량 및 청약 수수료
            </span>
            <div className="flex flex-wrap gap-2">
              {ipo.underwriters.map((uw, idx) => (
                <div key={idx} className="px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-xs flex items-center gap-2">
                  <span className="font-bold text-gray-900">{uw.name}</span>
                  <span className="text-gray-600">배정 {uw.allocatedShares.toLocaleString()}주</span>
                  <span className="text-gray-500">· 수수료 {uw.fee.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2-1. IPOScore 에디토리얼 심층 분석 및 수급 리스크 진단 */}
        <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>{ipo.name} 실전 투자 분석 &amp; 수급 리스크 진단</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
              IPOScore 자체 분석 칼럼
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs sm:text-sm flex items-center gap-1.5 text-blue-900">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>상장일 유통금액 &amp; 오버행 진단</span>
              </span>
              <p className="text-gray-600 leading-relaxed">
                총 시가총액 {ipo.marketCapAtIpo.toLocaleString()}억원 중 상장일 유통가능 물량은 <strong>{ipo.circulatingSupplyRate}%</strong>로, 금액 기준 <strong>약 {Math.round((ipo.marketCapAtIpo * ipo.circulatingSupplyRate) / 100).toLocaleString()}억원</strong> 수준입니다.
              </p>
              <div className="p-2.5 rounded bg-white border border-gray-200 text-gray-800">
                <span className="font-semibold block mb-0.5">💡 수급 매도 압력:</span>
                {Math.round((ipo.marketCapAtIpo * ipo.circulatingSupplyRate) / 100) <= 300
                  ? '300억원 미만 소형 규모로 상장일 초기 매도 압력이 낮아 시초가 탄력이 높을 가능성이 큽니다.'
                  : Math.round((ipo.marketCapAtIpo * ipo.circulatingSupplyRate) / 100) <= 600
                  ? '300~600억원 수준의 중간 규모로 무난한 유통 물량이나 장중 차익 실현 매물을 주시해야 합니다.'
                  : '600억원을 초과하는 중대형 물량으로 상장일 기존 주주 및 기관의 매도 물량 출회에 유의해야 합니다.'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs sm:text-sm flex items-center gap-1.5 text-blue-900">
                <Building className="w-4 h-4 text-blue-700" />
                <span>공모 규모 및 밸류에이션 매력도</span>
              </span>
              <p className="text-gray-600 leading-relaxed">
                총 공모 모집 금액은 <strong>약 {ipo.totalOfferingAmount.toLocaleString()}억원</strong>이며,
                {ipo.confirmedPrice > 0
                  ? ` 공모가는 ${ipo.confirmedPrice.toLocaleString()}원으로 최종 확정되었습니다.`
                  : ` 희망 공모가 밴드는 ${ipo.priceBandMin.toLocaleString()}~${ipo.priceBandMax.toLocaleString()}원입니다.`}
              </p>
              <div className="p-2.5 rounded bg-white border border-gray-200 text-gray-800">
                <span className="font-semibold block mb-0.5">📊 기관 선호도 평가:</span>
                {ipo.institutionalCompetitionRate >= 1000
                  ? '경쟁률 1,000:1을 초과하여 기관들의 선호도가 매우 강한 흥행 종목으로 평가됩니다.'
                  : ipo.institutionalCompetitionRate >= 500
                  ? '경쟁률 500~1,000:1 수준으로 시장의 통상적인 관심을 무난하게 확보했습니다.'
                  : ipo.institutionalCompetitionRate > 0
                  ? '기관 수요예측 결과가 다소 보수적이므로 청약 전 추가적인 기업 펀더멘털 분석이 권장됩니다.'
                  : '기관 수요예측 결과 발표 대기 중입니다. 공시 즉시 점수 및 분석이 업데이트됩니다.'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs sm:text-sm flex items-center gap-1.5 text-blue-900">
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>실전 청약 및 자금 운용 팁</span>
              </span>
              <p className="text-gray-600 leading-relaxed">
                청약 마감 후 환불일까지의 소요 일정을 확인하고, 비례 청약 시 마이너스통장 이자 비용과 파킹통장 기회비용을 비교하여 실익을 계산해야 합니다.
              </p>
              <div className="p-2.5 rounded bg-white border border-gray-200 text-gray-800">
                <span className="font-semibold block mb-0.5">💰 배정 전략:</span>
                {ipo.institutionalCompetitionRate >= 1000
                  ? '균등 청약은 필수이며, 비례 청약 시 5사6입 단수주 커트라인을 공략하는 자금 배분이 유리합니다.'
                  : '경쟁률 및 의무확약 수치에 따라 비례 청약 비중을 유연하게 조절하는 균등 위주의 접근이 안전합니다.'}
              </div>
            </div>
          </div>

          {/* 관련 실전 투자 가이드 추천 (내부 링크 연계로 SEO 및 애드센스 품질 극대화) */}
          <div className="pt-3 border-t border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>{ipo.name} 청약 전 꼭 읽어야 할 실전 투자 가이드</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <Link
                href="/guides/institutional-competition-and-lockup-analysis"
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-blue-700 block">수요예측 지표 읽는 법</span>
                  <span className="text-[11px] text-gray-500">기관경쟁률·확약비율 해석 기준</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-700 shrink-0" />
              </Link>
              <Link
                href="/guides/proportional-allocation-and-5-down-6-up-strategy"
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-blue-700 block">비례배정 5사6입 전략</span>
                  <span className="text-[11px] text-gray-500">증거금 최소화 및 1주 추가 배정</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-700 shrink-0" />
              </Link>
              <Link
                href="/guides/listing-day-price-limits-and-selling-timing"
                className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-blue-700 block">상장일 매도 타이밍</span>
                  <span className="text-[11px] text-gray-500">변동폭 400% 구간 실전 매도법</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-700 shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. 인용된 전문가 출처 및 실시간 블로그/영상 분석 */}
        <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4 text-red-600" />
              <span>전문가 분석 & 실시간 유튜브·블로그 리뷰</span>
            </span>
            <span className="text-xs font-medium text-gray-500">원문 및 실시간 검색</span>
          </h2>

          {ipo.expertReviews && ipo.expertReviews.length > 0 && (
            <div className="space-y-2.5 text-xs mb-4">
              {ipo.expertReviews.map((rev) => {
                const isTistory = rev.url?.includes('tistory.com') || rev.author?.includes('티스토리');
                return (
                  <div key={rev.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            rev.sourceType === 'YOUTUBE'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isTistory
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {rev.sourceType === 'YOUTUBE' ? 'YouTube' : isTistory ? '티스토리' : '네이버블로그'}
                        </span>
                        <span className="font-bold text-gray-900">{rev.author}</span>
                        <span className="text-gray-400 text-[11px]">{rev.publishedAt}</span>
                      </div>
                      <p className="text-gray-800 font-semibold mt-1">&ldquo;{rev.title}&rdquo;</p>
                      <p className="text-gray-600 text-xs mt-0.5">{rev.summary}</p>
                    </div>
                    <a
                      href={
                        rev.url && !rev.url.includes('where=article') && rev.url !== 'https://youtube.com' && rev.url !== 'https://blog.naver.com'
                          ? rev.url
                          : rev.sourceType === 'YOUTUBE'
                            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${rev.author.replace(/의.*$/, '').replace(/TV$/, '').trim()} ${ipo.name} 공모주`)}`
                            : isTistory
                            ? `https://search.daum.net/search?w=blog&q=${encodeURIComponent(`${ipo.name} 공모주`)}`
                            : `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(`${ipo.name} 공모주`)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{rev.sourceType === 'YOUTUBE' ? '원문 영상 시청' : isTistory ? '티스토리 글 보기' : '원문 블로그 글 보기'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* 실시간 1클릭 외부 리뷰 검색 버튼 (유튜브, 네이버, 티스토리) */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-gray-500 block mb-2">
              💡 {ipo.name} 관련 실시간 투자자 리뷰 및 분석글 바로가기
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${ipo.name} 공모주`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 font-bold transition-colors"
              >
                <span>YouTube 영상 검색</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </a>
              <a
                href={`https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(`${ipo.name} 공모주`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 font-bold transition-colors"
              >
                <span>네이버 블로그 검색</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
              <a
                href={`https://search.daum.net/search?w=blog&q=${encodeURIComponent(`${ipo.name} 공모주`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-800 font-bold transition-colors"
              >
                <span>티스토리 블로그 검색</span>
                <ExternalLink className="w-3 h-3 text-orange-600" />
              </a>
            </div>
          </div>
        </div>

        {/* 광고 영역 - 상세 페이지 내 단 딱 1개만 단정하게 배치 */}
        <GoogleAdSlot label="스폰서 안내" />

        {/* 4. 실전 비례 청약 계산기 (취소 종목 제외) */}
        {!ipo.isCancelled && (
          <div>
            <IpoCalculator
              initialPrice={ipo.confirmedPrice > 0 ? ipo.confirmedPrice : ipo.priceBandMax}
              initialCompetitionRate={ipo.institutionalCompetitionRate}
              stockName={ipo.name}
            />
          </div>
        )}

        {/* 뉴스레터 구독 */}
        <NewsletterBanner />

        {/* 법적 유의사항 */}
        <div className="p-4 rounded-lg bg-gray-200/70 text-xs text-gray-600 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <p>
            {ipo.name} 리포트는 공시된 신고서와 외부 전문가들의 공개 의견을 종합한 결과입니다. 투자의 책임은 전적으로 투자자 본인에게 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
