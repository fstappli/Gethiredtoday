'use client';

import React from 'react';
import { ResumeData } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props { data: ResumeData; colorScheme?: string; fontSize?: 'small' | 'medium' | 'large'; }

const CS: Record<string, { sidebar: string; sidebarDark: string; accent: string; light: string }> = {
  teal:   { sidebar: '#0f766e', sidebarDark: '#0d5c56', accent: '#14b8a6', light: '#f0fdfa' },
  blue:   { sidebar: '#1e40af', sidebarDark: '#1e3a8a', accent: '#3b82f6', light: '#eff6ff' },
  purple: { sidebar: '#5b21b6', sidebarDark: '#4c1d95', accent: '#8b5cf6', light: '#faf5ff' },
  rose:   { sidebar: '#9f1239', sidebarDark: '#881337', accent: '#f43f5e', light: '#fff1f2' },
  slate:  { sidebar: '#1e293b', sidebarDark: '#0f172a', accent: '#64748b', light: '#f8fafc' },
};
const FS: Record<string, Record<string, string>> = {
  small:  { base: '12px', sm: '11px', xs: '10px', lg: '14px', xl: '17px', '2xl': '23px' },
  medium: { base: '13.5px', sm: '12.5px', xs: '11px', lg: '15.5px', xl: '19px', '2xl': '26px' },
  large:  { base: '15px', sm: '14px', xs: '12.5px', lg: '17px', xl: '21px', '2xl': '30px' },
};

export default function ModernTemplate({ data, colorScheme = 'teal', fontSize = 'medium' }: Props) {
  const c = CS[colorScheme] ?? CS.teal;
  const fs = FS[fontSize] ?? FS.medium;
  const d = { contact: (data.contact ?? {}) as ResumeData['contact'], work_experience: data.work_experience ?? [], education: data.education ?? [], skills: data.skills ?? [], certifications: data.certifications ?? [], languages: data.languages ?? [], volunteer_work: data.volunteer_work ?? [], projects: data.projects ?? [], custom_sections: data.custom_sections ?? [], summary: data.summary ?? '' };

  const SideSection = ({ title }: { title: string }) => (
    <div style={{ marginTop: '14px', marginBottom: '8px' }}>
      <div style={{ fontSize: fs.xs, fontWeight: 800, color: c.accent, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>{title}</div>
      <div style={{ height: '1px', background: `${c.accent}40`, marginTop: '4px' }} />
    </div>
  );

  const MainSection = ({ title }: { title: string }) => (
    <div style={{ margin: '14px 0 8px' }}>
      <div style={{ fontSize: fs.xs, fontWeight: 800, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ height: '2px', background: c.accent, width: '28px', marginTop: '3px', borderRadius: '1px' }} />
    </div>
  );

  return (
    <div id="resume-preview" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: fs.base, lineHeight: 1.5, color: '#1f2937', display: 'flex', boxSizing: 'border-box' as const }}>

      {/* SIDEBAR */}
      <div style={{ width: '72mm', background: `linear-gradient(175deg, ${c.sidebar} 0%, ${c.sidebarDark} 100%)`, color: '#fff', padding: '16mm 8mm 16mm', display: 'flex', flexDirection: 'column' as const, flexShrink: 0, overflow: 'hidden' }}>
        {/* Avatar — real uploaded photo if provided, else initial fallback */}
        {d.contact.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.contact.photo_url}
            alt={d.contact.full_name || 'Profile'}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', marginBottom: '12px', display: 'block' }}
          />
        ) : (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${c.accent}60`, border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
              {(d.contact.full_name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Name */}
        <div style={{ fontSize: fs.xl, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '3px' }}>{d.contact.full_name || 'Your Name'}</div>
        {d.work_experience[0]?.job_title && (
          <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 600, marginBottom: '12px' }}>{d.work_experience[0].job_title}</div>
        )}

        {/* Contact */}
        {[d.contact.email, d.contact.phone, d.contact.location, d.contact.linkedin, d.contact.website, d.contact.github].filter(Boolean).map((item, i) => (
          <div key={i} style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.75)', marginBottom: '4px', wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const }}>{item}</div>
        ))}

        {/* Skills */}
        {d.skills.length > 0 && (
          <>
            <SideSection title="Skills" />
            {d.skills.map((s) => (
              <div key={s.id} style={{ marginBottom: '7px' }}>
                <div style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.85)', marginBottom: '3px' }}>{s.name}</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: c.accent, width: s.level === 'Expert' ? '95%' : s.level === 'Advanced' ? '80%' : s.level === 'Intermediate' ? '60%' : '40%' }} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Languages */}
        {d.languages.length > 0 && (
          <>
            <SideSection title="Languages" />
            {d.languages.map((l) => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.85)' }}>{l.name}</span>
                {l.proficiency && <span style={{ fontSize: fs.xs, color: c.accent }}>{l.proficiency}</span>}
              </div>
            ))}
          </>
        )}

        {/* Certifications */}
        {d.certifications.length > 0 && (
          <>
            <SideSection title="Certifications" />
            {d.certifications.map((cert) => (
              <div key={cert.id} style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: fs.xs, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{cert.name}</div>
                {cert.issuer && <div style={{ fontSize: fs.xs, color: c.accent }}>{cert.issuer}</div>}
              </div>
            ))}
          </>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '16mm 14mm 16mm 12mm', background: '#fff', overflow: 'hidden' }}>
        {d.summary && (
          <>
            <MainSection title="Profile" />
            <p style={{ margin: '0 0 4px', color: '#4b5563', lineHeight: 1.7, fontSize: fs.base }}>{d.summary}</p>
          </>
        )}

        {d.work_experience.length > 0 && (
          <>
            <MainSection title="Experience" />
            {d.work_experience.map((job, i) => (
              <div key={job.id} style={{ marginBottom: i < d.work_experience.length - 1 ? '12px' : 0, paddingLeft: '10px', borderLeft: `2px solid ${c.accent}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs.lg, color: '#111827' }}>{job.job_title || 'Job Title'}</div>
                    <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 600 }}>{job.company}{job.location ? ` · ${job.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: fs.xs, color: '#9ca3af', whiteSpace: 'nowrap' as const, marginLeft: '8px' }}>
                    {formatDate(job.start_date)} – {job.is_current ? 'Present' : formatDate(job.end_date || '')}
                  </div>
                </div>
                {job.description && <p style={{ margin: '3px 0 2px', color: '#4b5563', lineHeight: 1.5, fontSize: fs.sm }}>{job.description}</p>}
                {job.achievements?.filter(Boolean).map((a, j) => (
                  <div key={j} style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <span style={{ color: c.accent, fontWeight: 700, flexShrink: 0 }}>›</span>
                    <span style={{ fontSize: fs.sm, color: '#374151', lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {d.education.length > 0 && (
          <>
            <MainSection title="Education" />
            {d.education.map((edu, i) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < d.education.length - 1 ? '8px' : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: fs.base, color: '#111827' }}>{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 500 }}>
                    {edu.institution}{edu.location ? ` · ${edu.location}` : ''}
                  </div>
                  {edu.gpa && <div style={{ fontSize: fs.xs, color: '#9ca3af' }}>GPA: {edu.gpa}</div>}
                </div>
                <div style={{ fontSize: fs.xs, color: '#9ca3af', whiteSpace: 'nowrap' as const }}>
                  {formatDate(edu.start_date)} – {edu.is_current ? 'Present' : formatDate(edu.end_date || '')}
                </div>
              </div>
            ))}
          </>
        )}

        {d.projects.length > 0 && (
          <>
            <MainSection title="Projects" />
            {d.projects.map((p, i) => (
              <div key={p.id} style={{ marginBottom: i < d.projects.length - 1 ? '8px' : 0 }}>
                <div style={{ fontWeight: 700, fontSize: fs.base, color: '#111827' }}>{p.name}</div>
                {p.description && <div style={{ fontSize: fs.sm, color: '#4b5563', marginTop: '2px' }}>{p.description}</div>}
              </div>
            ))}
          </>
        )}

        {d.volunteer_work.length > 0 && (
          <>
            <MainSection title="Volunteer Work" />
            {d.volunteer_work.map((vol, i) => (
              <div key={vol.id} style={{ marginBottom: i < d.volunteer_work.length - 1 ? '12px' : 0, paddingLeft: '10px', borderLeft: `2px solid ${c.accent}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs.lg, color: '#111827' }}>{vol.role || 'Role'}</div>
                    <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 600 }}>{vol.organization}</div>
                  </div>
                  <div style={{ fontSize: fs.xs, color: '#9ca3af', whiteSpace: 'nowrap' as const, marginLeft: '8px' }}>
                    {vol.start_date} – {vol.is_current ? 'Present' : (vol.end_date || '')}
                  </div>
                </div>
                {vol.description && <p style={{ margin: '3px 0 0', color: '#4b5563', lineHeight: 1.5, fontSize: fs.sm }}>{vol.description}</p>}
              </div>
            ))}
          </>
        )}

        {(d.custom_sections ?? []).map((section) => (
          section.items?.length > 0 && (
            <React.Fragment key={section.id}>
              <MainSection title={section.title || 'Custom Section'} />
              {section.items.map((item, i) => (
                <div key={item.id} style={{ marginBottom: i < section.items.length - 1 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: fs.base, color: '#111827' }}>{item.title}</div>
                    {item.date && <div style={{ fontSize: fs.xs, color: '#9ca3af', marginLeft: '8px', whiteSpace: 'nowrap' as const }}>{item.date}</div>}
                  </div>
                  {item.subtitle && <div style={{ fontSize: fs.sm, color: c.accent, fontWeight: 600 }}>{item.subtitle}</div>}
                  {item.description && <p style={{ margin: '2px 0 0', color: '#4b5563', fontSize: fs.sm, lineHeight: 1.5 }}>{item.description}</p>}
                </div>
              ))}
            </React.Fragment>
          )
        ))}
      </div>
    </div>
  );
}
