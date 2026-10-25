import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import VisitorBeacon from '@/components/VisitorBeacon';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import SiteFooter from '@/components/SiteFooter';
import AdSenseLoader from '@/components/AdSenseLoader';

const siteUrl = 'https://www.iposcore.kr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '공모주 점수·블로그 여론과 청약 계산기 | IPOScore',
    template: '%s | IPOScore',
  },
  description:
    '확인된 공시 기반 점수와 실제 블로그 원문·표본 내 의견, 공시 읽기 가이드와 배정·비용 계산 도구를 제공합니다.',
  keywords: [
    '공모주',
    '공모주 일정',
    '공모주 청약',
    '공모주 청약 일정',
    '2026 공모주 일정',
    '2026 공모주 청약 일정',
    '공모주 수요예측',
    '수요예측 결과',
    '기관 경쟁률',
    '의무보유확약',
    '의무보유확약 비율',
    '공모주 비례 계산기',
    '공모주 비례배정 계산기',
    '공모주 상장일',
    '공모주 청약 방법',
    '공모가 확정',
    '스팩 공모주',
    '코스닥 공모주',
    'IPO 일정',
    '주식 청약',
    'IPOScore',
  ],
  authors: [{ name: 'IPOScore 편집', url: siteUrl }],
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
    title: '공모주 공시 가이드와 배정·비용 계산기 | IPOScore',
    description:
      '공시 원문 확인 가이드와 배정·대출이자·손익 시뮬레이터',
    url: siteUrl,
    siteName: '공모주 알리미 리포트 (IPOScore)',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '공모주 알리미 리포트 - 공모주 공시 해설과 비용 계산',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '공모주 공시 가이드와 배정·비용 계산기 | IPOScore',
    description:
      '공모주 공시 해설과 균등·비례 배정 및 청약 비용 계산',
    images: [`${siteUrl}/og-image.png`],
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
      'naver-site-verification': [
        '18e7231084b093f99a51b01c7143edc2',
        '17e4d28137098909781e6fb70c5a646ea284f193',
      ],
    },
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '공모주 알리미 리포트 (IPOScore)',
    url: siteUrl,
    description: '공모주 공시 해설과 배정·비용 계산 도구',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IPOScore',
    url: siteUrl,
    email: 'hanmanju88@gmail.com',
    logo: `${siteUrl}/og-image.png`,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4909665367366825';
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SZCS9GN9SN';
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* RSS 및 사이트맵 자동 검색 메타 링크 */}
        <link rel="alternate" type="application/rss+xml" title="공모주 알리미 리포트 RSS 피드" href={`${siteUrl}/rss.xml`} />
        <link rel="sitemap" type="application/xml" title="Sitemap" href={`${siteUrl}/sitemap.xml`} />
        
        {/* 구글 서치콘솔 소유권 확인 메타 태그 */}
        {googleVerification && <meta name="google-site-verification" content={googleVerification} />}

        {/* 구글 애드센스 소유권 확인 메타 태그 & 스크립트 */}
        <meta name="google-adsense-account" content={adClient} />

        {/* 구조화 데이터 (JSON-LD) for Search Engine Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-100">
        <AdSenseLoader client={adClient} />
        <GoogleAnalytics gaId={gaMeasurementId} />
        <VisitorBeacon />
        {children}
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
