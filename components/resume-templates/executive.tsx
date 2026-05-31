'use client';

import { ResumeData } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props { data: ResumeData; colorScheme?: string; fontSize?: 'small' | 'medium' | 'large'; }

const CS: Record<string, { bg: string; accent: string; gold: string }> = {
  purple: { bg: '#1e1033', accent: '#a78bfa', gold: '#fbbf24' },
  teal:   { bg: '#0c2c2a', accent: '#5eead4', gold: '#fbbf24' },
  blue:   { bg: '#0f1f4c', accent: '#93c5fd', gold: '#fbbf24' },
  rose:   { bg: '#2d0a14', accent: '#fca5a5', gold: '#fbbf24' },
  slate:  { bg: '#0f172a', accent: '#94a3b8', gold: '#e2e8f0' },
};
const FS: Record<string, Record<string, string>> = {
  small:  { base: '12px', sm: '11px', xs: '10px', lg: '14px', xl: '17px', '2xl': '26px', '3xl': '36px' },
  medium: { base: '13.5px', sm: '12.5px', xs: '11px', lg: '16px', xl: '20px', '2xl': '30px', '3xl': '42px' },
  large:  { base: '15px', sm: '14px', xs: '12.5px', lg: '18px', xl: '22px', '2xl': '34px', '3xl': '50px' },
};

export default function ExecutiveTemplate({ data, colorScheme = 'purple', fontSize = 'medium' }: Props) {
  const c = CS[colorScheme] ?? CS.purple;
  const fs = FS[fontSize] ?? FS.medium;
  const d = { contact: (data.contact ?? {}) as ResumeData['contact'], work_experience: data.work_experience ?? [], education: data.education ?? [], skills: data.skills ?? [], certifications: data.certifications ?? [], languages: data.languages ?? [], volunteer_work: data.volunteer_work ?? [], projects: data.projects ?? [], custom_sections: data.custom_sections ?? [], summary: data.summary ?? '' };

  const Sec = ({ title }: { title: string }) => (
    <div style={{ margin: '16px 0 9px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '20px', height: '2px', background: c.gold, flexShrink: 0 }} />
      <span style={{ fontSize: fs.xs, fontWeight: 800, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontFamily: 'Arial, sans-serif' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  );

  const contactParts = [d.contact.email, d.contact.phone, d.contact.location, d.contact.linkedin, d.contact.website, d.contact.github].filter(Boolean);

  return (
    <div id="resume-preview" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: fs.base, lineHeight: 1.55, color: '#1f2937', background: '#fff', boxSizing: 'border-box' as const }}>

      {/* Rich dark header */}
      <div style={{ background: c.bg, padding: '16mm 20mm 14mm', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative corner */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '140px', height: '140px', borderRadius: '0 0 0 140px', background: `${c.accent}15` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '80px', height: '80px', borderRadius: '0 80px 0 0', background: `${c.gold}10` }} />

        <h1 style={{ fontSize: fs['3xl'], fontWeight: 700, color: '#ffffff', margin: '0 0 4px', letterSpacing: '0.015em', fontFamily: "'Georgia', serif", lineHeight: 1.05 }}>
          {d.contact.full_name || 'Your Name'}
        </h1>
        {d.work_experience[0]?.job_title && (
          <div style={{ fontSize: fs.xl, color: c.accent, fontWeight: 500, marginBottom: '10px', letterSpacing: '0.02em' }}>{d.work_experience[0].job_title}</div>
        )}
        {/* Gold divider */}
        <div style={{ width: '48px', height: '2px', background: c.gold, marginBottom: '10px' }} />
        {/* Contact pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '10px' }}>
          {contactParts.map((item, i) => (
            <span key={i} style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Body: main + sidebar */}
      <div style={{ display: 'flex', minHeight: '200mm' }}>
        {/* Main content */}
        <div style={{ flex: 1, padding: '8mm 14mm 16mm 20mm' }}>
          {d.summary && (
            <>
              <Sec title="Executive Summary" />
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.75, fontStyle: 'italic' as const, borderLeft: `3px solid ${c.accent}40`, paddingLeft: '10px' }}>{d.summary}</p>
            </>
          )}

          {d.work_experience.length > 0 && (
            <>
              <Sec title="Professional Experience" />
              {d.work_experience.map((job, i) => (
                <div key={job.id} style={{ marginBottom: i < d.work_experience.length - 1 ? '14px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: fs.lg, color: '#111827', fontFamily: "'Georgia', serif" }}>{job.job_title || 'Job Title'}</div>
                      <div style={{ fontSize: fs.sm, color: c.bg, fontWeight: 700, letterSpacing: '0.01em' }}>{job.company}{job.location ? ` · ${job.location}` : ''}</div>
                    </div>
                    <div style={{ fontSize: fs.xs, color: '#9ca3af', whiteSpace: 'nowrap' as const, background: '#f9fafb', padding: '2px 8px', borderRadius: '4px' }}>
                      {formatDate(job.start_date)} – {job.is_current ? 'Present' : formatDate(job.end_date || '')}
                    </div>
                  </div>
                  {job.description && <p style={{ margin: '3px 0 2px', color: '#4b5563', lineHeight: 1.6, fontSize: fs.sm }}>{job.description}</p>}
                  {job.achievements?.filter(Boolean).map((a, j) => (
                    <div key={j} style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                      <span style={{ color: c.gold, flexShrink: 0, fontWeight: 700 }}>▸</span>
                      <span style={{ fontSize: fs.sm, color: '#374151', lineHeight: 1.5 }}>{a}</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {d.projects.length > 0 && (
            <>
              <Sec title="Notable Projects" />
              {d.projects.map((p, i) => (
                <div key={p.id} style={{ marginBottom: i < d.projects.length - 1 ? '8px' : 0 }}>
                  <div style={{ fontWeight: 700, fontSize: fs.base, color: '#111827' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: fs.sm, color: '#4b5563', marginTop: '2px' }}>{p.description}</div>}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: '58mm', background: '#fafafa', borderLeft: '1px solid #f0f0f0', padding: '8mm 12mm 16mm 10mm', flexShrink: 0, overflow: 'hidden' }}>
          {d.education.length > 0 && (
            <>
              <div style={{ fontSize: fs.xs, fontWeight: 800, color: c.bg, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '8px' }}>Education</div>
              {d.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: fs.sm, color: '#111827' }}>{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  <div style={{ fontSize: fs.xs, color: c.bg, fontWeight: 600 }}>{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>
                  <div style={{ fontSize: fs.xs, color: '#9ca3af' }}>{formatDate(edu.start_date)} – {edu.is_current ? 'Present' : formatDate(edu.end_date || '')}</div>
                  {edu.gpa && <div style={{ fontSize: fs.xs, color: '#6b7280' }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </>
          )}

          {d.skills.length > 0 && (
            <>
              <div style={{ fontSize: fs.xs, fontWeight: 800, color: c.bg, textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '14px 0 8px' }}>Core Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                {d.skills.map((s) => (
                  <span key={s.id} style={{ fontSize: fs.xs, padding: '3px 8px', border: `1px solid ${c.bg}30`, borderRadius: '4px', color: c.bg, fontWeight: 600 }}>{s.name}</span>
                ))}
              </div>
            </>
          )}

          {d.certifications.length > 0 && (
            <>
              <div style={{ fontSize: fs.xs, fontWeight: 800, color: c.bg, textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '14px 0 8px' }}>Certifications</div>
              {d.certifications.map((cert) => (
                <div key={cert.id} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: fs.xs, fontWeight: 600, color: '#111827' }}>{cert.name}</div>
                  {cert.issuer && <div style={{ fontSize: fs.xs, color: '#9ca3af' }}>{cert.issuer}</div>}
                </div>
              ))}
            </>
          )}

          {d.languages.length > 0 && (
            <>
              <div style={{ fontSize: fs.xs, fontWeight: 800, color: c.bg, textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '14px 0 8px' }}>Languages</div>
              {d.languages.map((l) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: fs.xs, fontWeight: 600, color: '#111827' }}>{l.name}</span>
                  {l.proficiency && <span style={{ fontSize: fs.xs, color: '#9ca3af' }}>{l.proficiency}</span>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
