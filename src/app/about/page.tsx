import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: '운영 소개와 정정 문의',
  description: 'IPOScore의 공시 확인·블로그 원문 수집·청약 비용 계산 기능, 작성 책임과 의견 표본의 한계 및 정정 문의 방법을 안내합니다.',
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
            <h1 className="text-2xl sm:text-3xl font-black">공시와 원문을 확인하고, 내 청약 비용을 계산하는 곳</h1>
            <p>IPOScore(공모주 알리미 리포트)는 개인 투자자가 공모주 청약의 조건과 비용을 스스로 확인하도록 종목 일정·참고점수·블로그 원문 모음과 계산 도구를 제공합니다. 등록자료와 원문 확인 항목, 의견의 실제 표본을 구분해 보여주는 것을 목표로 합니다.</p>
          </header>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">이 사이트에서 할 수 있는 일</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>투자설명서에서 일정, 유통가능 물량, 위험요소를 찾는 순서를 배웁니다.</li>
              <li>증거금, 비례 경쟁률, 대출금, 환불일까지의 일수로 배정과 비용의 가정을 비교합니다.</li>
              <li>공식 원문과 확인일이 갖춰진 종목 정보의 근거를 따라 확인합니다.</li>
              <li>새로 등록되는 종목과 누적된 과거 종목을 탐색하고, 항목별 공시 확인 여부를 구분합니다.</li>
              <li>수집 근거를 갖춘 블로그의 제목·작성자·발행일·짧은 발췌를 보고 원문으로 이동합니다.</li>
              <li>명시적으로 확인된 의견 표본과 미분류 원문을 구분하고 점수에 반영된 표본 수를 확인합니다.</li>
            </ul>
            <div className="flex flex-wrap gap-4 text-blue-700 font-semibold"><Link className="underline" href="/guides">공시·청약 가이드</Link><Link className="underline" href="/calculator">배정·비용 계산기</Link><Link className="underline" href="/methodology">출처와 점수 산식</Link></div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">운영과 작성 책임</h2>
            <p>운영·편집 표기는 IPOScore입니다. 개별 가이드의 작성 표기와 수정일, 참고한 공식 자료를 본문에서 확인할 수 있습니다. 사이트명이나 작성 표기가 금융 자격, 금융기관 소속 또는 외부 전문가의 검수를 뜻하지 않습니다.</p>
            <p>작성·정리와 원문 수집·분류에 자동화 도구를 사용할 수 있습니다. 자동 생성 문장이나 등록값을 공시 확인 사실로 취급하지 않고, 확인한 항목에는 원문과 확인시각을 연결합니다. 초기 37건은 시작 데이터이며 종목 수는 이후 등록에 따라 달라집니다. 기존·신규 종목 목록은 유지하고, 공시 근거가 연결되지 않은 항목은 등록자료로 표시합니다.</p>
            <p>블로그 작성자의 이름은 원문 출처 표기이며 금융 자격이나 IPOScore와의 제휴를 뜻하지 않습니다. 원문 작성자가 직접 표현한 입장만 자동 분류하며, 인용이나 모호한 표현은 미분류로 남깁니다. 일부 블로그의 표본을 전체 투자자의 여론으로 일반화하지 않습니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">자료를 다루는 원칙</h2>
            <p>공시의 사실, 원문 작성자의 의견, 자체 계산과 설명용 가정을 구분합니다. 검색 링크를 개별 원문으로 표시하지 않으며, 수집하지 않은 의견이나 표본 없는 여론 비율을 만들지 않습니다. 동일 블로그 또는 작성자의 최신 글 1건을 의견 표본으로 삼고 미분류를 분모에서 제외합니다. 표본이 없으면 비율은 미산출(null)이며 중립이나 0%로 바꾸지 않습니다.</p>
            <p>참고점수는 기관 경쟁률·확약·유통 비율의 정량 지표 최대 85점과 실제 명시 의견의 긍정 비율에 따른 최대 15점으로 계산합니다. 유효한 등록값이 있으면 등록자료 참고점수를 제공하고, 세 지표의 공시 근거까지 확인한 경우에는 공시 확인 표기를 덧붙입니다. 공모가 미확정만으로 점수를 숨기지 않습니다. 명시 의견 표본이 없으면 정량 85점을 100점으로 환산합니다.</p>
            <p>수요예측 미발표나 필수 지표 누락·오류로 계산할 수 없으면 발표·자료 확인 대기로 표시하며 임의의 평균 점수를 채우지 않습니다. 실제 블로그 원문은 점수 산출 여부와 독립적으로 제공합니다. 참고점수는 자체 비교 보조 도구이며 수익 예측이나 투자 성과를 검증한 모델이 아닙니다.</p>
            <p>정기 수집은 청약 시작 하루 전인 종목을 대상으로 한국시간 12:17·18:17에 실행하도록 설정되어 있습니다. 수집 스냅샷을 GitHub에 저장하고 해당 변경의 사이트 배포까지 완료해야 화면에 반영됩니다. 예약 설정과 실제 실행·배포 완료는 별개이며 실행이 지연되거나 실패할 수 있습니다. 실패한 채널의 마지막 성공 원문은 시점을 표시해 보존하되 현재 분류 표본과 점수에서는 제외합니다. 일부 채널만 실패한 경우 정상 수집된 채널의 명시 입장은 반영합니다.</p>
            <p>공시 즉시 갱신이나 특정 기간 내 정정·회신을 보장하지 않습니다. 원문 접근 제한, RSS에 없는 과거 글, 짧은 발췌와 자동 분류의 한계가 있습니다. 화면의 수집 상태와 <Link className="text-blue-700 underline" href="/methodology#review-method">원문 수집·점수 기준</Link>을 함께 확인하고, 실제 청약 전에는 주관사의 최종 공고를 확인하세요.</p>
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
