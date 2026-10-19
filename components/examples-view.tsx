"use client";

import { useState } from "react";
import Link from "next/link";
import ResumeThumb from "@/components/resume-thumb";
import { RESUME_EXAMPLES } from "@/lib/resume-examples-data";
import { layoutForIndustry, previewForExample } from "@/lib/example-thumb";

const POPULAR = ["software-engineer", "registered-nurse", "teacher", "data-analyst"];

export default function ExamplesView() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = RESUME_EXAMPLES.filter(
    (ex) => !q || `${ex.title} ${ex.industry} ${ex.level}`.toLowerCase().includes(q),
  );
  const popular = POPULAR.map((s) => RESUME_EXAMPLES.find((e) => e.slug === s)).filter(Boolean) as typeof RESUME_EXAMPLES;

  return (
    <>
      <section className="mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-5 pb-7 pt-14 text-center">
        <h1 className="font-display m-0 max-w-[760px] text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[56px]">
          Resume examples for every kind of job.
        </h1>
        <p className="m-0 max-w-[620px] text-lg leading-normal text-text-muted">
          Find your job title, borrow the phrasing, then make it yours in the builder.
        </p>
        <label className="box-border flex min-h-[56px] w-[min(560px,100%)] items-center gap-2.5 rounded-[14px] border-[1.5px] border-line-strong bg-white px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <span className="sr-only">Search job titles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a job title, e.g. Data Analyst"
            className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-text-subtle"
          />
        </label>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="py-2.5 text-sm text-text-muted">Popular:</span>
          {popular.map((p) => (
            <Link key={p.slug} href={`/resume-examples/${p.slug}`} className="flex min-h-[44px] items-center rounded-full border border-line bg-white px-3.5 text-sm font-bold text-ink no-underline hover:border-ink">
              {p.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-[18px] px-5 pb-20 pt-4 [grid-template-columns:repeat(auto-fit,minmax(min(270px,100%),1fr))]" aria-live="polite">
        {filtered.map((ex) => (
          <Link key={ex.slug} href={`/resume-examples/${ex.slug}`} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white text-ink no-underline hover:border-ink">
            <div className="flex h-[200px] justify-center overflow-hidden bg-[#F2EFE7] pt-5">
              <ResumeThumb layout={layoutForIndustry(ex.industry)} content={previewForExample(ex)} width={210} className="rounded shadow-[0_10px_24px_rgba(13,27,25,.12)]" />
            </div>
            <div className="flex items-center justify-between gap-2 px-[18px] py-4">
              <span>
                <b className="text-[17px]">{ex.title}</b>
                <br />
                <span className="text-sm text-text-muted">{ex.industry} · {ex.level}</span>
              </span>
              <span aria-hidden="true" className="font-extrabold text-brand">→</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="col-span-full m-0 py-10 text-center text-text-muted">No examples match that search. Try a broader job title.</p>
        ) : null}
      </section>

      <section className="px-5 pb-[72px]">
        <div className="mx-auto box-border flex max-w-[1200px] flex-wrap items-center gap-5 rounded-3xl border border-line bg-white p-8">
          <div className="min-w-[280px] flex-[1_1_320px]">
            <h2 className="font-display m-0 text-[28px] font-bold">Don&apos;t see your job title?</h2>
            <p className="mb-0 mt-1.5 text-text-muted">Start from scratch and the AI writer will suggest bullets for your role.</p>
          </div>
          <Link href="/signup" className="rounded-[14px] bg-brand px-[22px] py-4 font-extrabold text-white no-underline hover:bg-brand-dark">Start free</Link>
        </div>
      </section>
    </>
  );
}
