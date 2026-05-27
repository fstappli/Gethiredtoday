import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ResumeData, WorkExperience, Education, Skill } from '@/types';
import Logo from '@/components/logo';

export const dynamic = 'force-dynamic';

interface PublicResumeRow {
  id: string;
  title: string;
  template_id: string;
  color_scheme: string | null;
  font_size: string | null;
  data: ResumeData;
  is_public: boolean;
}

async function getPublicResume(id: string): Promise<PublicResumeRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('resumes')
    .select('id, title, template_id, color_scheme, font_size, data, is_public')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle<PublicResumeRow>();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getPublicResume(id);
  if (!r) return { title: 'Resume not found' };
  const name = r.data?.contact?.full_name || r.title;
  return {
    title: `${name} — Resume`,
    description: r.data?.summary?.slice(0, 160) || `Professional resume of ${name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getPublicResume(id);
  if (!r) notFound();

  const d = r.data;
  const contact = d.contact || ({} as ResumeData['contact']);
  const name = contact.full_name || r.title;
  const accent = '#4AB7A6';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between text-xs text-slate-500">
        <Logo href="/" size="sm" />
        <span>Viewing a shared resume</span>
      </div>

      <article className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-100 rounded-xl p-8 sm:p-12">
        {/* Header */}
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.location && <span>{contact.location}</span>}
            {contact.linkedin && (
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent }}>
                LinkedIn
              </a>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent }}>
                Website
              </a>
            )}
            {contact.github && (
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: accent }}>
                GitHub
              </a>
            )}
          </div>
        </header>

        {/* Summary */}
        {d.summary && (
          <Section title="Summary" accent={accent}>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{d.summary}</p>
          </Section>
        )}

        {/* Experience */}
        {d.work_experience && d.work_experience.length > 0 && (
          <Section title="Work Experience" accent={accent}>
            <div className="space-y-5">
              {d.work_experience.map((job: WorkExperience, i: number) => (
                <div key={i}>
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{job.job_title}</p>
                      <p className="text-sm text-slate-600">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {job.start_date}{job.end_date ? ` – ${job.end_date}` : job.is_current ? ' – Present' : ''}
                    </span>
                  </div>
                  {job.description && (
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{job.description}</p>
                  )}
                  {job.achievements && job.achievements.length > 0 && (
                    <ul className="mt-2 space-y-1 list-disc pl-5 text-sm text-slate-700">
                      {job.achievements.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {d.education && d.education.length > 0 && (
          <Section title="Education" accent={accent}>
            <div className="space-y-3">
              {d.education.map((ed: Education, i: number) => (
                <div key={i} className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{ed.degree}{ed.field_of_study ? ` in ${ed.field_of_study}` : ''}</p>
                    <p className="text-sm text-slate-600">{ed.institution}{ed.location ? ` · ${ed.location}` : ''}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {ed.start_date}{ed.end_date ? ` – ${ed.end_date}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        {d.skills && d.skills.length > 0 && (
          <Section title="Skills" accent={accent}>
            <div className="flex flex-wrap gap-2">
              {d.skills.map((s: Skill, i: number) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {s.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {d.projects && d.projects.length > 0 && (
          <Section title="Projects" accent={accent}>
            <div className="space-y-3">
              {d.projects.map((p, i: number) => (
                <div key={i}>
                  <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                  {p.description && <p className="text-sm text-slate-600 mt-0.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {d.certifications && d.certifications.length > 0 && (
          <Section title="Certifications" accent={accent}>
            <ul className="space-y-1 text-sm text-slate-700">
              {d.certifications.map((c, i: number) => (
                <li key={i}>
                  <span className="font-medium text-slate-900">{c.name}</span>
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date_issued ? ` (${c.date_issued})` : ''}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Languages */}
        {d.languages && d.languages.length > 0 && (
          <Section title="Languages" accent={accent}>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
              {d.languages.map((l, i: number) => (
                <span key={i}>
                  <span className="font-medium text-slate-900">{l.name}</span>
                  {l.proficiency ? ` (${l.proficiency})` : ''}
                </span>
              ))}
            </div>
          </Section>
        )}
      </article>

      <div className="max-w-3xl mx-auto mt-6 text-center text-xs text-slate-400">
        Built with <Logo href="/" size="sm" />
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: accent }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
