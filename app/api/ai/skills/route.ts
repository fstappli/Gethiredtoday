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

    const { jobTitle } = await req.json();

    if (!jobTitle || typeof jobTitle !== 'string') {
      return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
    }

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system:
        'You are a professional resume coach with deep knowledge of industry skill requirements. Return a list of skills — one per line, no numbering, no bullets, no extra text. Include a mix of technical hard skills and relevant soft skills. Return only the skills, nothing else.',
      messages: [{
        role: 'user',
        content: `List 15-20 of the most relevant and in-demand skills for a ${jobTitle}. Include both technical skills and key soft skills that hiring managers look for in this role.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response type' }, { status: 500 });
    }

    const skills = content.text
      .split('\n')
      .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter((line) => line.length > 1 && line.length < 80);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('AI skills error:', error);
    return NextResponse.json({ error: 'Failed to generate skills' }, { status: 500 });
  }
}
