import { MetadataRoute } from 'next';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { getAllGuides } from '@/data/guidesData';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iposcore.kr';

  // 정적 페이지
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 실전 투자 가이드 아티클 상세 페이지
  const guideRoutes: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 공모주별 상세 페이지 (표준 6자리 증권코드 기준)
  const ipoRoutes: MetadataRoute.Sitemap = getAllEffectiveIpos().map((ipo) => ({
    url: `${baseUrl}/ipo/${ipo.code}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...routes, ...guideRoutes, ...ipoRoutes];
}
