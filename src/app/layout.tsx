import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import VisitorBeacon from '@/components/VisitorBeacon';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const siteUrl = 'https://iposcore.kr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '공모주 청약 일정 & AI 분석 리포트 - 실시간 수요예측 경쟁률·비례 계산기 | IPOScore',
    template: '%s | IPOScore',
  },
  description:
    '2026년 실시간 공모주 청약 일정 캘린더, DART 전자공시 기관 수요예측 경쟁률, 의무보유확약 비율, 비례배정 5사6입 계산기 및 전문가 AI 종합 점수를 한눈에 확인하세요.',
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
    title: '공모주 청약 일정 & AI 분석 리포트 | IPOScore',
    description:
      '실시간 공모주 청약 일정 캘린더, DART 기관 수요예측 경쟁률, 의무보유확약 및 비례배정 5사6입 계산기',
    url: siteUrl,
    siteName: '공모주 알리미 리포트 (IPOScore)',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '공모주 알리미 리포트 - 실시간 공모주 청약 일정 & AI 분석',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '공모주 청약 일정 & AI 분석 리포트 | IPOScore',
    description:
      '실시간 공모주 청약 일정, 기관 수요예측 경쟁률, 비례배정 계산기 및 전문가 AI 요약',
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
    alternateName: ['IPOScore', '공모주 알리미', 'iposcore.kr'],
    url: siteUrl,
    description:
      '2026년 실시간 공모주 청약 일정, DART 기관 수요예측 경쟁률, 의무보유확약, 비례배정 계산기 및 전문가 AI 종합 점수를 제공하는 금융 포털.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IPOScore',
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    sameAs: [],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '2026년 공모주 청약 일정은 어디서 확인하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IPOScore(공모주 알리미 리포트)에서 금융감독원 전자공시(DART)를 기반으로 매일 업데이트되는 실시간 공모주 청약 일정, 수요예측일, 환불일, 상장일을 한눈에 확인하실 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '공모주 수요예측 경쟁률과 의무보유확약이란 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '수요예측 기관 경쟁률은 기관 투자자들의 관심도를 나타내며 통상 500:1 이상이면 흥행으로 평가됩니다. 의무보유확약 비율은 기관들이 상장 후 일정 기간 주식을 팔지 않겠다고 약속한 비율로, 확약 비율이 높을수록 상장일 유통 물량이 줄어 주가 상승에 긍정적입니다.',
        },
      },
      {
        '@type': 'Question',
        name: '공모주 비례배정 5사6입 법칙이란 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '비례 배정 시 배정 계산 주수의 소수점 자리가 0.6 이상이면 1주를 올림하여 추가 배정하고, 0.5 이하이면 버리는 배정 방식입니다. IPOScore의 비례배정 계산기를 통해 마이너스통장 대출이자 대비 실질 수익을 시뮬레이션할 수 있습니다.',
        },
      },
    ],
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
        <GoogleAnalytics gaId={gaMeasurementId} />
        <VisitorBeacon />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
