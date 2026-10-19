import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isTemplateAllowed } from '@/lib/subscription';
import { getCaller, canCreateResume, upgradeRequired } from '@/lib/plan-guard';
import { NextResponse } from 'next/server';


// GET /api/resume, list all resumes for the authenticated user
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('id, title, template_id, ats_score, color_scheme, font_size, is_public, data, created_at, updated_at, finalized_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch resumes:', error);
      return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
    }

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('GET /api/resume error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/resume, create a new resume
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce free-tier resume limit and template set server-side
    const caller = await getCaller();
    if (caller.plan === 'free') {
      const { count } = await supabase
        .from('resumes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (!canCreateResume('free', count ?? 0)) {
        return upgradeRequired('second_resume', 'Free plan is limited to 1 resume. Upgrade to Pro for unlimited resumes.');
      }
    }

    const body = await req.json();
    const {
      title = 'My Resume',
      template_id = 'classic',
      data = {},
      ats_score,
      color_scheme = 'teal',
      font_size = 'medium',
      is_public = false,
    } = body;

    if (!isTemplateAllowed(caller.plan, template_id)) {
      return upgradeRequired('templates', 'That template is on Pro. Pick a free template or upgrade.');
    }

    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        template_id,
        data,
        ats_score: ats_score ?? null,
        color_scheme,
        font_size,
        is_public,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create resume:', error);
      return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
    }

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error('POST /api/resume error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
