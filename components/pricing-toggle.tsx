"use client";

import { useState } from "react";
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
  const [period, setPeriod] = useState<"monthly" | "quarterly">("monthly");
  const m = period === "monthly";
  const base = "min-h-[44px] rounded-[10px] px-[18px] py-3 text-[15px]";

  return (
    <>
      <section className="mx-auto flex max-w-[1140px] flex-col items-center gap-5 px-6 pb-10 pt-[72px] text-center">
        <h1 className="font-display m-0 max-w-[760px] text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[56px]">
          Free while you build. Pro when you apply.
        </h1>
        <p className="m-0 max-w-[620px] text-[19px] leading-normal text-text-muted">
          No trial traps. Your free resume and PDF stay free forever. Cancel Pro in two clicks.
        </p>
        <div role="group" aria-label="Billing period" className="flex gap-1 rounded-[14px] border border-line bg-white p-1">
          <button type="button" aria-pressed={m} onClick={() => setPeriod("monthly")} className={`${base} ${m ? "bg-ink font-bold text-white" : "bg-transparent font-semibold text-ink"}`}>
            Monthly
          </button>
          <button type="button" aria-pressed={!m} onClick={() => setPeriod("quarterly")} className={`${base} ${!m ? "bg-ink font-bold text-white" : "bg-transparent font-semibold text-ink"}`}>
            Every 3 months{" "}
            <span className="ml-1 rounded-full bg-sun px-2 py-0.5 text-xs font-extrabold text-ink">Save [X]%</span>
          </button>
        </div>
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
            <span className="font-display text-[52px] font-extrabold">{m ? "$9.99" : "[$/mo]"}</span>
            <span className="text-on-dark-muted"> /month</span>
            <div className="mt-1 text-sm text-on-dark-muted">{m ? "Billed monthly. Cancel any time." : "Billed [$ total] every 3 months."}</div>
          </div>
          <Link
            href={upgradeHref("pricing", m ? "monthly" : "quarterly")}
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
