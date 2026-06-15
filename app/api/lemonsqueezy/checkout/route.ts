import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const CHECKOUT_URL = 'https://kreativecasa.gumroad.com/l/kxtcbs';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();

    const url = new URL(CHECKOUT_URL);
    const checkoutEmail = email || user.email;
    if (checkoutEmail) url.searchParams.set('email', checkoutEmail);
    url.searchParams.set('wanted', 'true');

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
