import type { IpoItem } from '@/types/ipo';
import { getCollectedReviews, summarizeReviews } from '@/lib/reviewEvidence';
import Link from 'next/link';

const timeLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));
const dayLabel = (value: string) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value));
const stanceLabel = { POSITIVE: '참여 언급', NEUTRAL: '관망·중립 언급', CAUTION: '불참·주의 언급', UNCLASSIFIED: '의견 미분류' };
const ratioLabel = (ratio: number | null) => ratio === null ? '—' : `${Number(ratio.toFixed(1))}%`;

export default function ReviewPanel({ ipo }: { ipo: IpoItem }) {
  const reviews = getCollectedReviews(ipo);
  const summary = summarizeReviews(ipo);
  const collection = ipo.reviewCollection;
  return (
    <section id="blog-reviews" className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 space-y-5" aria-labelledby="blog-reviews-heading">
      <header className="space-y-2">
        <h2 id="blog-reviews-heading" className="text-lg font-bold">블로그 리뷰</h2>
        {collection && <p className="text-xs text-gray-500">{summary.totalReviews}편 · 의견 표본 {summary.sampleSize}건 · {timeLabel(collection.collectedAt)} 수집</p>}
        {summary.stale && <p className="text-xs text-amber-800 rounded-lg bg-amber-50 border border-amber-200 p-3">{collection?.status === 'partial' ? '일부 채널 수집에 실패했습니다. 해당 채널의 이전 원문은 보존하지만 현재 여론 집계와 점수에서 제외했습니다.' : `최근 수집에 실패해 마지막 성공 자료를 표시합니다${collection?.lastSuccessfulAt ? ` (${timeLabel(collection.lastSuccessfulAt)})` : ''}. 현재 여론 집계와 점수에서는 제외했습니다.`}</p>}
      </header>
      {summary.sampleSize > 0 ? (
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="font-bold text-sm">확인한 표본 안의 의견 분포</p>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div><p className="font-bold text-blue-800">{summary.positiveCount}건 · {ratioLabel(summary.positiveRatio)}</p><p className="text-xs text-gray-600 mt-1">참여</p></div>
            <div><p className="font-bold text-gray-700">{summary.neutralCount}건 · {ratioLabel(summary.neutralRatio)}</p><p className="text-xs text-gray-600 mt-1">관망·중립</p></div>
            <div><p className="font-bold text-amber-800">{summary.cautionCount}건 · {ratioLabel(summary.cautionRatio)}</p><p className="text-xs text-gray-600 mt-1">불참·주의</p></div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">수집한 글의 의견 분포입니다. 미분류 {summary.unclassifiedCount}건 제외.</p>
        </div>
      ) : <p className="text-sm leading-relaxed text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">{reviews.length ? '관련 글을 모았습니다. 명시적인 참여·불참 의견은 아직 없습니다.' : collection?.status === 'failed' ? '이번 수집에 실패했습니다. 다시 확인하고 있습니다.' : '청약 전날 관련 글을 확인합니다.'}</p>}
      <div className="space-y-3">{reviews.map((review) => (
        <article key={review.url} className="rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500"><span className="font-semibold text-gray-800">{review.author}</span><time dateTime={review.publishedAt}>발행 {dayLabel(review.publishedAt)} (KST)</time><span>{stanceLabel[review.sentiment]}</span></div>
          <h3 className="font-bold text-sm leading-relaxed"><a className="text-blue-700 underline break-words" href={review.url} target="_blank" rel="noopener noreferrer">{review.title} ↗</a></h3>
          {review.evidence?.excerpt && <p className="text-xs text-gray-700 leading-relaxed"><span className="font-semibold">확인한 문장: </span>“{review.evidence.excerpt}”</p>}
          {(collection?.status === 'failed' || collection?.channels.some(channel => channel.status === 'failed' && channel.feedUrl === review.evidence?.feedUrl)) && <p className="text-[11px] text-amber-700">이전 수집 자료 · 현재 집계 제외</p>}
        </article>
      ))}</div>
      <details className="text-xs text-gray-500"><summary className="cursor-pointer">수집·분류 기준</summary><p className="mt-2 leading-relaxed">일정만 언급한 글도 포함하며 명시적인 참여 의견만 집계합니다. 같은 블로그·작성자는 최신 1편을 반영하고, 자동 분류는 문맥에 따라 틀릴 수 있습니다. 전체 투자자의 여론을 대표하지 않습니다. <Link href="/methodology#review-method" className="text-blue-700 underline">자세히 보기</Link></p></details>
    </section>
  );
}
