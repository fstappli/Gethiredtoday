"use client";

import { useState } from "react";
import Link from "next/link";
import { track, getAttribution } from "@/lib/analytics";

/**
 * The one email capture for logged-out visitors. Sends a useful 5-point ATS checklist.
 * Honeypot field `company`, explicit consent, no dark patterns.
 */
export default function EmailCaptureCard({
  source,
  variant = "light",
  heading = "Get the 5-point ATS resume checklist",
  body = "A short checklist to run before you send your resume anywhere. Free, one email.",
  className = "",
}: {
  source: string;
  variant?: "light" | "dark";
  heading?: string;
  body?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  const dark = variant === "dark";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S{2,}$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!consent) { setError("Please tick the box so we know you want the email."); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          consent,
          source,
          page: window.location.pathname,
          attribution: getAttribution() ?? {},
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(typeof d.error === "string" ? d.error : "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      track("generate_lead", { source, method: "checklist" });
      setStatus("done");
    } catch {
      setError("We could not reach the server. Please try again.");
      setStatus("idle");
    }
  }

  const wrap = dark ? "bg-ink text-white" : "border border-line bg-white text-ink";
  const muted = dark ? "text-on-dark-muted" : "text-text-muted";

  if (status === "done") {
    return (
      <div role="status" className={`rounded-3xl p-7 ${wrap} ${className}`}>
        <b className="font-display block text-2xl">Check your inbox</b>
        <p className={`mb-4 mt-2 ${muted}`}>The checklist is on its way. While you wait, see how your own resume scores.</p>
        <Link href="/ats-checker" className="inline-flex min-h-[48px] items-center rounded-xl bg-mint-bright px-5 font-extrabold text-ink no-underline">
          Check my resume free
        </Link>
      </div>
    );
  }

  return (
    <section aria-label="Email signup" className={`rounded-3xl p-7 ${wrap} ${className}`}>
      <b className="font-display block text-2xl leading-tight">{heading}</b>
      <p className={`mb-4 mt-2 leading-normal ${muted}`}>{body}</p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <label className="flex min-w-[220px] flex-1 flex-col">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 text-base text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-[48px] rounded-xl bg-brand px-5 text-base font-extrabold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Send me the checklist"}
          </button>
        </div>
        {/* Honeypot: hidden from people and assistive tech */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
          <label>Company<input type="text" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} /></label>
        </div>
        <label className={`flex items-start gap-2.5 text-sm ${muted}`}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-[#0B6E5F]" />
          <span>
            Email me this checklist and occasional job search tips. Unsubscribe any time. See our{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
        {error ? <p role="alert" className={`m-0 text-sm font-semibold ${dark ? "text-[#FFB59A]" : "text-danger-ink"}`}>{error}</p> : null}
      </form>
    </section>
  );
}
