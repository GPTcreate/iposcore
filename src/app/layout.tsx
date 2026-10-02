import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';

const siteUrl = 'https://iposcore.kr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '공모주 알리미 리포트 | 실시간 공모주 청약 일정 & AI 분석',
    template: '%s | 공모주 알리미 리포트',
  },
  description:
    '실시간 공모주 청약 일정, DART 기관 수요예측 경쟁률, 의무보유확약, 비례배정 계산기 및 전문가 AI 종합 점수(1~100점)를 한눈에 확인하세요.',
  keywords: [
    '공모주',
    '공모주 일정',
    '공모주 청약',
    '2026 공모주 일정',
    '수요예측 결과',
    '기관 경쟁률',
    '의무보유확약',
    '공모주 비례 계산기',
    '공모주 상장일',
    'IPO 일정',
    '주식 청약',
  ],
  authors: [{ name: '공모주 알리미 팀', url: siteUrl }],
  creator: '공모주 알리미',
  publisher: '공모주 알리미 리포트',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: '공모주 알리미 리포트 | 실시간 공모주 청약 일정 & AI 분석',
    description:
      '공모주 청약 일정, 기관 경쟁률, 비례배정 계산기 및 유튜브·블로그 전문가 AI 요약 분석 리포트',
    url: siteUrl,
    siteName: '공모주 알리미 리포트',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '공모주 알리미 리포트 | 실시간 공모주 청약 일정 & AI 분석',
    description:
      '실시간 공모주 청약 일정, 기관 수요예측 경쟁률, 비례배정 계산기 및 전문가 AI 요약',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification': '17e4d28137098909781e6fb70c5a646ea284f193',
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '공모주 알리미 리포트',
  alternateName: 'iposcore.kr',
  url: siteUrl,
  description:
    '실시간 공모주 청약 일정, DART 기관 수요예측 경쟁률, 의무보유확약, 비례배정 계산기 및 전문가 AI 종합 점수를 제공하는 금융 포털.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4909665367366825';

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 구글 서치콘솔 / 네이버 웹마스터 기본 메타 태그 */}
        <meta name="naver-site-verification" content="17e4d28137098909781e6fb70c5a646ea284f193" />
        <meta name="google-site-verification" content="google-search-console-verification" />
        
        {/* 구글 애드센스 소유권 확인 메타 태그 & 스크립트 */}
        <meta name="google-adsense-account" content="ca-pub-4909665367366825" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          crossOrigin="anonymous"
        />

        {/* 구조화 데이터 (JSON-LD) for Search Engine Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-100">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
