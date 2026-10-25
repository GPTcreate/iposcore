import { NextResponse } from 'next/server';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { getAllGuides } from '@/data/guidesData';
import { isReviewedIpo } from '@/lib/contentQuality';
import { isPublicIpo } from '@/lib/publicIpo';
import { summarizeReviews } from '@/lib/reviewEvidence';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';
import { loadServerReviewArchive } from '@/lib/reviewArchiveServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  loadServerCustomIpos();
  loadServerReviewArchive();
  const siteUrl = 'https://www.iposcore.kr';
  
  const guideRssItems = getAllGuides().map((guide) => {
    const pubDate = new Date(guide.publishedAt).toUTCString();
    return `
    <item>
      <title><![CDATA[[투자 가이드] ${guide.title}]]></title>
      <link>${siteUrl}/guides/${guide.slug}</link>
      <guid>${siteUrl}/guides/${guide.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${guide.excerpt}]]></description>
      <category>${guide.category}</category>
    </item>`;
  }).join('');

  const ipoRssItems = getAllEffectiveIpos().filter(isPublicIpo).map((ipo) => {
    const pubDate = new Date(ipo.reviewCollection?.lastSuccessfulAt || ipo.dataQuality!.reviewedAt!).toUTCString();
    const reviews = summarizeReviews(ipo);
    const description = `실제 블로그 원문 ${reviews.totalReviews}건 · 의견 분류 표본 ${reviews.sampleSize}건. ${isReviewedIpo(ipo) ? '공시 원문 확인 자료를 함께 제공합니다.' : '공시 수치와 점수는 원문 검토 전입니다.'}`;
    return `
    <item>
      <title><![CDATA[[공모주 자료] ${ipo.name} 원문과 블로그 리뷰]]></title>
      <link>${siteUrl}/ipo/${ipo.id}</link>
      <guid>${siteUrl}/ipo/${ipo.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category>공모주</category>
    </item>`;
  }).join('');

  const rssItems = `${guideRssItems}\n${ipoRssItems}`;

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>공모주 알리미 리포트 (iposcore.kr)</title>
    <link>${siteUrl}</link>
    <description>공모주 공시 읽기 가이드, 원문 확인 자료와 배정·비용 계산 도구</description>
    <language>ko</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
