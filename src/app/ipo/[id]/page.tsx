import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Header from '@/components/Header';
import ScoreBadge from '@/components/ScoreBadge';
import IpoCalculator from '@/components/IpoCalculator';
import DetailBackButton from '@/components/DetailBackButton';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import { getEffectiveIpoByIdOrCode, getAllEffectiveIpos } from '@/lib/ipoUtils';
import { LEGACY_CODE_ALIASES } from '@/lib/ipoStore';
import { isReviewedIpo, hasVerifiedForecast, isSpecificOfficialSourceUrl } from '@/lib/contentQuality';
import { calculateIpoScore } from '@/lib/scoring';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';

interface PageProps { params: Promise<{ id: string }> }
export const dynamicParams = true;
export const dynamic = 'force-dynamic';
const siteUrl = 'https://www.iposcore.kr';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  loadServerCustomIpos();
  const ipo = getEffectiveIpoByIdOrCode(id);
  if (!ipo) return { title: '종목 자료를 찾을 수 없습니다', robots: { index: false } };
  const reviewed = isReviewedIpo(ipo);
  const title = reviewed ? `${ipo.name} 공시 확인과 청약 조건` : `${ipo.name} 자료 확인 안내`;
  const description = reviewed
    ? `${ipo.name}의 원문 확인일과 공시 출처, 청약 조건 및 비용 계산을 확인합니다.`
    : `${ipo.name}의 기존 자료는 원문 대조 기록 확인 전입니다. 검증되지 않은 수치와 점수는 제공하지 않습니다.`;
  return {
    title, description,
    alternates: { canonical: `${siteUrl}/ipo/${ipo.id}` },
    robots: { index: reviewed, follow: true, googleBot: { index: reviewed, follow: true } },
    openGraph: { title, description, url: `${siteUrl}/ipo/${ipo.id}`, type: 'article' },
  };
}

export async function generateStaticParams() {
  return [
    ...getAllEffectiveIpos().flatMap((ipo) => [{ id: ipo.id }, { id: ipo.code }]),
    ...Object.keys(LEGACY_CODE_ALIASES).map((id) => ({ id })),
  ];
}

export default async function IpoDetailPage({ params }: PageProps) {
  const { id } = await params;
  loadServerCustomIpos();
  const ipo = getEffectiveIpoByIdOrCode(id);
  if (!ipo) notFound();
  if (id !== ipo.id) permanentRedirect(`/ipo/${ipo.id}`);

  if (!isReviewedIpo(ipo)) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <DetailBackButton />
          <article className="rounded-xl border border-gray-300 bg-white p-6 sm:p-8 space-y-5 text-sm leading-relaxed">
            <p className="text-amber-800 font-bold">공식 원문 대조 기록 확인 전</p>
            <h1 className="text-2xl sm:text-3xl font-black">{ipo.name} 자료 확인 안내</h1>
            <p>기존 자료에 공시 원문과 확인 기록이 갖춰지지 않아 일정·가격·점수·자동 요약을 제공하지 않습니다. 이 안내는 해당 회사의 공모 진행 여부나 취소를 의미하지 않습니다.</p>
            <p>청약 여부를 확인하려면 DART에서 회사명을 검색하고 최신 투자설명서의 정정 여부, 모집 조건, 일반 청약 일정과 주관사를 확인하세요. 증거금률·수수료·계좌 조건은 주관사 공고를 함께 확인해야 합니다.</p>
            <div className="flex flex-wrap gap-4 text-blue-700 font-semibold">
              <a className="underline" href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer">DART 공시 검색</a>
              <a className="underline" href="https://kind.krx.co.kr/" target="_blank" rel="noopener noreferrer">KIND 상장공시</a>
              <Link className="underline" href="/guides/dart-prospectus-reading-top-3-risk-factors">공시 확인 순서</Link>
              <Link className="underline" href="/methodology">자료 공개 기준</Link>
            </div>
            <p className="text-xs text-gray-500">검색 링크는 해당 종목의 원문을 확인했다는 표시가 아닙니다. 오류 제보에는 원문 접수번호를 함께 알려주세요.</p>
          </article>
          <Link className="inline-block text-blue-700 font-bold underline" href="/calculator">배정·비용 계산기 이용하기 →</Link>
        </main>
      </div>
    );
  }

  const forecast = hasVerifiedForecast(ipo);
  const score = calculateIpoScore(ipo);
  const sources = ipo.dataQuality!.sources!.filter((source) => isSpecificOfficialSourceUrl(source.url));
  const money = (value: number) => value > 0 ? `${value.toLocaleString('ko-KR')}원` : '미확인';
  const metrics = [
    ['청약 기간', `${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd}`],
    ['환불일 / 상장일', `${ipo.refundDate} / ${ipo.listingDate || '미확인'}`],
    ['공모가', ipo.confirmedPrice > 0 ? `${money(ipo.confirmedPrice)} (확정)` : `${money(ipo.priceBandMin)} ~ ${money(ipo.priceBandMax)} (희망)`],
    ['주관사', ipo.underwriters.map((u) => u.name).join(', ') || '미확인'],
    ['기관 수요예측 경쟁률', ipo.institutionalCompetitionRate > 0 ? `${ipo.institutionalCompetitionRate.toLocaleString()} : 1` : '미확인'],
    ['의무보유확약 / 유통가능 비율', forecast ? `${ipo.lockupCommitmentRate}% / ${ipo.circulatingSupplyRate}%` : '필수 지표 확인 전'],
  ];
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${ipo.name} 공시 확인과 청약 조건`,
    dateModified: ipo.dataQuality!.reviewedAt,
    author: { '@type': 'Organization', name: 'IPOScore 편집', url: `${siteUrl}/about` },
    mainEntityOfPage: `${siteUrl}/ipo/${ipo.id}`,
    citation: sources.map((source) => source.url),
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, '\\u003c') }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <DetailBackButton />
        <article className="bg-white border border-gray-300 rounded-xl p-6 sm:p-8 space-y-6">
          <header className="flex flex-col md:flex-row justify-between gap-5">
            <div className="space-y-2">
              <p className="text-xs text-blue-700 font-bold">{ipo.market} · {ipo.code}</p>
              <h1 className="text-2xl sm:text-3xl font-black">{ipo.name} 공시 확인과 청약 조건</h1>
              <p className="text-xs text-gray-600">IPOScore 편집 · 원문 확인일 {ipo.dataQuality!.reviewedAt}</p>
              <p className="text-xs text-gray-600">확인일 이후 정정될 수 있습니다. 신청 전 최신 공고를 확인하세요.</p>
            </div>
            <ScoreBadge score={score.score} grade={score.scoreGrade} isVerified={forecast} size="lg" />
          </header>
          {ipo.isCancelled && <p className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm">공모 철회 안내: {ipo.cancelReason || '연결된 원문의 철회 사유를 확인하세요.'}</p>}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">{metrics.map(([label, value]) => <div className="bg-gray-50 border border-gray-200 rounded-lg p-4" key={label}><dt className="text-xs text-gray-500 mb-2">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl>
          {forecast && <p className="text-xs text-gray-600 leading-relaxed">원점수: 경쟁률 {score.breakdown.competitionScore} + 확약 {score.breakdown.lockupScore} + 유통 {score.breakdown.circulatingScore}. 합계 ÷ 85 × 100을 반올림했습니다. 투자 수익을 예측하거나 청약을 추천하는 값이 아닙니다. <Link className="text-blue-700 underline" href="/methodology">전체 산식과 한계</Link></p>}
          <section className="space-y-3 border-t border-gray-200 pt-5">
            <h2 className="text-lg font-bold">확인한 원문</h2>
            <ul className="space-y-2 text-sm text-blue-700">{sources.map((source) => <li key={source.url}><a className="underline break-words" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
          </section>
          {ipo.aiSummary.bulletPoints.length > 0 && <section className="space-y-3 border-t border-gray-200 pt-5"><h2 className="text-lg font-bold">자료 해설</h2><ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">{ipo.aiSummary.bulletPoints.map((point, i) => <li key={i}>{point}</li>)}</ul></section>}
          {ipo.aiSummary.riskPoints.length > 0 && <section className="space-y-3"><h2 className="text-lg font-bold">추가 확인할 위험요소</h2><ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">{ipo.aiSummary.riskPoints.map((point, i) => <li key={i}>{point}</li>)}</ul></section>}
          {ipo.status === 'LISTED' && ipo.confirmedPrice > 0 && <section className="border-t border-gray-200 pt-5 space-y-3"><h2 className="text-lg font-bold">상장일 가격 비교</h2><p className="text-sm">시초가 {ipo.openingPrice ? money(ipo.openingPrice) : '미확인'} · 종가 {ipo.closingPrice ? money(ipo.closingPrice) : '미확인'}</p><p className="text-xs text-gray-600">공모가 대비 가격 차이는 실제 투자 수익과 다릅니다. 배정량과 이자·수수료·매도 비용이 추가로 반영됩니다.</p></section>}
        </article>
        {!ipo.isCancelled && <IpoCalculator initialPrice={ipo.confirmedPrice || undefined} initialProportionalCompetitionRate={ipo.subscriptionResults?.proportionalCompetitionRate} stockName={ipo.name} />}
        <GoogleAdSlot />
      </main>
    </div>
  );
}
