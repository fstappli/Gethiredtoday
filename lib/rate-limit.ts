/**
 * Small per-instance rate limiter. It slows abuse of anonymous endpoints but is NOT durable across
 * serverless instances; pair it with a Vercel Firewall rate-limit rule for hard guarantees.
 */
const buckets = new Map<string, { n: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
}

/** Client IP from headers Vercel sets itself (not spoofable by the caller), falling back to the last hop. */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    'unknown'
  );
}
