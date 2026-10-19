import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

const PRIVATE = ['/api/', '/dashboard/', '/builder/', '/auth/', '/onboarding', '/upgrade', '/check-email'];

/** AI answer engines are explicitly welcome: being quoted by them is a goal. */
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'PerplexityBot', 'Perplexity-User',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-SearchBot', 'Claude-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'Amazonbot', 'DuckAssistBot', 'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
