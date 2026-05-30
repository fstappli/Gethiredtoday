import { createClient } from '@/lib/supabase';

export type Plan = 'free' | 'pro';

// ─── Pro-status helpers (single source of truth) ──────────────────────────

export type SubscriptionStatus =
  | 'free'
  | 'active'
  | 'trialing'
  | 'pro'
  | 'cancelled'
  | 'past_due';

export interface SubscriptionFields {
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
}

/** True if the user currently has Pro access — including the grace period
 *  after cancelling when `subscription_ends_at` hasn't yet passed. */
export function isProActive(
  p: SubscriptionFields | null | undefined,
  now: Date = new Date()
): boolean {
  if (!p) return false;
  const s = (p.subscription_status || '').toLowerCase();
  if (s === 'active' || s === 'trialing' || s === 'pro') return true;
  if (s === 'cancelled' && p.subscription_ends_at) {
    try {
      return new Date(p.subscription_ends_at).getTime() > now.getTime();
    } catch {
      return false;
    }
  }
  return false;
}

/** True for cancelled users who still have Pro access (grace window). */
export function isCancelledWithGrace(
  p: SubscriptionFields | null | undefined,
  now: Date = new Date()
): boolean {
  if (!p) return false;
  const s = (p.subscription_status || '').toLowerCase();
  if (s !== 'cancelled') return false;
  if (!p.subscription_ends_at) return false;
  try {
    return new Date(p.subscription_ends_at).getTime() > now.getTime();
  } catch {
    return false;
  }
}

/** Default grace period (30 days) used when we don't know the exact cycle end. */
export const DEFAULT_PERIOD_DAYS = 30;

/** Returns an ISO timestamp for `now + 30 days` — used as the default
 *  subscription_ends_at when we don't have a precise cycle end from Gumroad. */
export function monthFromNow(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + DEFAULT_PERIOD_DAYS);
  return d.toISOString();
}

/** Format a subscription_ends_at for display (e.g. "May 19, 2026"). */
export function formatEndsAt(ends: string | null | undefined): string {
  if (!ends) return '';
  try {
    const d = new Date(ends);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export const PLAN_LIMITS = {
  free: {
    maxResumes: 1,
    maxCoverLetters: 1,
    maxAISuggestions: 3,
    premiumTemplates: false,
    atsCheckerFull: false,
    pdfDownload: false,
    wordDownload: false,
    watermark: true,
    jobTailoring: false,
    coverLetterBuilder: false,
  },
  pro: {
    maxResumes: Infinity,
    maxCoverLetters: Infinity,
    maxAISuggestions: Infinity,
    premiumTemplates: true,
    atsCheckerFull: true,
    pdfDownload: true,
    wordDownload: true,
    watermark: false,
    jobTailoring: true,
    coverLetterBuilder: true,
  },
} as const;

export type FeatureKey = keyof typeof PLAN_LIMITS['free'];

/**
 * Returns true if the given plan can access the given feature.
 */
export function canUseFeature(plan: Plan, feature: FeatureKey): boolean {
  const limit = PLAN_LIMITS[plan][feature];
  if (typeof limit === 'boolean') return limit;
  if (typeof limit === 'number') return limit > 0;
  return false;
}

/**
 * Client-side: fetches the current user's plan from Supabase.
 * Returns 'free' if unauthenticated or no active subscription.
 */
export async function getUserPlan(): Promise<Plan> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'free';

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    const status = profile?.subscription_status;
    if (status === 'active' || status === 'trialing' || status === 'pro') {
      return 'pro';
    }
    return 'free';
  } catch {
    return 'free';
  }
}

/**
 * Redirects to Gumroad checkout. Requires the user to be authenticated.
 * The server-side route at /api/lemonsqueezy/checkout-redirect handles
 * attaching the user's email and the post-purchase return URL.
 */
export function startCheckout(from = '/dashboard'): void {
  window.location.href = `/upgrade?from=${encodeURIComponent(from)}`;
}
