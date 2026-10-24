import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: '운영 소개와 정정 문의',
  description: 'IPOScore의 운영 목적, 작성 책임, 정보 확인 방식과 정정 문의 방법을 안내합니다.',
  alternates: { canonical: 'https://www.iposcore.kr/about' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article className="p-6 sm:p-8 rounded-xl bg-white border border-gray-300 space-y-8 text-sm leading-relaxed">
          <header className="space-y-3">
            <p className="text-xs text-blue-700 font-bold">서비스 소개</p>
            <h1 className="text-2xl sm:text-3xl font-black">공시를 확인하고, 내 청약 비용을 계산하는 곳</h1>
            <p>IPOScore(공모주 알리미 리포트)는 개인 투자자가 공모주 청약의 조건과 비용을 스스로 확인할 수 있도록 공시 읽기 가이드와 계산 도구를 제공합니다.</p>
          </header>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">이 사이트에서 할 수 있는 일</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>투자설명서에서 일정, 유통가능 물량, 위험요소를 찾는 순서를 배웁니다.</li>
              <li>증거금, 비례 경쟁률, 대출금, 환불일까지의 일수로 배정과 비용의 가정을 비교합니다.</li>
              <li>공식 원문과 확인일이 갖춰진 종목 정보의 근거를 따라 확인합니다.</li>
            </ul>
            <div className="flex flex-wrap gap-4 text-blue-700 font-semibold"><Link className="underline" href="/guides">공시·청약 가이드</Link><Link className="underline" href="/calculator">배정·비용 계산기</Link><Link className="underline" href="/methodology">출처와 점수 산식</Link></div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">운영과 작성 책임</h2>
            <p>운영·편집 표기는 IPOScore입니다. 개별 가이드의 작성 표기와 수정일, 참고한 공식 자료를 본문에서 확인할 수 있습니다. 사이트명이나 작성 표기가 금융 자격, 금융기관 소속 또는 외부 전문가의 검수를 뜻하지 않습니다.</p>
            <p>작성·정리에 자동화 도구를 사용할 수 있습니다. 자동 생성 문장을 공시 사실로 취급하지 않고, 종목 자료에는 원문과 확인 기록을 요구합니다. 실제 검토 기록이 없는 기존 종목은 검증 대기로 구분하며 수치와 점수를 공개하지 않습니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">자료를 다루는 원칙</h2>
            <p>공시의 사실, 자체 계산, 설명용 가정을 구분합니다. 검색 링크를 원문으로 표시하지 않으며, 수집하지 않은 전문가의 의견이나 표본 없는 여론 비율을 만들지 않습니다. 공시 즉시 갱신이나 특정 기간 내 오류 수정·회신을 보장하지 않습니다.</p>
            <p>참고 점수는 공개한 구간별 산식으로 계산하는 비교 보조 도구입니다. 과거 5개년 백테스트나 수익 예측 정확도를 입증한 자료는 없으며 그러한 성과를 주장하지 않습니다. 제도와 일정이 바뀔 수 있으므로 실제 청약 전 주관사의 최종 공고를 확인하세요.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">정정 제보와 문의</h2>
            <p>이메일: <a className="text-blue-700 font-semibold underline" href="mailto:hanmanju88@gmail.com">hanmanju88@gmail.com</a></p>
            <p>페이지 URL, 오류가 있는 문장이나 수치, 정정 근거가 되는 원문 링크를 함께 보내주시면 확인에 도움이 됩니다. 계좌번호나 비밀번호 등 민감한 정보는 보내지 마세요.</p>
            <p>주요 수정 내용과 이유는 <Link className="text-blue-700 underline" href="/methodology">분석 기준의 변경 기록</Link>에 남깁니다.</p>
          </section>
          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold">이용 전 알아둘 점</h2>
            <p>이 사이트는 금융기관이나 청약 신청 창구가 아닙니다. 해설과 계산 결과는 개별 투자자에게 적합한 투자 권유가 아니며, 청약 및 매매에는 원금 손실이 발생할 수 있습니다. 광고가 게재되는 경우에는 광고와 편집 콘텐츠를 구분합니다.</p>
            <p className="text-xs text-gray-500">이 페이지 수정일: 2026-10-25</p>
          </section>
        </article>
      </main>
    </div>
  );
}
