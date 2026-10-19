"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

export type CtaSource = "article" | "example" | "template" | "tool";

const DEFAULTS: Record<CtaSource, { heading: string; body: string; primary: string }> = {
  article: {
    heading: "Put this advice into your resume",
    body: "Build your resume free, check its ATS score and download the PDF. No card needed.",
    primary: "Build my resume free",
  },
  example: {
    heading: "Start from this example",
    body: "Copy the structure, swap in your own details and download your PDF free.",
    primary: "Use this example free",
  },
  template: {
    heading: "Try this template with your details",
    body: "Pick a template, fill it in and download the PDF free. You can switch templates any time.",
    primary: "Start free",
  },
  tool: {
    heading: "Fix what the checker finds",
    body: "Create a free account to edit your resume, see your top fixes and keep your score history.",
    primary: "Create free account",
  },
};

export function InlineSignupCta({
  source,
  heading,
  body,
  className = "",
}: {
  source: CtaSource;
  heading?: string;
  body?: string;
  className?: string;
}) {
  const d = DEFAULTS[source];
  return (
    <aside aria-label="Create a free account" className={`my-10 rounded-3xl bg-ink p-7 text-white ${className}`}>
      <b className="font-display block text-2xl leading-tight">{heading ?? d.heading}</b>
      <p className="mb-5 mt-2 leading-normal text-on-dark-muted">{body ?? d.body}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/signup?from=${source}`}
          onClick={() => track("sign_up_start", { source, placement: "inline_cta" })}
          className="inline-flex min-h-[48px] items-center rounded-xl bg-mint-bright px-5 font-extrabold text-ink no-underline"
        >
          {d.primary}
        </Link>
        <Link href="/ats-checker" className="inline-flex min-h-[44px] items-center px-2 font-bold text-mint-bright no-underline">
          Check my resume score
        </Link>
      </div>
    </aside>
  );
}

const DISMISS_KEY = "ght:sticky-cta-dismissed";

/** Mobile-only bottom bar. Dismissible, remembered per browser, sits above content but under modals. */
export function StickySignupBar({ source = "article" }: { source?: CtaSource }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch { /* ignore */ }
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    try { window.localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div role="region" aria-label="Create a free account" className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-line bg-white px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5 shadow-[0_-8px_24px_rgba(13,27,25,.08)] min-[761px]:hidden">
      <span className="min-w-0 flex-1 text-sm font-bold leading-tight text-ink">Free resume + PDF. No card needed.</span>
      <Link
        href={`/signup?from=${source}_sticky`}
        onClick={() => track("sign_up_start", { source, placement: "sticky_bar" })}
        className="inline-flex min-h-[44px] flex-none items-center rounded-xl bg-brand px-4 text-sm font-extrabold text-white no-underline"
      >
        Start free
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="grid h-11 w-11 flex-none place-items-center rounded-full text-text-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}

export default InlineSignupCta;
