import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import FaqItem from "@/components/faq-item";

export const metadata: Metadata = {
  title: "Auto-Apply: apply to great-fit jobs, approve every one",
  description:
    "Tell us what you're looking for once. Each morning we line up matching jobs, tailor your resume to each, and send them when you say go.",
  alternates: { canonical: "https://www.hiredtodayapp.com/auto-apply" },
};

const CONTROLS = [
  { t: "Review mode", d: "Nothing is sent until you tap Approve. Switch to automatic whenever you're comfortable." },
  { t: "Match threshold", d: "Set a minimum match score. We never apply below it." },
  { t: "Daily limit", d: "Choose anywhere from 5 to 50 applications a day." },
  { t: "Pause any time", d: "One tap stops everything. Every application is logged in your tracker." },
];

const STEPS = [
  { t: "Pick your target", d: "Job titles, locations, remote or on-site, salary floor." },
  { t: "Choose your resume", d: "We tailor a copy for each job. Your original never changes." },
  { t: "Review each morning", d: "Approve, skip, or let it run. Track replies in one place." },
];

export default function AutoApplyLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="bg-ink text-white">
          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-[72px] [grid-template-columns:repeat(auto-fit,minmax(min(460px,100%),1fr))]">
            <div className="flex flex-col gap-5">
              <span className="self-start rounded-full bg-sun px-3 py-1.5 text-[13px] font-extrabold text-ink">AUTO-APPLY · PRO</span>
              <h1 className="font-display m-0 text-[42px] font-bold leading-none tracking-[-2px] min-[761px]:text-[62px]">
                Apply to 50 great-fit jobs a day. Approve every one.
              </h1>
              <p className="m-0 text-[19px] leading-[1.55] text-[#C9D8D3]">
                Tell us what you&apos;re looking for once. Each morning we line up matching jobs, tailor your resume to each, and send them when you say go.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-[14px] bg-mint-bright px-6 py-[17px] font-extrabold text-ink no-underline">Start free, try matches</Link>
                <Link href="/pricing" className="rounded-[14px] border-[1.5px] border-text-muted px-[18px] py-[17px] font-bold text-white no-underline">See Pro pricing</Link>
              </div>
            </div>
            <div aria-hidden="true" className="flex flex-col gap-2.5 rounded-3xl bg-ink-soft p-[22px]">
              <div className="flex items-center justify-between"><b>Needs your OK · 3</b><span className="text-[13px] font-extrabold text-mint-bright">Review mode</span></div>
              <div className="flex flex-col gap-2.5 rounded-[14px] bg-ink p-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#EDE9FF] font-extrabold text-[#4B3BA8]">N</span>
                  <span className="flex-1"><b>Senior Product Designer</b><br /><span className="text-[13px] text-on-dark-muted">Northwind · Dubai</span></span>
                  <b className="text-mint-bright">91%</b>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="grid min-h-[44px] place-items-center rounded-[10px] border border-text-muted font-bold">Skip</span>
                  <span className="grid min-h-[44px] place-items-center rounded-[10px] bg-mint-bright font-extrabold text-ink">Approve &amp; send</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-ink p-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#FFE9D6] font-extrabold text-[#8A3B12]">B</span>
                <span className="flex-1"><b>Lead UX Designer</b><br /><span className="text-[13px] text-on-dark-muted">Bluefin · Remote</span></span>
                <b className="text-mint-bright">88%</b>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-20">
          <h2 className="font-display m-0 text-[32px] font-bold tracking-[-1.2px] min-[761px]:text-[44px]">You stay in control. Always.</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            {CONTROLS.map((c) => (
              <div key={c.t} className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-[22px]">
                <b className="font-display text-xl">{c.t}</b>
                <span className="leading-normal text-text-muted">{c.d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-5 py-20">
            <h2 className="font-display m-0 text-[32px] font-bold tracking-[-1.2px] min-[761px]:text-[44px]">Set it up in 2 minutes</h2>
            <ol className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-3.5">
                  <span className={`font-display grid h-11 w-11 flex-none place-items-center rounded-xl font-extrabold text-white ${i === 2 ? "bg-brand" : "bg-ink"}`}>{i + 1}</span>
                  <span><b className="text-lg">{s.t}</b><br /><span className="leading-normal text-text-muted">{s.d}</span></span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex max-w-[820px] flex-col gap-1.5 px-5 py-[72px]">
          <h2 className="font-display m-0 mb-2.5 text-[32px] font-bold min-[761px]:text-[34px]">Auto-Apply questions</h2>
          <FaqItem q="What happens if a site needs me to log in?">
            We mark it &quot;Needs you&quot; in your tracker with a direct link, so you can finish it in a minute.
          </FaqItem>
          <FaqItem q="Do I have to approve every application?">
            Review mode is the default, so nothing is sent until you approve it. You can switch to automatic sending in your settings.
          </FaqItem>
        </section>

        <section className="px-5 pb-[72px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3.5 rounded-[28px] bg-brand px-6 py-[52px] text-center text-white">
            <h2 className="font-display m-0 text-[32px] font-bold tracking-[-1.2px] min-[761px]:text-[42px]">See your matches before you pay.</h2>
            <p className="m-0 text-[#CFEDE4]">Create a free account and we&apos;ll show your top 3 matching jobs right away.</p>
            <Link href="/signup" className="rounded-[14px] bg-sun px-[26px] py-[17px] font-extrabold text-ink no-underline">Show my matches</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
