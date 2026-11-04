"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const TOPICS = ["Account or login", "Billing or payment", "Resume builder", "Auto-Apply", "Something else"];

const INPUT = "min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base font-normal";

export default function ContactForm({ source, defaultTopic }: { source: "public" | "dashboard"; defaultTopic?: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: defaultTopic ?? TOPICS[0], message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [signedIn, setSignedIn] = useState(false);

  // Prefill from the logged-in user so they only have to type the message.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!alive || !user) return;
        setSignedIn(true);
        const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
        setForm((f) => ({ ...f, email: f.email || user.email || "", name: f.name || meta.full_name || meta.name || "" }));
      } catch {
        // Logged-out visitors just fill the form themselves.
      }
    })();
    return () => { alive = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex min-w-0 flex-[1_1_420px] flex-col gap-3 rounded-3xl border border-line bg-white p-7">
        <h2 className="font-display m-0 text-[26px]">Message sent</h2>
        <p className="m-0 text-text-muted">Thanks, {form.name || "we got it"}. We&apos;ll reply to {form.email}, usually within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5 rounded-3xl border border-line bg-white p-7">
      <h2 className="font-display m-0 text-[26px]">Send us a message</h2>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Your name
        <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Email
        <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT} />
        {signedIn && <span className="text-xs font-normal text-text-muted">Use the email you pay with, if it differs from your login.</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Topic
        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={INPUT}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Message
        <textarea required rows={5} minLength={5} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={INPUT} />
      </label>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
      </div>
      {status === "error" && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-ink">We could not send that. Please try again, or email <a href="mailto:hello@hiredtodayapp.com" className="underline">hello@hiredtodayapp.com</a>.</p>}
      <button type="submit" disabled={status === "loading"} className="min-h-[54px] rounded-[14px] bg-brand text-base font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? "Sending..." : "Send message"}
      </button>
      <span className="text-[13px] text-text-muted">Or email us at <a href="mailto:hello@hiredtodayapp.com" className="font-semibold text-brand underline">hello@hiredtodayapp.com</a></span>
    </form>
  );
}
