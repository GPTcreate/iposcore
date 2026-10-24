import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.iposcore.kr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Mediapartners-Google', // 구글 애드센스 크롤러 전용
        allow: '/',
      },
      {
        userAgent: 'Yeti', // 네이버 검색로봇
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Googlebot', // 구글 검색로봇
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      {
        userAgent: 'Daumoa', // 다음/카카오 검색로봇
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
