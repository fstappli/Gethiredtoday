import { NextRequest, NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;

/** Public helper: turns an uploaded .pdf / .docx / .txt resume into plain text for the ATS checker. Nothing is stored. */
export async function POST(req: NextRequest) {
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
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      if (text.trim().length < 20) {
        return NextResponse.json(
          { error: 'That PDF has no selectable text (it may be a scan). Paste the text instead.' },
          { status: 422 },
        );
      }
      return NextResponse.json({ text });
    }
    if (name.endsWith('.docx')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth') as typeof import('mammoth');
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return NextResponse.json({ text: value });
    }
    if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
      return NextResponse.json({ text: buf.toString('utf8') });
    }
  } catch {
    return NextResponse.json({ error: 'We could not read that file. Paste the text instead.' }, { status: 422 });
  }
  return NextResponse.json(
    { error: 'We can read PDF, Word (.docx) and text files here.' },
    { status: 415 },
  );
}
