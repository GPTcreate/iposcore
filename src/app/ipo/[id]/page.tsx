import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Building2, CalendarDays, ChartColumn, FileText } from 'lucide-react';
import Header from '@/components/Header';
import ScoreBadge from '@/components/ScoreBadge';
import IpoCalculator from '@/components/IpoCalculator';
import DetailBackButton from '@/components/DetailBackButton';
import GoogleAdSlot from '@/components/GoogleAdSlot';
import ShareButtons from '@/components/ShareButtons';
import NewsletterBanner from '@/components/NewsletterBanner';
import ReviewPanel from '@/components/ReviewPanel';
import { getEffectiveIpoByIdOrCode, getAllEffectiveIpos } from '@/lib/ipoUtils';
import { LEGACY_CODE_ALIASES } from '@/lib/ipoStore';
import { getFieldEvidence, hasVerifiedForecast, isReviewedIpo, isSpecificOfficialSourceUrl } from '@/lib/contentQuality';
import { calculateIpoScore } from '@/lib/scoring';
import { isIndexableIpo } from '@/lib/publicIpo';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';
import { loadServerReviewArchive } from '@/lib/reviewArchiveServer';
import type { IpoEvidenceField, IpoItem } from '@/types/ipo';

interface PageProps { params: Promise<{ id: string }> }
export const dynamicParams = true;
export const dynamic = 'force-dynamic';
const siteUrl = 'https://www.iposcore.kr';
const statusLabels = { UPCOMING: '청약 예정', SUBSCRIPTION: '청약 진행 중', WAITING_LISTING: '상장 대기', LISTED: '상장 완료' };
const statusStyles = { UPCOMING: 'bg-blue-700', SUBSCRIPTION: 'bg-red-600', WAITING_LISTING: 'bg-gray-700', LISTED: 'bg-emerald-700' };
const formatNumber = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
const money = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? `${formatNumber(value)}원` : '미등록';
const amount = (value: number) => Number.isFinite(value) && value > 0 ? `${formatNumber(value)}억원` : '미등록';
const percentage = (value: number) => Number.isFinite(value) && value >= 0 ? `${formatNumber(value)}%` : '미등록';
const memoText = (value: string) => /(?:원금|이자|수익).{0,40}보장(?:되는|됩니다|한다|합니다|받는|하는)/.test(value)
  ? '원금·이자 반환 조건과 청약·거래 비용은 공시와 주관사 공고에서 확인할 사항입니다.' : value;

function FieldSource({ ipo, field }: { ipo: IpoItem; field?: IpoEvidenceField }) {
  const evidence = field ? getFieldEvidence(ipo, field) : undefined;
  if (!evidence) return null;
  return <a href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer" title={`${evidence.sourceTitle} · 확인일 ${evidence.checkedAt.slice(0, 10)}`} aria-label={`${evidence.sourceTitle} 원문, 확인일 ${evidence.checkedAt.slice(0, 10)}`} className="shrink-0 text-[11px] font-medium text-blue-700 underline">원문 ↗</a>;
}

function Metric({ label, children, ipo, field }: { label: string; children: ReactNode; ipo: IpoItem; field?: IpoEvidenceField }) {
  return <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 min-w-0"><dt className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-gray-500 mb-2"><span>{label}</span><FieldSource ipo={ipo} field={field} /></dt><dd className="font-bold text-sm sm:text-base text-gray-900 break-words">{children}</dd></div>;
}

function ListingPrice({ label, price, registeredRate, offerPrice }: { label: string; price?: number; registeredRate?: number; offerPrice: number }) {
  const hasPrice = typeof price === 'number' && Number.isFinite(price) && price > 0;
  const rate = hasPrice && offerPrice > 0 ? (price - offerPrice) / offerPrice * 100 : registeredRate;
  const difference = hasPrice && offerPrice > 0 ? price - offerPrice : undefined;
  const color = typeof rate === 'number' && rate > 0 ? 'text-rose-700' : typeof rate === 'number' && rate < 0 ? 'text-blue-700' : 'text-gray-700';
  return <div className="rounded-xl border border-emerald-200 bg-white p-5 space-y-2">
    <h3 className="text-sm font-bold text-gray-600">{label}</h3>
    <p className="text-2xl font-black">{money(price)}</p>
    <p className={`text-lg font-black ${color}`}>{typeof rate === 'number' && Number.isFinite(rate) ? `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%` : '수익률 미등록'}</p>
    {difference !== undefined && <p className={`text-sm font-semibold ${color}`}>공모가 대비 1주당 {difference > 0 ? '+' : ''}{formatNumber(difference)}원</p>}
  </div>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  loadServerCustomIpos();
  loadServerReviewArchive();
  const ipo = getEffectiveIpoByIdOrCode(id);
  if (!ipo) return { title: '종목 자료를 찾을 수 없습니다', robots: { index: false } };
  const title = `${ipo.name} 공모주 일정·참고점수·블로그 리뷰`;
  const indexable = isIndexableIpo(ipo);
  const description = `${ipo.name}의 등록된 청약 일정, 공모가, 주관사와 기관 지표·참고점수를 확인하고 실제 블로그 원문과 배정·손익 계산기를 이용하세요. 항목별 원문 확인 상태를 구분합니다.`;
  return {
    title, description,
    alternates: { canonical: `${siteUrl}/ipo/${ipo.id}` },
    robots: { index: indexable, follow: true, googleBot: { index: indexable, follow: true } },
    openGraph: { title, description, url: `${siteUrl}/ipo/${ipo.id}`, type: 'article' },
  };
}

export async function generateStaticParams() {
  return [
    ...getAllEffectiveIpos().flatMap((ipo) => [{ id: ipo.id }, ...(ipo.code ? [{ id: ipo.code }] : [])]),
    ...Object.keys(LEGACY_CODE_ALIASES).map((id) => ({ id })),
  ];
}

export default async function IpoDetailPage({ params }: PageProps) {
  const { id } = await params;
  loadServerCustomIpos();
  loadServerReviewArchive();
  const ipo = getEffectiveIpoByIdOrCode(id);
  if (!ipo) notFound();
  if (id !== ipo.id) permanentRedirect(`/ipo/${ipo.id}`);

  const reviewed = isReviewedIpo(ipo);
  const verifiedScore = hasVerifiedForecast(ipo);
  const score = calculateIpoScore(ipo);
  const fieldNames: IpoEvidenceField[] = ['subscriptionStart', 'subscriptionEnd', 'refundDate', 'listingDate', 'confirmedPrice', 'depositRatePercent', 'institutionalCompetitionRate', 'lockupCommitmentRate', 'circulatingSupplyRate'];
  const fieldSources = fieldNames.flatMap((field) => { const source = getFieldEvidence(ipo, field); return source ? [{ title: source.sourceTitle, url: source.sourceUrl }] : []; });
  const wholeSources = [...(ipo.dataQuality?.sources || []), ...(ipo.discovery ? [{ title: ipo.discovery.reportName, url: ipo.discovery.sourceUrl }] : [])].filter((source) => isSpecificOfficialSourceUrl(source.url));
  const sources = [...new Map([...fieldSources, ...wholeSources].map((source) => [source.url, source])).values()];
  const sourceCheckedDates = new Map(fieldNames.flatMap((field) => { const source = getFieldEvidence(ipo, field); return source ? [[source.sourceUrl, source.checkedAt.slice(0, 10)] as const] : []; }));
  const hasOfferingData = ipo.confirmedPrice > 0 || ipo.priceBandMin > 0 || ipo.institutionalCompetitionRate > 0 || ipo.totalOfferingAmount > 0;
  const depositRate = typeof ipo.depositRatePercent === 'number' && Number.isFinite(ipo.depositRatePercent) && ipo.depositRatePercent > 0 && ipo.depositRatePercent <= 100 ? ipo.depositRatePercent : undefined;
  const circulatingAmount = ipo.marketCapAtIpo > 0 && ipo.circulatingSupplyRate >= 0 && ipo.circulatingSupplyRate <= 100 ? ipo.marketCapAtIpo * ipo.circulatingSupplyRate / 100 : undefined;
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${ipo.name} 공모주 일정과 참고점수`,
    ...(reviewed && ipo.dataQuality?.reviewedAt ? { dateModified: ipo.dataQuality.reviewedAt } : {}),
    author: { '@type': 'Organization', name: 'IPOScore', url: `${siteUrl}/about` },
    mainEntityOfPage: `${siteUrl}/ipo/${ipo.id}`,
    ...(sources.length ? { citation: sources.map((source) => source.url) } : {}),
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, '\\u003c') }} />
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><DetailBackButton /><ShareButtons stockName={ipo.name} aiScore={score.basis === 'PENDING' ? undefined : score.score} scoreVerified={verifiedScore} /></div>

        <article className="bg-white border border-gray-300 rounded-xl p-5 sm:p-7 space-y-5">
          <header className="flex flex-col md:flex-row justify-between gap-5">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className={`rounded px-2.5 py-1 text-white ${ipo.isCancelled ? 'bg-rose-700' : statusStyles[ipo.status]}`}>{ipo.isCancelled ? '공모 철회' : statusLabels[ipo.status]}</span><span className="rounded border border-gray-200 bg-gray-100 px-2 py-1">{ipo.market === 'UNCONFIRMED' ? '시장 미확인' : ipo.market}</span>{ipo.code && <span className="text-gray-500">종목코드 {ipo.code}</span>}</div>
              <h1 className="text-2xl sm:text-3xl font-black break-words">{ipo.name} 공모주 분석</h1>
              <p className="text-sm text-gray-700 leading-relaxed">{memoText(ipo.aiSummary.headline)}</p>
              <p className={`text-xs ${reviewed ? 'text-blue-700' : 'text-gray-500'}`}>{reviewed ? `공시 원문 확인 · ${ipo.dataQuality?.reviewedAt?.slice(0, 10)}` : ipo.discovery && !isIndexableIpo(ipo) ? '공시 접수 · 일정 확인 중' : '등록자료'}</p>
            </div>
            <ScoreBadge score={score.score} grade={score.scoreGrade} isVerified={verifiedScore} size="lg" basis={score.basis} sampleSize={score.sampleSize} />
          </header>
          {ipo.isCancelled && <p className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm leading-relaxed">공모 철회 등록 안내: {ipo.cancelReason || '최신 공시에서 진행 상태와 철회 사유를 확인하세요.'}</p>}
          <nav className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200 pt-4 text-xs font-semibold text-blue-700"><a href="#ipo-schedule" className="underline">일정·공모가</a><a href="#ipo-metrics" className="underline">기관·유통 지표</a><a href="#ipo-underwriters" className="underline">주관사·수수료</a><a href="#ipo-calculator" className="underline">배정·손익 계산</a><a href="#blog-reviews" className="underline">블로그 리뷰</a></nav>
        </article>

        <section id="ipo-schedule" className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarDays className="w-5 h-5 text-blue-700" />청약 일정과 공모가</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="청약 시작" ipo={ipo} field="subscriptionStart">{ipo.subscriptionStart || '일정 확인 중'}</Metric>
            <Metric label="청약 마감" ipo={ipo} field="subscriptionEnd">{ipo.subscriptionEnd || '일정 확인 중'}</Metric>
            <Metric label="환불일" ipo={ipo} field="refundDate">{ipo.refundDate || '일정 확인 중'}</Metric>
            <Metric label="상장일" ipo={ipo} field="listingDate">{ipo.listingDate || '일정 확인 중'}</Metric>
            <Metric label={ipo.confirmedPrice > 0 ? '확정 공모가' : '공모가 확정 전'} ipo={ipo} field="confirmedPrice">{ipo.confirmedPrice > 0 ? money(ipo.confirmedPrice) : '미확정'}</Metric>
            <Metric label="청약 증거금률" ipo={ipo} field="depositRatePercent">{depositRate === undefined ? '종목별 조건 확인 중' : percentage(depositRate)}</Metric>
            <Metric label="희망 공모가 하단" ipo={ipo}>{money(ipo.priceBandMin)}</Metric>
            <Metric label="희망 공모가 상단" ipo={ipo}>{money(ipo.priceBandMax)}</Metric>
            <Metric label="주관 증권사" ipo={ipo}>{ipo.underwriters.map((underwriter) => underwriter.name).join(', ') || '주관사 확인 중'}</Metric>
          </dl>
        </section>

        {!ipo.isCancelled && ipo.status === 'LISTED' && <section className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 sm:p-7 space-y-4">
          <header className="flex flex-wrap gap-2 items-baseline justify-between"><h2 className="text-lg font-bold">상장일 가격·수익률</h2><p className="text-xs text-gray-600">공모가 {money(ipo.confirmedPrice)} 대비 · 상장일 {ipo.listingDate || '미등록'}</p></header>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><ListingPrice label="상장일 시초가" price={ipo.openingPrice} registeredRate={ipo.openingReturnRate} offerPrice={ipo.confirmedPrice} /><ListingPrice label="상장일 종가" price={ipo.closingPrice} registeredRate={ipo.closingReturnRate} offerPrice={ipo.confirmedPrice} /></div>
        </section>}

        <section id="ipo-metrics" className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold"><ChartColumn className="w-5 h-5 text-blue-700" />기관 수요예측과 유통 지표</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Metric label="기관 수요예측 경쟁률" ipo={ipo} field="institutionalCompetitionRate">{!ipo.pendingForecastFields?.includes('institutionalCompetitionRate') && ipo.institutionalCompetitionRate > 0 ? `${formatNumber(ipo.institutionalCompetitionRate)} : 1` : '결과 확인 중'}</Metric>
            <Metric label="의무보유확약 비율" ipo={ipo} field="lockupCommitmentRate">{hasOfferingData && !ipo.pendingForecastFields?.includes('lockupCommitmentRate') ? percentage(ipo.lockupCommitmentRate) : '결과 확인 중'}</Metric>
            <Metric label="상장일 유통가능 비율" ipo={ipo} field="circulatingSupplyRate">{!ipo.pendingForecastFields?.includes('circulatingSupplyRate') && ipo.circulatingSupplyRate > 0 ? percentage(ipo.circulatingSupplyRate) : '비율 확인 중'}</Metric>
            <Metric label="총 공모금액" ipo={ipo}>{amount(ipo.totalOfferingAmount)}</Metric>
            <Metric label="공모가 기준 시가총액" ipo={ipo}>{amount(ipo.marketCapAtIpo)}</Metric>
            <Metric label="유통가능 금액 (계산)" ipo={ipo}>{circulatingAmount === undefined ? '계산 자료 미등록' : `약 ${amount(circulatingAmount)}`}</Metric>
          </dl>
        </section>

        <section id="ipo-underwriters" className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Building2 className="w-5 h-5 text-blue-700" />주관사별 배정 수량과 청약 수수료</h2>
          <div className="overflow-x-auto"><table className="w-full min-w-[320px] text-sm text-left"><thead className="border-b border-gray-300 bg-gray-50 text-xs text-gray-600"><tr><th className="p-3">주관 증권사</th><th className="p-3 text-right">등록 배정 수량</th><th className="p-3 text-right">등록 수수료</th></tr></thead><tbody>{ipo.underwriters.map((underwriter, index) => <tr key={`${underwriter.name}-${index}`} className="border-b border-gray-200"><th className="p-3 font-semibold">{underwriter.name}</th><td className="p-3 text-right">{underwriter.allocatedShares > 0 ? `${formatNumber(underwriter.allocatedShares)}주` : '미등록'}</td><td className="p-3 text-right">{Number.isFinite(underwriter.fee) && underwriter.fee >= 0 ? `${formatNumber(underwriter.fee)}원` : '미등록'}</td></tr>)}</tbody></table></div>
          {!ipo.underwriters.length && <p className="text-sm text-gray-500">등록된 주관사 정보가 없습니다.</p>}
          {ipo.subscriptionResults && <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2"><h3 className="font-bold text-sm">등록된 청약 결과</h3><dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {ipo.subscriptionResults.totalAccounts !== undefined && <div><dt className="text-gray-500">청약 건수</dt><dd className="font-semibold mt-1">{formatNumber(ipo.subscriptionResults.totalAccounts)}건</dd></div>}
            {ipo.subscriptionResults.equalAllocationShares !== undefined && <div><dt className="text-gray-500">균등 배정 기록</dt><dd className="font-semibold mt-1">{formatNumber(ipo.subscriptionResults.equalAllocationShares)}주</dd></div>}
            {ipo.subscriptionResults.proportionalCompetitionRate !== undefined && <div><dt className="text-gray-500">비례 경쟁률</dt><dd className="font-semibold mt-1">{formatNumber(ipo.subscriptionResults.proportionalCompetitionRate)} : 1</dd></div>}
          </dl></div>}
        </section>

        {(ipo.aiSummary.bulletPoints.length > 0 || ipo.aiSummary.positivePoints.length > 0 || ipo.aiSummary.riskPoints.length > 0) && <section className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold"><FileText className="w-5 h-5 text-blue-700" />핵심 체크포인트</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ title: '주의할 점', points: ipo.aiSummary.riskPoints }, { title: '관심 요인', points: ipo.aiSummary.positivePoints }].filter((group) => group.points.length).map((group) => <div key={group.title} className="rounded-lg border border-gray-200 bg-gray-50 p-4"><h3 className="font-bold text-sm mb-2">{group.title}</h3><ul className="list-disc pl-4 text-xs leading-relaxed space-y-2">{group.points.map((point, index) => <li key={index}>{memoText(point)}</li>)}</ul></div>)}</div>
          {ipo.aiSummary.bulletPoints.length > 0 && <details className="border-t border-gray-200 pt-3"><summary className="cursor-pointer text-xs font-semibold text-gray-600">분석 메모 더 보기</summary><ul className="mt-3 list-disc pl-5 text-sm leading-relaxed space-y-2">{ipo.aiSummary.bulletPoints.map((point, index) => <li key={index}>{memoText(point)}</li>)}</ul></details>}
        </section>}

        <details className="rounded-xl border border-gray-300 bg-white p-5 sm:px-7">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600">출처·산식·이용 안내</summary>
          <div className="mt-4 space-y-5 text-xs text-gray-600 leading-relaxed">
            {sources.length > 0 && <section className="space-y-2"><h3 className="font-bold text-gray-800">공시 원문</h3><ul className="space-y-2">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-words">{source.title} ↗</a>{sourceCheckedDates.has(source.url) && <span className="ml-2 text-gray-500">확인일 {sourceCheckedDates.get(source.url)}</span>}</li>)}</ul><p>원문 링크는 확인한 항목의 근거이며, 이후 정정이나 다른 조건까지 확인했다는 뜻은 아닙니다.</p></section>}
            <section className="space-y-2"><h3 className="font-bold text-gray-800">점수·계산 기준</h3>
              {score.basis === 'PENDING' ? <p>기관 경쟁률·확약·유통 비율이 갖춰지면 참고점수를 계산합니다.</p> : <p>경쟁률 {score.breakdown.competitionScore} + 확약 {score.breakdown.lockupScore} + 유통 {score.breakdown.circulatingScore} = {score.quantitativeRawScore} / 85점.
                {score.basis === 'COMBINED' ? ` 명시 입장 표본 ${score.sampleSize}건의 참여 비율을 기준으로 리뷰 ${Number(score.breakdown.sentimentScore.toFixed(2))}점을 더했습니다.` : ' 분류 표본이 없어 정량 합계를 100점으로 환산했습니다.'}
                {' '}<Link href="/methodology" className="text-blue-700 underline">전체 산식</Link></p>}
              <p>유통가능 금액 = 등록 시가총액 × 유통가능 비율 ÷ 100. 확약은 신청·배정 기준을 구분하며, 보호예수 비율과 유통가능 비율은 다릅니다.</p>
            </section>
            <section className="space-y-2"><h3 className="font-bold text-gray-800">자료 이용 안내</h3><ul className="list-disc pl-4 space-y-2">
              <li>일정과 공모 조건은 정정될 수 있습니다. 청약 시간·계좌 조건·최종 일정은 주관사 최신 공고를 확인하세요.</li>
              <li>등록 수수료는 온라인·영업점·고객등급·면제 조건에 따라 달라집니다. 배정 수량의 구분과 실제 비용은 주관사 공고를 따릅니다.</li>
              <li>상장 가격 대비 차이는 배정량·이자·청약 수수료·매도 비용을 반영한 실제 수익과 다릅니다.</li>
              {!reviewed && <li>분석 메모는 등록자료를 정리한 내용입니다. 해석과 전망은 확정 사실이나 청약 추천이 아닙니다.</li>}
            </ul></section>
          </div>
        </details>

        <div id="ipo-calculator" className="space-y-3">{!ipo.isCancelled ? <>
          {ipo.confirmedPrice <= 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{ipo.priceBandMax > 0 ? `공모가 미확정 · 희망밴드 상단 ${money(ipo.priceBandMax)} 기준으로 시작합니다.` : '공모 조건 확인 중 · 예시 값으로 계산합니다.'}</p>}
          <IpoCalculator initialPrice={ipo.confirmedPrice || ipo.priceBandMax || undefined} initialProportionalCompetitionRate={ipo.subscriptionResults?.proportionalCompetitionRate} initialDepositRatePercent={depositRate} stockName={ipo.name} />
        </> : <Link href="/calculator" className="text-sm font-bold text-blue-700 underline">다른 청약 가정으로 배정·손익 계산하기 →</Link>}</div>
        <ReviewPanel ipo={ipo} />
        <NewsletterBanner />
        <GoogleAdSlot />
      </main>
    </div>
  );
}
