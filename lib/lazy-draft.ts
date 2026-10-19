/**
 * Lazy registration: logged-out work (ATS check, first builder step) is kept in
 * localStorage, then claimed into the account right after sign-up / log-in.
 * Client-only. All reads/writes are wrapped so private mode never throws.
 */
export type LazyDraft =
  | { kind: 'ats'; resumeText: string; jobText?: string; score?: number; fixes?: string[]; savedAt: number }
  | { kind: 'builder'; templateId?: string; targetRole?: string; data: Record<string, unknown>; savedAt: number };

const KEY = 'ght:lazy-draft:v1';

export function saveLazyDraft(draft: LazyDraft): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

export function readLazyDraft(): LazyDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LazyDraft) : null;
  } catch { return null; }
}

export function clearLazyDraft(): void {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Where to send a user after auth when a draft is waiting. */
export function postAuthPath(): string {
  const d = readLazyDraft();
  if (!d) return '/onboarding';
  return d.kind === 'ats' ? '/dashboard/ats-checker?claim=1' : '/builder/resume/new?claim=1';
}
