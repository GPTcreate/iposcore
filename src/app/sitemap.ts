import { MetadataRoute } from 'next';
import { getAllEffectiveIpos } from '@/lib/ipoUtils';
import { getAllGuides } from '@/data/guidesData';
import { isIndexableIpo } from '@/lib/publicIpo';
import { loadServerCustomIpos } from '@/lib/ipoServerStore';
import { loadServerReviewArchive } from '@/lib/reviewArchiveServer';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  loadServerCustomIpos();
  loadServerReviewArchive();
  const baseUrl = 'https://www.iposcore.kr';

  // 정적 페이지
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guides`,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/calculator`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 실전 투자 가이드 아티클 상세 페이지
  routes.push({ url: `${baseUrl}/research/iam-spac1-float`, lastModified: new Date('2026-10-25'), changeFrequency: 'monthly', priority: 0.8 });
  routes.push({ url: `${baseUrl}/methodology`, lastModified: new Date('2026-10-25'), changeFrequency: 'monthly', priority: 0.7 });

  const guideRoutes: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 공모주별 상세 페이지 (불변 영문 고유 슬러그 기준)
  const ipoRoutes: MetadataRoute.Sitemap = getAllEffectiveIpos().filter(isIndexableIpo).map((ipo) => ({
    url: `${baseUrl}/ipo/${ipo.id}`,
    ...((ipo.reviewCollection?.lastSuccessfulAt || ipo.dataQuality?.reviewedAt)
      ? { lastModified: new Date((ipo.reviewCollection?.lastSuccessfulAt || ipo.dataQuality?.reviewedAt)!) } : {}),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...routes, ...guideRoutes, ...ipoRoutes];
}
