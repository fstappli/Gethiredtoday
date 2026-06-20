import { MetadataRoute } from 'next';
import { RESUME_EXAMPLES } from '@/lib/resume-examples-data';
import { BLOG_POSTS } from '@/lib/blog-posts';

const BASE = 'https://hiredtodayapp.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                          priority: 1.0, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${BASE}/pricing`,             priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE}/resume-templates`,    priority: 0.9, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE}/ats-checker`,         priority: 0.8, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE}/resume-examples`,     priority: 0.8, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${BASE}/blog`,                priority: 0.8, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${BASE}/resources`,           priority: 0.7, changeFrequency: 'weekly',  lastModified: new Date() },
    { url: `${BASE}/about`,               priority: 0.5, changeFrequency: 'yearly',  lastModified: new Date() },
    { url: `${BASE}/contact`,             priority: 0.5, changeFrequency: 'yearly',  lastModified: new Date() },
    { url: `${BASE}/sitemap`,             priority: 0.4, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE}/signup`,              priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE}/privacy`,             priority: 0.3, changeFrequency: 'yearly',  lastModified: new Date() },
    { url: `${BASE}/terms`,               priority: 0.3, changeFrequency: 'yearly',  lastModified: new Date() },
  ];

  const examplePages: MetadataRoute.Sitemap = RESUME_EXAMPLES.map((ex) => ({
    url: `${BASE}/resume-examples/${ex.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
    lastModified: new Date(),
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
    lastModified: new Date(post.date),
  }));

  return [...staticPages, ...examplePages, ...blogPages];
}
