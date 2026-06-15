import { getAnthropicClient } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

type SuggestionType = 'bullets' | 'skills' | 'summary' | 'related-titles';

const PROMPTS: Record<SuggestionType, { system: string; user: (jobTitle: string) => string; max_tokens: number }> = {
  bullets: {
    system:
      'You are a senior resume writer. Produce exactly 10 achievement-oriented resume bullet points for the given job title. Each bullet MUST: start with a strong action verb (Spearheaded, Engineered, Reduced, Increased, Delivered, Owned, Led, Built, Shipped, Drove, Scaled); include a quantified result where plausible (%, $, time, users); be complete on ONE line; end with no period. Return ONLY the 10 bullets, one per line, each starting with "- " (hyphen space). No preamble, no numbering, no extra text.',
    user: (t) => `Job title: ${t}\n\nWrite 10 resume bullet points for this role.`,
    max_tokens: 900,
  },
  skills: {
    system:
      'You are a resume coach. List exactly 12 high-demand skills for the given job title. Mix 60% technical/hard skills and 40% soft skills. Each skill should be 1-3 words, no descriptions. Return ONLY 12 lines, one skill per line, no numbering, no bullets, no punctuation other than spaces. Focus on ATS-scannable keywords.',
    user: (t) => `Job title: ${t}\n\nList 12 relevant skills.`,
    max_tokens: 300,
  },
  summary: {
    system:
      'You are a senior resume writer. Produce exactly 5 different 2-3 sentence professional summary options for the given job title. Each summary should have a different angle: (1) results-focused, (2) leadership-focused, (3) specialist/expertise, (4) growth-focused, (5) collaboration-focused. Each must be complete, impactful, and ATS-friendly. Return ONLY the 5 summaries separated by "---" on its own line. No preamble, no numbering, no labels.',
    user: (t) => `Job title: ${t}\n\nWrite 5 summary options with different angles.`,
    max_tokens: 1200,
  },
  'related-titles': {
    system:
      'You are a career coach. Return exactly 6 closely related job titles for the given title. Each related title should be realistic and likely to overlap in skills (senior/junior variants, adjacent specializations, lateral moves). Return ONLY 6 lines, one title per line. No numbering, no bullets.',
    user: (t) => `Given job title: ${t}\n\nList 6 related job titles.`,
    max_tokens: 200,
  },
};

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
    const type = (body.type ?? '') as SuggestionType;
    const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '';

    if (!PROMPTS[type]) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: bullets, skills, summary, related-titles' }, { status: 400 });
    }
    if (!jobTitle) {
      return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('AI suggestions: ANTHROPIC_API_KEY is not configured');
      return NextResponse.json({ error: 'AI is temporarily unavailable. Please try again shortly.' }, { status: 503 });
    }

    const cfg = PROMPTS[type];
    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: cfg.max_tokens,
      system: cfg.system,
      messages: [{ role: 'user', content: cfg.user(jobTitle) }],
    });

    const content = message.content?.[0];
    if (!content || content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response type' }, { status: 500 });
    }

    // Detect refusal / meta-responses Claude sometimes returns when the
    // input looks nonsensical ("&&", empty, profanity, etc.). We don't
    // want those lines polluting the suggestion list.
    const REFUSAL_MARKERS = [
      "i'd be happy",
      'i notice',
      'appears to be',
      'could you please',
      'i apologize',
      "i can't",
      'i cannot',
      'please provide',
      'not an actual',
      'not a valid',
    ];
    const looksLikeRefusal = (line: string) => {
      const l = line.toLowerCase();
      return REFUSAL_MARKERS.some((m) => l.includes(m));
    };

    // Parse response into array of suggestions
    let suggestions: string[] = [];

    if (type === 'summary') {
      suggestions = content.text
        .split(/\n---\n|\n---|---\n/g)
        .map((s) => s.trim())
        .filter((s) => s.length > 20 && !looksLikeRefusal(s));
    } else {
      suggestions = content.text
        .split('\n')
        .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
        .filter((line) => line.length > 1 && line.length < 280 && !looksLikeRefusal(line));
    }

    // If the whole response was a refusal we may have ended up with zero
    // suggestions after filtering — return an empty array so the UI shows
    // its friendly "no suggestions yet" state instead of a mangled refusal.
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
