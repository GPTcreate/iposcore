import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: '데이터 출처와 분석 기준',
  description: 'IPOScore의 공시 확인 기준, 블로그 원문 수집과 의견 분류, 공시 85점·리뷰 15점 산식 및 무표본 처리 방식을 공개합니다.',
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
            <p>공시 수치와 외부 리뷰의 근거를 따로 확인합니다. 공모가·경쟁률 등 금융 수치를 공개하려면 DART 또는 KIND의 개별 공시 원문 링크와 확인일을 기록해야 합니다. 포털·동영상 검색 결과는 개별 원문 근거로 인정하지 않습니다. 원문 링크의 형식이 맞다는 것만으로 문서 내용까지 검증되는 것은 아닙니다.</p>
            <p>기존 37개 종목의 공시 수치는 원문 대조 기록을 갖추기 전까지 공개하지 않으며 점수도 산출을 보류합니다. 다만 해당 종목과 일정에 연결되는 블로그 원문을 실제 수집했다면 작성자·제목·발행일·짧은 발췌·링크를 독립적으로 공개할 수 있습니다. 외부 글이 존재한다는 사실이 공모가나 경쟁률 검증을 대신하지는 않습니다.</p>
            <p>공시 검토 자료도 수집 근거를 갖춘 원문도 없는 페이지는 목록·검색 색인·광고 대상에서 제외합니다. 공시 검토나 원문 수집으로 공개 요건을 갖춘 뒤에도 정정과 수집 상태를 확인해야 합니다.</p>
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
          <section id="review-method" className="space-y-3 scroll-mt-6">
            <h2 className="text-lg font-bold">블로그 원문 수집과 의견 분류</h2>
            <p>등록한 네이버 블로그·티스토리의 공개 RSS에서 글을 찾고, 허용된 동일 블로그의 개별 글 주소만 원문으로 사용합니다. 종목명 또는 확인 가능한 별칭이 제목이나 발췌에 있어야 하며, 종목 ID·종목명·청약 시작일이 일치하는 스냅샷에 연결합니다. 짧은 이름이 다른 회사 이름의 일부로 들어간 경우와 스팩의 호수가 다른 경우는 제외합니다. 다른 회차나 과거 청약의 수집 결과를 그대로 재사용하지 않습니다.</p>
            <p>발행일은 해당 청약 시작일 전 30일부터 시작일 당일까지이고 실제 수집시각보다 미래일 수 없습니다. 원문 URL, RSS 주소, 발행·수집시각, 일치한 이름, 짧은 발췌와 콘텐츠 해시를 남깁니다. 해시는 수집 내용의 식별용이며 글의 주장이나 투자 성과가 사실이라는 인증은 아닙니다. 원문 전체를 재배포하지 않고 링크로 연결합니다.</p>
            <p>자동 분류는 작성자가 해당 종목에 대해 직접 표현한 참여·청약 의사, 불참·패스 의사, 판단 유보를 확인한 경우에만 각각 긍정·주의·중립으로 기록합니다. 인용, 여러 종목을 함께 다루는 문단, 조건부 표현이나 뜻이 불분명한 문장은 미분류로 남깁니다. 높은 경쟁률이나 확약 비율만으로 글쓴이의 의견을 추정하지 않으며, 자동 분류에는 오류가 있을 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>원문 목록은 같은 글의 모바일 주소·추적 주소를 정리해 URL 중복을 제거합니다.</li>
              <li>의견 표본은 동일 블로그 또는 작성자의 최신 글 1건을 기준으로 합니다. 최신 글이 미분류이면 이전 글의 입장을 대신 가져오지 않습니다.</li>
              <li>미분류를 제외한 명시 입장 표본 수를 분모로 긍정·중립·주의 비율을 계산합니다. 표본이 없으면 비율은 미산출(null)이며, 중립이나 0%로 표시하지 않습니다.</li>
              <li>최근 수집에 실패한 경우 마지막 성공 원문은 과거 자료임을 표시해 보존합니다. 전체 실패이면 현재 의견 비율과 리뷰 가점을 산출하지 않습니다. 일부 채널만 실패했다면 그 채널의 보존 원문은 분류 표본에서 제외하고, 정상 수집된 채널의 명시 입장만 현재 비율과 리뷰 가점에 반영합니다.</li>
            </ul>
            <p>원문 편수와 의견 표본 수는 다를 수 있습니다. 일부 등록 블로그의 작은 표본이므로 전체 투자자의 여론이나 수익 가능성을 대표하지 않습니다. 원문 목록의 날짜와 명시 입장 표본 수를 함께 확인하세요.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">정기 수집과 화면 반영</h2>
            <p>정기 수집 설정은 매일 한국시간 12:17·18:17에 청약 시작 하루 전(D-1)인 종목을 대상으로 실행하는 방식입니다. GitHub Actions에서 공개 RSS를 확인하고 수집 스냅샷을 저장합니다. 실행 지연·실패나 원문의 접근 제한으로 해당 시각에 자료가 갱신되지 않을 수 있습니다.</p>
            <p>저장된 스냅샷은 GitHub에 보관하고, 해당 변경의 사이트 배포가 완료된 뒤 화면에 반영됩니다. 스냅샷 저장과 배포 완료는 별개입니다. 화면에 표시된 수집시각·마지막 성공시각과 성공·일부 실패·실패 상태를 기준으로 최신 여부를 확인하세요. 예약 설정만으로 운영 수집이나 배포가 성공했다고 표시하지 않습니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">공시·리뷰 참고점수: 공개 산식</h2>
            <p>기관 경쟁률·확약 비율·유통가능 비율을 비교하기 위한 자체 설계 지표입니다. 수익률 예측 모델이나 백테스트로 검증한 투자 전략이 아닙니다. 실제 매출, 수익성, 공모가의 적정성, 업종 차이를 모두 반영하지 못합니다.</p>
            <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px] text-xs border border-gray-200">
              <caption className="sr-only">정량 참고 점수의 구간별 원점수</caption>
              <thead className="bg-gray-50"><tr><th className="p-3">지표</th><th className="p-3">구간별 원점수 (위 조건부터 적용)</th><th className="p-3">상한</th></tr></thead>
              <tbody>{rows.map(([name, rule, max]) => <tr className="border-t border-gray-200" key={name}><th className="p-3">{name}</th><td className="p-3">{rule}</td><td className="p-3 whitespace-nowrap">{max}</td></tr>)}</tbody>
            </table></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="font-semibold">공시 원점수 Q = 경쟁률 원점수 + 확약 원점수 + 유통 원점수 (최대 85점)</p>
              <p><strong>현재 명시 입장 표본이 있을 때:</strong> 공시+리뷰 참고점수 = 반올림(Q + 긍정 비율(%) × 0.15). 리뷰 기여는 최대 15점입니다.</p>
              <p><strong>명시 입장 표본이 없을 때:</strong> 공시 참고점수 = 반올림(Q ÷ 85 × 100). 리뷰 가점 대신 공시 점수만 환산하며 산출 기준을 구분해 표시합니다.</p>
            </div>
            <p>가상 예시: 경쟁률 950:1(35점), 확약 12%(18점), 유통 27%(14점)이면 Q는 67점입니다. 명시 입장 표본이 없으면 공시 참고점수는 79점입니다. 독립 표본 5개 중 긍정 3·중립 1·주의 1이면 긍정 비율은 60%, 리뷰 기여는 9점이고 공시+리뷰 참고점수는 76점입니다. 원문에 미분류 2편이 더 있어도 분모는 5개입니다. 모두 설명용 수치입니다.</p>
            <p>실제로 중립 입장만 있는 경우는 표본이 없는 경우와 다릅니다. 중립만 있는 현재 표본은 긍정 비율 0%, 리뷰 기여 0점으로 공시 원점수 Q를 그대로 사용합니다. 서로 다른 산출 기준의 점수를 같은 기준처럼 비교하지 않도록 배지의 공시·리뷰 구분과 표본 수를 함께 확인하세요.</p>
            <p>S는 85점 이상, A는 75~84점, B는 60~74점, C는 60점 미만이라는 점수 구간입니다. 투자 추천이나 안전성 등급이 아닙니다. 공시 원문 검토 기록 또는 필수 수요예측 지표가 없으면 실제 리뷰가 있어도 점수는 산출 보류입니다. 누락된 수치에 임의의 평균 점수를 넣지 않으며, 확인된 확약 0%는 0점입니다. 공모가 상단 초과에 자동 가점을 주지 않습니다.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">계산기와 해설의 한계</h2>
            <p>계산기 기본값은 사용법을 위한 예시입니다. 기관 경쟁률로 비례 경쟁률을 추정하지 않습니다. 비례 이론 주수와 실제 배정은 다를 수 있으며 균등 배정도 보장되지 않습니다. 이자·수수료·매도 비용과 손실 시나리오를 함께 비교하세요.</p>
            <p>가이드의 수치 예시는 독자가 재현할 수 있도록 직접 계산한 설명용 사례입니다. 회사의 실제 실적이나 관측 통계로 제시하지 않습니다. 작성에 자동화 도구를 사용할 수 있으며 그 결과가 외부 금융 전문가의 검수를 뜻하지 않습니다.</p>
            <Link className="text-blue-700 underline" href="/calculator">가정을 바꿔 직접 계산하기 →</Link>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">정정과 변경 기록</h2>
            <p>2026-10-25: 출처 없는 잠정 점수와 여론 통계 노출 중단, 원금·배정·수익 보장 표현 수정, 계산 예시와 공식 자료 연결. 이후 실제 RSS·원문 근거를 저장하는 수집 절차와 중복·미분류·실패 보존 기준을 추가하고, 공시 85점·리뷰 최대 15점 및 무표본 환산 방식을 공개했습니다.</p>
            <p>잘못된 정보는 종목 또는 가이드 URL, 문제가 되는 문장, 확인 가능한 공시 원문을 함께 <a className="text-blue-700 underline" href="mailto:hanmanju88@gmail.com">hanmanju88@gmail.com</a>으로 알려주세요. 검토 결과에 따라 수정하고 주요 변경 이유를 기록합니다.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
