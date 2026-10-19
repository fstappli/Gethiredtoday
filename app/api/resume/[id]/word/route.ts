import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { isProActive } from '@/lib/subscription';
import type {
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Certification,
  Language,
  VolunteerWork,
  Project,
  CustomSection,
} from '@/types';

/**
 * Word (.doc) download for a resume.
 *
 * Returns an HTML document with Word-compatible MIME type and .doc filename.
 * Microsoft Word opens HTML-based .doc files natively, preserving most
 * formatting. This avoids requiring a heavy docx library while still giving
 * users a real Word-editable file.
 *
 * Important: this renderer must write out every section the builder supports
 * (contact, summary, work, education, skills, projects, certifications,
 * languages, volunteer work, custom sections). Previously it silently
 * dropped volunteer_work and custom_sections, which users rightly reported
 * as "missing data" on download.
 */

function esc(s: string): string {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatDate(d?: string): string {
  return d ? esc(d) : '';
}

function dateRange(start?: string, end?: string, isCurrent?: boolean): string {
  if (isCurrent) {
    return `${formatDate(start)} – Present`;
  }
  if (start && end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  if (start) return formatDate(start);
  if (end) return formatDate(end);
  return '';
}

function renderHtml(title: string, data: ResumeData): string {
  const c = data.contact ?? ({} as ResumeData['contact']);
  const name = c.full_name || title || 'Resume';

  // Contact line, same fields used by the visual templates.
  const contactLine = [c.email, c.phone, c.location, c.linkedin, c.website, c.github]
    .filter(Boolean)
    .map((v) => esc(v as string))
    .join(' · ');

  // Optional profile photo (appears at top-right if set). Base64 data URIs
  // embed directly; http(s) URLs are inlined via <img src>. We render the
  // header as a 2-column table so Word lays the photo and name out side by
  // side reliably; older `float:right` versions occasionally got pushed to
  // their own page in Word 2016 / Pages, leaving a stretched empty band at
  // the top of the document.
  const photoCellHtml = c.photo_url
    ? `<td style="padding:0 0 0 12px;width:80px;vertical-align:top;text-align:right;">
         <img src="${esc(c.photo_url)}" alt="" width="80" height="80"
              style="width:80px;height:80px;object-fit:cover;border-radius:50%;display:block;" />
       </td>`
    : '';

  // ── Work experience ──
  const workHtml = (data.work_experience ?? [])
    .map(
      (j: WorkExperience) => `
<div style="page-break-inside:avoid;margin-top:12px;">
  <h3 style="margin:0 0 2px;font-size:14px;">${esc(j.job_title || '')}</h3>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:11px;color:#666;border-collapse:collapse;">
    <tr>
      <td style="padding:0;">${esc(j.company || '')}${j.location ? ` · ${esc(j.location)}` : ''}</td>
      <td style="padding:0;text-align:right;white-space:nowrap;">${dateRange(j.start_date, j.end_date, j.is_current)}</td>
    </tr>
  </table>
  ${j.description ? `<p style="font-size:12px;margin:4px 0;">${esc(j.description)}</p>` : ''}
  ${
    j.achievements && j.achievements.length
      ? `<ul style="margin:6px 0 0 0;padding-left:20px;">${j.achievements
          .filter(Boolean)
          .map((b) => `<li style="font-size:12px;margin-bottom:2px;">${esc(b)}</li>`)
          .join('')}</ul>`
      : ''
  }
</div>`
    )
    .join('');

  // ── Education (now renders GPA, description, and "Present" for is_current) ──
  const eduHtml = (data.education ?? [])
    .map(
      (e: Education) => `
<div style="margin:8px 0;page-break-inside:avoid;">
  <div style="font-weight:bold;font-size:13px;">${esc(e.degree || '')}${e.field_of_study ? ` in ${esc(e.field_of_study)}` : ''}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:11px;color:#666;border-collapse:collapse;">
    <tr>
      <td style="padding:0;">${esc(e.institution || '')}${e.location ? ` · ${esc(e.location)}` : ''}</td>
      <td style="padding:0;text-align:right;white-space:nowrap;">${dateRange(e.start_date, e.end_date, e.is_current)}</td>
    </tr>
  </table>
  ${e.gpa ? `<div style="font-size:11px;color:#666;">GPA: ${esc(e.gpa)}</div>` : ''}
  ${e.description ? `<p style="font-size:12px;margin:2px 0 0;">${esc(e.description)}</p>` : ''}
</div>`
    )
    .join('');

  // ── Skills (now renders level + category grouping) ──
  // Group by category when any skill has one; otherwise plain comma list.
  const skills = (data.skills ?? []).filter((s) => s.name);
  const hasCategories = skills.some((s) => s.category && s.category.trim());
  let skillsHtml = '';
  if (skills.length) {
    if (hasCategories) {
      const byCategory: Record<string, Skill[]> = {};
      for (const s of skills) {
        const key = (s.category || 'Other').trim();
        (byCategory[key] = byCategory[key] || []).push(s);
      }
      skillsHtml = Object.entries(byCategory)
        .map(
          ([cat, items]) =>
            `<p style="font-size:12px;margin:4px 0;"><strong>${esc(cat)}:</strong> ${items
              .map((s) => `${esc(s.name)}${s.level ? ` (${esc(s.level)})` : ''}`)
              .join(' · ')}</p>`
        )
        .join('');
    } else {
      skillsHtml = `<p style="font-size:12px;line-height:1.6;">${skills
        .map((s) => `${esc(s.name)}${s.level ? ` (${esc(s.level)})` : ''}`)
        .join(' · ')}</p>`;
    }
  }

  // ── Certifications ──
  const certsHtml = (data.certifications ?? []).length
    ? `<ul style="margin:4px 0 0 0;padding-left:20px;">${data
        .certifications!.map(
          (cert: Certification) => `
<li style="font-size:12px;margin-bottom:4px;">
  <strong>${esc(cert.name || '')}</strong>${cert.issuer ? `, ${esc(cert.issuer)}` : ''}
  ${cert.date_issued ? ` (${esc(cert.date_issued)}${cert.expiry_date ? ` – ${esc(cert.expiry_date)}` : ''})` : ''}
  ${cert.credential_id ? `<br/><span style="color:#666;">ID: ${esc(cert.credential_id)}</span>` : ''}
  ${cert.url ? ` <a href="${esc(cert.url)}">${esc(cert.url)}</a>` : ''}
</li>`
        )
        .join('')}</ul>`
    : '';

  // ── Projects (now renders url, technologies, dates) ──
  const projectsHtml = (data.projects ?? [])
    .map(
      (p: Project) => `
<div style="margin:8px 0;page-break-inside:avoid;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:0;font-weight:bold;font-size:13px;">${esc(p.name || '')}${p.url ? ` <span style="font-weight:normal;font-size:11px;color:#4AB7A6;">· ${esc(p.url)}</span>` : ''}</td>
      ${
        p.start_date || p.end_date
          ? `<td style="padding:0;text-align:right;white-space:nowrap;font-weight:normal;font-size:11px;color:#666;">${dateRange(p.start_date, p.end_date, false)}</td>`
          : ''
      }
    </tr>
  </table>
  ${p.description ? `<p style="font-size:12px;color:#444;margin:4px 0;">${esc(p.description)}</p>` : ''}
  ${
    p.technologies && p.technologies.length
      ? `<p style="font-size:11px;color:#666;margin:2px 0 0;"><strong>Tech:</strong> ${p.technologies.map((t) => esc(t)).join(', ')}</p>`
      : ''
  }
</div>`
    )
    .join('');

  // ── Languages ──
  const langsHtml = (data.languages ?? []).length
    ? `<p style="font-size:12px;">${data
        .languages!.filter((l: Language) => l.name)
        .map((l) => `${esc(l.name)}${l.proficiency ? ` (${esc(l.proficiency)})` : ''}`)
        .join(' · ')}</p>`
    : '';

  // ── Volunteer work (previously dropped, now rendered) ──
  const volunteerHtml = (data.volunteer_work ?? [])
    .map(
      (v: VolunteerWork) => `
<div style="margin:8px 0;page-break-inside:avoid;">
  <div style="font-weight:bold;font-size:13px;">${esc(v.role || '')}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:11px;color:#666;border-collapse:collapse;">
    <tr>
      <td style="padding:0;">${esc(v.organization || '')}</td>
      <td style="padding:0;text-align:right;white-space:nowrap;">${dateRange(v.start_date, v.end_date, v.is_current)}</td>
    </tr>
  </table>
  ${v.description ? `<p style="font-size:12px;margin:4px 0;">${esc(v.description)}</p>` : ''}
</div>`
    )
    .join('');

  // ── Custom sections (previously dropped, now rendered) ──
  const customHtml = (data.custom_sections ?? [])
    .filter((cs) => cs.items && cs.items.length)
    .map(
      (cs: CustomSection) => `
${renderSection(
  cs.title || 'Additional',
  cs.items
    .map(
      (item) => `
<div style="margin:6px 0;page-break-inside:avoid;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:0;font-weight:bold;font-size:13px;">${esc(item.title || '')}</td>
      ${item.date ? `<td style="padding:0;text-align:right;white-space:nowrap;font-weight:normal;font-size:11px;color:#666;">${esc(item.date)}</td>` : ''}
    </tr>
  </table>
  ${item.subtitle ? `<div style="font-size:11px;color:#666;">${esc(item.subtitle)}</div>` : ''}
  ${item.description ? `<p style="font-size:12px;margin:4px 0;">${esc(item.description)}</p>` : ''}
</div>`
    )
    .join('')
)}
`
    )
    .join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${esc(name)}, Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    /* @page is what Word actually reads for margins / page size. CSS body
       margin is a fallback for browser-side preview only. Without @page
       set explicitly, some Word builds default to ~25mm everything which
       cropped photos/headers hugging the edge. */
    @page { size: A4; margin: 16mm 14mm 16mm 14mm; }
    body { font-family: Calibri, Arial, sans-serif; color: #222; margin: 0; font-size: 12px; line-height: 1.5; }
    h1 { font-size: 22px; margin: 0 0 6px 0; color: #111; page-break-after: avoid; }
    h2 { page-break-after: avoid; }
    h3 { page-break-after: avoid; page-break-inside: avoid; }
    p { orphans: 3; widows: 3; }
    li { page-break-inside: avoid; }
    ul { page-break-inside: auto; }
    a { color: #4AB7A6; text-decoration: none; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 6px 0;">
    <tr>
      <td style="padding:0;vertical-align:top;">
        <h1>${esc(name)}</h1>
        ${contactLine ? `<p style="font-size:11px;color:#666;margin:0;">${contactLine}</p>` : ''}
      </td>
      ${photoCellHtml}
    </tr>
  </table>
  ${data.summary ? renderSection('Summary', `<p style="font-size:12px;line-height:1.5;">${esc(data.summary)}</p>`) : ''}
  ${renderSection('Work Experience', workHtml)}
  ${renderSection('Education', eduHtml)}
  ${renderSection('Skills', skillsHtml)}
  ${renderSection('Projects', projectsHtml)}
  ${renderSection('Certifications', certsHtml)}
  ${renderSection('Languages', langsHtml)}
  ${renderSection('Volunteer Work', volunteerHtml)}
  ${customHtml}
</body>
</html>`;
}

function renderSection(label: string, content: string): string {
  return content
    ? `<h2 style="margin:18px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#4AB7A6;border-bottom:1px solid #4AB7A6;padding-bottom:2px;">${esc(label)}</h2>${content}`
    : '';
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pro gate, respect the grace period after cancel (otherwise paying
  // users who just cancelled lose Word export mid-cycle).
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_ends_at')
    .eq('id', user.id)
    .single();

  if (!isProActive(profile)) {
    return NextResponse.json(
      { error: 'Word download is a Pro feature. Please upgrade.', code: 'upgrade_required', trigger: 'word_export' },
      { status: 402 }
    );
  }

  const { data: resume, error } = await supabase
    .from('resumes')
    .select('title, data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const html = renderHtml(resume.title, resume.data as ResumeData);
  const filenameSafe = (resume.title || 'resume').replace(/[^a-z0-9-_ ]/gi, '').slice(0, 60) || 'resume';

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filenameSafe}.doc"`,
    },
  });
}
