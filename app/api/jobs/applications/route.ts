import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { ApplicationStatus } from '@/types/jobs';

const APPLIED_STATUSES: ApplicationStatus[] = ['applied', 'viewed', 'interview', 'offer', 'rejected'];

// GET /api/jobs/applications — list user's applications with optional status filter
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const statusParam = searchParams.get('status');
    const validStatuses: ApplicationStatus[] = ['matched', 'redirected', 'applied', 'viewed', 'interview', 'rejected', 'offer'];
    const filterStatuses: ApplicationStatus[] = statusParam
      ? (statusParam.split(',').filter((s) => validStatuses.includes(s as ApplicationStatus)) as ApplicationStatus[])
      : [];

    let query = supabase
      .from('applications')
      .select(`
        id, status, application_type, applied_at, redirected_at, source, created_at, updated_at,
        jobs (
          id, title, company, location, redirect_url, category, contract_type, work_type, salary_min, salary_max, currency
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filterStatuses.length > 0) {
      query = query.in('status', filterStatuses);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('applications query error:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Separate counts
    const all = applications ?? [];
    const appliedCount = all.filter((a) => APPLIED_STATUSES.includes(a.status as ApplicationStatus)).length;
    const redirectedCount = all.filter((a) => a.status === 'redirected').length;

    return NextResponse.json({
      applications: all,
      counts: {
        applied: appliedCount,
        redirected: redirectedCount,
        total: all.length,
      },
    });
  } catch (err) {
    console.error('GET /api/jobs/applications error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
