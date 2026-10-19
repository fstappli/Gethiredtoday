import { jsonLdString } from '@/lib/seo/jsonld';

/** Renders one or more JSON-LD blocks. Safe against </script> injection. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
