import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Info, Mail, CheckCircle2, Cpu, Shield, BookOpen } from 'lucide-react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 소개 및 분석 방법론',
  description: '공모주 알리미 리포트(IPOScore)의 설립 목적, AI 투자 매력도 산출 방법론 및 문의 안내입니다.',
  alternates: {
    canonical: 'https://iposcore.kr/about',
  },
  openGraph: {
    title: '서비스 소개 및 분석 방법론 | IPOScore',
    description: '공모주 알리미 리포트(IPOScore)의 설립 목적, AI 투자 매력도 산출 방법론 및 문의 안내',
    url: 'https://iposcore.kr/about',
    type: 'website',
    images: ['https://iposcore.kr/og-image.png'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← 홈으로 돌아가기</span>
          </Link>
        </div>

        <div className="p-6 sm:p-8 rounded-xl bg-white border border-gray-300 shadow-2xs space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>서비스 소개</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              공모주 알리미 리포트에 대하여
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              복잡한 증권신고서와 흩어진 전문가 의견을 한곳에 모아 바쁜 투자자의 시간을 아껴드립니다.
            </p>
          </div>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-700" />
                <span>1. 서비스 설립 취지 및 운영 목적</span>
              </h2>
              <p>
                공모주 청약은 많은 개인 투자자들이 참여하는 대표적인 재테크 수단이지만, 매번 수십~수백 쪽에 달하는 금융감독원 전자공시(DART) 투자설명서를 일일이 정독하거나 유튜브 채널을 여러 개 찾아보는 것은 상당한 시간과 노력이 소모됩니다.
              </p>
              <p>
                <strong>&apos;공모주 알리미 리포트(IPOScore)&apos;</strong>는 공시된 핵심 정량 지표(기관경쟁률, 의무보유확약, 유통가능물량)와 신뢰할 수 있는 투자 데이터를 종합 분석하여 <strong>바쁜 개인 투자자가 단 10초 만에 공모주의 매력도와 내재 리스크를 객관적으로 파악</strong>할 수 있도록 돕기 위해 설립되었습니다.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-700" />
                <span>2. IPOScore 정량 평가 및 AI 매력도 산출 방법론</span>
              </h2>
              <p className="text-xs text-gray-600">
                IPOScore의 매력도 점수는 주관적 추측을 배제하고, 과거 5개년 공모주 상장일 수익률 데이터를 백테스팅하여 도출된 통계적 가중치 모델을 기반으로 산출됩니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1">
                    📊 기관 수요예측 경쟁률 (가중치 35%)
                  </span>
                  <p className="text-gray-600">국내외 기관투자자들의 참여 열기와 사전 선호도를 정량화하여 800:1 이상 시 높은 가점을 부여합니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1">
                    🔒 의무보유확약 비율 (가중치 30%)
                  </span>
                  <p className="text-gray-600">상장 후 15일~6개월간 매도를 제한하겠다고 약속한 기관 물량 비중으로, 15% 이상 시 수급 안정성 최상급으로 분류합니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1">
                    💧 상장일 유통가능 금액/비율 (가중치 25%)
                  </span>
                  <p className="text-gray-600">상장 당일 시장에 풀릴 수 있는 주식 금액이 300억 원 이하이거나 총 주식수 대비 25% 미만일 경우 매도 압력이 낮아 우수한 점수를 받습니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1">
                    📈 희망공모가 밴드 확정치 (가중치 10%)
                  </span>
                  <p className="text-gray-600">기관 수요예측 결과 공모가가 희망 밴드 상단을 초과하여 결정되었는지 여부를 분석해 시장의 초과 수요를 반영합니다.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-700" />
                <span>3. 편집 원칙 및 E-E-A-T 신뢰성 서약</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>원천 공시 데이터 준수</span>
                  </span>
                  <p className="text-gray-600">금융감독원 전자공시시스템(DART)에 공시된 투자설명서 및 증권발행실적보고서 수치만을 1차 원천으로 사용합니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>편집권 독립 & 유료 리딩 배제</span>
                  </span>
                  <p className="text-gray-600">특정 상장 주관사나 발행회사로부터 일체의 금전적 대가를 수수하지 않으며, 특정 종목 추천이나 유료 리딩방을 운영하지 않습니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>데이터 정정 및 투명성 보장</span>
                  </span>
                  <p className="text-gray-600">주관사 및 DART의 정정신고서가 공시되는 즉시 수치를 갱신하며, 사용자 제보 접수 시 당일 검증 및 즉각 수정합니다.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <span>4. 투자자 보호 및 법적 면책 안내 (Disclaimer)</span>
              </h2>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <p className="font-bold">⚠️ 본 사이트의 모든 콘텐츠 및 분석 리포트는 참고용 정보입니다.</p>
                <p>
                  IPOScore(공모주 알리미 리포트)에서 제공하는 수치, AI 분석 결과 및 투자 가이드 칼럼은 자본시장과 금융투자업에 관한 법률상 개별 종목에 대한 투자 권유나 청약 매수 추천이 아닙니다.
                </p>
                <p>
                  상장일 주가 변동 및 청약 손실 위험은 전적으로 투자자 본인에게 귀속되므로, 실제 청약 신청 전 증권신고서와 주관증권사의 최종 투자설명서를 반드시 확인하시기 바랍니다.
                </p>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-700" />
                <span>5. 데이터 정정 제보 및 문의처</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                기재된 공시 수치에 정정이 필요하거나 데이터 연동, 오류 제보, 제휴 관련 문의는 아래 공식 이메일로 연락주시면 영업일 기준 24시간 이내에 검증 후 회신해 드립니다.
              </p>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-sm">
                📧 공식 문의 이메일: <a href="mailto:hanmanju88@gmail.com" className="underline font-bold">hanmanju88@gmail.com</a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
