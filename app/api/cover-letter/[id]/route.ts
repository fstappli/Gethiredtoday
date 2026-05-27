import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET /api/cover-letter/[id] — fetch a single cover letter
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }

    // Allow access if owner or cover letter is public
    if (coverLetter.user_id !== user.id && !coverLetter.is_public) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('GET /api/cover-letter/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cover-letter/[id] — partial update (same as PUT, used by share modal)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// PUT /api/cover-letter/[id] — update a cover letter
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('cover_letters')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ['title', 'template_id', 'data', 'contact', 'is_public'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update cover letter:', error);
      return NextResponse.json({ error: 'Failed to update cover letter' }, { status: 500 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('PUT /api/cover-letter/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cover-letter/[id] — delete a cover letter
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership before deleting
    const { data: existing, error: fetchError } = await supabase
      .from('cover_letters')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete cover letter:', error);
      return NextResponse.json({ error: 'Failed to delete cover letter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cover-letter/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
