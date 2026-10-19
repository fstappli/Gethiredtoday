/** Shared helpers for sign-up, log-in and the post-auth hand-off. Client-safe. */

export function safeNext(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

/**
 * Every auth path lands on /auth/claim first. It moves any logged-out work
 * (lib/lazy-draft.ts) into the new account, then continues to `next`.
 */
export function claimPath(next: string): string {
  return `/auth/claim?next=${encodeURIComponent(next)}`;
}

export function callbackUrl(origin: string, next: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(claimPath(next))}`;
}

/** Carry ?template=, ?from= and ?redirect= across auth pages. */
export function carryParams(sp: URLSearchParams, extra: Record<string, string> = {}): string {
  const out = new URLSearchParams();
  for (const k of ['redirect', 'template', 'from']) {
    const v = sp.get(k);
    if (v) out.set(k, v);
  }
  for (const [k, v] of Object.entries(extra)) out.set(k, v);
  const s = out.toString();
  return s ? `?${s}` : '';
}

/** Where a brand-new user should land after sign-up. */
export function signupNext(sp: URLSearchParams): string {
  const redirect = sp.get('redirect') ?? sp.get('next');
  if (redirect && safeNext(redirect, '') ) return safeNext(redirect);
  const q = new URLSearchParams();
  const tpl = sp.get('template');
  const from = sp.get('from');
  if (tpl) q.set('template', tpl);
  if (from) q.set('from', from);
  const s = q.toString();
  return s ? `/onboarding?${s}` : '/onboarding';
}

export const LINKEDIN_ENABLED = process.env.NEXT_PUBLIC_AUTH_LINKEDIN === 'true';
export const APPLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_APPLE === 'true';
