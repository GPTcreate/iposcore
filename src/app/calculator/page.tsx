import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import IpoCalculator from '@/components/IpoCalculator';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import NewsletterBanner from '@/components/NewsletterBanner';
import { Calculator } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '공모주 비례배정·대출이자·손익분기 계산기',
  description: '비례 경쟁률과 증거금률로 배정 이론값을 계산하고, 균등 배정 가정·대출 원금·매도 수수료와 세금을 바꿔 손실 시나리오와 손익분기 수익률을 비교하세요.',
  alternates: { canonical: 'https://www.iposcore.kr/calculator' },
  openGraph: {
    title: '공모주 비례배정·대출이자·손익분기 계산기 | IPOScore',
    description: '배정 가정과 비용을 직접 입력하는 공모주 손익 시뮬레이터. 계산 공식과 재현 가능한 예시를 함께 제공합니다.',
    url: 'https://www.iposcore.kr/calculator',
    type: 'website',
    images: ['https://www.iposcore.kr/og-image.png'],
  },
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-2xs sm:p-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800"><Calculator className="h-3.5 w-3.5" /><span>조건을 바꿔 비교하는 청약 계산 도구</span></div>
          <h1 className="text-2xl font-black sm:text-3xl">공모주 비례배정·대출이자·손익분기 계산기</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">균등 배정은 0주부터 시작합니다. 비례 경쟁률과 배정 가정을 직접 정하고 대출·거래 비용을 반영해, 주가가 오르거나 내릴 때의 손익을 비교해 보세요.</p>
        </div>

        <IpoCalculator />

        <section className="space-y-4 rounded-xl border border-gray-300 bg-white p-5 text-sm shadow-2xs sm:p-6" aria-labelledby="calculation-method">
          <h2 id="calculation-method" className="text-lg font-bold">계산 공식과 적용 범위</h2>
          <p className="leading-relaxed text-gray-600">아래는 이 도구에서 사용하는 단순화한 계산 모델입니다. 실제 청약 가능 금액, 배정 주수, 이자와 세금은 종목·계좌·금융기관의 조건에 따라 달라집니다. 청약 증거금은 전부 주식 취득대금이 되는 것이 아니며, 미배정 금액은 환불됩니다.</p>
          <dl className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 leading-relaxed">
            <div><dt className="font-semibold">비례 1주에 필요한 이론상 증거금</dt><dd className="text-gray-600">공모가 × 증거금률 ÷ 100 × 비례 경쟁률</dd></div>
            <div><dt className="font-semibold">비례 배정 이론값과 주수 가정</dt><dd className="text-gray-600">증거금 ÷ 비례 1주 필요 증거금. 기본은 소수점 절사이며, 5사6입을 선택하면 소수 부분 0.6 이상을 올리는 가정으로 계산합니다. 여기에 사용자가 입력한 균등 주수를 더합니다.</dd></div>
            <div><dt className="font-semibold">대출 이자</dt><dd className="text-gray-600">대출 원금 × 연이율 ÷ 100 × 실제 사용 일수 ÷ 365. 달력일 기준 단리이며, 일수 산정·윤년·최소 부과 단위는 대출 약정을 확인하세요.</dd></div>
            <div><dt className="font-semibold">비용 차감 후 손익</dt><dd className="text-gray-600">배정 가정 주수 × 공모가 × 매도 수익률 ÷ 100 − 대출 이자 − 청약 수수료 − 매도대금 × 매도 수수료·세금률 ÷ 100</dd></div>
            <div><dt className="font-semibold">손익분기 수익률</dt><dd className="text-gray-600">[(주식 취득대금 + 대출 이자 + 청약 수수료) ÷ (주식 취득대금 × (1 − 매도비용률 ÷ 100)) − 1] × 100. 배정이 0주이거나 매도비용률이 100%이면 산출하지 않습니다.</dd></div>
          </dl>
          <p className="leading-relaxed text-gray-600">기관 수요예측 경쟁률을 일반 청약의 비례 경쟁률로 바꾸는 공통 공식은 적용하지 않습니다. 균등 추첨과 단수주 배정도 확정할 수 없습니다. 최종 비례 경쟁률, 최소·최대 청약 수량과 청약 단위를 주관사 공지에서 확인하세요.</p>
        </section>

        <section className="space-y-4 rounded-xl border border-gray-300 bg-white p-5 text-sm shadow-2xs sm:p-6" aria-labelledby="calculation-example">
          <h2 id="calculation-example" className="text-lg font-bold">같은 배정이라도 비용에 따라 달라지는 예시</h2>
          <p className="leading-relaxed text-gray-600">실제 종목과 무관한 계산 예시입니다. 증거금 1,000만원, 공모가 20,000원, 증거금률 50%, 비례 경쟁률 1,000:1이면 비례 이론값은 1주입니다. 균등 0주·절사·청약 수수료 2,000원을 공통 조건으로 두었습니다.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">
              <caption className="sr-only">수익률, 대출 및 매도비용에 따른 청약 손익 예시</caption>
              <thead className="border-b border-gray-300 bg-gray-50"><tr><th scope="col" className="p-3">조건</th><th scope="col" className="p-3">매매 차익</th><th scope="col" className="p-3">이자 / 매도비용</th><th scope="col" className="p-3">비용 차감 후 손익</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                <tr><th scope="row" className="p-3 font-medium">+20%·자기자금·매도비용 0%</th><td className="p-3">+4,000원</td><td className="p-3">0원 / 0원</td><td className="p-3 font-semibold">+2,000원</td></tr>
                <tr><th scope="row" className="p-3 font-medium">+20%·자기자금·매도비용 0.2%</th><td className="p-3">+4,000원</td><td className="p-3">0원 / 48원</td><td className="p-3 font-semibold">+1,952원</td></tr>
                <tr><th scope="row" className="p-3 font-medium">+20%·500만원 대출·연 5%·4일·매도비용 0.2%</th><td className="p-3">+4,000원</td><td className="p-3">약 2,740원 / 48원</td><td className="p-3 font-semibold">약 −788원</td></tr>
                <tr><th scope="row" className="p-3 font-medium">−20%·자기자금·매도비용 0%</th><td className="p-3">−4,000원</td><td className="p-3">0원 / 0원</td><td className="p-3 font-semibold">−6,000원</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-gray-500">0.2%는 예시용 합산 비율이며 현재 적용 세율을 뜻하지 않습니다. 기본 예시의 손익분기 수익률은 +10%입니다. 대출 500만원·연 5%·4일·매도비용 0.2% 예시에서는 약 +23.95%로 높아집니다. 원 단위 표시에서 반올림합니다.</p>
        </section>

        <section className="space-y-3 rounded-xl border border-gray-300 bg-white p-5 text-sm shadow-2xs sm:p-6" aria-labelledby="calculator-sources">
          <h2 id="calculator-sources" className="text-lg font-bold">입력 전에 확인할 원문</h2>
          <p className="leading-relaxed text-gray-600">공모가·증거금률·청약 일정·배정 방식은 금융감독원 <a href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">DART</a>에서 회사명으로 찾은 최종 투자설명서와 정정 공시를 확인하세요. 상장 공시는 한국거래소 <a href="https://kind.krx.co.kr/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">KIND</a>, 최종 비례 경쟁률·청약 수수료·계좌별 거래비용은 해당 주관 증권사의 공지를 기준으로 입력하세요.</p>
          <p className="leading-relaxed text-gray-600">이 도구는 공시나 계좌 정보를 자동 조회하지 않습니다. 투자 수익을 예측하거나 특정 청약을 권유하지 않으며, 청약 단위·한도·추첨, 환불금 재투자, 배정 후 매도일까지의 추가 대출 이자와 개별 과세 사정은 자동 반영하지 않습니다.</p>
          <Link href="/guides/proportional-allocation-and-5-down-6-up-strategy" className="inline-block font-semibold text-blue-700 underline">균등·비례 배정과 단수주 처리 가이드 읽기 →</Link>
        </section>

        <GoogleAdSlot label="스폰서 안내" />
        <NewsletterBanner />
      </main>
    </div>
  );
}
