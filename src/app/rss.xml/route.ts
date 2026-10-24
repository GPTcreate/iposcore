import { NextResponse } from 'next/server';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { getAllGuides } from '@/data/guidesData';
import { isReviewedIpo } from '@/lib/contentQuality';

export const dynamic = 'force-dynamic';

export async function GET() {
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

  const ipoRssItems = getAllEffectiveIpos().filter(isReviewedIpo).map((ipo) => {
    const pubDate = new Date(ipo.dataQuality!.reviewedAt!).toUTCString();
    return `
    <item>
      <title><![CDATA[[공모주 분석] ${ipo.name} (${ipo.market}) 공시 확인]]></title>
      <link>${siteUrl}/ipo/${ipo.id}</link>
      <guid>${siteUrl}/ipo/${ipo.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${ipo.aiSummary.headline} | 확정공모가: ${ipo.confirmedPrice ? ipo.confirmedPrice.toLocaleString() + '원' : '미정'} | 청약기간: ${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd} | 주관사: ${ipo.underwriters.map(u => u.name).join(', ')}]]></description>
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
