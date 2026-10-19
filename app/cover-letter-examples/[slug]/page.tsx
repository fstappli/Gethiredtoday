import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import JsonLd from "@/components/seo/json-ld";
import { COVER_LETTER_EXAMPLES, getCoverLetterExample } from "@/lib/cover-letter-examples";
import { absoluteUrl } from "@/lib/site-config";
import { breadcrumbSchema, faqSchema , ogImages } from "@/lib/seo/jsonld";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return COVER_LETTER_EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ex = getCoverLetterExample(slug);
  if (!ex) return {};
  const title = `${ex.title} Cover Letter Example`;
  const description = `See a full ${ex.title.toLowerCase()} cover letter example, what to include and the mistakes to avoid. Free editable template.`;
  const url = absoluteUrl(`/cover-letter-examples/${ex.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images: ogImages(title, "Cover letter example") },
    twitter: { card: "summary_large_image", title, description, images: ogImages(title, "Cover letter example") },
  };
}

export default async function CoverLetterExamplePage({ params }: Props) {
  const { slug } = await params;
  const ex = getCoverLetterExample(slug);
  if (!ex) notFound();

  const path = `/cover-letter-examples/${ex.slug}`;
  const others = COVER_LETTER_EXAMPLES.filter((e) => e.slug !== ex.slug);
  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Cover letter examples", path: "/cover-letter-examples" },
      { name: `${ex.title} cover letter`, path },
    ]),
    faqSchema(ex.faqs),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <JsonLd data={schemas} />
      <main className="flex-1">
        <header className="mx-auto flex max-w-[820px] flex-col gap-3.5 px-5 pb-5 pt-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-text-muted">
            <Link href="/cover-letter-examples" className="font-semibold text-brand">Cover letter examples</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{ex.title}</span>
          </nav>
          <h1 className="font-display m-0 text-4xl font-bold leading-[1.04] tracking-[-1.5px] min-[761px]:text-5xl">{ex.title} cover letter example</h1>
          <p className="m-0 text-lg leading-[1.6] text-text-muted">{ex.intro}</p>
        </header>

        <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-5 pb-12 text-[17px] leading-[1.65]">
          <section aria-label="Quick answer" className="rounded-2xl border-l-4 border-brand bg-mint-soft p-5">
            <div className="text-xs font-extrabold tracking-[1px] text-brand-dark">QUICK ANSWER</div>
            <p className="m-0 mt-1.5 text-lg font-semibold leading-[1.55]">{ex.quickAnswer}</p>
          </section>

          <section aria-labelledby="example-heading" className="flex flex-col gap-3">
            <h2 id="example-heading" className="font-display m-0 text-[30px] font-bold">Example {ex.title.toLowerCase()} cover letter</h2>
            <p className="m-0 text-text-muted">This is an editable template. Replace everything in [square brackets] with your own real details, and delete anything that does not apply to you.</p>
            <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-6">
              {ex.letter.map((para, i) => (
                <p key={i} className="m-0 whitespace-pre-line">{para}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="include-heading" className="flex flex-col gap-3">
            <h2 id="include-heading" className="font-display m-0 text-[30px] font-bold">What to include in a {ex.title.toLowerCase()} cover letter</h2>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-6">
              {ex.include.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>

          <section aria-labelledby="mistakes-heading" className="flex flex-col gap-3">
            <h2 id="mistakes-heading" className="font-display m-0 text-[30px] font-bold">Common mistakes to avoid</h2>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-6">
              {ex.mistakes.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>

          <section aria-labelledby="faq-heading" className="flex flex-col">
            <h2 id="faq-heading" className="font-display m-0 mb-2 text-[30px] font-bold">Frequently asked questions</h2>
            {ex.faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="border-b border-line py-4">
                <summary className="flex min-h-[44px] cursor-pointer items-center text-[17px] font-bold">{f.q}</summary>
                <p className="mb-0 mt-1.5 text-text-muted">{f.a}</p>
              </details>
            ))}
          </section>

          <aside aria-label="Next steps" className="rounded-3xl bg-ink p-7 text-white">
            <b className="font-display block text-2xl leading-tight">Write your {ex.title.toLowerCase()} cover letter</b>
            <p className="mb-5 mt-2 leading-normal text-on-dark-muted">Use the builder to match the letter to your resume and the job ad. Writing and previewing is free, and so is your resume PDF.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/cover-letter" className="inline-flex min-h-[48px] items-center rounded-xl bg-mint-bright px-5 font-extrabold text-ink no-underline">Open the cover letter builder</Link>
              <Link href="/signup?from=cover-letter-example" className="inline-flex min-h-[48px] items-center rounded-xl border border-ink-line px-5 font-bold text-white no-underline">Create a free account</Link>
            </div>
          </aside>

          <section aria-labelledby="related-heading" className="flex flex-col gap-3">
            <h2 id="related-heading" className="font-display m-0 text-[26px] font-bold">Related resources</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              <li><Link href={`/resume-examples/${ex.resumeSlug}`} className="font-bold text-brand">{ex.title} resume example</Link></li>
              <li><Link href="/resources/how-to-write-a-cover-letter" className="font-bold text-brand">How to write a cover letter that gets interviews</Link></li>
              <li><Link href="/ats-checker" className="font-bold text-brand">Check your resume against a job ad</Link></li>
            </ul>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {others.slice(0, 6).map((o) => (
                <Link key={o.slug} href={`/cover-letter-examples/${o.slug}`} className="flex min-h-[44px] items-center rounded-xl border border-line bg-white px-4 font-bold text-ink no-underline hover:border-ink">{o.title}</Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
