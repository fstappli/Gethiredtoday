import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getCaller, upgradeRequired } from '@/lib/plan-guard';
import { isTemplateAllowed } from '@/lib/subscription';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: resume, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ resume });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, data, template_id, ats_score, color_scheme, font_size, is_public } = body;

  if (template_id !== undefined) {
    const caller = await getCaller();
    if (!isTemplateAllowed(caller.plan, template_id)) {
      return upgradeRequired('templates', 'That template is on Pro. Pick a free template or upgrade.');
    }
  }

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updatePayload.title = title;
  if (data !== undefined) updatePayload.data = data;
  if (template_id !== undefined) updatePayload.template_id = template_id;
  if (ats_score !== undefined) updatePayload.ats_score = ats_score;
  if (color_scheme !== undefined) updatePayload.color_scheme = color_scheme;
  if (font_size !== undefined) updatePayload.font_size = font_size;
  if (is_public !== undefined) updatePayload.is_public = is_public;

  const { data: resume, error } = await supabase
    .from('resumes')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }

  return NextResponse.json({ resume });
}

// PUT is an alias for PATCH, supports clients that send PUT for updates
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
