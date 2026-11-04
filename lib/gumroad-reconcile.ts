import { activatePro, ilikeExact } from '@/lib/pro-activation';

export { ilikeExact };

// A live subscription renews monthly, so its latest sale is recent.
const RECENT_SALE_DAYS = 35;

interface GumroadSale {
  id: string;
  paid?: boolean;
  refunded?: boolean;
  chargedback?: boolean;
  product_permalink?: string;
  subscription_id?: string | null;
  created_at?: string;
  subscription_ended_at?: string | null;
  subscription_cancelled_at?: string | null;
  subscription_failed_at?: string | null;
}

/** Finds a paid, non-refunded, still-live Gumroad sale for this email. */
export async function findActiveGumroadSale(
  email: string,
  accessToken: string
): Promise<{ saleId: string; subscriptionId?: string | null } | null> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; sales?: GumroadSale[] };
    if (!json.success) return null;
    const PRODUCT_PERMALINK = process.env.GUMROAD_PRODUCT_PERMALINK ?? 'kxtcbs';
    const cutoff = Date.now() - RECENT_SALE_DAYS * 24 * 60 * 60 * 1000;
    const valid = (json.sales ?? []).find((s) => {
      if (!s.paid || s.refunded || s.chargedback) return false;
      if (s.product_permalink !== PRODUCT_PERMALINK) return false;
      if (s.subscription_ended_at || s.subscription_cancelled_at || s.subscription_failed_at) return false;
      const created = s.created_at ? new Date(s.created_at).getTime() : NaN;
      return Number.isFinite(created) && created >= cutoff;
    });
    return valid ? { saleId: valid.id, subscriptionId: valid.subscription_id ?? null } : null;
  } catch {
    return null;
  }
}

// Best-effort per-instance throttle so free users don't hit Gumroad on every page load.
const lastChecked = new Map<string, number>();
const THROTTLE_MS = 5 * 60 * 1000;

/**
 * Safety net for missed webhooks: if a free user has a live paid Gumroad sale,
 * upgrade the profile. Returns true if the profile was upgraded.
 */
export async function reconcileGumroadPurchase(
  userId: string,
  email: string,
  opts: { force?: boolean } = {}
): Promise<boolean> {
  const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
  if (!accessToken) return false;

  const now = Date.now();
  if (!opts.force && now - (lastChecked.get(userId) ?? 0) < THROTTLE_MS) return false;
  lastChecked.set(userId, now);

  const sale = await findActiveGumroadSale(email, accessToken);
  if (!sale) return false;

  try {
    const { matched, newlyPro } = await activatePro({ userId }, { subscriptionId: sale.subscriptionId ?? sale.saleId });
    if (newlyPro) console.warn(`[reconcile] upgraded ${email} from a missed webhook (sale ${sale.saleId})`);
    return matched > 0;
  } catch (err) {
    console.error(`[reconcile] update failed for ${userId}:`, err);
    return false;
  }
}
