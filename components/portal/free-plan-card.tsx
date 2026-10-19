"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { PRICING } from "@/lib/site-config";
import { upgradeHref, type UpgradeTrigger } from "@/lib/upgrade-triggers";
import { track } from "@/lib/analytics";

const AI_DAILY_LIMIT = 5;

/** Compact "your free plan" card with real usage and one honest upgrade link. Never blocks anything. */
export default function FreePlanCard({ resumeCount }: { resumeCount: number }) {
  const [aiUsed, setAiUsed] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const day = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("feature_usage")
          .select("count")
          .eq("user_id", user.id)
          .eq("feature", "ai_rewrite")
          .eq("day", day)
          .maybeSingle();
        if (!error) setAiUsed((data as { count?: number } | null)?.count ?? 0);
      } catch { /* usage table may not exist yet */ }
    })();
  }, []);

  const trigger: UpgradeTrigger = aiUsed !== null && aiUsed >= AI_DAILY_LIMIT ? "ai_limit" : resumeCount >= 1 ? "second_resume" : "auto_apply";

  const rows: { label: string; value: string; hot: boolean }[] = [
    { label: "Resumes", value: `${resumeCount} of 1`, hot: resumeCount >= 1 },
  ];
  if (aiUsed !== null) rows.push({ label: "AI rewrites today", value: `${Math.min(aiUsed, AI_DAILY_LIMIT)} of ${AI_DAILY_LIMIT}`, hot: aiUsed >= AI_DAILY_LIMIT });

  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-sun-soft p-5">
      <b className="font-display text-xl leading-[1.2]">Your free plan</b>
      <dl className="m-0 flex flex-col gap-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <dt className="text-text-muted">{r.label}</dt>
            <dd className={`m-0 font-extrabold ${r.hot ? "text-warning-ink" : "text-ink"}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <span className="text-sm leading-normal text-text-muted">
        Pro adds unlimited resumes and AI rewrites, all templates, Word export and Auto-Apply with review mode. Your PDF download stays free.
      </span>
      <Link
        href={upgradeHref(trigger)}
        onClick={() => track("upgrade_prompt_click", { trigger, surface: "dashboard_card" })}
        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-ink p-[13px] text-center font-extrabold text-white no-underline"
      >
        See Pro, ${PRICING.proMonthly}/mo
      </Link>
    </div>
  );
}
