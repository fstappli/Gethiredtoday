/**
 * Only same-site paths are allowed as post-login / post-payment destinations.
 * Rejects backslashes, tabs/newlines and control characters (browsers treat "/\evil.com" and
 * "/<TAB>/evil.com" like "//evil.com"), then re-parses against a dummy origin to be certain.
 */
export function safeInternalPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw || /[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  try {
    const u = new URL(raw, 'http://internal.invalid');
    if (u.origin !== 'http://internal.invalid') return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
