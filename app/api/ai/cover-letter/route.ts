import { getAnthropicClient } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'Use a polished, business-appropriate tone. Be confident and precise.',
  friendly: 'Use a warm, approachable tone while remaining professional. Be personable and genuine.',
  enthusiastic: 'Use an energetic, passionate tone that conveys genuine excitement about the role and company.',
  formal: 'Use a highly formal, conservative tone with traditional business language. Avoid contractions.',
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { jobTitle, company, recipientName, tone, skills, yearsExperience } = await req.json();

    if (!jobTitle || typeof jobTitle !== 'string') {
      return NextResponse.json({ error: 'jobTitle is required' }, { status: 400 });
    }
    if (!company || typeof company !== 'string') {
      return NextResponse.json({ error: 'company is required' }, { status: 400 });
    }

    const toneKey = tone && TONE_INSTRUCTIONS[tone] ? tone : 'professional';
    const toneInstruction = TONE_INSTRUCTIONS[toneKey];

    const skillsText = Array.isArray(skills) && skills.length > 0
      ? skills.join(', ')
      : 'not specified';

    const experienceText = yearsExperience
      ? `${yearsExperience} years of experience`
      : 'relevant experience';

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are a professional cover letter writer. Write a compelling cover letter body consisting of exactly 3 paragraphs. Do NOT include a salutation, greeting, closing, or signature — only the body paragraphs. ${toneInstruction} Be specific to the company and role. Avoid generic filler phrases. Return only the 3 body paragraphs separated by blank lines.`,
      messages: [{
        role: 'user',
        content: `Write a cover letter body for a ${jobTitle} position at ${company}.
${recipientName ? `The hiring manager's name is ${recipientName}.` : ''}
Candidate has ${experienceText}.
Key skills: ${skillsText}.

Write 3 compelling body paragraphs that highlight relevant qualifications and demonstrate genuine interest in this specific company and role.`
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response type' }, { status: 500 });
    }

    const letter = content.text.trim();
    return NextResponse.json({ letter });
  } catch (error) {
    console.error('AI cover letter error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
