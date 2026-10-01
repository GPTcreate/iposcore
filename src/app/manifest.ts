import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '공모주 알리미 리포트',
    short_name: '공모주알리미',
    description: '공모주 청약 일정, 기관 수요예측 경쟁률 및 전문가 AI 요약 분석 리포트',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f4f6',
    theme_color: '#1d4ed8',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
