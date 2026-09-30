import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

export const metadata = {
  title: '서비스 이용약관 | 공모주 알리미 리포트',
  description: '공모주 알리미 리포트 서비스 이용약관 및 투자 유의사항 안내입니다.',
};

export default function TermsPage() {
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
              <FileText className="w-3.5 h-3.5" />
              <span>이용 규정</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              서비스 이용약관 (Terms of Service)
            </h1>
            <p className="text-xs text-gray-500 mt-1">시행일자: 2026년 10월 1일</p>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            {/* 자본시장법 면책 조항 강조 */}
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold block mb-1">【중요】 투자 책임 및 면책 고지</span>
                <p>
                  본 사이트에서 제공하는 공모주 AI 분석 점수 및 요약 정보는 금융감독원 DART 공시와 외부 공개 콘텐츠를 바탕으로 한 <strong>단순 통계 참고 자료</strong>입니다. 특정 금융투자상품의 매수·매도 또는 청약을 직접 권유하는 투자자문이 아니며, 투자의 최종 결정과 결과에 대한 책임은 전적으로 투자자 본인에게 있습니다.
                </p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">제1조 (목적)</h2>
              <p>
                본 약관은 '공모주 알리미 리포트'(이하 '서비스')가 제공하는 웹사이트 및 뉴스레터 관련 서비스의 이용 조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">제2조 (제공 서비스)</h2>
              <p>서비스는 이용자에게 다음과 같은 정보성 콘텐츠를 무료로 제공합니다:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2 text-gray-600">
                <li>공모주 청약 및 상장 일정 캘린더</li>
                <li>기관 수요예측 결과 및 전자공시 정량 지표 요약</li>
                <li>공모주 비례 배정 모의 계산기</li>
                <li>주간 공모주 브리핑 뉴스레터</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">제3조 (저작권 및 인용 출처 준수)</h2>
              <p>
                서비스는 외부 전문가(유튜브, 블로그 등)의 의견을 인용할 때 출처 링크와 저작권자를 명확히 표기하며, 공정한 정보 취합 및 메타 분석의 범위 내에서만 인용합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">제4조 (서비스의 변경 및 중단)</h2>
              <p>
                서비스는 시스템 유지보수, 공시 API 제공업체의 사정 또는 운영상 필요에 따라 사전 공지 없이 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
