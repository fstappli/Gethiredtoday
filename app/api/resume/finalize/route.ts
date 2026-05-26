import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/resume/finalize — mark a resume as the user's active job-search resume
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resume_id } = await req.json();
    if (!resume_id || typeof resume_id !== 'string') {
      return NextResponse.json({ error: 'resume_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, data')
      .eq('id', resume_id)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Clear finalized_at on all other resumes for this user
    await supabase
      .from('resumes')
      .update({ finalized_at: null })
      .eq('user_id', user.id)
      .neq('id', resume_id);

    // Set finalized_at on selected resume
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ finalized_at: new Date().toISOString() })
      .eq('id', resume_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to finalize resume:', updateError);
      return NextResponse.json({ error: 'Failed to finalize resume' }, { status: 500 });
    }

    return NextResponse.json({ success: true, resume_id });
  } catch (err) {
    console.error('POST /api/resume/finalize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/resume/finalize — un-finalize the active resume
export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await supabase
      .from('resumes')
      .update({ finalized_at: null })
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/resume/finalize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
