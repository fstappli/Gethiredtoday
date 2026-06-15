const brand = {
  color: '#4AB7A6',
  name: 'HiredTodayApp',
  url: 'https://hiredtodayapp.com',
  logo: 'https://hiredtodayapp.com/og-image.png',
  from: 'hello@hiredtodayapp.com',
  unsubscribe: 'https://hiredtodayapp.com/unsubscribe',
};

function base(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brand.name}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr><td style="background:${brand.color};padding:24px 32px;">
          <a href="${brand.url}" style="color:#ffffff;font-size:20px;font-weight:800;text-decoration:none;letter-spacing:-0.5px;">${brand.name}</a>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #f1f5f9;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
            © ${new Date().getFullYear()} ${brand.name} ·
            <a href="${brand.unsubscribe}" style="color:#94a3b8;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;line-height:1.2;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">${text}</p>`;
}

function btn(text: string, href: string) {
  return `<div style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:${brand.color};color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;">${text}</a></div>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">`;
}

// ─── Email 1: Welcome ──────────────────────────────────────────────────────
export function welcomeEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Your resume is waiting — let's make it interview-ready",
    html: base(`
      ${h1(`Welcome to ${brand.name}, ${firstName || 'friend'}! 👋`)}
      ${p("You're one step away from having a resume that actually gets you interviews.")}
      ${p("Here's what you can do right now:")}
      <ul style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
        <li><strong>Build your resume</strong> — AI writes tailored bullet points in seconds</li>
        <li><strong>Check your ATS score</strong> — see if your resume passes automated screening</li>
        <li><strong>Browse templates</strong> — 60+ designs for every industry</li>
      </ul>
      ${btn("Build My Resume →", `${brand.url}/builder/resume`)}
      ${divider()}
      ${p("Questions? Just reply to this email — I read every one.")}
      <p style="margin:0;font-size:15px;color:#475569;">— Haroon, Founder of ${brand.name}</p>
    `),
  };
}

// ─── Email 2: Day 1 — ATS Mistakes ────────────────────────────────────────
export function atsEducationEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "The #1 reason your resume isn't getting callbacks",
    html: base(`
      ${h1(`${firstName || 'Hey'}, here's why most resumes fail.`)}
      ${p("75% of resumes are rejected by ATS software before a human ever reads them.")}
      ${p("The most common reasons:")}
      <ul style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
        <li>Missing keywords from the job description</li>
        <li>Tables, columns, or graphics that ATS can't parse</li>
        <li>Non-standard section headings (e.g., "Career Journey" instead of "Experience")</li>
        <li>Wrong file format (some ATS systems can't read PDFs from certain editors)</li>
      </ul>
      ${p("Our ATS Checker scans your resume against 30+ criteria and tells you exactly what to fix.")}
      ${btn("Check My ATS Score →", `${brand.url}/ats-checker`)}
      ${divider()}
      ${p("See you tomorrow with more tips.")}
      <p style="margin:0;font-size:15px;color:#475569;">— Haroon</p>
    `),
  };
}

// ─── Email 3: Day 3 — Feature reveal ──────────────────────────────────────
export function featureRevealEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "The AI feature most job seekers don't know about",
    html: base(`
      ${h1(`${firstName || 'Hey'}, did you try this yet?`)}
      ${p("Most people use HiredTodayApp to format their resume. Smart. But the users who get the most callbacks use our <strong>AI Bullet Point Writer</strong>.")}
      ${p("Here's how it works:")}
      <ol style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
        <li>Enter your job title and a few notes about what you did</li>
        <li>Click "AI Enhance"</li>
        <li>Get 3 impact-driven bullet points with metrics and action verbs</li>
      </ol>
      ${p("Example output for a project manager:")}
      <div style="background:#f0fdf9;border:1px solid #ccfbef;border-radius:12px;padding:16px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#0f172a;">✅ Led cross-functional team of 12 to deliver $2.4M product redesign 3 weeks ahead of schedule</p>
        <p style="margin:0 0 8px;font-size:14px;color:#0f172a;">✅ Reduced project delivery time by 35% through agile sprint implementation</p>
        <p style="margin:0;font-size:14px;color:#0f172a;">✅ Managed stakeholder communications across 4 departments, achieving 98% satisfaction score</p>
      </div>
      ${btn("Try AI Bullet Writer →", `${brand.url}/builder/resume`)}
    `),
  };
}

// ─── Email 4: Day 7 — Upgrade offer ───────────────────────────────────────
export function upgradeOfferEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Your resume isn't done yet — here's what's missing",
    html: base(`
      ${h1(`${firstName || 'Hey'}, one last thing.`)}
      ${p("You've started building. Now let's finish strong.")}
      ${p("Pro gives you everything you need to land interviews:")}
      <ul style="margin:0 0 16px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
        <li><strong>Unlimited resumes</strong> — apply to different roles with tailored versions</li>
        <li><strong>PDF download</strong> — the format recruiters actually want</li>
        <li><strong>Full AI writing</strong> — unlimited bullet points, summaries, and suggestions</li>
        <li><strong>All 60+ templates</strong> — including executive and creative designs</li>
        <li><strong>Full ATS checker</strong> — 30-point analysis with actionable fixes</li>
      </ul>
      ${btn("Upgrade to Pro — $9.99/mo →", `${brand.url}/pricing`)}
      ${divider()}
      ${p("Cancel anytime. No questions.")}
      <p style="margin:0;font-size:15px;color:#475569;">— Haroon</p>
    `),
  };
}

// ─── Email 5: Day 10 — Last chance (value-based nudge) ────────────────────
export function day10LastChanceEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Your resume is built. The interviews aren't coming yet.",
    html: base(`
      ${h1(`${firstName || 'Hey'} — 10 days in. Time for real talk.`)}
      ${p("You built a resume on GetHiredToday. Nicely done. But I can see you haven't subscribed yet, and I want to be straight with you about what that's probably costing you.")}
      ${p("Without Pro, AI suggestions are limited. If you're actively job hunting, you need unlimited rewrites tailored to each job description. After that, you're applying with a static resume against jobs that each want different keywords — and getting filtered out before a human reads them.")}
      ${p("Pro fixes that. Unlimited AI rewrites, unlimited ATS checks, clean downloads — for less than the cost of a coffee.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;margin-bottom:8px;">Pro pricing</div>
        <div style="font-size:36px;font-weight:800;color:${brand.color};line-height:1;margin-bottom:4px;">$9.99<span style="font-size:18px;color:#94a3b8;font-weight:500;">/month</span></div>
        <div style="font-size:13px;color:#475569;margin-top:12px;">Flat $9.99/month. Cancel any time.</div>
      </td></tr></table>
      ${btn("Upgrade to Pro →", `${brand.url}/pricing`)}
      ${p("If $9.99 is still the blocker — and honestly, if it is, the job market is probably what's squeezing you, which is exactly why I made this affordable — hit reply and tell me. I read every email.")}
      <p style="margin:0;font-size:15px;color:#475569;">— Haroon</p>
    `),
  };
}

// ─── Email 6: Day 14 — Win-back ───────────────────────────────────────────
export function day14WinbackEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: "Before you go — one quick ask",
    html: base(`
      ${h1(`${firstName || 'Hey'} — before you go`)}
      ${p("You've been with us for two weeks, and it looks like HiredTodayApp didn't quite click for you. That's okay — not every tool is right for every person. Before I stop emailing you, I'd love to know one thing.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#fffbeb;border-left:4px solid #f59e0b;padding:20px;border-radius:4px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;line-height:1.5;">What stopped you from upgrading?</div>
        <div style="font-size:14px;color:#94a3b8;margin-top:8px;line-height:1.6;">Hit reply with one sentence. Just the honest answer.</div>
      </td></tr></table>
      ${p(`It helps me more than you'd think. A one-liner like <em>"too expensive,"</em> <em>"I already found a job,"</em> <em>"the ATS checker didn't work the way I expected,"</em> or <em>"I forgot about it"</em> — whatever it is — tells me exactly what to fix.`)}
      ${p("And if you've since landed a job: <strong>congratulations.</strong> That's the whole point. I'd still love to hear what helped, so I can make it better for the next person.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:#f8fafc;border-radius:12px;padding:20px;">
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:8px;">In case it helps:</div>
        <div style="font-size:15px;line-height:1.6;color:#475569;margin-bottom:12px;">Pro is $9.99/mo. Less than a coffee. No autorenew trap — cancel any time, no questions. If $9.99 is the wall, hit reply instead and tell me why.</div>
        <a href="${brand.url}/pricing" style="display:inline-block;background:${brand.color};color:#ffffff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:50px;text-decoration:none;">Upgrade to Pro →</a>
      </td></tr></table>
      ${p("After this email, I'll stop bugging you unless you come back. Your account stays active — you can subscribe anytime. Thanks for giving it a try. Really.")}
      <p style="margin:0;font-size:15px;color:#475569;">— Haroon</p>
      ${divider()}
      <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;font-style:italic;">P.S. If you did land a job — I'd love a one-sentence story for our reader wins page. Total opt-in. But those stories are the whole reason I built this.</p>
    `),
  };
}
