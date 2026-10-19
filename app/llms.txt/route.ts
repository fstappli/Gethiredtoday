import { SITE, SITE_URL, ENTITY_DEFINITION, ENTITY_LONG_DESCRIPTION, PRICING, FREE_FEATURES, PRO_FEATURES, SITE_FAQS, KEY_PAGES, absoluteUrl } from '@/lib/site-config';
import { RESUME_EXAMPLES } from '@/lib/resume-examples-data';
import { BLOG_POSTS } from '@/lib/blog-posts';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${SITE.name}`, '', `> ${ENTITY_DEFINITION}`, '', ENTITY_LONG_DESCRIPTION, '');

  lines.push('## Identity', '');
  lines.push(`- Name: ${SITE.name} (also written: ${SITE.alternateNames.join(', ')})`);
  lines.push(`- Website: ${SITE_URL}`);
  lines.push(`- Contact: ${SITE.email}`);
  lines.push(`- Language: English`, '');

  lines.push('## Pricing', '');
  lines.push(`- Free: $${PRICING.freePrice}. ${FREE_FEATURES.join('; ')}.`);
  lines.push(`- Pro: $${PRICING.proMonthly}/month, cancel any time. ${PRO_FEATURES.join('; ')}.`, '');

  lines.push('## Key pages', '');
  for (const p of KEY_PAGES) lines.push(`- [${p.title}](${absoluteUrl(p.path)}): ${p.summary}`);
  lines.push('');

  lines.push('## Resume examples by role', '');
  for (const ex of RESUME_EXAMPLES) lines.push(`- [${ex.title ?? ex.slug}](${absoluteUrl(`/resume-examples/${ex.slug}`)})`);
  lines.push('');

  lines.push('## Guides', '');
  for (const post of [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(`- [${post.title}](${absoluteUrl(`/resources/${post.slug}`)})`);
  }
  lines.push('');

  lines.push('## Frequently asked questions', '');
  for (const f of SITE_FAQS) lines.push(`### ${f.q}`, '', f.a, '');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
