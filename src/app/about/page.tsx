import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Info, Mail, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: '서비스 소개 및 문의 | 공모주 알리미 리포트',
  description: '공모주 알리미 리포트의 설립 목적, 분석 방법론 및 제휴/오류 문의 안내입니다.',
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

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. 서비스 시작 배경</h2>
              <p>
                공모주 청약은 많은 분들이 참여하는 대표적인 재테크 수단이지만, 매번 수십 장에 달하는 전자공시(DART) 투자설명서를 일일이 정독하거나 유튜브 채널을 여러 개 찾아보는 것은 상당한 시간과 노력이 소모됩니다.
              </p>
              <p>
                <strong>&apos;공모주 알리미 리포트&apos;</strong>는 공시된 핵심 수치(기관경쟁률, 의무확약, 유통물량)와 검증된 전문가들의 리뷰를 종합 분석하여 **단 10초 만에 공모주의 매력도와 리스크를 객관적으로 파악**할 수 있도록 돕고자 제작되었습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900">2. 신뢰할 수 있는 3대 원칙</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>객관적 공식 데이터</span>
                  </span>
                  <p className="text-gray-600">금융감독원 전자공시(DART) 공식 API 수치를 1차 기반으로 합니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>공정한 출처 명시</span>
                  </span>
                  <p className="text-gray-600">전문가 의견 인용 시 채널명과 원문 링크를 100% 명시합니다.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                  <span className="font-bold text-gray-900 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>비용 없는 무료 정보</span>
                  </span>
                  <p className="text-gray-600">유료 리딩이나 종목 추천 없이 모든 정보를 무료 공개합니다.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-3 border-t border-gray-200">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-700" />
                <span>제휴 및 데이터 정정/문의처</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                기재된 공시 수치에 정정이 필요하거나 채널 연동, 광고/제휴 관련 문의는 아래 이메일로 연락주시면 영업일 기준 24시간 이내에 회신해 드립니다.
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
