import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const CHECKOUT_URL = 'https://kreativecasa.gumroad.com/l/kxtcbs';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Only allow returning the user to safe in-app paths (starts with a single
// slash, no protocol-relative URLs, no absolute URLs). Anything else falls
// back to /dashboard.
function safeReturnPath(raw: string | null): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Preserve the upgrade intent through login so the user lands right
    // back at checkout after authenticating.
    const loginUrl = new URL('/login', req.url);
    const from = req.nextUrl.searchParams.get('from');
    const redirectTarget = `/api/lemonsqueezy/checkout-redirect${from ? `?from=${encodeURIComponent(from)}` : ''}`;
    loginUrl.searchParams.set('redirect', redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  // "from" is the in-app path the user was on when they clicked upgrade —
  // we'll bring them back here after payment completes on Gumroad.
  const from = safeReturnPath(req.nextUrl.searchParams.get('from'));
  const appOrigin = req.nextUrl.origin;
  const returnUrl = `${appOrigin}/api/purchase/return?to=${encodeURIComponent(from)}`;

  // Log the checkout attempt so we can measure drop-off
  try {
    await getAdminClient()
      .from('checkout_attempts')
      .insert({ user_id: user.id, email: user.email, from_path: from });
  } catch {
    // Table may not exist yet — silent fail, never block the checkout
  }

  const url = new URL(CHECKOUT_URL);
  url.searchParams.set('email', user.email!);
  url.searchParams.set('wanted', 'true'); // skip landing page, go straight to checkout
  // Gumroad honors `redirect_url` — after a successful purchase, the user is
  // bounced here instead of staying on Gumroad's thank-you page.
  url.searchParams.set('redirect_url', returnUrl);

  return NextResponse.redirect(url.toString());
}
