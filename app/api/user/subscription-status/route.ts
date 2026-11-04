import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive, ADMIN_EMAIL } from '@/lib/subscription';
import { reconcileGumroadPurchase } from '@/lib/gumroad-reconcile';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ isPro: false, accountCreatedAt: null }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_ends_at, created_at')
      .eq('id', user.id)
      .single();

    let isPro = user.email === ADMIN_EMAIL || isProActive(profile);
    if (!isPro && user.email && (profile?.subscription_status ?? 'free') === 'free') {
      isPro = await reconcileGumroadPurchase(user.id, user.email, {
        force: new URL(req.url).searchParams.get('refresh') === '1',
      });
    }

    return NextResponse.json({
      isPro,
      accountCreatedAt: profile?.created_at ?? null,
    });
  } catch {
    return NextResponse.json({ isPro: false, accountCreatedAt: null }, { status: 500 });
  }
}
