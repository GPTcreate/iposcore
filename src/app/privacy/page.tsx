import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '공모주 알리미 리포트(IPOScore)의 개인정보처리방침 안내입니다.',
  alternates: {
    canonical: 'https://iposcore.kr/privacy',
  },
  openGraph: {
    title: '개인정보처리방침 | IPOScore',
    description: '공모주 알리미 리포트(IPOScore)의 개인정보처리방침 안내',
    url: 'https://iposcore.kr/privacy',
    images: ['https://iposcore.kr/og-image.png'],
  },
};

export default function PrivacyPage() {
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>법적 고지</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              개인정보처리방침 (Privacy Policy)
            </h1>
            <p className="text-xs text-gray-500 mt-1">시행일자: 2026년 10월 1일</p>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. 수집하는 개인정보 항목 및 수집 방법</h2>
              <p>
                &apos;공모주 알리미 리포트&apos;(이하 &apos;서비스&apos;)는 이용자에게 주간 공모주 청약 알림 및 리포트 발송을 위해 최소한의 개인정보만을 수집합니다.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2 text-gray-600">
                <li><strong>수집 항목</strong>: 이메일 주소 (뉴스레터 구독 신청 시)</li>
                <li><strong>자동 생성 정보</strong>: 접속 IP 정보, 쿠키(Cookie), 서비스 이용 기록 (구글 애널리틱스 및 애드센스 분석용)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. 개인정보의 수집 및 이용 목적</h2>
              <p>수집된 개인정보는 다음의 목적에 한하여 이용됩니다:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2 text-gray-600">
                <li>주간 공모주 청약 일정 및 AI 분석 요약 리포트 이메일 발송</li>
                <li>청약 D-1 알림 및 긴급 공시 정보 안내</li>
                <li>서비스 이용 통계 분석 및 품질 개선</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. 구글 애드센스(Google AdSense) 및 제3자 쿠키 안내</h2>
              <p>
                본 웹사이트는 구글(Google LLC)이 제공하는 웹 광고 서비스인 &apos;구글 애드센스&apos;를 이용하고 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2 text-gray-600">
                <li>구글을 포함한 제3자 공급업체는 이용자가 본 웹사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 쿠키를 사용하여 맞춤형 광고를 게재합니다.</li>
                <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">구글 광고 설정</a> 페이지를 방문하여 맞춤형 광고 게재를 거부(Opt-out)할 수 있습니다.</li>
                <li>또한 웹브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. 개인정보의 보유 및 이용 기간</h2>
              <p>
                이용자의 개인정보는 원칙적으로 구독 취소(수신 거부) 요청 시까지 보유 및 이용되며, 수신 거부 요청 즉시 복구할 수 없는 방법으로 안전하게 파기됩니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. 개인정보 보호책임자 및 문의처</h2>
              <p>서비스 이용 중 발생하는 개인정보 보호 관련 민원은 아래 이메일로 접수하실 수 있습니다:</p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <p>• <strong>담당 부서</strong>: 운영지원팀</p>
                <p>• <strong>문의 이메일</strong>: <a href="mailto:hanmanju88@gmail.com" className="text-blue-700 underline font-semibold">hanmanju88@gmail.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
