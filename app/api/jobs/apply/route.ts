import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/jobs/apply — create an application record (external_redirect type)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_id, resume_id, source } = await req.json();
    if (!job_id || typeof job_id !== 'string') {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    // Verify the job exists
    const { data: job } = await supabase
      .from('jobs')
      .select('id, redirect_url, title')
      .eq('id', job_id)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check for existing application (prevent duplicates)
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('job_id', job_id)
      .single();

    if (existing) {
      return NextResponse.json({
        application: existing,
        duplicate: true,
        redirect_url: job.redirect_url,
      });
    }

    // Get user's active resume if not provided
    let activeResumeId = resume_id ?? null;
    if (!activeResumeId) {
      const { data: resume } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .not('finalized_at', 'is', null)
        .order('finalized_at', { ascending: false })
        .limit(1)
        .single();
      activeResumeId = resume?.id ?? null;
    }

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id,
        resume_id: activeResumeId,
        status: 'redirected',
        application_type: 'external_redirect',
        redirected_at: new Date().toISOString(),
        source: source ?? 'manual',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create application:', insertError);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    return NextResponse.json({
      application,
      redirect_url: job.redirect_url,
    }, { status: 201 });
  } catch (err) {
    console.error('POST /api/jobs/apply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
