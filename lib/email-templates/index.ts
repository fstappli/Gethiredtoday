import { SITE, SITE_URL, PRICING } from '@/lib/site-config';

const brand = {
  color: '#0B6E5F',
  name: SITE.name,
  url: SITE_URL,
  from: SITE.email,
};

/** Optional per-recipient context so every email can carry a working unsubscribe link. */
export interface EmailCtx {
  userId?: string;
  email?: string;
}

function unsubscribeUrl(ctx?: EmailCtx): string {
  if (ctx?.userId) return `${brand.url}/unsubscribe?uid=${encodeURIComponent(ctx.userId)}`;
  if (ctx?.email) return `${brand.url}/unsubscribe?email=${encodeURIComponent(ctx.email)}`;
  return `${brand.url}/unsubscribe`;
}

/** Link back to the site with UTM params so email conversions can be measured. */
export function emailLink(path: string, campaign: string): string {
  const u = new URL(path, brand.url);
  u.searchParams.set('utm_source', 'email');
  u.searchParams.set('utm_medium', 'lifecycle');
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

const PRICE = `$${PRICING.proMonthly}`;

function base(body: string, ctx?: EmailCtx): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brand.name}</title></head>
<body style="margin:0;padding:0;background:#f6f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e3da;">
        <tr><td style="background:${brand.color};padding:24px 32px;">
          <a href="${brand.url}" style="color:#ffffff;font-size:20px;font-weight:800;text-decoration:none;letter-spacing:-0.5px;">${brand.name}</a>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f1f5f9;background:#fbfaf6;">
          <p style="margin:0;font-size:12px;color:#5a6662;text-align:center;line-height:1.6;">
            © ${new Date().getFullYear()} ${brand.name}. You are receiving this because you signed up at ${brand.url}.<br>
            <a href="${unsubscribeUrl(ctx)}" style="color:#5a6662;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0d1b19;line-height:1.2;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f4d49;">${text}</p>`;
}

function btn(text: string, href: string) {
  return `<div style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:${brand.color};color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">${text}</a></div>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e6e3da;margin:24px 0;">`;
}

function list(items: string[]) {
  return `<ul style="margin:0 0 16px;padding-left:20px;color:#3f4d49;font-size:15px;line-height:2;">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

// ─── Email 1: Welcome ──────────────────────────────────────────────────────
export function welcomeEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: "Your resume is waiting, let's make it interview-ready",
    html: base(`
      ${h1(`Welcome to ${brand.name}, ${firstName || 'there'}!`)}
      ${p("You are one step away from a resume that is easy for both people and applicant tracking systems to read.")}
      ${p("Here is what you can do right now, free:")}
      ${list([
        '<strong>Build your resume</strong> with AI help for your bullet points',
        '<strong>Check your ATS score</strong> and see your top 3 fixes',
        '<strong>Download your resume as a PDF</strong>, always free',
        '<strong>Search jobs</strong> and save the ones you like',
      ])}
      ${btn('Build my resume', emailLink('/builder/resume', 'welcome'))}
      ${divider()}
      ${p('Questions? Just reply to this email. A real person reads it.')}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Email 2: Day 1, ATS basics ────────────────────────────────────────────
export function atsEducationEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'The most common reasons resumes get filtered out',
    html: base(`
      ${h1(`${firstName || 'Hey'}, here is why good resumes get skipped.`)}
      ${p('Many employers use applicant tracking systems (ATS) to sort applications before a person reads them. A resume can be strong and still be hard for that software to read.')}
      ${p('The most common problems:')}
      ${list([
        'Missing keywords from the job description',
        'Tables, text boxes or graphics that the software cannot read',
        'Unusual section headings, such as "Career Journey" instead of "Experience"',
        'A PDF made from an image or a design tool, so the text cannot be selected',
      ])}
      ${p('The ATS checker scores your resume and shows your top 3 fixes for free. Pro unlocks the full 30-point report and matching against a job ad.')}
      ${btn('Check my ATS score', emailLink('/dashboard/ats-checker', 'ats_education'))}
      ${divider()}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Email 3: Day 3, AI bullets ────────────────────────────────────────────
export function featureRevealEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'Turn your duties into results with the AI bullet writer',
    html: base(`
      ${h1(`${firstName || 'Hey'}, have you tried this yet?`)}
      ${p('Recruiters skim. Bullets that start with a strong verb and show a result get read. The AI bullet writer helps you get there.')}
      ${p('How it works:')}
      <ol style="margin:0 0 16px;padding-left:20px;color:#3f4d49;font-size:15px;line-height:2;">
        <li>Open a resume and pick an experience</li>
        <li>Add a few notes about what you did</li>
        <li>Ask the AI for stronger bullets, then edit them so they stay true</li>
      </ol>
      ${p('An example of the style (made-up numbers, only to show the format):')}
      <div style="background:#e3f4ee;border-radius:12px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#0d1b19;">Before: Responsible for managing project timelines</p>
        <p style="margin:0;font-size:14px;color:#0d1b19;">After: Led a team of 6 to deliver the project 3 weeks early by introducing weekly sprint reviews</p>
      </div>
      ${p('Free accounts get 5 AI rewrites a day. Pro gives you unlimited rewrites.')}
      ${btn('Try the bullet writer', emailLink('/dashboard/resumes', 'feature_reveal'))}
      ${p(`Need more than 5 a day? <a href="${emailLink('/upgrade?from=email_feature_reveal', 'feature_reveal')}" style="color:${brand.color};font-weight:700;">See what Pro adds</a>.`)}
    `, ctx),
  };
}

// ─── Email 4: Day 7, Upgrade offer ─────────────────────────────────────────
export function upgradeOfferEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'What Pro adds when you are ready to apply',
    html: base(`
      ${h1(`${firstName || 'Hey'}, ready to apply more widely?`)}
      ${p('Your free plan already includes one resume, PDF download, your ATS score with the top 3 fixes, job search and 5 AI rewrites a day. Pro is for when you start applying to several roles.')}
      ${list([
        '<strong>Unlimited resumes</strong>, so you can tailor one to each kind of role',
        '<strong>All templates</strong> and <strong>Word (.docx) export</strong>',
        '<strong>Unlimited AI rewrites</strong>',
        '<strong>Full 30-point ATS report</strong> with job ad matching',
        '<strong>Match % on every job</strong> and <strong>Auto-Apply</strong> with review mode, up to 50 a day',
      ])}
      ${btn(`See Pro, ${PRICE}/month`, emailLink('/upgrade?from=email_upgrade_offer', 'upgrade_offer'))}
      ${divider()}
      ${p('You can cancel from Plan &amp; billing in two clicks.')}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Email 5: Day 10, Value nudge ──────────────────────────────────────────
export function day10LastChanceEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'Tailoring your resume to each job',
    html: base(`
      ${h1(`${firstName || 'Hey'}, a quick tip for your job search.`)}
      ${p('Each job ad asks for slightly different skills and keywords. A resume tailored to each ad is easier for ATS software to match and easier for a recruiter to scan.')}
      ${p('On the free plan you have one resume and 5 AI rewrites a day. If you are applying to several jobs, Pro lets you keep a tailored version for each, with unlimited AI rewrites and the full ATS report to check each one against its job ad.')}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#fbfaf6;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:12px;color:#5a6662;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;margin-bottom:8px;">Pro</div>
        <div style="font-size:36px;font-weight:800;color:${brand.color};line-height:1;margin-bottom:4px;">${PRICE}<span style="font-size:18px;color:#5a6662;font-weight:500;">/month</span></div>
        <div style="font-size:13px;color:#3f4d49;margin-top:12px;">Cancel any time from Plan &amp; billing.</div>
      </td></tr></table>
      ${btn('Compare Free and Pro', emailLink('/upgrade?from=email_day10', 'day10'))}
      ${p('If something about the product is getting in your way, just reply and tell us.')}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Subscription ending notice ────────────────────────────────────────────
export function subscriptionEndingEmail(
  firstName: string,
  endsAt: string,
  ctx?: EmailCtx
): { subject: string; html: string } {
  return {
    subject: `Important: your ${brand.name} Pro subscription`,
    html: base(`
      ${h1(`Hi ${firstName || 'there'}, a quick update on your Pro plan.`)}
      ${p("We are making a change to how subscriptions work. <strong>Automatic billing is being removed</strong>, so your subscription will <strong>not</strong> auto-renew.")}
      ${p(`Your Pro access is active until <strong>${endsAt}</strong>. After that date your account moves to the free plan.`)}
      <div style="background:#e3f4ee;border-radius:12px;padding:20px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0d1b19;">Until ${endsAt} you keep:</p>
        <ul style="margin:0;padding-left:20px;color:#3f4d49;font-size:14px;line-height:2;">
          <li>Unlimited resumes and all templates</li>
          <li>Unlimited AI rewrites</li>
          <li>The full ATS report and Word export</li>
          <li>Auto-Apply</li>
        </ul>
      </div>
      ${p('After that, your resumes stay in your account and PDF download stays free. To keep Pro, resubscribe any time.')}
      ${btn(`Resubscribe to Pro, ${PRICE}/month`, emailLink('/upgrade?from=email_subscription_ending', 'subscription_ending'))}
      ${divider()}
      ${p('Questions? Reply to this email.')}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Email 6: Day 14, Win-back ─────────────────────────────────────────────
export function day14WinbackEmail(firstName: string, ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'One quick question',
    html: base(`
      ${h1(`${firstName || 'Hey'}, one quick question`)}
      ${p(`It has been two weeks since you joined ${brand.name}. Before we stop emailing you, we would like to know one thing.`)}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#fff1cc;border-left:4px solid #ffd166;padding:20px;border-radius:4px;">
        <div style="font-size:17px;font-weight:700;color:#0d1b19;line-height:1.5;">What would make ${brand.name} more useful for your job search?</div>
        <div style="font-size:14px;color:#3f4d49;margin-top:8px;line-height:1.6;">Reply with one sentence. Every reply is read.</div>
      </td></tr></table>
      ${p('If you have already found a job, congratulations. That is the whole point.')}
      ${p(`Your account stays active and your resume stays free to download. If you want more than one resume, all templates or Auto-Apply, Pro is ${PRICE}/month and you can cancel from Plan &amp; billing.`)}
      ${btn('See Free vs Pro', emailLink('/upgrade?from=email_day14', 'day14'))}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}

// ─── Lead magnet: ATS resume checklist (logged-out email capture) ──────────
export function leadChecklistEmail(ctx?: EmailCtx): { subject: string; html: string } {
  return {
    subject: 'Your 5-point ATS resume checklist',
    html: base(`
      ${h1('Your 5-point ATS resume checklist')}
      ${p('Run through these before you send your resume anywhere:')}
      <ol style="margin:0 0 16px;padding-left:20px;color:#3f4d49;font-size:15px;line-height:1.8;">
        <li><strong>Use a simple layout.</strong> One main column, no tables, text boxes, icons or graphics that hold important text.</li>
        <li><strong>Use standard headings.</strong> "Experience", "Education" and "Skills" are read correctly by almost every system.</li>
        <li><strong>Mirror the job ad.</strong> Use the same names for skills and tools that the ad uses, as long as they are true for you.</li>
        <li><strong>Show results.</strong> Start bullets with a verb and add a number, scale or outcome where you honestly can.</li>
        <li><strong>Export a text-based file.</strong> Make sure you can select and copy the text in your PDF. If you cannot, software cannot read it either.</li>
      </ol>
      ${p('Want to see how your own resume scores? The checker is free and shows your top 3 fixes.')}
      ${btn('Check my resume free', emailLink('/ats-checker', 'lead_checklist'))}
      ${divider()}
      <p style="margin:0;font-size:15px;color:#3f4d49;">The ${brand.name} team</p>
    `, ctx),
  };
}
