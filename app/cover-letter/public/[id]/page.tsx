import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PublicCoverLetterRow {
  id: string;
  title: string;
  template_id: string;
  data: {
    body?: string;
    subject?: string;
  };
  contact: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  is_public: boolean;
}

async function getPublicCoverLetter(id: string): Promise<PublicCoverLetterRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('cover_letters')
    .select('id, title, template_id, data, contact, is_public')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle<PublicCoverLetterRow>();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cl = await getPublicCoverLetter(id);
  if (!cl) return { title: 'Cover letter not found' };
  const name = cl.contact?.full_name || cl.title;
  return {
    title: `${name} — Cover Letter`,
    description: `Cover letter by ${name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicCoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cl = await getPublicCoverLetter(id);
  if (!cl) notFound();

  const accent = '#4AB7A6';
  const contact = cl.contact || {};
  const name = contact.full_name || cl.title;
  const body = cl.data?.body || '';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between text-xs text-slate-500">
        <Link href="/" className="font-semibold" style={{ color: accent }}>HiredTodayApp</Link>
        <span>Viewing a shared cover letter</span>
      </div>

      <article className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-100 rounded-xl p-8 sm:p-12">
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.location && <span>{contact.location}</span>}
          </div>
        </header>

        {body ? (
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{body}</div>
        ) : (
          <p className="text-sm text-slate-400 italic">No content available.</p>
        )}
      </article>

      <div className="max-w-3xl mx-auto mt-6 text-center text-xs text-slate-400">
        Built with <Link href="/" className="font-semibold hover:underline" style={{ color: accent }}>HiredTodayApp</Link>
      </div>
    </div>
  );
}
