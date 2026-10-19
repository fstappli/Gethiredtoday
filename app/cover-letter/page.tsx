import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Cover Letter Builder: a letter that sounds like you",
  description:
    "Paste the job ad. We pull the best parts of your resume into a warm, specific letter you can edit line by line.",
  alternates: { canonical: "https://hiredtodayapp.com/cover-letter" },
};

const FEATURES = [
  { t: "Tailored to every job", d: "Each letter references the company and the role's top requirements." },
  { t: "Pick your tone", d: "Warm, confident or formal. Switch with one tap." },
  { t: "Matches your resume", d: "Same fonts and colors, so your application looks like a set." },
];

export default function CoverLetterLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-16 [grid-template-columns:repeat(auto-fit,minmax(min(460px,100%),1fr))]">
          <div className="flex flex-col gap-5">
            <span className="self-start rounded-full bg-mint-soft px-3 py-1.5 text-[13px] font-extrabold text-brand-dark">COVER LETTERS</span>
            <h1 className="font-display m-0 text-[42px] font-bold leading-none tracking-[-2px] min-[761px]:text-[60px]">
              A cover letter that sounds like you, in 60 seconds.
            </h1>
            <p className="m-0 text-[19px] leading-[1.55] text-text-muted">
              Paste the job ad. We pull the best parts of your resume into a warm, specific letter you can edit line by line.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-[14px] bg-brand px-6 py-[17px] font-extrabold text-white no-underline">Write my cover letter</Link>
              <Link href="/resume-templates" className="rounded-[14px] border-[1.5px] border-line-strong bg-white px-[18px] py-[17px] font-bold text-ink no-underline">Matching designs</Link>
            </div>
          </div>
          <div aria-hidden="true" className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-9 text-[15px] leading-[1.6] shadow-[0_24px_48px_rgba(13,27,25,.1)]">
            <div>
              <b className="font-display text-[22px]">Sarah Ahmed</b>
              <div className="text-[13px] font-semibold text-brand">Senior Product Designer · Dubai, UAE</div>
            </div>
            <div className="h-0.5 w-10 bg-brand" />
            <p className="m-0">Dear Hiring Team at Northwind,</p>
            <p className="m-0">Your Senior Product Designer role caught my eye because it puts checkout at the center. At Northwind Retail I redesigned checkout for 2.1M monthly shoppers and lifted conversion by 14%.</p>
            <p className="m-0 rounded-md bg-[#FFF6DC] px-1.5 py-1">I&apos;d love to bring the same research-first approach to your payments team.</p>
            <p className="m-0">Warm regards,<br />Sarah</p>
          </div>
        </section>
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-[1240px] gap-[18px] px-5 py-[72px] [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
            {FEATURES.map((f) => (
              <div key={f.t} className="flex flex-col gap-2">
                <b className="font-display text-[22px]">{f.t}</b>
                <span className="leading-normal text-text-muted">{f.d}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="px-5 pb-[72px] pt-16">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3.5 rounded-[28px] bg-ink px-6 py-[52px] text-center text-white">
            <h2 className="font-display m-0 text-[32px] font-bold tracking-[-1.1px] min-[761px]:text-[40px]">Write and preview your letter free.</h2>
            <p className="m-0 text-on-dark-muted">Downloading cover letters is part of Pro, along with unlimited resumes.</p>
            <Link href="/signup" className="rounded-[14px] bg-mint-bright px-[26px] py-[17px] font-extrabold text-ink no-underline">Create free account</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
