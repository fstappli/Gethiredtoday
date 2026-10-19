import { MetadataRoute } from 'next';
import { getContentUrls } from '@/lib/content-index';
import { SITE_URL } from '@/lib/site-config';

const BASE = SITE_URL;
/** Stable date: a lastModified that changes on every request is ignored by crawlers. */
const SITE_UPDATED = new Date('2026-10-19');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                          priority: 1.0, changeFrequency: 'weekly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/pricing`,             priority: 0.9, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/resume-templates`,    priority: 0.9, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/ats-checker`,         priority: 0.8, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/resume-examples`,     priority: 0.8, changeFrequency: 'weekly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/jobs`,                priority: 0.8, changeFrequency: 'daily',   lastModified: SITE_UPDATED },
    { url: `${BASE}/auto-apply`,          priority: 0.7, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/cover-letter`,        priority: 0.7, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/resources`,           priority: 0.7, changeFrequency: 'weekly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/about`,               priority: 0.5, changeFrequency: 'yearly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/contact`,             priority: 0.5, changeFrequency: 'yearly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/sitemap`,             priority: 0.4, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/signup`,              priority: 0.7, changeFrequency: 'monthly', lastModified: SITE_UPDATED },
    { url: `${BASE}/privacy`,             priority: 0.3, changeFrequency: 'yearly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/terms`,               priority: 0.3, changeFrequency: 'yearly',  lastModified: SITE_UPDATED },
    { url: `${BASE}/cookies`,             priority: 0.3, changeFrequency: 'yearly',  lastModified: SITE_UPDATED },
  ];

  const content: MetadataRoute.Sitemap = getContentUrls()
    .filter((c) => !staticPages.some((sp) => sp.url === `${BASE}${c.path}`))
    .map((c) => ({
      url: `${BASE}${c.path}`,
      priority: c.type === 'hub' ? 0.8 : c.type === 'guide' ? 0.7 : 0.8,
      changeFrequency: 'monthly' as const,
      lastModified: c.lastModified ? new Date(c.lastModified) : SITE_UPDATED,
    }));

  return [...staticPages, ...content];
}
