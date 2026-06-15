/**
 * Resume import — user uploads a PDF / DOCX / TXT of their existing resume,
 * we extract the text, ask Claude to structure it into the ResumeData schema,
 * then create a fresh resume row and return its id so the client can jump
 * straight into the builder with everything pre-filled.
 *
 * Supported inputs:
 *   - PDF  (native Claude document input — no extra parser needed)
 *   - DOCX (extracted via mammoth)
 *   - TXT  (passed straight through)
 *
 * Vercel function runtime: nodejs (Anthropic SDK + mammoth need Node).
 * Max file size: 8 MB — more than enough for any resume.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getAnthropicClient } from '@/lib/ai';
import { scoreResume } from '@/lib/ats';
import type { ResumeData } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const EXTRACT_SYSTEM = `You are a resume parsing expert. Extract the structured data from the attached resume and return it as valid JSON matching EXACTLY this shape:

{
  "contact": {
    "full_name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "github": ""
  },
  "summary": "",
  "work_experience": [
    {
      "id": "w1",
      "job_title": "",
      "company": "",
      "location": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "is_current": false,
      "description": "",
      "achievements": []
    }
  ],
  "education": [
    {
      "id": "e1",
      "degree": "",
      "field_of_study": "",
      "institution": "",
      "location": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "is_current": false,
      "gpa": "",
      "description": ""
    }
  ],
  "skills": [
    { "id": "s1", "name": "", "level": "Intermediate", "category": "" }
  ],
  "certifications": [],
  "languages": [],
  "projects": [],
  "volunteer_work": [],
  "custom_sections": []
}

Rules:
- Return ONLY valid JSON. No markdown fences, no commentary, no preamble.
- Use "" for unknown text fields; use [] for unknown arrays.
- Normalise dates to "YYYY-MM". Common inputs: "Jan 2020" → "2020-01", "2020" → "2020-01", "Present"/"Current" → leave end_date "" and set is_current: true.
- Split work_experience bullet points into the "achievements" array. The "description" should be a short 1-2 sentence summary of the role, not bullets.
- For skills, "level" must be one of: "Beginner", "Intermediate", "Advanced", "Expert" — use "Intermediate" if unclear. "category" is optional ("Technical", "Soft", "Language", etc.).
- Use stable short ids like w1, w2, e1, e2, s1, s2.
- Extract linkedin/github/website only if present; otherwise leave as "".`;

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

type ExtractContentBlock =
  | { type: 'text'; text: string }
  | {
      type: 'document';
      source: { type: 'base64'; media_type: 'application/pdf'; data: string };
    };

async function extractFromFile(file: File): Promise<ResumeData> {
  const buf = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  let contentBlocks: ExtractContentBlock[];

  if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    // Claude accepts PDF documents natively. Much more accurate than any
    // JS-side PDF text extractor because the model sees layout too.
    contentBlocks = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: buf.toString('base64'),
        },
      },
      {
        type: 'text',
        text: 'Parse this resume into the JSON shape described in the system prompt. Return ONLY the JSON object.',
      },
    ];
  } else if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    // Extract raw text from the docx with mammoth (pure JS, safe on Vercel).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as typeof import('mammoth');
    const { value: text } = await mammoth.extractRawText({ buffer: buf });
    contentBlocks = [
      {
        type: 'text',
        text: `Parse this resume into the JSON shape described in the system prompt. Return ONLY the JSON object.\n\nResume text:\n---\n${text}\n---`,
      },
    ];
  } else {
    // Plain text / .txt / unknown — best-effort.
    const text = buf.toString('utf8');
    contentBlocks = [
      {
        type: 'text',
        text: `Parse this resume into the JSON shape described in the system prompt. Return ONLY the JSON object.\n\nResume text:\n---\n${text}\n---`,
      },
    ];
  }

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: EXTRACT_SYSTEM,
    messages: [{ role: 'user', content: contentBlocks }],
  });

  const first = message.content[0];
  if (!first || first.type !== 'text') {
    throw new Error('Unexpected Claude response (not text).');
  }

  const jsonText = stripJsonFences(first.text);
  const parsed = JSON.parse(jsonText) as ResumeData;

  // Defensive: ensure all expected top-level arrays exist, in case Claude
  // omitted a section. The builder expects them to be arrays, not undefined.
  return {
    contact: {
      full_name: parsed.contact?.full_name ?? '',
      email: parsed.contact?.email ?? '',
      phone: parsed.contact?.phone ?? '',
      location: parsed.contact?.location ?? '',
      linkedin: parsed.contact?.linkedin ?? '',
      website: parsed.contact?.website ?? '',
      github: parsed.contact?.github ?? '',
      photo_url: parsed.contact?.photo_url ?? '',
    },
    summary: parsed.summary ?? '',
    work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    volunteer_work: Array.isArray(parsed.volunteer_work) ? parsed.volunteer_work : [],
    custom_sections: Array.isArray(parsed.custom_sections) ? parsed.custom_sections : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload a resume.' },
        { status: 401 }
      );
    }

    // Enforce free-tier resume limit on import
    const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';
    if (user.email !== ADMIN_EMAIL) {
      const { isProActive } = await import('@/lib/subscription');
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Resume import is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const templateId = ((formData.get('template_id') as string) || 'classic').trim() || 'classic';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Please choose a file to upload.' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'That file appears to be empty.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File is too large (max 8 MB). Yours is ${(file.size / 1024 / 1024).toFixed(1)} MB.` },
        { status: 400 }
      );
    }

    const lowerName = file.name.toLowerCase();
    const supported =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain' ||
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.txt');
    if (!supported) {
      return NextResponse.json(
        {
          error:
            'Unsupported file type. Please upload a PDF, DOCX, or TXT. If you have a .doc, save it as .docx first.',
        },
        { status: 400 }
      );
    }

    let data: ResumeData;
    try {
      data = await extractFromFile(file);
    } catch (err) {
      console.error('[resume/import] parse failed:', err);
      return NextResponse.json(
        {
          error:
            'We could not read this resume. Try exporting a text-based PDF (not a scan) or save it as .docx and upload again.',
        },
        { status: 422 }
      );
    }

    const title = data.contact?.full_name
      ? `${data.contact.full_name}'s Resume`
      : 'Imported Resume';

    // Seed the ATS score so the dashboard card shows a real number from the
    // moment the import completes, instead of a dash until the user clicks
    // Save in the builder.
    const initialAts = scoreResume(data);

    const { data: resume, error: insertErr } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        template_id: templateId,
        data,
        ats_score: initialAts,
        color_scheme: 'teal',
        font_size: 'medium',
        is_public: false,
      })
      .select('id')
      .single();

    if (insertErr || !resume) {
      console.error('[resume/import] DB insert failed:', insertErr);
      return NextResponse.json(
        { error: 'We parsed your resume but could not save it. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resume_id: resume.id,
      title,
      // Surface a short "what we extracted" summary so the client can show a
      // success toast before navigating to the builder.
      extracted: {
        name: data.contact.full_name || null,
        work_count: data.work_experience.length,
        education_count: data.education.length,
        skills_count: data.skills.length,
      },
    });
  } catch (err) {
    console.error('[resume/import] unhandled:', err);
    return NextResponse.json(
      {
        error:
          'Something unexpected happened during import. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
