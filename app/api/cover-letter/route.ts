import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// GET /api/cover-letter — list all cover letters for the authenticated user
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: coverLetters, error } = await supabase
      .from('cover_letters')
      .select('id, title, template_id, is_public, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch cover letters:', error);
      return NextResponse.json({ error: 'Failed to fetch cover letters' }, { status: 500 });
    }

    return NextResponse.json({ coverLetters });
  } catch (error) {
    console.error('GET /api/cover-letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cover-letter — create a new cover letter
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title = 'My Cover Letter',
      template_id = 'professional',
      data = {},
      contact = {},
      is_public = false,
    } = body;

    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: user.id,
        title,
        template_id,
        data,
        contact,
        is_public,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create cover letter:', error);
      return NextResponse.json({ error: 'Failed to create cover letter' }, { status: 500 });
    }

    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cover-letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
