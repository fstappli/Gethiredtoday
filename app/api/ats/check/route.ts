import { NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats';
import { getCaller, limitAtsReport } from '@/lib/plan-guard';

export async function POST(req: Request) {
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
    const caller = await getCaller();
    const plan = caller.plan;
    // Job ad matching is part of the full report (Pro).
    const result = calculateATSScore(resumeText, plan === 'pro' ? jobDescription : undefined);
    if (plan === 'pro') return NextResponse.json({ ...result, locked: false });
    // Free (and logged out): score + top 3 fixes. The rest is withheld on the server.
    return NextResponse.json({ ...limitAtsReport('free', result), trigger: 'full_ats_report' });
  } catch (error) {
    console.error('ATS check error:', error);
    return NextResponse.json(
      { error: 'We hit a problem scoring your resume. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
