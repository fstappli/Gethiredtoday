"use client";

import { useState } from "react";

export default function WeeklyTipsForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: email.split("@")[0] }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") return <p role="status" className="m-0 font-bold text-brand-dark">Thanks! Check your inbox.</p>;

  return (
    <form onSubmit={submit} className="flex flex-[1_1_360px] flex-wrap gap-2">
      <label className="flex flex-[1_1_220px]">
        <span className="sr-only">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-[50px] flex-1 rounded-xl border-[1.5px] border-[#D6C79A] bg-white px-3.5 text-base"
        />
      </label>
      <button type="submit" disabled={status === "loading"} className="min-h-[50px] rounded-xl bg-ink px-5 font-extrabold text-white disabled:opacity-60">
        {status === "loading" ? "Sending..." : "Send me tips"}
      </button>
      {status === "error" && <p role="alert" className="m-0 w-full text-sm font-semibold text-danger-ink">Enter a valid email and try again.</p>}
    </form>
  );
}
