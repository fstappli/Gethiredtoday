"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FaqItem from "@/components/faq-item";
import { saveLazyDraft } from "@/lib/lazy-draft";
import { track } from "@/lib/analytics";

interface AtsResult {
  overall_score: number;
  top_issues: string[];
  top_suggestions: string[];
}

const SAMPLE_RESUME = `Sarah Ahmed
Senior Product Designer
sarah.ahmed@email.com | Dubai, UAE | linkedin.com/in/sarah-ahmed

Summary
Product designer with 8 years of experience shipping consumer and fintech apps.

Experience
Senior Product Designer, Northwind Retail, 2021 to present
- Redesigned checkout for 2.1M monthly shoppers, lifting conversion by 14%.
- Built a 120-component design system that cut build time by 30%.
- Mentored 5 designers and ran weekly critique.

Product Designer, Bluefin Labs, 2018 to 2021
- Led the mobile banking redesign, raising the app rating from 3.6 to 4.7.
- Ran 40+ usability sessions that shaped a new onboarding flow.

Education
B.A. Visual Communication, 2016

Skills
Figma, Design systems, User research, Prototyping, A/B testing, Accessibility`;

function verdict(score: number) {
  if (score >= 80) return { title: "Excellent", body: "Your resume parses cleanly. The fixes below will polish it further.", color: "#5FD3B3" };
  if (score >= 60) return { title: "Good, with room to grow", body: "Your resume passes basic parsing. The three fixes below are your fastest way up.", color: "#FFD166" };
  return { title: "Needs work", body: "A few issues could keep your resume from being read. Start with the three fixes below.", color: "#FF9F7A" };
}

export default function PublicAtsChecker() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsResult | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/ats/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "We could not read that file."); return; }
      setResumeText(data.text || "");
      setFileName(file.name);
    } catch {
      setError("We could not read that file. Paste the text instead.");
    }
  }

  async function run(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 50) { setError("Upload your resume or paste at least 50 characters of text."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: trimmed, jobDescription: jobText.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Analysis failed. Please try again."); return; }
      if (typeof data.overall_score !== "number") { setError("The analyzer returned an unexpected response. Please try again."); return; }
      setResult({ overall_score: data.overall_score, top_issues: data.top_issues ?? [], top_suggestions: data.top_suggestions ?? [] });
      setResumeText(trimmed);
      track("ats_check_complete", { score: data.overall_score, logged_in: false });
    } catch {
      setError("We could not reach the checker. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function saveAndGo(path: string) {
    saveLazyDraft({
      kind: "ats",
      resumeText,
      jobText: jobText.trim() || undefined,
      score: result?.overall_score,
      fixes: result?.top_issues.slice(0, 3),
      savedAt: Date.now(),
    });
    router.push(path);
  }

  const v = result ? verdict(result.overall_score) : null;
  const fixes = result ? result.top_issues.slice(0, 3) : [];

  return (
    <div className="bg-ground-site text-ink">
      <section className="mx-auto flex max-w-[1000px] flex-col items-center gap-3.5 px-5 pb-5 pt-[52px] text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {["Free", "No sign-up", "Not stored"].map((t) => (
            <span key={t} className="rounded-full bg-mint-soft px-3 py-1.5 text-[13px] font-extrabold text-brand-dark">{t}</span>
          ))}
        </div>
        <h1 className="font-display m-0 text-[38px] font-bold leading-[1.03] tracking-[-1.7px] min-[761px]:text-[54px]">Will your resume get past the robots?</h1>
        <p className="m-0 max-w-[640px] text-lg leading-normal text-text-muted">Upload it and get your score in seconds, with the exact fixes that matter most.</p>
      </section>

      {!result && (
        <section className="mx-auto max-w-[760px] px-5 pb-[72px] pt-3">
          <form
            className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 shadow-[0_20px_40px_rgba(13,27,25,.06)]"
            onSubmit={(e) => { e.preventDefault(); run(resumeText); }}
          >
            <div className="relative">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border-2 border-dashed border-[#C9C4B6] bg-ground-site px-4 py-8 text-center focus-within:outline focus-within:outline-[3px] focus-within:outline-brand">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-soft">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
                </span>
                <b className="text-lg">{fileName ? fileName : "Drop your resume here, or choose a file"}</b>
                <span className="text-sm text-text-muted">PDF, Word (.docx) or text, up to 5 MB.</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx,.txt,.md,.pdf"
                  className="absolute h-px w-px opacity-0"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <details open={(!!resumeText && !fileName) || !!error}>
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 font-bold before:text-brand before:content-['+'] [details[open]>&]:before:content-['–']">Paste text instead</summary>
              <textarea
                rows={6}
                aria-label="Resume text"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="mt-2 w-full rounded-xl border-[1.5px] border-line-strong p-3 text-base"
              />
            </details>
            <label className="flex flex-col gap-1.5 font-bold">
              Target job description
              <span className="text-sm font-medium text-text-muted">Optional, but it makes the score far more useful</span>
              <textarea
                rows={4}
                placeholder="Paste the job ad here"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="rounded-xl border-[1.5px] border-line-strong p-3 text-base font-normal"
              />
            </label>
            {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-ink">{error}</p>}
            <button type="submit" disabled={loading} className="min-h-14 rounded-[14px] bg-brand text-[17px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
              {loading ? "Checking..." : "Check my resume"}
            </button>
            <button type="button" disabled={loading} onClick={() => { setResumeText(SAMPLE_RESUME); setFileName(""); run(SAMPLE_RESUME); }} className="min-h-[44px] bg-transparent font-bold text-brand">
              Try it with a sample resume
            </button>
          </form>
        </section>
      )}

      {result && v && (
        <section className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-6 px-5 pb-[72px] pt-3">
          <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-3.5">
            <div className="flex flex-wrap items-center gap-[22px] rounded-3xl bg-ink p-[26px] text-white">
              <div
                role="img"
                aria-label={`ATS score ${result.overall_score} out of 100`}
                className="grid h-28 w-28 flex-none place-items-center rounded-full"
                style={{ background: `conic-gradient(${v.color} 0 ${result.overall_score}%, #2A3A37 ${result.overall_score}%)` }}
              >
                <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-ink">
                  <span className="font-display text-[38px] font-extrabold">{result.overall_score}</span>
                </div>
              </div>
              <div className="min-w-[220px] flex-1">
                <b className="font-display text-[26px]">{v.title}</b>
                <p className="mb-0 mt-1.5 leading-normal text-on-dark-muted">{v.body}</p>
              </div>
            </div>
            <h2 className="font-display m-0 mt-2 text-2xl font-bold">Fix these first</h2>
            {fixes.map((f, i) => (
              <div key={f} className="flex gap-3.5 rounded-2xl border border-line bg-white p-[18px]">
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-[10px] font-extrabold ${i < 2 ? "bg-danger-soft text-danger-ink" : "bg-warning-soft text-warning-ink"}`}>{i + 1}</span>
                <span>
                  <b>{f}</b>
                  {result.top_suggestions[i] && <><br /><span className="leading-normal text-text-muted">{result.top_suggestions[i]}</span></>}
                </span>
              </div>
            ))}
            <div aria-hidden="true" className="flex flex-col gap-2.5 opacity-60 blur-[5px]">
              <div className="h-16 rounded-2xl bg-white" />
              <div className="h-16 rounded-2xl bg-white" />
            </div>
            <button type="button" onClick={() => { setResult(null); setError(null); }} className="min-h-[44px] self-start bg-transparent font-bold text-brand">
              Check a different resume
            </button>
          </div>
          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-3xl border-2 border-brand bg-white p-6">
            <b className="font-display text-2xl leading-[1.15]">See all 30 checks and fix them with AI</b>
            <span className="leading-normal text-text-muted">Save your report to a free account. We&apos;ll open it in the builder with fixes ready to accept.</span>
            <button type="button" onClick={() => saveAndGo("/signup?from=ats")} className="flex min-h-[44px] items-center justify-center gap-2.5 rounded-xl bg-ink p-[15px] font-bold text-white">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-[13px] font-extrabold text-ink">G</span>
              Continue with Google
            </button>
            <button type="button" onClick={() => saveAndGo("/signup?from=ats")} className="min-h-[44px] p-2 font-bold text-brand">
              Use email instead
            </button>
            <span className="text-center text-[13px] text-text-muted">Free forever plan. No card needed.</span>
          </aside>
        </section>
      )}

      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[820px] flex-col gap-1.5 px-5 py-16">
          <h2 className="font-display m-0 mb-2.5 text-[32px] font-bold">About ATS checks</h2>
          <FaqItem q="What is an ATS?">An applicant tracking system is the software employers use to collect, sort and search applications.</FaqItem>
          <FaqItem q="Why do resumes get rejected by ATS?">Common reasons include tables, graphics or unusual fonts, missing keywords from the job description, non-standard section headings, and PDFs that are not text-selectable.</FaqItem>
          <FaqItem q="Do you keep my resume?">Logged-out checks are processed and not stored on our servers. Your resume is only kept in your browser if you choose to save it to an account.</FaqItem>
          <p className="mt-4 text-sm text-text-muted">Already have an account? <Link href="/dashboard/ats-checker" className="font-bold text-brand">Open your ATS check</Link></p>
        </div>
      </section>
    </div>
  );
}
