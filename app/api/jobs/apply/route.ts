import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import type { Job } from '@/types/jobs';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { job_id, redirect_url, job_data, resume_id, source } = body as {
      job_id: string;
      redirect_url?: string;
      job_data?: Job;
      resume_id?: string;
      source?: string;
    };

    if (!job_id || typeof job_id !== 'string') {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();

    // Ensure job exists in DB — insert only if not cached; never overwrite
    // a well-populated row with potentially incomplete frontend data.
    if (job_data) {
      await admin.from('jobs').upsert({
        id: job_id,
        source: job_data.source ?? 'adzuna',
        title: job_data.title,
        company: job_data.company,
        location: job_data.location,
        country: job_data.country ?? 'us',
        description: job_data.description,
        redirect_url: job_data.redirect_url,
        category: job_data.category,
        contract_type: job_data.contract_type,
        work_type: job_data.work_type,
        salary_min: job_data.salary_min,
        salary_max: job_data.salary_max,
        currency: job_data.currency ?? 'USD',
        posted_at: job_data.posted_at,
        fetched_at: job_data.fetched_at ?? new Date().toISOString(),
        raw: {},
      }, { onConflict: 'id', ignoreDuplicates: true });
    }

    const { data: job } = await admin
      .from('jobs')
      .select('id, redirect_url')
      .eq('id', job_id)
      .single();

    const finalRedirectUrl = job?.redirect_url ?? redirect_url ?? job_data?.redirect_url;
    if (!finalRedirectUrl) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('job_id', job_id)
      .single();

    if (existing) {
      return NextResponse.json({ application: existing, duplicate: true, redirect_url: finalRedirectUrl });
    }

    // Get user's active resume
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
      .upsert({
        user_id: user.id,
        job_id,
        resume_id: activeResumeId,
        status: 'redirected',
        application_type: 'external_redirect',
        redirected_at: new Date().toISOString(),
        source: source ?? 'manual',
      }, { onConflict: 'user_id,job_id', ignoreDuplicates: true })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create application:', insertError);
      // URL was already opened — return success without tracking
      return NextResponse.json({ redirect_url: finalRedirectUrl, tracking: false });
    }

    return NextResponse.json({ application, redirect_url: finalRedirectUrl }, { status: 201 });
  } catch (err) {
    console.error('POST /api/jobs/apply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
