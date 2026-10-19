import { NextResponse } from 'next/server';
import { getCaller, upgradeRequired } from '@/lib/plan-guard';
import { PLAN_LIMITS } from '@/lib/subscription';

type Kind = 'pdf' | 'word' | 'cover_letter_pdf';

/**
 * POST /api/export/check { kind }
 * Call before any client-side export. 200 { allowed: true } or 402 upgrade_required.
 * PDF is always free; Word and cover letter downloads are Pro.
 */
export async function POST(req: Request) {
  const caller = await getCaller();
  if (!caller.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let kind: Kind = 'pdf';
  try {
    const body = await req.json();
    if (body?.kind === 'word' || body?.kind === 'cover_letter_pdf' || body?.kind === 'pdf') kind = body.kind;
  } catch { /* default pdf */ }

  const limits = PLAN_LIMITS[caller.plan];
  if (kind === 'word' && !limits.wordDownload) {
    return upgradeRequired('word_export', 'Word export is a Pro feature. Your PDF download is always free.');
  }
  if (kind === 'cover_letter_pdf' && !limits.coverLetterDownload) {
    return upgradeRequired('cover_letter_download', 'Cover letter downloads are a Pro feature. You can still write and preview for free.');
  }
  return NextResponse.json({ allowed: true, plan: caller.plan });
}
