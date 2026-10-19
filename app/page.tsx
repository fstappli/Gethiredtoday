import type { Metadata } from "next";
import EmailCaptureCard from "@/components/seo/email-capture-card";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ResumeThumb from "@/components/resume-thumb";
import HomeJobSearch from "@/components/home/home-job-search";
import HomeJobStrip from "@/components/home/home-job-strip";
import type { TemplateLayout } from "@/components/template-preview";

export const metadata: Metadata = {
  title: { absolute: "GetHiredToday: Free AI Resume Builder, ATS Checker and Job Search" },
  description:
    "Build an ATS-friendly resume in about 3 minutes, check your ATS score, search jobs and apply with a tailored resume. Free to start, PDF download always free.",
  alternates: { canonical: "https://www.hiredtodayapp.com" },
  openGraph: {
    title: "GetHiredToday: Free AI Resume Builder",
    description: "Build an ATS-friendly resume in about 3 minutes. Free to start.",
    url: "https://www.hiredtodayapp.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetHiredToday: Free AI Resume Builder",
    description: "Build an ATS-friendly resume in about 3 minutes. Free to start.",
  },
};

const TEMPLATES: { title: string; kind: string; pro: boolean; layout: TemplateLayout; accent: string }[] = [
  { title: "Classic Professional", kind: "Single column", pro: false, layout: "classic", accent: "#0B6E5F" },
  { title: "Modern Sidebar", kind: "Two column", pro: false, layout: "sidebar", accent: "#1e293b" },
  { title: "Executive Bold", kind: "Dark header", pro: true, layout: "executive", accent: "#1F2A44" },
  { title: "Contemporary", kind: "Centered", pro: false, layout: "centered", accent: "#0d9488" },
  { title: "Creative Rose", kind: "Side column", pro: true, layout: "creative", accent: "#e11d48" },
  { title: "Academic Classic", kind: "Traditional serif", pro: false, layout: "minimal", accent: "#1d4ed8" },
];

const FAQ: [string, string][] = [
  ["Is it really free to start?", "Yes. Build, score and download one resume as a PDF without a card. Pro unlocks unlimited resumes, Word export, job matching and Auto-Apply."],
  ["What does Auto-Apply send in my name?", "A version of your resume tailored to each job. In review mode nothing is sent until you approve it."],
  ["Can I import my existing resume?", "Yes. Upload a PDF or Word file, or paste your LinkedIn profile link."],
  ["How is this different from a general AI chatbot?", "It is built only for job search: recruiter-tested templates, a live ATS score, job matching and application tracking in one place."],
  ["How do I cancel?", "Go to Plan & billing and choose Cancel. Two clicks, and your resumes stay in your account."],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const eyebrow = "text-sm font-extrabold tracking-[1px]";
const h2 = "font-display m-0 font-bold";
const card = "rounded-[20px] border border-line bg-white";

function StartCard({ href, tint, stroke, title, body, cta, icon }: { href: string; tint: string; stroke: string; title: string; body: string; cta: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className={`${card} flex flex-col gap-2.5 p-6 text-ink no-underline hover:border-ink`}>
      <span className="grid h-12 w-12 place-items-center rounded-[14px]" style={{ background: tint }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" aria-hidden="true">{icon}</svg>
      </span>
      <b className="font-display text-[21px]">{title}</b>
      <span className="leading-normal text-text-muted">{body}</span>
      <span className="font-extrabold text-brand">{cta} →</span>
    </Link>
  );
}

function Step({ n, dark, title, body }: { n: string; dark: boolean; title: string; body: string }) {
  return (
    <div className={`${card} flex flex-col gap-2.5 p-[26px]`}>
      <span className={`font-display grid h-11 w-11 place-items-center rounded-xl font-extrabold text-white ${dark ? "bg-ink" : "bg-brand"}`}>{n}</span>
      <h3 className="font-display m-0 text-[22px] font-bold">{title}</h3>
      <p className="m-0 leading-[1.55] text-text-muted">{body}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-ground-site text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute -right-[180px] -top-40 h-[620px] w-[620px] rounded-full bg-mint-soft" />
          <div aria-hidden="true" className="absolute -bottom-[200px] -left-[120px] h-[420px] w-[420px] rounded-full bg-sun-soft" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-[72px] pt-16 [grid-template-columns:repeat(auto-fit,minmax(min(470px,100%),1fr))]">
            <div className="flex flex-col gap-[22px]">
              <span className="flex items-center gap-2 self-start rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-semibold">
                <span className="rounded-full bg-brand px-2.5 py-[3px] text-xs font-extrabold text-white">FREE</span>
                No card needed. Ever, for the free plan.
              </span>
              <h1 className="font-display m-0 text-balance text-[46px] font-extrabold leading-[.98] tracking-[-1.4px] min-[761px]:text-[72px] min-[761px]:tracking-[-2.4px]">
                Let&apos;s get you <span className="text-brand">hired.</span>
              </h1>
              <p className="m-0 max-w-[540px] text-xl leading-[1.55] text-text-muted">
                Build a resume you&apos;re proud of, search jobs from employers worldwide, and apply with a resume tailored to each one. We&apos;ll guide you every step of the way.
              </p>
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex" aria-hidden="true">
                  {[["MT", "#5FD3B3"], ["LK", "#FFD166"], ["PS", "#E8E3FF"], ["+", "#FFD9C7"]].map(([t, bg], i) => (
                    <span key={t} className={`grid h-10 w-10 place-items-center rounded-full border-[3px] border-ground-site text-[13px] font-extrabold ${i ? "-ml-3" : ""}`} style={{ background: bg }}>{t}</span>
                  ))}
                </div>
                <span className="text-[15px] text-text-muted">
                  <b className="text-ink">50K+ resumes</b> built here
                  <br />
                  <span className="text-[#8A5A00]" aria-hidden="true">★★★★★</span> 4.8 out of 5
                </span>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div aria-hidden="true" className="absolute -left-2.5 top-[30px] hidden -rotate-6 overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(13,27,25,.14)] min-[761px]:block">
                <ResumeThumb layout="classic" accent="#0B6E5F" width={252} />
              </div>
              <div className="relative box-border flex w-[min(420px,100%)] flex-col gap-3.5 rounded-3xl border border-line bg-white p-7 shadow-[0_30px_60px_rgba(13,27,25,.12)]">
                <div>
                  <h2 className="font-display m-0 text-[26px] font-bold tracking-[-.5px]">Create your free account</h2>
                  <p className="mb-0 mt-1.5 text-[15px] text-text-muted">Your first resume can be ready in about 3 minutes.</p>
                </div>
                <Link href="/signup?provider=google" className="flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl bg-ink p-[15px] font-bold text-white no-underline hover:bg-ink-soft">
                  <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-[13px] font-extrabold text-ink" aria-hidden="true">G</span>
                  Continue with Google
                </Link>
                <div className="flex items-center gap-2.5 text-[13px] text-text-subtle">
                  <span className="h-px flex-1 bg-line" />or use your email<span className="h-px flex-1 bg-line" />
                </div>
                <form action="/signup" method="get" className="flex flex-col gap-3.5">
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    Email address
                    <input type="email" name="email" autoComplete="email" required placeholder="you@example.com" className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong p-[13px] text-base font-normal placeholder:text-text-subtle" />
                  </label>
                  <button type="submit" className="min-h-[48px] rounded-xl bg-brand p-[15px] text-base font-extrabold text-white hover:bg-brand-dark">Get started free</button>
                </form>
                <div className="flex flex-wrap justify-between gap-1.5 text-[13px] text-text-muted">
                  <span>Free PDF download</span><span>No password needed</span><span>Private by default</span>
                </div>
                <div className="border-t border-[#EEEBE3] pt-3 text-center text-sm text-text-muted">
                  Already have an account? <Link href="/login" className="font-bold text-brand">Log in</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JOB SEARCH */}
        <section className="mx-auto max-w-[1240px] px-5 pb-14 pt-2">
          <div className="box-border flex flex-col gap-[18px] rounded-[28px] bg-ink p-5 text-white min-[761px]:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className={`${eyebrow} text-mint-bright`}>JOB SEARCH, BUILT IN</div>
                <h2 className={`${h2} mt-1.5 text-[30px] leading-[1.08] tracking-[-1px] min-[761px]:text-[38px]`}>Search jobs right here. See your match before you apply.</h2>
              </div>
              <Link href="/jobs" className="inline-flex min-h-[44px] items-center font-extrabold text-mint-bright">Browse all jobs →</Link>
            </div>
            <HomeJobSearch />
            <HomeJobStrip />
          </div>
        </section>

        {/* START YOUR WAY */}
        <section className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 pb-[72px] pt-4">
          <h2 className={`${h2} text-center text-[28px] tracking-[-.8px] min-[761px]:text-[32px]`}>Not sure where to begin? Pick what feels easiest.</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            <StartCard href="/signup?start=upload" tint="#E3F4EE" stroke="#0B6E5F" title="I have a resume" body="Upload it and we'll polish it, score it and fix the weak spots." cta="Upload my resume" icon={<path d="M12 16V4M6 10l6-6 6 6M4 20h16" />} />
            <StartCard href="/signup?start=scratch" tint="#FFF1CC" stroke="#8A5A00" title="I'm starting fresh" body="Answer a few friendly questions. AI writes the first draft for you." cta="Start from scratch" icon={<path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z" />} />
            <StartCard href="/ats-checker" tint="#EDE9FF" stroke="#4B3BA8" title="Just checking" body="See your ATS score in seconds. No account needed." cta="Check my score" icon={<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>} />
            <StartCard href="/jobs" tint="#FFE9D6" stroke="#8A3B12" title="I'm looking for jobs" body="Search openings and see how well you match before you apply." cta="Search jobs" icon={<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>} />
          </div>
        </section>

        {/* PROOF */}
        <section aria-label="By the numbers" className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-7 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
            {[["50K+", "resumes built"], ["~3 min", "to a first draft"], ["30+", "ATS-ready templates"], ["4.8/5", "average rating"]].map(([v, l]) => (
              <div key={l}><div className="font-display text-4xl font-extrabold">{v}</div><div className="text-text-muted">{l}</div></div>
            ))}
          </div>
        </section>

        {/* HOW */}
        <section className="mx-auto flex max-w-[1240px] flex-col gap-10 px-5 py-[88px]">
          <div className="flex max-w-[640px] flex-col gap-3">
            <div className={`${eyebrow} text-brand`}>HOW IT WORKS</div>
            <h2 className={`${h2} text-[34px] leading-[1.04] tracking-[-1.3px] min-[761px]:text-[46px]`}>From blank page to applied, in one sitting.</h2>
          </div>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            <Step n="1" dark title="Import or start fresh" body="Upload a PDF or Word file, or paste your LinkedIn link. We fill every section, so there's no retyping." />
            <Step n="2" dark title="Let AI sharpen it" body="Pick the job you want. AI rewrites weak bullets with numbers and keywords while your ATS score climbs live." />
            <Step n="3" dark={false} title="Download or Auto-Apply" body="Download your PDF for free, or switch on Auto-Apply and review fresh matches every morning." />
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-[88px] px-5 py-[88px]">
            <div className="grid items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))]">
              <div className="flex flex-col gap-4">
                <div className={`${eyebrow} text-brand`}>AI WRITER</div>
                <h2 className={`${h2} text-[32px] leading-[1.08] tracking-[-1px] min-[761px]:text-[40px]`}>Turn &quot;responsible for&quot; into results.</h2>
                <p className="m-0 text-lg leading-[1.55] text-text-muted">Tell us your role. We suggest clear, measurable bullet points you can accept, edit or regenerate with one tap.</p>
                <Link href="/signup" className="inline-flex min-h-[44px] items-center font-extrabold text-brand">Try the AI writer free →</Link>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl bg-ground-site p-6">
                <div className="rounded-[14px] border border-line bg-white p-4">
                  <div className="text-xs font-extrabold tracking-[.6px] text-danger-ink">BEFORE</div>
                  <p className="mb-0 mt-1.5 text-text-muted line-through">Responsible for managing the team and product launches.</p>
                </div>
                <div className="rounded-[14px] border-2 border-brand bg-white p-4">
                  <div className="text-xs font-extrabold tracking-[.6px] text-brand">AFTER · EXAMPLE</div>
                  <p className="mb-3 mt-1.5 font-semibold">Led a 12-person team that shipped 3 major features to 1.4M+ users.</p>
                  <div className="flex gap-2" aria-hidden="true">
                    <span className="grid min-h-[44px] place-items-center rounded-[10px] bg-brand px-4 font-bold text-white">Accept</span>
                    <span className="grid min-h-[44px] place-items-center rounded-[10px] border border-line-strong bg-white px-3.5 font-semibold">Regenerate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))]">
              <div className="flex flex-col gap-3.5 rounded-3xl bg-ink p-[26px] text-white" role="img" aria-label="Example ATS report with a score of 87 out of 100">
                <div className="flex items-center justify-between"><span className="font-bold">ATS report</span><span className="font-display text-[34px] font-extrabold text-mint-bright">87<span className="text-base text-on-dark-muted">/100</span></span></div>
                {[["Keywords", "18/20", 90, "#5FD3B3"], ["Formatting", "10/10", 100, "#5FD3B3"], ["Measurable impact", "4/10", 40, "#FFD166"]].map(([l, v, w, c]) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-sm"><span>{l}</span><span style={{ color: c === "#FFD166" ? "#FFD166" : undefined }}>{v}</span></div>
                    <div className="mt-1.5 h-2 rounded bg-ink-line"><div className="h-2 rounded" style={{ width: `${w}%`, background: c as string }} /></div>
                  </div>
                ))}
                <div className="rounded-xl bg-ink-soft p-3.5 text-sm leading-normal">Next fix: add numbers to 3 bullets in Experience. <Link href="/ats-checker" className="font-bold text-mint-bright">Check yours free</Link></div>
              </div>
              <div className="flex flex-col gap-4">
                <div className={`${eyebrow} text-brand`}>ATS SCORE</div>
                <h2 className={`${h2} text-[32px] leading-[1.08] tracking-[-1px] min-[761px]:text-[40px]`}>Know exactly what to fix before you hit send.</h2>
                <p className="m-0 text-lg leading-[1.55] text-text-muted">30+ checks across keywords, structure and contact details, each with a one-click fix. Paste a job ad to match it line by line.</p>
                <Link href="/ats-checker" className="inline-flex min-h-[44px] items-center font-extrabold text-brand">Check my resume free, no sign-up →</Link>
              </div>
            </div>

            <div className="grid items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))]">
              <div className="flex flex-col gap-4">
                <div className={`${eyebrow} text-brand`}>AUTO-APPLY · PRO</div>
                <h2 className={`${h2} text-[32px] leading-[1.08] tracking-[-1px] min-[761px]:text-[40px]`}>Wake up to applications already sent.</h2>
                <p className="m-0 text-lg leading-[1.55] text-text-muted">Choose your role, location and minimum match. We tailor your resume for each job and send up to 50 a day. You approve every one, or let it run. Pause any time.</p>
                <Link href="/auto-apply" className="inline-flex min-h-[44px] items-center font-extrabold text-brand">See how Auto-Apply works →</Link>
              </div>
              <div className="flex flex-col gap-2.5 rounded-3xl bg-ground-site p-[22px]" role="img" aria-label="Example Auto-Apply queue">
                <div className="flex items-center justify-between px-1 pb-1.5 pt-0.5"><b>Today&apos;s queue</b><span className="rounded-full bg-mint-soft px-2.5 py-1 text-[13px] font-extrabold text-brand-dark">Example</span></div>
                {[["N", "#EDE9FF", "#4B3BA8", "Senior Product Manager", "Remote", "92%"], ["B", "#FFE9D6", "#8A3B12", "Product Manager, Growth", "Hybrid", "88%"]].map(([i, bg, fg, t, l, s]) => (
                  <div key={t} className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3.5">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] font-extrabold" style={{ background: bg, color: fg }}>{i}</span>
                    <span className="flex-1"><b>{t}</b><br /><span className="text-[13px] text-text-muted">{l}</span></span>
                    <b className="text-brand">{s}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section className="mx-auto flex max-w-[1240px] flex-col gap-7 px-5 py-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className={`${eyebrow} text-brand`}>TEMPLATES</div>
              <h2 className={`${h2} text-[34px] tracking-[-1.3px] min-[761px]:text-[46px]`}>Designs recruiters actually like.</h2>
            </div>
            <Link href="/resume-templates" className="inline-flex min-h-[44px] items-center font-extrabold text-brand">Browse all 30+ →</Link>
          </div>
          <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
            {TEMPLATES.map((t) => (
              <Link key={t.title} href="/resume-templates" className="flex flex-col gap-3 text-ink no-underline">
                <div className="relative flex justify-center rounded-[18px] bg-[#F2EFE7] py-[22px]">
                  <ResumeThumb layout={t.layout} accent={t.accent} width={252} className="rounded-md shadow-[0_12px_28px_rgba(13,27,25,.14)]" />
                  <span className={`absolute right-3.5 top-3.5 rounded-full px-[11px] py-[5px] text-xs font-extrabold ${t.pro ? "bg-sun text-ink" : "bg-mint-soft text-brand-dark"}`}>{t.pro ? "Pro" : "Free"}</span>
                </div>
                <div className="flex justify-between gap-2"><b className="text-[17px]">{t.title}</b><span className="text-sm text-text-muted">{t.kind}</span></div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRICING TEASER */}
        <section className="mx-auto flex max-w-[1040px] flex-col items-center gap-7 px-5 py-[88px] text-center">
          <h2 className={`${h2} text-[34px] tracking-[-1.3px] min-[761px]:text-[46px]`}>Start free. Upgrade when you&apos;re ready to apply.</h2>
          <div className="grid w-full gap-[18px] text-left [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
            <div className="flex flex-col gap-3.5 rounded-3xl border border-line bg-white p-[30px]">
              <b className="font-display text-[22px]">Free</b>
              <span className="font-display text-[44px] font-extrabold">$0</span>
              <ul className="m-0 flex flex-col gap-2 pl-[18px] text-text-muted">
                <li>1 resume with free templates</li><li>AI writer with a daily allowance</li><li>ATS score and top 3 fixes</li><li>Job search and your top 3 matches a day</li><li>PDF download</li>
              </ul>
              <Link href="/signup" className="mt-auto rounded-[14px] border-[1.5px] border-ink p-[15px] text-center font-extrabold text-ink no-underline">Create free account</Link>
            </div>
            <div className="relative flex flex-col gap-3.5 rounded-3xl bg-brand p-[30px] text-white">
              <span className="absolute -top-3.5 right-6 rounded-full bg-sun px-3 py-1.5 text-[13px] font-extrabold text-ink">MOST CHOSEN</span>
              <b className="font-display text-[22px]">Pro</b>
              <span><span className="font-display text-[44px] font-extrabold">$9.99</span><span className="text-[#CFEDE4]"> per month</span></span>
              <ul className="m-0 flex flex-col gap-2 pl-[18px] text-[#E8F7F2]">
                <li>Unlimited resumes and cover letters</li><li>All 30+ templates and Word export</li><li>Full ATS report and every job match</li><li>Auto-Apply up to 50 jobs a day</li>
              </ul>
              <Link href="/pricing" className="mt-auto rounded-[14px] bg-white p-[15px] text-center font-extrabold text-brand no-underline">See Pro plans</Link>
            </div>
          </div>
          <p className="m-0 text-sm text-text-muted">Cancel in two clicks from your account. Secure checkout.</p>
        </section>

        {/* FAQ */}
        <section className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[820px] flex-col gap-2 px-5 py-[88px]">
            <h2 className={`${h2} mb-3 text-[40px] tracking-[-1px]`}>Questions, answered</h2>
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0} className="border-b border-line py-3.5">
                <summary className="flex min-h-[44px] cursor-pointer items-center text-lg font-bold">{q}</summary>
                <p className="mb-0 mt-2 leading-[1.6] text-text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 pb-16 pt-6">
          <div className="mx-auto box-border flex max-w-[1200px] flex-col items-center gap-[18px] rounded-[32px] bg-brand px-7 py-16 text-center text-white">
            <h2 className={`${h2} max-w-[720px] text-[36px] leading-[1.04] tracking-[-1.4px] min-[761px]:text-[50px]`}>Your next interview is one resume away.</h2>
            <p className="m-0 text-lg text-[#CFEDE4]">Free to start. About 3 minutes to your first draft.</p>
            <Link href="/signup" className="rounded-[14px] bg-sun px-7 py-[18px] text-[17px] font-extrabold text-ink no-underline">Create my free account</Link>
          </div>
        </section>
        <section className="mx-auto w-full max-w-[860px] px-5 pb-16"><EmailCaptureCard source="home" /></section>
      </main>
      <Footer />
    </div>
  );
}
