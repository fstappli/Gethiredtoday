"use client";

import Link from "next/link";
import { upgradeHref } from "@/lib/upgrade-triggers";

const FREE = [
  "1 resume, free templates",
  "AI writer with daily rewrites",
  "ATS score and top 3 fixes",
  "PDF download",
  "Free ATS checker, unlimited",
];
const PRO = [
  "Unlimited resumes and cover letters",
  "All 60+ templates",
  "Word (.docx) export",
  "Full 30-point ATS report + job-description match",
  "Every job match scored against your resume",
  "Auto-Apply: up to 50 jobs a day, with review mode",
  "Priority support",
];

function Tick({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="flex-none">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export default function PricingToggle() {
  
  return (
    <>
      <section className="mx-auto flex max-w-[1140px] flex-col items-center gap-5 px-6 pb-10 pt-[72px] text-center">
        <h1 className="font-display m-0 max-w-[760px] text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[56px]">
          Free while you build. Pro when you apply.
        </h1>
        <p className="m-0 max-w-[620px] text-[19px] leading-normal text-text-muted">
          No trial traps. Your free resume and PDF stay free forever. Cancel Pro in two clicks.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1140px] items-stretch gap-5 px-6 pb-16 [grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))]">
        <div className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-8">
          <div>
            <div className="font-display text-2xl font-bold">Free</div>
            <div className="mt-1 text-text-muted">Build and send one great resume</div>
          </div>
          <div>
            <span className="font-display text-[52px] font-extrabold">$0</span>
            <span className="text-text-muted"> forever</span>
          </div>
          <Link href="/signup" className="flex min-h-[44px] items-center justify-center rounded-[14px] border-[1.5px] border-ink p-4 text-center font-bold text-ink no-underline">Start free</Link>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2.5 leading-[1.4]"><Tick color="#0B6E5F" />{f}</li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-col gap-5 rounded-3xl bg-ink p-8 text-white shadow-[0_30px_60px_rgba(13,27,25,.25)]">
          <span className="absolute -top-3.5 left-8 rounded-full bg-sun px-3 py-1.5 text-[13px] font-extrabold text-ink">MOST CHOSEN</span>
          <div>
            <div className="font-display text-2xl font-bold">Pro</div>
            <div className="mt-1 text-on-dark-muted">Everything to land interviews faster</div>
          </div>
          <div>
            <span className="font-display text-[52px] font-extrabold">$9.99</span>
            <span className="text-on-dark-muted"> /month</span>
            <div className="mt-1 text-sm text-on-dark-muted">Billed monthly. Cancel any time.</div>
          </div>
          <Link
            href={upgradeHref("pricing", "monthly")}
            className="flex min-h-[44px] items-center justify-center rounded-[14px] bg-mint-bright p-4 text-center font-extrabold text-ink no-underline"
          >
            Get Pro
          </Link>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2.5 leading-[1.4]"><Tick color="#5FD3B3" />{f}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
