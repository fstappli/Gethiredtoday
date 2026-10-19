"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const TOPICS = ["Account or login", "Billing", "Resume builder", "Auto-Apply", "Something else"];

const HELP = [
  { t: "Billing or cancelling", d: "Manage your plan yourself in two clicks", href: "/dashboard/billing" },
  { t: "What's free and what's Pro", d: "Compare plans", href: "/pricing" },
  { t: "How Auto-Apply works", d: "Review mode, limits and safety", href: "/auto-apply" },
];

const INPUT = "min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base font-normal";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: TOPICS[0], message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-10 px-5 pb-[72px] pt-14">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px]">
            <h1 className="font-display m-0 text-[40px] font-bold leading-[1.02] tracking-[-1.7px] min-[761px]:text-[54px]">Hi there. How can we help?</h1>
            <p className="m-0 text-lg leading-[1.55] text-text-muted">A real person reads every message. We usually reply within [response time].</p>
            <div className="flex flex-col gap-2.5">
              {HELP.map((h) => (
                <Link key={h.href} href={h.href} className="flex items-center justify-between rounded-2xl border border-line bg-white px-[18px] py-4 text-ink no-underline">
                  <span><b>{h.t}</b><br /><span className="text-sm text-text-muted">{h.d}</span></span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>

          {status === "success" ? (
            <div role="status" className="flex min-w-0 flex-[1_1_420px] flex-col gap-3 rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display m-0 text-[26px]">Message sent</h2>
              <p className="m-0 text-text-muted">Thanks, {form.name || "we got it"}. We&apos;ll reply to {form.email}.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5 rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display m-0 text-[26px]">Send us a message</h2>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Your name
                <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Email
                <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Topic
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={INPUT}>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Message
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={INPUT} />
              </label>
              {status === "error" && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-ink">We could not send that. Please try again or email us.</p>}
              <button type="submit" disabled={status === "loading"} className="min-h-[54px] rounded-[14px] bg-brand text-base font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
              <span className="text-[13px] text-text-muted">Or email us at [support email]</span>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
