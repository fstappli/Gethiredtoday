import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

// GET /api/resume — list all resumes for the authenticated user
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

// POST /api/resume — create a new resume
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce free-tier resume limit server-side
    if (user.email !== ADMIN_EMAIL) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at')
        .eq('id', user.id)
        .single();
      if (!isProActive(profile)) {
        const { count } = await supabase
          .from('resumes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if ((count ?? 0) >= 1) {
          return NextResponse.json(
            { error: 'Free plan is limited to 1 resume. Upgrade to Pro for unlimited resumes.' },
            { status: 403 }
          );
        }
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
