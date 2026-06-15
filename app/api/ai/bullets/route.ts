import { getAnthropicClient } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    const body = await req.json();

    // Accept both builder format { job_title } and legacy { jobTitle }
    const jobTitle: string = body.job_title || body.jobTitle || '';
    const company: string = body.company || '';
    const description: string = body.description || '';
    const existing: string[] = Array.isArray(body.achievements) ? body.achievements.filter(Boolean) : [];

    if (!jobTitle) {
      return NextResponse.json({ error: 'job_title is required' }, { status: 400 });
    }

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system:
        'You are a professional resume writer. Generate exactly 5 achievement-oriented bullet points for a work experience entry. Each bullet MUST start with a strong action verb (e.g., Spearheaded, Engineered, Reduced, Increased, Delivered). Include quantifiable results where possible (percentages, dollar amounts, time saved). Demonstrate business impact. Return each bullet on its own line starting with a hyphen (-). Return only the bullet points, no preamble or extra text.',
      messages: [{
        role: 'user',
        content: `Job Title: ${jobTitle}
Company: ${company || 'Company not specified'}
Responsibilities/Context: ${description || existing.join('; ') || 'Not provided'}

Write 5 achievement-focused bullet points for this role.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response type' }, { status: 500 });
    }

    const bullets = content.text
      .split('\n')
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line) => line.length > 10);

    return NextResponse.json({ bullets });
  } catch (error) {
    console.error('AI bullets error:', error);
    return NextResponse.json({ error: 'Failed to generate bullet points' }, { status: 500 });
  }
}
