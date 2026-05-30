import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create table by inserting a dummy row into a raw query via rpc if available,
  // otherwise use the postgres extension approach via supabase-js
  const sql = `
    CREATE TABLE IF NOT EXISTS checkout_attempts (
      id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    uuid        REFERENCES profiles(id) ON DELETE SET NULL,
      email      text,
      from_path  text,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS checkout_attempts_created_at_idx ON checkout_attempts (created_at DESC);
    CREATE INDEX IF NOT EXISTS checkout_attempts_user_id_idx    ON checkout_attempts (user_id);
  `;

  const { error } = await admin.rpc('exec_sql', { sql });

  if (error) {
    // Try alternative: insert a test row to see if table already exists
    const { error: checkError } = await admin.from('checkout_attempts').select('id').limit(1);
    if (!checkError) {
      return NextResponse.json({ ok: true, note: 'Table already exists' });
    }
    return NextResponse.json({ error: error.message, hint: 'Run SQL manually in Supabase dashboard' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'checkout_attempts table created' });
}
