import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
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
