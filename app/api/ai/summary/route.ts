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

    // Accept both builder format { contact, work_experience } and legacy { jobTitle, experienceItems }
    let jobTitle: string;
    let contextLines: string;

    if (body.work_experience) {
      // Builder format
      const exp = Array.isArray(body.work_experience) ? body.work_experience : [];
      jobTitle = exp[0]?.job_title || body.contact?.full_name || 'Professional';
      contextLines = exp
        .slice(0, 3)
        .map((e: { job_title?: string; company?: string; description?: string }) =>
          `${e.job_title || ''}${e.company ? ' at ' + e.company : ''}${e.description ? ': ' + e.description : ''}`
        )
        .filter(Boolean)
        .join('; ');
    } else {
      // Legacy format
      jobTitle = body.jobTitle;
      contextLines = Array.isArray(body.experienceItems)
        ? body.experienceItems.join(', ')
        : body.experienceItems || '';
    }

    if (!jobTitle) {
      return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
    }

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Write a compelling 3-sentence professional resume summary for a ${jobTitle}.
Key experience context: ${contextLines || 'not specified'}.
Rules: start with the job title and years/level, include one specific achievement or strength, end with a value statement. Return only the summary text, no quotes, no labels.`,
      }],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
