import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import JsonLd from "@/components/seo/json-ld";
import { COVER_LETTER_EXAMPLES } from "@/lib/cover-letter-examples";
import { absoluteUrl } from "@/lib/site-config";
import { breadcrumbSchema , ogImages } from "@/lib/seo/jsonld";

const TITLE = "Cover Letter Examples by Role: Editable Templates";
const DESCRIPTION =
  "Cover letter examples for software engineers, nurses, marketers, teachers and more. See what to include, avoid common mistakes and copy an editable template.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/cover-letter-examples") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl("/cover-letter-examples"), type: "website", images: ogImages(TITLE, "Editable cover letter examples by role") },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ogImages(TITLE, "Editable cover letter examples by role") },
};

export default function CoverLetterExamplesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Cover letter examples", path: "/cover-letter-examples" }])} />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[980px] flex-col gap-4 px-5 pb-8 pt-14">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-text-muted">
            <Link href="/cover-letter" className="font-semibold text-brand">Cover letters</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Examples by role</span>
          </nav>
          <h1 className="font-display m-0 text-[40px] font-bold leading-[1.04] tracking-[-1.6px] min-[761px]:text-[56px]">Cover letter examples by role</h1>
          <p className="m-0 max-w-[720px] text-lg leading-[1.6] text-text-muted">
            Pick your role to see a full example letter you can edit, what to include and the mistakes to avoid. Anything in [square brackets] is a placeholder for your own details.
          </p>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 pb-12">
          <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
            {COVER_LETTER_EXAMPLES.map((e) => (
              <li key={e.slug}>
                <Link href={`/cover-letter-examples/${e.slug}`} className="flex h-full flex-col gap-2 rounded-[20px] border border-line bg-white p-6 text-ink no-underline hover:border-ink">
                  <b className="font-display text-[22px]">{e.title} cover letter</b>
                  <span className="leading-normal text-text-muted">{e.quickAnswer.split(". ")[0]}.</span>
                  <span className="mt-auto pt-2 font-extrabold text-brand">See the example →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-5 pb-[72px]">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-5 rounded-[28px] bg-ink p-7 text-white min-[761px]:px-7 min-[761px]:py-11">
            <div className="flex-[1_1_360px]">
              <b className="font-display text-2xl leading-[1.1]">Write yours in a few minutes</b>
              <p className="mb-0 mt-2 text-on-dark-muted">Paste a job ad and get a letter that matches your resume. You can write and preview for free.</p>
            </div>
            <Link href="/cover-letter" className="inline-flex min-h-[48px] items-center rounded-[14px] bg-mint-bright px-6 font-extrabold text-ink no-underline">Open the cover letter builder</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
