import { NextRequest, NextResponse } from 'next/server';
import { MAX_ATS_TEXT_CHARS } from '@/lib/ats';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { zipUncompressedSize } from '@/lib/zip-guard';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
// A .docx is a zip; refuse ones that would inflate far beyond any real resume (zip bombs).
const MAX_UNZIPPED_BYTES = 40 * 1024 * 1024;

/** Public helper: turns an uploaded .docx / .txt resume into plain text for the ATS checker. Nothing is stored. */
export async function POST(req: NextRequest) {
  if (!rateLimit(`ats-extract:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many uploads. Please wait a minute and try again.' }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Upload a file to continue.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Upload a file to continue.' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That file is over 5 MB.' }, { status: 413 });

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  const tooLong = () =>
    NextResponse.json({ error: 'That resume is longer than we can check. Paste the most recent roles instead.' }, { status: 413 });
  try {
    if (name.endsWith('.docx')) {
      const unzipped = zipUncompressedSize(buf);
      if (unzipped === null) throw new Error('not a readable docx');
      if (unzipped > MAX_UNZIPPED_BYTES) {
        return NextResponse.json({ error: 'That file is too large to read. Paste the text instead.' }, { status: 413 });
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth') as typeof import('mammoth');
      const { value } = await mammoth.extractRawText({ buffer: buf });
      if (value.length > MAX_ATS_TEXT_CHARS) return tooLong();
      return NextResponse.json({ text: value });
    }
    if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
      // A real text file has no NUL bytes and decodes cleanly; anything else is a binary file with a text label.
      if (buf.subarray(0, 4096).includes(0)) throw new Error('binary content');
      const text = buf.toString('utf8');
      const bad = (text.match(/\uFFFD/g) ?? []).length;
      if (bad > Math.max(2, text.length * 0.02)) throw new Error('not valid text');
      if (text.length > MAX_ATS_TEXT_CHARS) return tooLong();
      return NextResponse.json({ text });
    }
  } catch {
    return NextResponse.json({ error: 'We could not read that file. Paste the text instead.' }, { status: 422 });
  }
  return NextResponse.json(
    { error: 'We can read Word (.docx) and text files here. For a PDF, copy the text and paste it below.' },
    { status: 415 },
  );
}
