import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive, PLAN_LIMITS, type Plan } from '@/lib/subscription';
import type { UpgradeTrigger } from '@/lib/upgrade-triggers';

export const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

/* ─── Pure helpers (unit tested) ─────────────────────────────────────────── */

export type UsageFeature = 'ai_rewrite' | 'job_match_view' | 'auto_apply';

/** UTC day key, e.g. "2026-10-19". */
export function dayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** How many more uses of a daily-limited feature remain. Infinity for Pro. */
export function remainingToday(limit: number, used: number): number {
  if (!Number.isFinite(limit)) return Infinity;
  return Math.max(0, limit - Math.max(0, used));
}

export function canCreateResume(plan: Plan, existingCount: number): boolean {
  return existingCount < PLAN_LIMITS[plan].maxResumes;
}

export function canUseAiRewrite(plan: Plan, usedToday: number): boolean {
  return remainingToday(PLAN_LIMITS[plan].aiRewritesPerDay, usedToday) > 0;
}

/** Free users see their top N scored matches; others are locked. */
export function applyMatchLimit<T extends { match_score: number }>(
  plan: Plan,
  matches: T[],
  limit: number = PLAN_LIMITS[plan].jobMatchesPerDay
): (T & { locked: boolean })[] {
  const sorted = [...matches].sort((a, b) => b.match_score - a.match_score);
  return sorted.map((m, i) => (
    i < limit ? { ...m, locked: false } : { ...m, match_score: -1, locked: true }
  ));
}

/** Free ATS report: score + top N fixes only. */
export function limitAtsReport<T extends {
  overall_score: number;
  top_issues: string[];
  top_suggestions: string[];
}>(plan: Plan, result: T) {
  if (plan === 'pro') return { ...result, locked: false as const };
  const n = PLAN_LIMITS.free.atsTopFixes;
  return {
    overall_score: result.overall_score,
    top_issues: result.top_issues.slice(0, n),
    top_suggestions: result.top_suggestions.slice(0, n),
    locked: true as const,
    locked_fix_count: Math.max(0, result.top_suggestions.length - n),
  };
}

export function clampAutoApplyCap(cap: number): number {
  return Math.max(1, Math.min(PLAN_LIMITS.pro.autoApplyPerDay, Math.floor(cap) || 1));
}

/* ─── Server helpers ─────────────────────────────────────────────────────── */

export function upgradeRequired(trigger: UpgradeTrigger, error: string, status: 402 | 403 = 402) {
  return NextResponse.json({ error, code: 'upgrade_required', trigger }, { status });
}

export interface Caller {
  supabase: SupabaseClient;
  user: User | null;
  plan: Plan;
}

/** Resolve the signed-in user and their plan. Admin is always Pro. */
export async function getCaller(): Promise<Caller> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, plan: 'free' };
  if (user.email === ADMIN_EMAIL) return { supabase, user, plan: 'pro' };
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_ends_at')
    .eq('id', user.id)
    .single();
  return { supabase, user, plan: isProActive(profile) ? 'pro' : 'free' };
}

export async function getUsage(supabase: SupabaseClient, userId: string, feature: UsageFeature): Promise<number> {
  const { data } = await supabase
    .from('feature_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('day', dayKey())
    .maybeSingle();
  return (data as { count?: number } | null)?.count ?? 0;
}

/** Increment today's counter; returns the new value. Fails open if the table is missing. */
export async function bumpUsage(supabase: SupabaseClient, userId: string, feature: UsageFeature, by = 1): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('bump_feature_usage', { p_feature: feature, p_by: by });
    if (error) return 0;
    return typeof data === 'number' ? data : 0;
  } catch {
    return 0;
  }
}

/**
 * Gate an AI rewrite endpoint. Returns a NextResponse to send back when the
 * request must be blocked (401 / 402), or null when allowed (and counted).
 */
export async function guardAiRewrite(caller: Caller): Promise<NextResponse | null> {
  if (!caller.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.plan === 'pro') return null;
  const used = await getUsage(caller.supabase, caller.user.id, 'ai_rewrite');
  if (!canUseAiRewrite(caller.plan, used)) {
    return upgradeRequired('ai_limit', 'You used your 5 free AI rewrites today. Upgrade to Pro for unlimited rewrites.');
  }
  await bumpUsage(caller.supabase, caller.user.id, 'ai_rewrite');
  return null;
}
