import { NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats';

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
