import { describe, it, expect, vi } from 'vitest';
import { calculateATSScore, resumeDataToText, resumeDataToScoreText, scoreResume } from '@/lib/ats';
import type { ResumeData } from '@/types';

vi.mock('@/lib/supabase-server', () => ({ createServerSupabaseClient: async () => ({}) }));
const caller = { plan: 'free' as 'free' | 'pro' };
vi.mock('@/lib/plan-guard', async () => {
  const actual = await vi.importActual<typeof import('@/lib/plan-guard')>('@/lib/plan-guard');
  return { ...actual, getCaller: async () => ({ plan: caller.plan, user: null, supabase: {} }) };
});

const ok = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;

const bullets = Array.from({ length: 12 }, (_, i) =>
  `Increased revenue by ${10 + i}% by leading a team of ${3 + i} engineers delivering platform migration number ${i}`);
const strong: ResumeData = {
  contact: { full_name: 'Sarah Ahmed', email: 'sarah.ahmed@gmail.com', phone: '+31 6 1234 5678', location: 'Amsterdam', linkedin: 'linkedin.com/in/sarah-ahmed' } as never,
  summary: 'Product designer with eight years of experience shipping consumer and fintech applications across web and mobile platforms.',
  work_experience: [
    { job_title: 'Senior Designer', company: 'Northwind', location: 'Amsterdam', description: 'Led design of checkout flows', achievements: bullets } as never,
    { job_title: 'Designer', company: 'Bluefin', achievements: bullets } as never,
  ],
  education: [{ degree: 'BA', field_of_study: 'Visual Communication', institution: 'Rietveld' } as never],
  skills: ['Figma', 'Research', 'Prototyping', 'Accessibility'].map((name) => ({ name })) as never,
  certifications: [], languages: [], volunteer_work: [], projects: [], custom_sections: [],
};
const blank: ResumeData = { contact: {} as never, summary: '', work_experience: [], education: [], skills: [], certifications: [], languages: [], volunteer_work: [], projects: [], custom_sections: [] };

describe('range and determinism', () => {
  const inputs = ['', ' ', '   \n\t', 'a', 'x'.repeat(15_000), 'word '.repeat(50_000), '😀'.repeat(5000), 'مرحبا بالعالم '.repeat(300), 'email a@b.co summary experience education skills', '\u0000￿'];
  it.each(inputs.map((s, i) => [i, s]))('integer in [0,100] for input #%i', (_i, s) => {
    const r = calculateATSScore(s as string);
    expect(ok(r.overall_score)).toBe(true);
    expect(calculateATSScore(s as string).overall_score).toBe(r.overall_score);
    expect(ok(calculateATSScore(s as string, 'x'.repeat(5000) + ' kubernetes ' + '😀').overall_score)).toBe(true);
  });
  it('empty JD / whitespace JD stays in range', () => {
    expect(ok(calculateATSScore(strongText(), '').overall_score)).toBe(true);
    expect(ok(calculateATSScore(strongText(), '   ').overall_score)).toBe(true);
  });
  it('scoreResume tolerates null/undefined fields and huge arrays (crashes on null skill entry, lib/ats.ts:203)', () => {
    const weird = { contact: null, summary: null, work_experience: null, education: undefined, skills: null } as never;
    expect(ok(scoreResume(weird))).toBe(true);
    const huge = { ...strong, skills: Array.from({ length: 50_000 }, (_, i) => ({ name: 'skill' + i })) } as never;
    expect(ok(scoreResume(huge))).toBe(true);
    expect(ok(scoreResume({ ...strong, skills: [null, { name: null }] } as never))).toBe(true);
  });
  it('blank resume scores 0', () => expect(scoreResume(blank)).toBe(0));
});

function strongText() { return resumeDataToText(strong); }

describe('monotonic sanity', () => {
  it('strong >> sparse', () => {
    const s = scoreResume(strong);
    const sparse = scoreResume({ ...blank, contact: { full_name: 'Bob Smith' } as never });
    expect(s).toBeGreaterThanOrEqual(80);
    expect(s).toBeGreaterThan(sparse + 40);
  });
  it('removing sections lowers score', () => {
    const base = scoreResume(strong);
    expect(scoreResume({ ...strong, summary: '' })).toBeLessThan(base);
    expect(scoreResume({ ...strong, skills: [] })).toBeLessThan(base);
    expect(scoreResume({ ...strong, work_experience: [] })).toBeLessThan(base);
    expect(scoreResume({ ...strong, education: [] })).toBeLessThan(base);
  });
  it('JD keywords raise keyword score', () => {
    const t = strongText();
    const jdHit = 'Looking for designer with prototyping accessibility research checkout experience';
    const jdMiss = 'Kubernetes terraform golang microservices observability pipelines';
    expect(calculateATSScore(t, jdHit).overall_score).toBeGreaterThan(calculateATSScore(t, jdMiss).overall_score);
    expect(calculateATSScore(t, jdHit).sections.keywords.score).toBeGreaterThan(calculateATSScore(t, jdMiss).sections.keywords.score);
  });
  it('starter placeholder resume is not scored high', () => {
    const ph: ResumeData = { ...blank, contact: { full_name: 'Your Name', email: 'your.email@example.com', phone: '+1 (555) 123-4567', location: 'City, State' } as never, summary: 'Replace this with 2-3 sentences' };
    expect(scoreResume(ph)).toBe(0);
  });
});

describe('scoring rule correctness (false positives / negatives)', () => {
  const pad = ' lorem'.repeat(320);
  const full = (extra: string) => `${extra}\nsummary experience education skills ${pad}`;
  // BUG: substring matching - the word "experience" anywhere counts as a section heading
  it('section detection is substring based, so prose "experience" counts as a section', () => {
    const r = calculateATSScore('I like nothing. no sections here. my experience is great. ' + pad);
    expect(r.top_issues.join()).toContain('Work experience section missing');
  });
  // BUG: phone regex is US-only (needs 10 digits contiguous groups 3-3-4)
  it('valid international phone numbers are rejected', () => {
    const r = calculateATSScore(full('a@b.com +44 20 7946 0958'));
    expect(r.top_issues).not.toContain('Missing phone number');
  });
  it('phone regex false positive on any 10-digit number (e.g. order/ID)', () => {
    const r = calculateATSScore(full('a@b.com id 1234567890'));
    expect(r.top_issues).toContain('Missing phone number');
  });
  it('phone detection fails for common Pakistani/UAE style +92 300 1234567', () => {
    const r = calculateATSScore(full('a@b.com +92 300 1234567'));
    expect(r.top_issues).not.toContain('Missing phone number');
  });
  it('email regex accepts plus-addresses? ', () => {
    // [\w.-]+ excludes "+" but matches the tail after it, still passes
    expect(calculateATSScore(full('first+tag@mail.co.uk')).top_issues).not.toContain('Missing email address');
  });
  it('"Add education" only when words missing, but "degree"/"college" in prose counts', () => {
    const r = calculateATSScore('degree ' + pad);
    expect(r.top_suggestions).toContain('Add education section');
  });
  it('LinkedIn credited for the bare word "linkedin" (not a URL)', () => {
    const r = calculateATSScore(full('I use linkedin sometimes'));
    expect(r.top_suggestions).toContain('Add your LinkedIn profile URL');
  });
  it('JD keyword match counts duplicates and punctuation tokens ("engineer," never matches "engineer")', () => {
    const r = calculateATSScore('engineer ' + pad + ' a@b.com', 'engineer, engineer, engineer, engineer,');
    expect(r.sections.keywords.score).toBeGreaterThan(50);
  });
  it('stopwords >4 chars ("which", "their", "years") dominate JD match; non-English JD with short words ignored', () => {
    const t = 'python developer ' + pad;
    const r = calculateATSScore(t, 'Python AWS SQL Go Java'); // all <=4 chars after filter except "python"
    expect(r.sections.keywords.score).toBeLessThanOrEqual(100);
    expect(r.sections.keywords.score).toBeLessThan(100);
  });
  it('table/graphic detection only finds HTML tokens, never real tables in pasted text; always 90 formatting', () => {
    const r = calculateATSScore('Name | Skill | Years\n--- | --- | ---\n' + full('a@b.com'));
    expect(r.sections.formatting.score).toBeLessThan(90);
  });
  it('word count counts only whitespace-separated tokens (CJK text = 1 word)', () => {
    const r = calculateATSScore('我是一名软件工程师，拥有十年经验。'.repeat(100));
    expect(r.top_issues.join()).not.toContain('too short');
  });
  it('custom_sections are not scored/flattened', () => {
    const t = resumeDataToText({ ...strong, custom_sections: [{ title: 'Awards', items: ['Won X'] }] as never });
    expect(t).toContain('Awards');
  });
});

describe('consistency across surfaces', () => {
  it('checker (resumeDataToText + calculateATSScore) equals card score (scoreResume) for clean data', () => {
    expect(calculateATSScore(resumeDataToText(strong)).overall_score).toBe(scoreResume(strong));
  });
  it('checker (placeholder-stripped text) matches the card/builder score for a resume with placeholder fields', () => {
    const d: ResumeData = { ...strong, contact: { ...strong.contact, email: 'your.email@example.com', phone: '(555) 123-4567' } as never };
    // the dashboard checker now flattens with resumeDataToScoreText, like scoreResume does
    expect(calculateATSScore(resumeDataToScoreText(d)).overall_score).toBe(scoreResume(d));
  });
  it('paste of the same text as flattened resume gives same score', () => {
    expect(calculateATSScore(strongText()).overall_score).toBe(calculateATSScore(strongText() + '\n').overall_score);
  });
});

describe('free vs pro gating on /api/ats/check', () => {
  const post = async (body: unknown, raw = false) => {
    const { POST } = await import('@/app/api/ats/check/route');
    return POST(new Request('http://x/api/ats/check', { method: 'POST', body: raw ? (body as string) : JSON.stringify(body) }));
  };
  const text = 'summary experience education skills a@b.com 555-123-4567 ' + 'lorem '.repeat(300);
  it('free: only score + top 3, no sections, JD ignored', async () => {
    caller.plan = 'free';
    const j = await (await post({ resumeText: text, jobDescription: 'lorem ipsum dolor' })).json();
    expect(ok(j.overall_score)).toBe(true);
    expect(j.sections).toBeUndefined();
    expect(j.top_issues.length).toBeLessThanOrEqual(3);
    expect(j.top_suggestions.length).toBeLessThanOrEqual(3);
    expect(j.locked).toBe(true);
    const noJd = await (await post({ resumeText: text })).json();
    expect(j.overall_score).toBe(noJd.overall_score);
  });
  it('pro: full report', async () => {
    caller.plan = 'pro';
    const j = await (await post({ resumeText: text })).json();
    expect(j.sections).toBeDefined();
    expect(j.locked).toBe(false);
  });
  it('validation: bad JSON, empty, short, wrong types -> 400', async () => {
    caller.plan = 'free';
    expect((await post('{not json', true)).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect((await post({ resumeText: 'short' })).status).toBe(400);
    expect((await post({ resumeText: 123 })).status).toBe(400);
    expect((await post(null)).status).toBe(400);
  });
  it('no server-side size cap on resumeText/jobDescription (2MB accepted)', async () => {
    caller.plan = 'free';
    const res = await post({ resumeText: 'x '.repeat(1_000_000) });
    expect(res.status).toBe(413);
  });
});

describe('/api/ats/extract', () => {
  const call = async (file: File | null) => {
    const { POST } = await import('@/app/api/ats/extract/route');
    const fd = new FormData();
    if (file) fd.append('file', file);
    const res = await POST(new Request('http://x/api/ats/extract', { method: 'POST', body: fd }) as never);
    return { status: res.status, json: await res.json() };
  };
  it('txt ok', async () => {
    const r = await call(new File(['hello resume'], 'r.txt', { type: 'text/plain' }));
    expect(r.status).toBe(200);
    expect(r.json.text).toBe('hello resume');
  });
  it('no file -> 400', async () => expect((await call(null)).status).toBe(400));
  it('over 5MB -> 413', async () => expect((await call(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'r.txt'))).status).toBe(413));
  it('pdf -> 415 with paste hint (PDF unsupported)', async () => {
    const r = await call(new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' }));
    expect(r.status).toBe(415);
    expect(r.json.error).toMatch(/PDF/);
  });
  it('legacy .doc -> 415', async () => expect((await call(new File(['x'], 'cv.doc', { type: 'application/msword' }))).status).toBe(415));
  it('corrupt docx -> 422 friendly', async () => {
    const r = await call(new File(['not a zip'], 'cv.docx'));
    expect(r.status).toBe(422);
    expect(r.json.error).toMatch(/paste/i);
  });
  it('empty txt returns 200 with empty text (no server-side "empty file" message)', async () => {
    const r = await call(new File([''], 'cv.txt', { type: 'text/plain' }));
    expect(r.status).toBe(200);
    expect(r.json.text).toBe('');
  });
  it('binary file labelled text/plain is rejected with a friendly 422', async () => {
    const r = await call(new File([new Uint8Array([0, 255, 254, 1, 2, 3])], 'a.bin', { type: 'text/plain' }));
    expect(r.status).toBe(422);
  });
});

describe('performance (ReDoS)', () => {
  // BUG CRITICAL: /[\w.-]+@[\w.-]+\.\w+/ is quadratic on long tokens without '@'; 100k chars ~ 17s blocking the event loop.
  it('100k-char single token scores in <500ms', () => {
    const t = Date.now();
    calculateATSScore('x'.repeat(100_000));
    expect(Date.now() - t).toBeLessThan(500);
  }, 60000);
});
