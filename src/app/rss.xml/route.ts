import { NextResponse } from 'next/server';
import { MOCK_IPOS } from '@/data/mockIpo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';
  
  const rssItems = MOCK_IPOS.map((ipo) => {
    const pubDate = new Date(ipo.subscriptionStart).toUTCString();
    return `
    <item>
      <title><![CDATA[[공모주 분석] ${ipo.name} (${ipo.market}) - ${ipo.scoreGrade}등급 (${ipo.aiScore}점)]]></title>
      <link>${siteUrl}/ipo/${ipo.code}</link>
      <guid>${siteUrl}/ipo/${ipo.code}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${ipo.aiSummary.headline} | 확정공모가: ${ipo.confirmedPrice ? ipo.confirmedPrice.toLocaleString() + '원' : '미정'} | 청약기간: ${ipo.subscriptionStart} ~ ${ipo.subscriptionEnd} | 주관사: ${ipo.underwriters.map(u => u.name).join(', ')}]]></description>
      <category>공모주</category>
    </item>`;
  }).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>공모주 알리미 리포트 (iposcore.kr)</title>
    <link>${siteUrl}</link>
    <description>실시간 공모주 청약 일정, 기관 수요예측 경쟁률, 의무보유확약 및 AI 종합 점수 리포트</description>
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
