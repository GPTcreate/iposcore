import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: '데이터 출처와 분석 기준',
  description: 'IPOScore의 원문 확인 기준, 미확인 정보 처리, 정량 참고 점수 산식과 계산 도구의 가정을 공개합니다.',
  alternates: { canonical: 'https://www.iposcore.kr/methodology' },
};

const rows = [
  ['기관 수요예측 경쟁률', '1,200 이상 40 / 900 이상 35 / 600 이상 30 / 300 이상 24 / 100 이상 18 / 0 초과 10', '40점'],
  ['의무보유확약 비율(%)', '20 이상 25 / 15 이상 22 / 10 이상 18 / 5 이상 14 / 0 초과 9 / 0은 0', '25점'],
  ['상장일 유통가능 비율(%)', '20 이하 20 / 25 이하 17 / 30 이하 14 / 38 이하 10 / 38 초과 5', '20점'],
];

export default function MethodologyPage() {
  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 space-y-8 text-sm leading-relaxed">
          <header className="space-y-3">
            <p className="text-xs text-blue-700 font-bold">공개 기준 · 개정 2026-10-25</p>
            <h1 className="text-2xl sm:text-3xl font-black">데이터 출처와 분석 기준</h1>
            <p className="text-gray-700">좋은 점수보다 먼저 확인할 것은 숫자가 어디서 왔는지입니다. IPOScore의 공개 조건과 계산 과정을 아래에 공개합니다.</p>
          </header>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">종목 정보를 공개하는 조건</h2>
            <p>종목별 공시 원문 링크와 확인일을 기록한 자료만 일정 목록과 피드에 표시합니다. DART 접수번호가 있는 개별 공시나 KIND 접수번호가 있는 개별 공시가 필요합니다. 포털 검색 결과와 동영상 검색 링크는 원문 근거로 인정하지 않습니다.</p>
            <p>기존 자료 중 이 기록이 없는 종목은 검증 대기로 분리합니다. 해당 페이지에서는 수치·점수·자동 요약을 제공하지 않고, 검색 색인과 광고 대상에서도 제외합니다. 검증 완료 후 내용이 바뀌면 다시 확인해야 합니다. 현재 기존 종목 37개는 이 기록을 갖추지 못해 공개를 보류했습니다. 원문 링크가 있다는 것만으로 내용이 자동 검증되는 것은 아닙니다.</p>
            <p>공시를 즉시 반영하는 실시간 서비스가 아닙니다. 확인일 이후 정정신고서가 나올 수 있으므로 청약 신청 전 최신 투자설명서와 주관사의 최종 공고를 대조해야 합니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">독자가 따라 확인하는 순서</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>DART에서 회사명으로 검색하고, 최종 정정 투자설명서의 접수일과 접수번호를 기록합니다.</li>
              <li>모집·매출 조건에서 공모가·일정·주관사를, 배정 관련 항목에서 기관 수요예측 및 확약의 기준을 확인합니다.</li>
              <li>주식 총수와 유통가능 주식 수의 기준일을 맞춥니다. 비율만 비교하지 말고 유통가능 금액도 계산합니다.</li>
              <li>일반 청약의 증거금률·최소 청약 단위·한도·수수료는 본인 증권사 공고에서 확인합니다.</li>
            </ol>
            <p className="flex flex-wrap gap-4 text-blue-700"><a className="underline" href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer">금융감독원 DART</a><a className="underline" href="https://kind.krx.co.kr/" target="_blank" rel="noopener noreferrer">한국거래소 KIND</a><Link className="underline" href="/guides/dart-prospectus-reading-top-3-risk-factors">공시 읽기 예시</Link></p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">정량 참고 점수: 공개 산식 v2</h2>
            <p>기관 경쟁률·확약 비율·유통가능 비율을 비교하기 위한 자체 설계 지표입니다. 수익률 예측 모델이나 백테스트로 검증한 투자 전략이 아닙니다. 실제 매출, 수익성, 공모가의 적정성, 업종 차이를 모두 반영하지 못합니다.</p>
            <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px] text-xs border border-gray-200">
              <caption className="sr-only">정량 참고 점수의 구간별 원점수</caption>
              <thead className="bg-gray-50"><tr><th className="p-3">지표</th><th className="p-3">구간별 원점수 (위 조건부터 적용)</th><th className="p-3">상한</th></tr></thead>
              <tbody>{rows.map(([name, rule, max]) => <tr className="border-t border-gray-200" key={name}><th className="p-3">{name}</th><td className="p-3">{rule}</td><td className="p-3 whitespace-nowrap">{max}</td></tr>)}</tbody>
            </table></div>
            <p className="bg-blue-50 border border-blue-200 rounded-lg p-4 font-semibold">참고 점수 = 반올림((경쟁률 원점수 + 확약 원점수 + 유통 원점수) ÷ 85 × 100)</p>
            <p>예시: 경쟁률 950:1(35점), 확약 12%(18점), 유통 27%(14점)이면 합계 67점, 정규화 점수는 79점입니다. 이 값은 예시이며 실제 종목 평가가 아닙니다. 구간 A는 75~84점, S는 85점 이상, B는 60~74점, C는 60점 미만이라는 분류일 뿐 청약 추천이 아닙니다.</p>
            <p>원문 검토 기록이나 필수 지표가 없으면 산출을 보류합니다. 누락된 경쟁률과 확약에 임의의 평균 점수를 넣지 않습니다. 외부 리뷰를 실제 수집·검증한 표본이 없으므로 여론 비율과 여론 가점은 사용하지 않으며 공모가 상단 초과에도 자동 가점을 주지 않습니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">계산기와 해설의 한계</h2>
            <p>계산기 기본값은 사용법을 위한 예시입니다. 기관 경쟁률로 비례 경쟁률을 추정하지 않습니다. 비례 이론 주수와 실제 배정은 다를 수 있으며 균등 배정도 보장되지 않습니다. 이자·수수료·매도 비용과 손실 시나리오를 함께 비교하세요.</p>
            <p>가이드의 수치 예시는 독자가 재현할 수 있도록 직접 계산한 설명용 사례입니다. 회사의 실제 실적이나 관측 통계로 제시하지 않습니다. 작성에 자동화 도구를 사용할 수 있으며 그 결과가 외부 금융 전문가의 검수를 뜻하지 않습니다.</p>
            <Link className="text-blue-700 underline" href="/calculator">가정을 바꿔 직접 계산하기 →</Link>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">정정과 변경 기록</h2>
            <p>2026-10-25: 출처 없는 잠정 점수와 여론 통계 노출 중단, 원금·배정·수익 보장 표현 수정, 계산 예시와 공식 자료 연결, 실제 수정일 기준으로 사이트맵 정리.</p>
            <p>잘못된 정보는 종목 또는 가이드 URL, 문제가 되는 문장, 확인 가능한 공시 원문을 함께 <a className="text-blue-700 underline" href="mailto:hanmanju88@gmail.com">hanmanju88@gmail.com</a>으로 알려주세요. 검토 결과에 따라 수정하고 주요 변경 이유를 기록합니다.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
