import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/jobs/matches — fetch current matches for authenticated user's finalized resume
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Find finalized resume
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, title, finalized_at')
      .eq('user_id', user.id)
      .not('finalized_at', 'is', null)
      .order('finalized_at', { ascending: false })
      .limit(1)
      .single();

    if (!resume) {
      return NextResponse.json({ matches: [], resume: null, has_finalized_resume: false });
    }

    const { data: matches, error } = await supabase
      .from('job_matches')
      .select(`
        id, match_score, matched_reasons, created_at,
        jobs (
          id, title, company, location, country, description,
          redirect_url, category, contract_type, work_type,
          salary_min, salary_max, currency, posted_at
        )
      `)
      .eq('user_id', user.id)
      .eq('resume_id', resume.id)
      .order('match_score', { ascending: false })
      .limit(50);

    if (error) {
      console.error('job_matches query error:', error);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    // Get application statuses for these jobs
    const jobIds = (matches ?? [])
      .map((m) => {
        const j = m.jobs as unknown as { id: string } | null;
        return j?.id ?? null;
      })
      .filter((id): id is string => Boolean(id));

    const { data: applications } = jobIds.length > 0
      ? await supabase
          .from('applications')
          .select('job_id, status')
          .eq('user_id', user.id)
          .in('job_id', jobIds)
      : { data: [] };

    const appliedMap = new Map((applications ?? []).map((a) => [a.job_id, a.status]));

    const enriched = (matches ?? []).map((m) => {
      const j = m.jobs as unknown as { id: string } | null;
      return {
        ...m,
        application_status: appliedMap.get(j?.id ?? '') ?? null,
      };
    });

    return NextResponse.json({
      matches: enriched,
      resume: { id: resume.id, title: resume.title, finalized_at: resume.finalized_at },
      has_finalized_resume: true,
    });
  } catch (err) {
    console.error('GET /api/jobs/matches error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
