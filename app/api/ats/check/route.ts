import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';
import { calculateATSScore } from '@/lib/ats';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.email !== ADMIN_EMAIL) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_ends_at')
      .eq('id', user.id)
      .single();
    if (!isProActive(profile)) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON with a "resumeText" field.' },
      { status: 400 }
    );
  }

  const resumeText =
    body && typeof body === 'object' && 'resumeText' in body && typeof (body as { resumeText: unknown }).resumeText === 'string'
      ? (body as { resumeText: string }).resumeText
      : '';
  const jobDescription =
    body && typeof body === 'object' && 'jobDescription' in body && typeof (body as { jobDescription: unknown }).jobDescription === 'string'
      ? (body as { jobDescription: string }).jobDescription
      : undefined;

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json(
      { error: 'Please provide resume text with at least 50 characters.' },
      { status: 400 }
    );
  }

  try {
    const result = calculateATSScore(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    console.error('ATS check error:', error);
    return NextResponse.json(
      { error: 'We hit a problem scoring your resume. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
