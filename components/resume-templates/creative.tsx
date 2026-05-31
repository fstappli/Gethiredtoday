'use client';

import { ResumeData } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props { data: ResumeData; colorScheme?: string; fontSize?: 'small' | 'medium' | 'large'; }

const CS: Record<string, { sidebar: string; accent: string; mid: string; light: string }> = {
  rose:   { sidebar: '#c2185b', accent: '#e91e63', mid: '#f06292', light: '#fce4ec' },
  teal:   { sidebar: '#00695c', accent: '#00897b', mid: '#4db6ac', light: '#e0f2f1' },
  blue:   { sidebar: '#1565c0', accent: '#1976d2', mid: '#64b5f6', light: '#e3f2fd' },
  purple: { sidebar: '#4a148c', accent: '#6a1b9a', mid: '#ce93d8', light: '#f3e5f5' },
  slate:  { sidebar: '#263238', accent: '#37474f', mid: '#90a4ae', light: '#eceff1' },
};
const FS: Record<string, Record<string, string>> = {
  small:  { base: '12px', sm: '11px', xs: '10px', lg: '14px', xl: '17px', '2xl': '25px', '3xl': '34px' },
  medium: { base: '13.5px', sm: '12.5px', xs: '11px', lg: '16px', xl: '20px', '2xl': '29px', '3xl': '40px' },
  large:  { base: '15px', sm: '14px', xs: '12.5px', lg: '18px', xl: '22px', '2xl': '34px', '3xl': '47px' },
};

export default function CreativeTemplate({ data, colorScheme = 'rose', fontSize = 'medium' }: Props) {
  const c = CS[colorScheme] ?? CS.rose;
  const fs = FS[fontSize] ?? FS.medium;
  const d = { contact: (data.contact ?? {}) as ResumeData['contact'], work_experience: data.work_experience ?? [], education: data.education ?? [], skills: data.skills ?? [], certifications: data.certifications ?? [], languages: data.languages ?? [], volunteer_work: data.volunteer_work ?? [], projects: data.projects ?? [], custom_sections: data.custom_sections ?? [], summary: data.summary ?? '' };

  const SideHeading = ({ title }: { title: string }) => (
    <div style={{ margin: '16px 0 8px' }}>
      <div style={{ fontSize: fs.xs, fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '0.14em', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.25)' }}>{title}</div>
    </div>
  );

  const MainHeading = ({ title }: { title: string }) => (
    <div style={{ margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '3px', height: '16px', background: c.accent, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{ fontSize: fs.xs, fontWeight: 800, color: c.sidebar, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: `${c.accent}30` }} />
    </div>
  );

  const contactItems = [
    d.contact.email,
    d.contact.phone,
    d.contact.location,
    d.contact.linkedin,
    d.contact.website,
    d.contact.github,
  ].filter(Boolean);

  // Skill level percentage
  const skillWidth = (level?: string) => {
    if (level === 'Expert') return '92%';
    if (level === 'Advanced') return '75%';
    if (level === 'Intermediate') return '55%';
    return '35%';
  };

  return (
    <div id="resume-preview" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: fs.base, lineHeight: 1.55, color: '#1f2937', display: 'flex', boxSizing: 'border-box' as const }}>

      {/* Left Sidebar */}
      <div style={{ width: '64mm', background: c.sidebar, color: '#fff', padding: '0 0 16mm', flexShrink: 0, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
        {/* Top accent block with name */}
        <div style={{ background: c.accent, padding: '14mm 10mm 12mm', position: 'relative' }}>
          {/* Decorative shape */}
          <div style={{ position: 'absolute', bottom: '-20px', right: 0, width: 0, height: 0, borderLeft: '64mm solid transparent', borderTop: `20px solid ${c.accent}` }} />
          <div style={{ fontSize: fs['3xl'], fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', wordBreak: 'break-word' as const }}>
            {(d.contact.full_name || 'Your Name').split(' ').map((word, i) => (
              <div key={i}>{word}</div>
            ))}
          </div>
          {d.work_experience[0]?.job_title && (
            <div style={{ fontSize: fs.sm, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: '6px', lineHeight: 1.3 }}>{d.work_experience[0].job_title}</div>
          )}
        </div>

        <div style={{ padding: '28px 10mm 0', flex: 1 }}>
          {/* Contact */}
          {contactItems.length > 0 && (
            <>
              <SideHeading title="Contact" />
              {contactItems.map((item, i) => (
                <div key={i} style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.8)', marginBottom: '5px', wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const, lineHeight: 1.4 }}>{item}</div>
              ))}
            </>
          )}

          {/* Skills */}
          {d.skills.length > 0 && (
            <>
              <SideHeading title="Skills" />
              {d.skills.map((s) => (
                <div key={s.id} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.9)', marginBottom: '3px', fontWeight: 500 }}>{s.name}</div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', background: c.mid, borderRadius: '2px', width: skillWidth(s.level) }} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Languages */}
          {d.languages.length > 0 && (
            <>
              <SideHeading title="Languages" />
              {d.languages.map((l) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{l.name}</span>
                  {l.proficiency && <span style={{ fontSize: fs.xs, color: c.mid }}>{l.proficiency}</span>}
                </div>
              ))}
            </>
          )}

          {/* Education */}
          {d.education.length > 0 && (
            <>
              <SideHeading title="Education" />
              {d.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: fs.xs, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  <div style={{ fontSize: fs.xs, color: c.mid, marginTop: '1px' }}>{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>
                  <div style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>
                    {formatDate(edu.start_date)}{edu.end_date || edu.is_current ? ` – ${edu.is_current ? 'Present' : formatDate(edu.end_date || '')}` : ''}
                  </div>
                  {edu.gpa && <div style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.5)' }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </>
          )}

          {/* Certifications */}
          {d.certifications.length > 0 && (
            <>
              <SideHeading title="Certifications" />
              {d.certifications.map((cert) => (
                <div key={cert.id} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: fs.xs, fontWeight: 600, color: '#fff' }}>{cert.name}</div>
                  {cert.issuer && <div style={{ fontSize: fs.xs, color: c.mid }}>{cert.issuer}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '14mm 14mm 16mm 12mm', background: '#fff', overflow: 'hidden' }}>
        {d.summary && (
          <>
            <MainHeading title="Profile" />
            <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.75, fontSize: fs.base, background: c.light, padding: '8px 12px', borderRadius: '6px' }}>{d.summary}</p>
          </>
        )}

        {d.work_experience.length > 0 && (
          <>
            <MainHeading title="Experience" />
            {d.work_experience.map((job, i) => (
              <div key={job.id} style={{ marginBottom: i < d.work_experience.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs.lg, color: '#111827' }}>{job.job_title || 'Job Title'}</div>
                    <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 600 }}>{job.company}{job.location ? ` · ${job.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: fs.xs, color: '#fff', background: c.accent, padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' as const, marginLeft: '8px', flexShrink: 0 }}>
                    {formatDate(job.start_date)} – {job.is_current ? 'Present' : formatDate(job.end_date || '')}
                  </div>
                </div>
                {job.description && <p style={{ margin: '3px 0 2px', color: '#4b5563', lineHeight: 1.6, fontSize: fs.sm }}>{job.description}</p>}
                {job.achievements?.filter(Boolean).map((a, j) => (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginTop: '3px', alignItems: 'flex-start' }}>
                    <span style={{ color: c.accent, flexShrink: 0, fontWeight: 700, fontSize: fs.base, lineHeight: 1.3 }}>◆</span>
                    <span style={{ fontSize: fs.sm, color: '#374151', lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {d.projects.length > 0 && (
          <>
            <MainHeading title="Projects" />
            {d.projects.map((p, i) => (
              <div key={p.id} style={{ marginBottom: i < d.projects.length - 1 ? '8px' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: fs.base, color: '#111827' }}>{p.name}</div>
                {p.description && <div style={{ fontSize: fs.sm, color: '#4b5563', marginTop: '2px' }}>{p.description}</div>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
