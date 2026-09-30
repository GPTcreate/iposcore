import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'IPO Insight AI | 공모주 일정 & 전문가 AI 요약 분석 리포트',
  description: '공모주 청약 일정, DART 기관 수요예측 경쟁률, 전문 유튜브·블로그 감성 분석 및 AI 종합 매력도 점수(1~100점)를 실시간 제공합니다. 비례 청약 계산기 및 무료 메일링 알림 지원.',
  keywords: ['공모주', '공모주 일정', '공모주 청약', '수요예측', '의무보유확약', '공모주 계산기', 'IPO', '주식 청약'],
  openGraph: {
    title: 'IPO Insight AI | 공모주 일정 & 전문가 AI 요약 분석 리포트',
    description: '공모주 청약 일정 및 전문 유튜버 의견 AI 3줄 요약 & 매력도 지수 제공',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 구글 애드센스 스크립트 (환경 변수에 CLIENT_ID가 있을 때만 활성화) */}
        {adClient && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-gray-900 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
