import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { getGuideBySlug, getAllGuides } from '@/data/guidesData';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: '가이드를 찾을 수 없습니다 | IPOScore',
    };
  }

  const title = `${guide.title} | IPOScore 투자 가이드`;
  const description = guide.excerpt;

  return {
    title,
    description,
    keywords: [
      ...guide.tags,
      '공모주 가이드',
      '공모주 청약',
      'IPOScore',
    ],
    alternates: {
      canonical: `https://www.iposcore.kr/guides/${guide.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.iposcore.kr/guides/${guide.slug}`,
      type: 'article',
      images: ['https://www.iposcore.kr/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://www.iposcore.kr/og-image.png'],
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const allGuides = getAllGuides();
  const relatedGuides = allGuides
    .filter((g) => g.slug !== guide.slug)
    .sort((a, b) => Number(b.category === guide.category) - Number(a.category === guide.category))
    .slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    datePublished: new Date(guide.publishedAt).toISOString(),
    dateModified: new Date(guide.updatedAt).toISOString(),
    author: {
      '@type': 'Organization',
      name: guide.author,
      url: 'https://www.iposcore.kr/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'IPOScore',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.iposcore.kr/og-image.png',
      },
    },
    image: 'https://www.iposcore.kr/og-image.png',
    mainEntityOfPage: `https://www.iposcore.kr/guides/${guide.slug}`,
    citation: guide.sources.map((source) => source.url),
    inLanguage: 'ko-KR',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://www.iposcore.kr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '공모주 투자 가이드',
        item: 'https://www.iposcore.kr/guides',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: `https://www.iposcore.kr/guides/${guide.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 상단 네비게이션 & 뒤로가기 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-gray-600">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>가이드 목록으로 돌아가기</span>
          </Link>
          <div className="flex items-center gap-2 text-gray-400">
            <span>홈</span>
            <span>/</span>
            <span>투자 가이드</span>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-[140px] sm:max-w-xs">{guide.category}</span>
          </div>
        </div>

        {/* 아티클 메인 컨테이너 */}
        <article className="p-6 sm:p-10 rounded-xl bg-white border border-gray-300 shadow-2xs space-y-8">
          {/* 헤더 메타정보 */}
          <div className="border-b border-gray-200 pb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {guide.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>읽는 시간 {guide.readTime}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>내용 수정 <time dateTime={guide.updatedAt}>{guide.updatedAt}</time></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
              {guide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              {guide.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-700" />
                <span>작성: <Link href="/about" className="font-semibold text-blue-700 underline underline-offset-2">{guide.author}</Link></span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {guide.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 본문 요약 박스 */}
          <div className="p-4 sm:p-5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs sm:text-sm text-blue-900 leading-relaxed">
            <span className="font-bold block mb-1 flex items-center gap-1.5 text-blue-950">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>이 글에서 확인할 내용</span>
            </span>
            <p>{guide.excerpt}</p>
            <p className="mt-2 text-xs text-blue-800">본문의 계산 사례는 별도 명시가 없으면 가정한 수치입니다. 실제 종목의 가격·배정 결과나 수익 예측이 아닙니다.</p>
          </div>

          {/* 목차 (Table of Contents) */}
          <nav aria-label="본문 목차" className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm">
            <span className="font-bold text-gray-900 block mb-2">📌 본문 목차</span>
            <ul className="space-y-1.5 text-gray-700 font-medium">
              {guide.content.map((sec, idx) => (
                <li key={idx} className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                  <span className="text-blue-700 font-bold">{idx + 1}.</span>
                  <a href={`#sec-${idx}`}>{sec.sectionTitle.replace(/^\d+\.\s*/, '')}</a>
                </li>
              ))}
              <li><a href="#sources" className="text-blue-700 underline underline-offset-2">공식 출처와 확인 범위</a></li>
            </ul>
          </nav>

          {/* 본문 섹션 반복 */}
          <div className="space-y-10 text-sm sm:text-base text-gray-800 leading-relaxed">
            {guide.content.map((sec, idx) => (
              <section key={idx} id={`sec-${idx}`} className="space-y-4 pt-2 scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-b border-gray-200 pb-2.5 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-700 shrink-0" />
                  <span>{sec.sectionTitle}</span>
                </h2>

                <div className="space-y-3">
                  {sec.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed text-gray-700 font-normal">
                      {para}
                    </p>
                  ))}
                </div>

                {/* 콜아웃 박스 (Tip / Warning / Info) */}
                {sec.callout && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1 ${
                      sec.callout.type === 'tip'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : sec.callout.type === 'warning'
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-blue-50 border-blue-300 text-blue-900'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      {sec.callout.type === 'tip' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                      {sec.callout.type === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-700" />}
                      {sec.callout.type === 'info' && <Info className="w-4 h-4 text-blue-700" />}
                      <span>{sec.callout.title}</span>
                    </span>
                    <p className="whitespace-pre-line leading-relaxed font-medium">
                      {sec.callout.text}
                    </p>
                  </div>
                )}

                {/* 데이터 테이블 */}
                {sec.table && (
                  <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                      <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                        <tr>
                          {sec.table.headers.map((h, hIdx) => (
                            <th key={hIdx} scope="col" className="p-3 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-3 ${
                                  cIdx === 0 ? 'font-bold text-gray-900 whitespace-nowrap' : 'text-gray-700'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          <section id="sources" className="border-t border-gray-200 pt-6 space-y-4 scroll-mt-6">
            <h2 className="text-lg font-bold text-gray-900">공식 출처와 확인 범위</h2>
            <p className="text-xs text-gray-500 leading-relaxed">아래 자료의 제도·업무 안내를 참고해 IPOScore 편집이 설명과 계산 예시를 작성했습니다. 과거 공고 사례는 해당 공모의 조건이며, 현재 신청할 종목의 최신 공시와 증권사 공고를 우선 확인하세요.</p>
            <ul className="space-y-4">
              {guide.sources.map((source) => (
                <li key={source.url} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-semibold text-blue-700 underline underline-offset-2 break-words">
                    <span>{source.title}</span><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">{source.description}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">출처 확인 및 내용 수정: <time dateTime={guide.updatedAt}>{guide.updatedAt}</time> · 오류 제보: <a href={`mailto:hanmanju88@gmail.com?subject=${encodeURIComponent(`[가이드 수정] ${guide.title}`)}`} className="text-blue-700 underline break-all">hanmanju88@gmail.com</a></p>
          </section>

          {/* 아티클 하단 이용 안내 */}
          <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500 space-y-1.5 bg-gray-50/50 p-4 rounded-xl">
            <span className="font-bold text-gray-700 block">가이드 이용 안내</span>
            <p>
              청약 절차와 공시를 이해하기 위한 교육용 설명입니다. 배정·환불·권리 행사 조건은 종목과 증권사에 따라 다르며, 주가 하락과 자금 비용으로 손실이 발생할 수 있습니다. 특정 종목의 청약이나 매매 시점을 권하는 자료가 아닙니다.
            </p>
          </div>
        </article>

        {/* 연관 가이드 추천 */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-gray-300 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <span>함께 읽으면 좋은 추천 공모주 가이드</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedGuides.map((rel) => (
              <Link
                key={rel.slug}
                href={`/guides/${rel.slug}`}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] font-bold text-blue-700 block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>읽는 시간 {rel.readTime}</span>
                  <span className="text-blue-700 font-bold flex items-center">
                    읽기 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
