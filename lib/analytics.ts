/**
 * Thin, safe wrapper around gtag plus first-touch attribution.
 * Client only: every call is a no-op on the server and never throws.
 */
export type AnalyticsEvent =
  | 'view_pricing'
  | 'sign_up_start'
  | 'sign_up'
  | 'generate_lead'
  | 'ats_check_complete'
  | 'resume_created'
  | 'begin_checkout'
  | 'upgrade_prompt_view'
  | 'upgrade_prompt_click';

type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const ATTR_KEY = 'ght:attribution:v1';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_path?: string;
  first_seen?: number;
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    const attr = getAttribution();
    window.gtag('event', event, { ...params, utm_source: attr?.utm_source, utm_medium: attr?.utm_medium, utm_campaign: attr?.utm_campaign });
  } catch { /* never break the page for analytics */ }
}

/** Capture only once: first touch wins. */
export function captureAttribution(): void {
  try {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(ATTR_KEY)) return;
    const sp = new URLSearchParams(window.location.search);
    let referrer = '';
    try { referrer = document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer.slice(0, 300) : ''; } catch { /* ignore */ }
    const a: Attribution = {
      utm_source: sp.get('utm_source') ?? undefined,
      utm_medium: sp.get('utm_medium') ?? undefined,
      utm_campaign: sp.get('utm_campaign') ?? undefined,
      utm_term: sp.get('utm_term') ?? undefined,
      utm_content: sp.get('utm_content') ?? undefined,
      referrer: referrer || undefined,
      landing_path: window.location.pathname,
      first_seen: Date.now(),
    };
    window.localStorage.setItem(ATTR_KEY, JSON.stringify(a));
  } catch { /* ignore */ }
}

export function getAttribution(): Attribution | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(ATTR_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
