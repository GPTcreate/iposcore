import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';

const pageUrl = 'https://www.iposcore.kr/research/iam-spac1-float';
const title = '아이엠1호스팩 공시 읽기: 4.58%와 95.42%를 구분하는 법';
const description = '아이엠기업인수목적1호의 DART 공시에서 유통가능 주식과 보호예수를 구분하고, 공모가 기준 유통금액과 최소 청약 증거금을 직접 계산합니다.';
const sources = [
  {
    id: 'source-oct08',
    date: '2026-10-08',
    title: 'DART 정정 증권신고서(지분증권)',
    receiptNumber: '20261008000225',
    url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261008000225',
    scope: '제1부의 공모 전 주주 보호예수 항목: 상장예정 주식 수, 유통가능 주식 수, 기존 주주 주식과 전환사채의 보호예수.',
  },
  {
    id: 'source-oct22',
    date: '2026-10-22',
    title: 'DART 발행조건확정 증권신고서(지분증권)',
    receiptNumber: '20261022000373',
    url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373',
    scope: '정정 후 확정 공모가, 기관 수요예측 결과와 기간별 의무보유확약 신청 내역, 일반청약자 배정 수량과 증거금률. 그 외 사항은 10월 8일 신고서와 같다는 문구를 확인.',
  },
  {
    id: 'source-oct23',
    date: '2026-10-23',
    title: 'iM증권: 아이엠기업인수목적1호 코스닥시장 상장 일반공모 안내',
    receiptNumber: null,
    url: 'https://ww2.imfnsec.com/research/bussiness_indust/re020301.jsp?bid=C_A001&aid=4922',
    scope: '개별 공모 공지 본문의 공모가, 공모 주식 수, 일반투자자 증거금률과 최소 청약 수량. 첨부 투자설명서 PDF 전체의 검토를 뜻하지 않음.',
  },
] as const;

const listedShares = 5240000;
const floatShares = 5000000;
const restrictedShares = 240000;
const offerPrice = 2000;
const floatPercent = floatShares / listedShares * 100;
const restrictedPercent = restrictedShares / listedShares * 100;
const floatAmount = floatShares * offerPrice;
const minimumShares = 10;
const depositRatePercent = 100;
const minimumDeposit = minimumShares * offerPrice * depositRatePercent / 100;
const format = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'article',
    title,
    description,
    url: pageUrl,
    publishedTime: '2026-10-25',
    modifiedTime: '2026-10-25',
    images: ['https://www.iposcore.kr/og-image.png'],
  },
};

export default function IamSpacFloatResearchPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: '2026-10-25',
    dateModified: '2026-10-25',
    author: { '@type': 'Organization', name: 'IPOScore', url: 'https://www.iposcore.kr/about' },
    publisher: { '@type': 'Organization', name: 'IPOScore', url: 'https://www.iposcore.kr' },
    mainEntityOfPage: pageUrl,
    citation: sources.map((source) => source.url),
    inLanguage: 'ko-KR',
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c') }} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <article className="space-y-8 rounded-xl border border-gray-300 bg-white p-5 text-sm leading-relaxed sm:p-8">
          <header className="space-y-3">
            <nav aria-label="현재 위치" className="flex flex-wrap gap-2 text-xs text-gray-500"><Link href="/" className="underline">홈</Link><span aria-hidden="true">/</span><Link href="/guides" className="underline">공시 읽기와 청약 가이드</Link><span aria-hidden="true">/</span><span>공시 읽기 사례</span></nav>
            <p className="text-xs font-bold text-blue-700">실제 공시 읽기 사례 · 원문 확인 및 작성 <time dateTime="2026-10-25">2026-10-25</time> · IPOScore</p>
            <h1 className="text-2xl font-black leading-snug sm:text-3xl">{title}</h1>
            <p className="text-base text-gray-700">아이엠기업인수목적1호의 신고서에 나오는 4.58%는 공모 전 주주가 가진 주식의 비율입니다. 같은 표에서 상장 직후 유통가능한 공모 주식은 95.42%입니다. 비율 옆의 주식 수와 보호예수 조건을 함께 읽어야 두 숫자의 의미를 구분할 수 있습니다.</p>
          </header>

          <section className="space-y-4" aria-labelledby="float-reading">
            <h2 id="float-reading" className="text-lg font-bold">1. 비율의 이름부터 확인하기</h2>
            <p><a href="#source-oct08" className="font-semibold text-blue-700 underline">10월 8일 정정 신고서</a>는 상장예정 보통주를 {format(listedShares)}주로 기재합니다. 그중 공모 주식 {format(floatShares)}주는 상장 직후 유통가능하고, 공모 전 주주의 보통주 {format(restrictedShares)}주는 보호예수 대상으로 설명합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-xs sm:text-sm">
                <caption className="mb-2 text-left text-xs text-gray-500">원문 기재 사실 · 2026-10-08 정정 신고서의 공모 전 주주 보호예수 항목</caption>
                <thead className="border-b border-gray-300 bg-gray-50"><tr><th scope="col" className="p-3">구분</th><th scope="col" className="p-3">주식 수</th><th scope="col" className="p-3">상장예정 주식 대비</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><th scope="row" className="p-3 font-medium">공모 주식 · 상장 직후 유통가능</th><td className="p-3">{format(floatShares)}주</td><td className="p-3 font-bold text-blue-800">{format(floatPercent)}%</td></tr>
                  <tr><th scope="row" className="p-3 font-medium">공모 전 주주 보통주 · 보호예수</th><td className="p-3">{format(restrictedShares)}주</td><td className="p-3 font-bold text-gray-800">{format(restrictedPercent)}%</td></tr>
                  <tr className="bg-gray-50"><th scope="row" className="p-3 font-medium">상장예정 보통주 합계</th><td className="p-3">{format(listedShares)}주</td><td className="p-3">100%</td></tr>
                </tbody>
              </table>
            </div>
            <figure className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div role="img" aria-label="상장예정 보통주 중 공모 주식 95.42%, 공모 전 주주 주식 4.58%" className="flex h-8 overflow-hidden rounded-md"><div className="bg-blue-700" style={{ width: `${floatPercent}%` }} /><div className="bg-gray-400" style={{ width: `${restrictedPercent}%` }} /></div>
              <figcaption className="flex flex-wrap justify-between gap-2 text-xs text-gray-600"><span>파란색: 유통가능 공모 주식 {format(floatPercent)}%</span><span>회색: 보호예수 보통주 {format(restrictedPercent)}%</span></figcaption>
            </figure>
            <p>공모 전 주주의 보통주에는 합병신주 상장 후까지 이어지는 보호예수 조건이 붙습니다. 신고서는 전환사채의 전환가능 주식 {format(1760000)}주도 별도로 설명합니다. 전환사채까지 모두 전환했다고 가정한 주식 수와 이 표의 상장예정 보통주 수는 기준이 다르므로 분모를 섞지 않아야 합니다.</p>
            <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-gray-700">4.58%를 유통가능비율로 옮겨 적으면, 보호예수 대상과 매도 가능한 주식을 뒤바꾸게 됩니다. 원문의 열 제목과 수량을 먼저 확인한 뒤 비율을 계산하세요.</p>
          </section>

          <section className="space-y-3" aria-labelledby="float-calculation">
            <h2 id="float-calculation" className="text-lg font-bold">2. 직접 계산하면 유통가능 금액은 100억원</h2>
            <p><a href="#source-oct22" className="font-semibold text-blue-700 underline">10월 22일 발행조건확정 신고서</a>는 1주당 공모가를 {format(offerPrice)}원으로 확정했습니다. 다음은 공시에서 확인한 수량과 공모가를 대입한 파생 계산입니다.</p>
            <dl className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div><dt className="font-semibold">상장예정 주식 대비 유통가능 비율</dt><dd className="text-gray-700">{format(floatShares)}주 ÷ {format(listedShares)}주 × 100 = 약 {format(floatPercent)}%</dd></div>
              <div><dt className="font-semibold">공모 전 주주 보통주 비율</dt><dd className="text-gray-700">{format(restrictedShares)}주 ÷ {format(listedShares)}주 × 100 = 약 {format(restrictedPercent)}%</dd></div>
              <div><dt className="font-semibold">공모가 기준 유통가능 금액</dt><dd className="text-gray-700">{format(floatShares)}주 × {format(offerPrice)}원 = {format(floatAmount)}원, 즉 {format(floatAmount / 100000000)}억원</dd></div>
            </dl>
            <p>100억원은 해당 수량을 공모가로 평가한 금액입니다. 상장일의 실제 거래대금이나 특정 가격에서 실제 매도될 물량을 뜻하지 않습니다. 기관 배정 이후의 의무보유나 후속 공시가 반영되면 상장 시점에 확인해야 할 유통 조건도 달라질 수 있습니다.</p>
          </section>

          <section className="space-y-3" aria-labelledby="demand-and-commitment">
            <h2 id="demand-and-commitment" className="text-lg font-bold">3. 경쟁률 1,266.52:1과 확약 신청 내역을 함께 읽기</h2>
            <p>10월 22일 신고서에는 기관 수요예측 참여 {format(1869)}건, 총 신청 {format(4749432000)}주, 경쟁률 1,266.52:1이 기재되어 있습니다. 경쟁률의 기준 물량은 기관투자자 배정 {format(3750000)}주입니다. 이 수치를 일반 청약의 비례 경쟁률로 사용하면 배정 계산의 기준이 달라집니다.</p>
            <p>같은 신고서의 기간별 의무보유확약 참여표는 신청 물량을 미확약으로 분류하고, 15일·1개월·3개월·6개월 확약 칸을 모두 없는 것으로 표시합니다. 이를 <strong>수요예측 신청 수량 기준</strong>으로 계산하면 확약 신청 비율은 0%입니다. 기관에 최종 배정한 물량의 확약 비율은 이 신청표만으로 확정할 수 없습니다.</p>
            <p>경쟁률은 신청 물량의 크기를, 확약은 일정 기간 보유하겠다는 조건을 보여 줍니다. 높은 경쟁률 한 숫자만으로 상장 직후 매도 가능한 물량까지 판단할 수 없습니다. 신청 기준과 배정 기준, 주식 수의 기준일을 맞춰 읽는 것이 이 사례의 핵심입니다.</p>
          </section>

          <section className="space-y-3" aria-labelledby="deposit-example">
            <h2 id="deposit-example" className="text-lg font-bold">4. 증거금률 100%라면 10주 청약 증거금은 2만원</h2>
            <p><a href="#source-oct23" className="font-semibold text-blue-700 underline">10월 23일 iM증권 개별 공모 안내</a>의 일반투자자 증거금률은 {depositRatePercent}%, 최소 청약 수량은 {minimumShares}주입니다. 10월 22일 신고서의 정정 후 증거금률도 100%입니다.</p>
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-semibold">공시 조건 대입: {format(offerPrice)}원 × {minimumShares}주 × {depositRatePercent}% = {format(minimumDeposit)}원</p>
            <p>최소 청약 수량은 신청 단위입니다. 10주를 신청했다고 10주를 배정받는 것은 아니며, 균등 배정 결과도 보장되지 않습니다. 청약 수수료는 계좌 등급과 신청 경로에 따라 적용 조건이 달라질 수 있으므로 주관사의 해당 공고와 수수료 안내를 확인하세요.</p>
            <Link href="/calculator" className="inline-block font-semibold text-blue-700 underline">증거금률과 비용을 바꿔 계산하기 →</Link>
          </section>

          <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4" aria-labelledby="review-scope">
            <h2 id="review-scope" className="text-base font-bold text-gray-900">확인 범위와 이후에 볼 내용</h2>
            <p>이 글은 2026-10-25에 아래 세 문서의 해당 항목을 확인한 공시 해설입니다. 10월 22일 문서에는 정정 사항 이외의 내용은 10월 8일 신고서와 같다고 기재되어 있어 함께 읽었습니다.</p>
            <p>이후 정정 공시의 존재 여부, 종목코드, KIND의 최종 상장 공고는 이 글에서 확인하지 않았습니다. 따라서 전체 청약 일정·상장 조건을 검증한 종합 청약 안내로 사용할 수 없습니다. 실제 신청 전에는 최신 투자설명서와 주관사 공고를 다시 확인하세요.</p>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-6" aria-labelledby="original-sources">
            <h2 id="original-sources" className="text-lg font-bold">직접 확인할 원문</h2>
            <ol className="space-y-4">
              {sources.map((source, index) => (
                <li key={source.id} id={source.id} className="scroll-mt-8 rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold"><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{index + 1}. {source.title}</a></p>
                  <p className="mt-1 text-xs text-gray-500">문서일 {source.date}{source.receiptNumber ? ` · 접수번호 ${source.receiptNumber}` : ' · 개별 공모 공지'} · 확인일 2026-10-25</p>
                  <p className="mt-2 text-gray-600">{source.scope}</p>
                </li>
              ))}
            </ol>
          </section>

          <nav aria-label="관련 자료" className="flex flex-wrap gap-x-5 gap-y-3 border-t border-gray-200 pt-5 font-semibold text-blue-700"><Link href="/guides/dart-prospectus-reading-top-3-risk-factors" className="underline">투자설명서 위험 요소 읽기</Link><Link href="/methodology" className="underline">출처와 계산 기준</Link></nav>
        </article>
      </main>
    </div>
  );
}
