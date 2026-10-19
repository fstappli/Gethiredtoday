import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ResumeThumb from '@/components/resume-thumb';
import { RESUME_EXAMPLES, getExampleBySlug } from '@/lib/resume-examples-data';
import { layoutForIndustry, previewForExample } from '@/lib/example-thumb';

interface Props { params: Promise<{ slug: string }> }

/** No em dashes in user-facing copy. */
const clean = (s: string) => s.replace(/\s*—\s*/g, ', ');

export async function generateStaticParams() {
  return RESUME_EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ex = getExampleBySlug(slug);
  if (!ex) return {};
  const title = clean(ex.metaTitle);
  const description = clean(ex.metaDescription);
  return {
    title,
    description,
    alternates: { canonical: `https://hiredtodayapp.com/resume-examples/${ex.slug}` },
    openGraph: { title, description, url: `https://hiredtodayapp.com/resume-examples/${ex.slug}`, type: 'article' },
  };
}

export default async function ExamplePage({ params }: Props) {
  const { slug } = await params;
  const ex = getExampleBySlug(slug);
  if (!ex) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: clean(ex.metaTitle),
    description: clean(ex.metaDescription),
    url: `https://hiredtodayapp.com/resume-examples/${ex.slug}`,
    publisher: { '@type': 'Organization', name: 'GetHiredToday', url: 'https://hiredtodayapp.com' },
  };

  const related = RESUME_EXAMPLES.filter((e) => e.slug !== ex.slug && e.industry === ex.industry)
    .concat(RESUME_EXAMPLES.filter((e) => e.slug !== ex.slug && e.industry !== ex.industry))
    .slice(0, 4);
  const first = ex.sampleExperiences[0];
  const useHref = `/builder/resume/new?example=${ex.slug}`;

  return (
    <div className="bg-ground-site text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <main>
        <div className="mx-auto max-w-[1240px] px-5 pt-7">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-text-muted">
            <Link href="/resume-examples" className="text-brand">Examples</Link>
            <span aria-hidden="true">/</span>
            <span>{ex.industry}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{ex.title}</span>
          </nav>
          <h1 className="font-display mb-1.5 mt-3.5 text-[36px] font-bold leading-[1.04] tracking-[-1.6px] min-[761px]:text-[52px]">{ex.title} resume example</h1>
          <p className="m-0 max-w-[720px] text-lg leading-normal text-text-muted">{clean(ex.intro)}</p>
        </div>

        <section className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-8 px-5 pb-14 pt-7">
          <div className="flex min-w-0 flex-[999_1_520px] justify-center rounded-3xl bg-[#F2EFE7] py-8">
            <ResumeThumb layout={layoutForIndustry(ex.industry)} content={previewForExample(ex)} width={440} className="rounded-md shadow-[0_20px_48px_rgba(13,27,25,.16)]" />
          </div>
          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-[22px] bg-ink p-6 text-white">
              <b className="font-display text-2xl leading-[1.15]">Make this resume yours in 3 minutes</b>
              <span className="leading-normal text-on-dark-muted">We will load this example into the builder. Swap in your details and AI tailors the rest.</span>
              <Link href={useHref} className="rounded-xl bg-mint-bright p-[15px] text-center font-extrabold text-ink no-underline">Use this example, free</Link>
              <span className="text-center text-[13px] text-on-dark-muted">Free PDF download included</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-5">
              <b>Top skills for this role</b>
              <div className="flex flex-wrap gap-1.5">
                {ex.skills.map((s) => (
                  <span key={s} className="rounded-lg bg-mint-soft px-2.5 py-1.5 text-[13px] font-bold text-brand-dark">{s}</span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[820px] flex-col gap-5 px-5 py-16 text-[17px] leading-[1.65]">
            <h2 className="font-display m-0 text-[34px] font-bold">How to write a {ex.title} resume</h2>

            <h3 className="font-display mb-0 mt-2 text-[22px] font-bold">1. Lead with outcomes in your summary</h3>
            <p className="m-0 text-text-muted">Name your speciality, years of experience and one result. Keep it to three or four lines.</p>
            <div className="rounded-[14px] border border-line bg-ground-site px-[18px] py-4">
              <div className="text-xs font-extrabold tracking-[.6px] text-brand">EXAMPLE SUMMARY</div>
              <p className="mb-0 mt-1.5">{clean(ex.sampleSummary)}</p>
            </div>

            <h3 className="font-display mb-0 mt-2 text-[22px] font-bold">2. Quantify every bullet you can</h3>
            <p className="m-0 text-text-muted">Recruiters scan for numbers. Users, revenue, time saved and ratings all count.</p>
            <div className="rounded-[14px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <b>{first.role}</b>
                <span className="text-sm text-text-subtle">{clean(first.dates)}</span>
              </div>
              <div className="mb-2 text-sm font-semibold text-brand">{first.company}</div>
              <ul className="m-0 flex flex-col gap-1.5 pl-[22px]">
                {first.bullets.map((b, i) => <li key={i}>{clean(b)}</li>)}
              </ul>
            </div>

            <h3 className="font-display mb-0 mt-2 text-[22px] font-bold">3. Include what recruiters look for</h3>
            <ul className="m-0 flex flex-col gap-1.5 pl-[22px] text-text-muted">
              {ex.mustHave.map((m, i) => <li key={i}>{clean(m)}</li>)}
            </ul>

            <h3 className="font-display mb-0 mt-2 text-[22px] font-bold">4. Mirror the job ad&apos;s keywords</h3>
            <p className="m-0 text-text-muted">Paste the job description into the ATS checker to see which terms you are missing.</p>
            <Link href="/ats-checker" className="self-start font-extrabold text-brand">Check my resume against a job ad →</Link>

            <h3 className="font-display mb-0 mt-2 text-[22px] font-bold">Expert tips</h3>
            <div className="grid gap-3 min-[561px]:grid-cols-2">
              {ex.tips.map((tip, i) => (
                <div key={i} className="rounded-xl border border-line bg-sun-soft p-4">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-warning-ink">Tip {i + 1}</span>
                  <p className="m-0 mt-1 text-[15px] leading-normal">{clean(tip)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 pb-[72px] pt-14">
          <h2 className="font-display m-0 text-[28px] font-bold">Related examples</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((r) => (
              <Link key={r.slug} href={`/resume-examples/${r.slug}`} className="flex min-h-[44px] items-center rounded-xl border border-line bg-white px-4 font-bold text-ink no-underline hover:border-ink">{r.title}</Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
