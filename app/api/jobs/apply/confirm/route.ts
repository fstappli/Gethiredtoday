import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/jobs/apply/confirm — user confirms they completed external application
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { application_id, confirmed } = await req.json();
    if (!application_id || typeof application_id !== 'string') {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: app } = await supabase
      .from('applications')
      .select('id, status, user_id')
      .eq('id', application_id)
      .eq('user_id', user.id)
      .single();

    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const newStatus = confirmed ? 'applied' : 'redirected';

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        applied_at: confirmed ? new Date().toISOString() : null,
      })
      .eq('id', application_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update application:', updateError);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    return NextResponse.json({ application: updated });
  } catch (err) {
    console.error('POST /api/jobs/apply/confirm error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
