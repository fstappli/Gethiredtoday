import { SITE, SITE_URL, ENTITY_DEFINITION, ENTITY_LONG_DESCRIPTION, PRICING, absoluteUrl } from '@/lib/site-config';

type Json = Record<string, unknown>;

/** Serialise for a <script type="application/ld+json"> tag without allowing </script> injection. */
export function jsonLdString(data: Json | Json[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export const ORG_ID = `${SITE_URL}/#organization`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    alternateName: [...SITE.alternateNames],
    url: SITE_URL,
    logo: SITE.logo,
    description: ENTITY_DEFINITION,
    email: SITE.email,
    ...(SITE.sameAs.length ? { sameAs: [...SITE.sameAs] } : {}),
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SITE.email, url: absoluteUrl('/contact') },
  };
}

export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    publisher: { '@id': ORG_ID },
    inLanguage: SITE.language,
  };
}

/** No aggregateRating: only add one when real, displayable reviews exist. */
export function softwareApplicationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: `${SITE.name} Resume Builder`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    description: ENTITY_LONG_DESCRIPTION,
    publisher: { '@id': ORG_ID },
    offers: [
      { '@type': 'Offer', name: 'Free', price: String(PRICING.freePrice), priceCurrency: PRICING.currency, url: absoluteUrl('/pricing') },
      { '@type': 'Offer', name: 'Pro (monthly)', price: String(PRICING.proMonthly), priceCurrency: PRICING.currency, url: absoluteUrl('/pricing') },
    ],
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function articleSchema(a: { title: string; description: string; path: string; datePublished: string; dateModified?: string; image?: string }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: absoluteUrl(a.path),
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    image: a.image ?? SITE.ogImage,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: SITE.language,
  };
}

export function howToSchema(h: { name: string; description: string; steps: { name: string; text: string }[] }): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: h.name,
    description: h.description,
    step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  };
}

/** Share-card URL for a page. Use in generateMetadata: openGraph.images / twitter.images. */
export function ogImageUrl(title: string, sub?: string): string {
  const p = new URLSearchParams({ title });
  if (sub) p.set('sub', sub);
  return `/og?${p.toString()}`;
}

export function ogImages(title: string, sub?: string) {
  return [{ url: ogImageUrl(title, sub), width: 1200, height: 630, alt: title }];
}
