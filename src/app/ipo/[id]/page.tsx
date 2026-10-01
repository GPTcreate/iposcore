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
import { MOCK_IPOS } from '@/data/mockIpo';
import {
  ArrowLeft,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Video,
  PieChart,
  ShieldAlert,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ipo = MOCK_IPOS.find((item) => item.id === id);
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

  const title = `${ipo.name} 공모주 청약 분석 리포트 - 공모가·경쟁률·AI점수`;
  const description = `${ipo.name} (${ipo.market}) 공모주 청약 일정(${ipo.subscriptionStart}~${ipo.subscriptionEnd}), 공모가 ${priceText}, 주관사 ${underwriterNames}. 기관 수요예측 경쟁률 ${ipo.institutionalCompetitionRate}:1 및 전문가 AI 요약 분석.`;

  return {
    title,
    description,
    keywords: [
      ipo.name,
      `${ipo.name} 공모주`,
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
      title: `${ipo.name} 공모주 청약 분석 리포트 | 공모주 알리미`,
      description,
      url: `https://iposcore.kr/ipo/${ipo.id}`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return MOCK_IPOS.map((ipo) => ({
    id: ipo.id,
  }));
}

export default async function IpoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ipo = MOCK_IPOS.find((item) => item.id === id);

  if (!ipo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 뒤로 가기 링크 & 공유 버튼 */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 전체 청약 일정 목록으로 돌아가기</span>
          </Link>
          <ShareButtons stockName={ipo.name} aiScore={ipo.aiScore} />
        </div>

        {/* 상단 종목 타이틀 카드 */}
        <div className="p-6 sm:p-7 rounded-xl bg-white border border-gray-300 shadow-2xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-700 text-white">
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
              <ScoreBadge score={ipo.aiScore} grade={ipo.scoreGrade} size="lg" />
            </div>
          </div>

          {/* 주요 일정 요약 바 */}
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
              <span className="font-bold text-blue-700 text-sm">
                {ipo.listingDate || '추후 공시 예정'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5 font-medium">확정 공모가</span>
              <span className="font-black text-gray-900 text-sm">
                {ipo.confirmedPrice > 0 ? `${ipo.confirmedPrice.toLocaleString()}원` : '수요예측 대기'}
              </span>
            </div>
          </div>
        </div>

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
              <span className="text-gray-500 block mb-1">기관 수요예측 경쟁률</span>
              <span className="text-base font-black text-gray-900">
                {ipo.institutionalCompetitionRate > 0 ? `${ipo.institutionalCompetitionRate}:1` : '발표 전'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">의무보유확약 비율</span>
              <span className="text-base font-black text-gray-900">
                {ipo.lockupCommitmentRate > 0 ? `${ipo.lockupCommitmentRate}%` : '발표 전'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">상장일 유통가능비율</span>
              <span className="text-base font-black text-gray-900">
                {ipo.circulatingSupplyRate}%
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
              <span className="text-gray-500 block mb-1">상장 시 시가총액</span>
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

        {/* 3. 인용된 전문가 출처 목록 */}
        {ipo.expertReviews.length > 0 && (
          <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                <span>참고한 전문 유튜브 & 블로그 리뷰 출처</span>
              </span>
              <span className="text-xs font-medium text-gray-500">원문 링크 제공</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              {ipo.expertReviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-gray-200 text-gray-800">
                        {rev.sourceType === 'YOUTUBE' ? 'YouTube' : 'Blog'}
                      </span>
                      <span className="font-bold text-gray-900">{rev.author}</span>
                      <span className="text-gray-400 text-[11px]">{rev.publishedAt}</span>
                    </div>
                    <p className="text-gray-800 font-semibold mt-1">"{rev.title}"</p>
                    <p className="text-gray-600 text-xs mt-0.5">{rev.summary}</p>
                  </div>
                  <a
                    href={
                      rev.url && !rev.url.includes('where=article') && rev.url !== 'https://youtube.com' && rev.url !== 'https://blog.naver.com'
                        ? rev.url
                        : rev.sourceType === 'YOUTUBE'
                          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${rev.author.replace(/의.*$/, '').replace(/TV$/, '').trim()} ${ipo.name} 공모주`)}`
                          : `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(`${ipo.name} 공모주`)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>{rev.sourceType === 'YOUTUBE' ? '원문 영상 시청' : '원문 블로그 글 보기'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 광고 영역 - 상세 페이지 내 단 딱 1개만 단정하게 배치 */}
        <GoogleAdSlot label="스폰서 안내" />

        {/* 4. 실전 비례 청약 계산기 */}
        <div>
          <IpoCalculator
            initialPrice={ipo.confirmedPrice > 0 ? ipo.confirmedPrice : ipo.priceBandMax}
            initialCompetitionRate={ipo.institutionalCompetitionRate}
            stockName={ipo.name}
          />
        </div>

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
