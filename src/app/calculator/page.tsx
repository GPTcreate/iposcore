import React from 'react';
import Header from '@/components/Header';
import IpoCalculator from '@/components/IpoCalculator';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import NewsletterBanner from '@/components/NewsletterBanner';
import { Calculator, CheckCircle } from 'lucide-react';

export const metadata = {
  title: '공모주 비례 청약 계산기 | 예상 배정주수 및 대출이자 시뮬레이터',
  description: '공모주 청약 시 투자 금액에 따른 예상 비례 배정주수와 마이너스통장 대출 이자 비용을 무료로 계산해보세요.',
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-blue-700" />
            <span>실전 청약 시뮬레이터</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            공모주 비례 청약 & 마이너스통장 이자 계산기
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
            투자하실 금액과 예상 경쟁률을 넣으시면 비례 1주당 필요 증거금과 대출 이자를 제하고 남는 최종 순수익을 손쉽게 계산하실 수 있습니다.
          </p>
        </div>

        {/* 인터랙티브 계산기 본체 */}
        <IpoCalculator
          initialPrice={30000}
          initialCompetitionRate={1500}
          initialRefundDays={2}
          stockName="공모주 맞춤"
        />

        {/* 계산기 활용 도움말 */}
        <div className="p-6 rounded-xl bg-white border border-gray-300 shadow-2xs text-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">
            💡 공모주 비례 배정 '5사6입 법칙'이란?
          </h3>
          <p className="text-gray-600 leading-relaxed">
            비례 배정 시 소수점 이하 자리가 <strong>0.6 이상이면 1주 배정(올림)</strong>, <strong>0.5 이하이면 버림</strong> 처리되는 경우가 일반적입니다. 예를 들어 계산 결과가 1.62주라면 2주를 받을 확률이 매우 높으므로, 증거금을 조금 더 채워 0.6 단위를 맞추는 것이 실전에서 유리합니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span className="text-gray-700">환불일이 주말을 낀 4일인 경우 대출 이자가 2배로 발생하므로 기대 수익을 꼭 확인해야 합니다.</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span className="text-gray-700">증권사 청약 수수료(통상 2,000원)는 1주도 배정받지 못했을 때는 부과되지 않습니다.</span>
            </div>
          </div>
        </div>

        {/* 광고 영역 - 페이지당 딱 1개만 단정하게 배치 */}
        <GoogleAdSlot label="스폰서 안내" />

        {/* 알림 신청 */}
        <NewsletterBanner />
      </main>
    </div>
  );
}
