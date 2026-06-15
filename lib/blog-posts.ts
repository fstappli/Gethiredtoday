export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  gradient: string;
  content: string; // HTML string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-ats-friendly-resume-2025",
    title: "How to Write an ATS-Friendly Resume in 2025",
    description: "75% of resumes are rejected by ATS before a human sees them. Here's exactly how to beat the bots and land more interviews.",
    date: "2025-04-10",
    readTime: "8 min read",
    category: "Resume Tips",
    gradient: "from-teal-500 to-cyan-600",
    content: `
<h2>What Is an ATS and Why Does It Matter?</h2>
<p>An Applicant Tracking System (ATS) is software used by 99% of Fortune 500 companies and most mid-size businesses to automatically screen, rank, and filter resumes before a recruiter ever sees them. Industry research suggests <strong>roughly 75% of resumes are rejected by ATS before reaching a human</strong>.</p>
<p>The system scans your resume for keywords, formatting compatibility, and relevance to the job description. If your resume fails these checks, you're invisible — regardless of how qualified you are.</p>

<h2>The 7 Rules for ATS-Friendly Resumes</h2>

<h3>1. Use a Clean, Single-Column Layout</h3>
<p>ATS systems parse text linearly. Multi-column layouts, tables, and text boxes confuse the parser — your content ends up scrambled or skipped. Stick to a single-column format, or a two-column layout where the sidebar only contains supplementary info (skills, contact details).</p>
<p><strong>Safe to use:</strong> Simple headers, bullet points, bold text, standard section titles.</p>
<p><strong>Avoid:</strong> Tables, text boxes, headers/footers (ATS often can't read them), images, graphics.</p>

<h3>2. Match Keywords From the Job Description Exactly</h3>
<p>ATS systems perform literal keyword matching. If the job says "project management" and your resume says "project coordination," you may not match — even though they mean the same thing.</p>
<p>How to do this right:</p>
<ul>
  <li>Copy the exact phrases from the job description</li>
  <li>Include both spelled-out and abbreviated forms: "Search Engine Optimization (SEO)"</li>
  <li>Don't keyword stuff — mention each key skill 2–3 times naturally</li>
</ul>

<h3>3. Use Standard Section Headings</h3>
<p>ATS systems look for familiar section labels. Creative headings like "What I've Done" or "My Toolkit" are often not recognized. Stick to standard labels:</p>
<ul>
  <li>Work Experience (not "Career History" or "Professional Journey")</li>
  <li>Education (not "Where I Studied")</li>
  <li>Skills (not "Expertise" or "Toolbox")</li>
  <li>Certifications, Languages, Projects</li>
</ul>

<h3>4. Use Standard File Formats</h3>
<p>Submit your resume as a <strong>.docx or PDF</strong> — but only if the application instructions allow PDF. When in doubt, .docx is more universally parseable. Never submit as an image file (JPG, PNG) or a scanned document.</p>

<h3>5. Include a Skills Section With Exact Keywords</h3>
<p>Your skills section is prime real estate for ATS keywords. List every relevant tool, language, certification, and methodology explicitly. Don't rely on burying them in bullet points alone — dedicate a section to them.</p>
<p>Example: Python, SQL, Tableau, Salesforce, HubSpot, Agile, Scrum, JIRA, Google Analytics, SEO/SEM</p>

<h3>6. Avoid Headers and Footers for Contact Info</h3>
<p>Many ATS systems cannot parse text that lives in Word headers or footers. Put your name, email, phone, and LinkedIn URL in the main body of the document — not in a formatted header section.</p>

<h3>7. Spell Out Acronyms (At Least Once)</h3>
<p>Always include both the acronym and the full term: "Search Engine Optimization (SEO)", "Customer Relationship Management (CRM)". This catches both exact-match and expanded-term searches.</p>

<h2>How to Test Your Resume for ATS Compatibility</h2>
<p>Before submitting any application, use <a href="/ats-checker">our ATS checker</a> to score your resume against the job description. It highlights missing keywords, formatting issues, and gives you a compatibility score.</p>

<h2>Quick Checklist Before You Apply</h2>
<ul>
  <li>✅ Single-column or simple two-column layout</li>
  <li>✅ Keywords match the exact language of the job posting</li>
  <li>✅ Standard section headings (Work Experience, Education, Skills)</li>
  <li>✅ No tables, text boxes, or images</li>
  <li>✅ Contact info in the body, not in headers/footers</li>
  <li>✅ Submitted as PDF or .docx (not an image)</li>
  <li>✅ Acronyms spelled out at least once</li>
</ul>
<p>Getting past the ATS is the first gate. Once you're through, a polished, achievement-focused resume does the rest of the work.</p>
    `,
  },
  {
    slug: "resume-summary-examples-that-get-interviews",
    title: "10 Resume Summary Examples That Get You Interviews",
    description: "Your summary is the first thing recruiters read. These 10 examples across industries show exactly how to write one that makes them keep reading.",
    date: "2025-04-08",
    readTime: "6 min read",
    category: "Resume Writing",
    gradient: "from-violet-500 to-purple-600",
    content: `
<h2>Why Your Resume Summary Matters More Than You Think</h2>
<p>Recruiters spend an average of 7 seconds on a first resume scan. The professional summary — that 2–4 sentence block at the top — is usually the first thing they read. If it doesn't immediately communicate your value, they move on.</p>
<p>A great summary answers three questions in 3–4 sentences:</p>
<ol>
  <li><strong>Who are you?</strong> (role + years of experience)</li>
  <li><strong>What's your biggest proof point?</strong> (one strong metric or achievement)</li>
  <li><strong>What's your specialty?</strong> (the niche you own)</li>
</ol>

<h2>The Formula</h2>
<p><em>[Role] with [X years] in [specialty]. [Biggest achievement with metric]. [What you're known for / what makes you different].</em></p>

<h2>10 Real Resume Summary Examples</h2>

<h3>1. Software Engineer (Mid-Level)</h3>
<blockquote>Full-stack software engineer with 5 years building scalable web applications in React and Node.js. Reduced API response times by 60% at Acme Corp through query optimization and caching. Passionate about clean architecture, developer experience, and shipping fast.</blockquote>

<h3>2. Marketing Manager</h3>
<blockquote>Results-driven marketing manager with 7 years scaling B2B demand generation. Grew organic traffic 280% at TechCo through SEO-led content programs. Managed $1.2M annual paid media budget with 3.8x ROAS across Google, LinkedIn, and Meta.</blockquote>

<h3>3. Data Scientist</h3>
<blockquote>Data scientist specializing in NLP and recommender systems with 5 years of production ML experience. Built fraud detection model saving $4M annually at FinCo. PhD in Statistics. Strong in Python, PyTorch, and end-to-end ML pipelines on AWS.</blockquote>

<h3>4. Product Manager</h3>
<blockquote>Senior Product Manager with 6 years building B2C mobile products with 1M+ users. Launched subscription feature adding $3.2M ARR at AppCo. Led cross-functional teams of 12 through discovery, delivery, and iteration using OKR and Agile frameworks.</blockquote>

<h3>5. Account Executive</h3>
<blockquote>Enterprise Account Executive with 6 years in SaaS, consistently exceeding quota (avg 124% attainment). Closed $8.4M in ARR in 2024. Specializes in 6–12 month complex sales cycles with C-suite stakeholders using MEDDIC qualification.</blockquote>

<h3>6. Financial Analyst</h3>
<blockquote>CFA Level II candidate with 4 years in equity research and financial modeling. Built 3-statement DCF models for 14 consumer sector companies. Recognized as top analyst two years running at BankCorp for coverage quality and turnaround speed.</blockquote>

<h3>7. UX Designer</h3>
<blockquote>Senior UX designer with 7 years creating user-centered products for fintech and SaaS. Redesigned onboarding flow at PayApp, increasing user activation from 34% to 67%. Expert in Figma, design systems, and mixed-methods user research.</blockquote>

<h3>8. Registered Nurse (ICU)</h3>
<blockquote>Registered Nurse with 6 years of ICU experience at Level 1 trauma centers. ACLS and PALS certified. Expert in Epic EMR and high-acuity patient management. Maintained 98% patient satisfaction score across four consecutive quarters.</blockquote>

<h3>9. Junior Developer (Entry Level)</h3>
<blockquote>Full-stack developer (React, Node.js, PostgreSQL) with bootcamp training and 3 deployed side projects. Built a task management SaaS with 200+ active users. Fast learner with strong CS fundamentals and a track record of shipping working code quickly.</blockquote>

<h3>10. Operations Manager</h3>
<blockquote>Operations manager with 9 years optimizing manufacturing and logistics operations. Reduced operational costs by $2.1M at ManufactureCo through Lean process redesign. Six Sigma Green Belt certified. Led cross-functional teams of 40+ across production, logistics, and QA.</blockquote>

<h2>What Makes These Work</h2>
<p>Every summary above does three things:</p>
<ul>
  <li><strong>Specific number</strong> — not "improved performance" but "reduced costs by $2.1M"</li>
  <li><strong>Company context</strong> — even a fake one adds credibility ("at FinCo", "at TechCo")</li>
  <li><strong>Clear specialty</strong> — the reader knows exactly what you're good at</li>
</ul>

<h2>Common Summary Mistakes to Avoid</h2>
<ul>
  <li>❌ "Hardworking team player with a passion for excellence" — meaningless, every resume says this</li>
  <li>❌ Longer than 4 sentences — summaries are scannable, not essays</li>
  <li>❌ Written in third person ("John is a software engineer...") — always write in first person without using "I"</li>
  <li>❌ Objective statements ("Seeking a challenging role...") — these went out in 2005</li>
</ul>
<p>Use our <a href="/builder/resume/new">AI-powered builder</a> to generate a tailored summary for your specific role in seconds.</p>
    `,
  },
  {
    slug: "resume-mistakes-costing-you-interviews",
    title: "7 Resume Mistakes That Are Costing You Interviews",
    description: "These common resume mistakes silently eliminate you from consideration. Fix them today and watch your response rate climb.",
    date: "2025-04-05",
    readTime: "7 min read",
    category: "Resume Tips",
    gradient: "from-rose-500 to-orange-500",
    content: `
<h2>Why Good Candidates Get Ignored</h2>
<p>It's not always about being underqualified. Many excellent candidates get filtered out before a recruiter ever reads their resume — not because of their experience, but because of easily fixable mistakes in how their resume is written, formatted, or structured.</p>
<p>Here are the 7 most common resume mistakes — and how to fix each one today.</p>

<h2>Mistake 1: Writing Responsibilities Instead of Achievements</h2>
<p>The most common mistake on resumes is listing what you were supposed to do instead of what you actually accomplished.</p>
<p><strong>❌ Wrong:</strong> "Responsible for managing the customer success team."</p>
<p><strong>✅ Right:</strong> "Led customer success team of 8, improving retention from 74% to 89% in 12 months."</p>
<p>Every bullet point should answer: <em>what happened because you were there?</em> If the bullet sounds like it could have been on anyone's job description, rewrite it with a metric.</p>

<h2>Mistake 2: Not Tailoring for Each Application</h2>
<p>Sending the same resume to every job is one of the biggest silent killers. ATS systems score your resume against the job description — a generic resume typically scores 30–50% lower than a tailored one.</p>
<p>You don't need to rewrite your entire resume for every job. Make these targeted changes:</p>
<ul>
  <li>Adjust your professional summary to reflect the role</li>
  <li>Add keywords from the job posting to your skills section</li>
  <li>Reorder bullet points to lead with the most relevant experience</li>
</ul>
<p>This takes 10–15 minutes per application and meaningfully increases your response rate.</p>

<h2>Mistake 3: Unprofessional or Missing Contact Information</h2>
<p>Recruiters report rejecting resumes for these contact information issues:</p>
<ul>
  <li>Email addresses like "partyguy1998@gmail.com" or "hotmail" domains</li>
  <li>Missing LinkedIn URL (especially for professional roles)</li>
  <li>No location (remote or city/country — some roles require specific locations)</li>
  <li>Phone number only (missing email)</li>
</ul>
<p>Use a professional email (firstname.lastname@gmail.com), include your LinkedIn, and list your city/country or "Remote, Open to Relocation" if applicable.</p>

<h2>Mistake 4: Formatting That Breaks ATS Parsing</h2>
<p>Design elements that look beautiful to humans are invisible — or actively harmful — to ATS systems:</p>
<ul>
  <li><strong>Tables and columns</strong> — ATS reads these out of order or skips them</li>
  <li><strong>Text boxes</strong> — not read at all by most parsers</li>
  <li><strong>Headers and footers</strong> — many systems skip these entirely</li>
  <li><strong>Images and icons</strong> — ATS can't read images</li>
  <li><strong>Fancy fonts</strong> — parsers struggle with non-standard fonts</li>
</ul>
<p>Use clean templates with standard formatting. Our <a href="/builder/resume/new">builder uses ATS-safe templates</a> by default.</p>

<h2>Mistake 5: Resume Is Too Long (or Too Short)</h2>
<p>The right resume length depends on experience:</p>
<ul>
  <li><strong>0–5 years experience:</strong> 1 page, no exceptions</li>
  <li><strong>5–15 years experience:</strong> 1–2 pages</li>
  <li><strong>15+ years / executive roles:</strong> 2 pages max</li>
</ul>
<p>The most common mistake is a 3-page resume from someone with 4 years of experience. Pare it down. Ruthlessly cut anything that doesn't directly support why you're right for this role.</p>

<h2>Mistake 6: Listing Skills Without Evidence</h2>
<p>Anyone can write "Leadership" or "Strategic Thinking" in their skills section. These empty soft skills add nothing. Recruiters skim past them.</p>
<p>Two approaches that actually work:</p>
<ol>
  <li>Only list skills you can back up with a bullet point in your experience: if you list "Data Analysis," have a bullet that shows a data analysis result.</li>
  <li>Be specific: "Python (5 years, NumPy, pandas, scikit-learn)" beats "Programming."</li>
</ol>

<h2>Mistake 7: Typos, Inconsistent Formatting, and Grammar Errors</h2>
<p>Surveys consistently show that 60–70% of hiring managers will reject a resume with a single typo. In competitive hiring environments, a typo signals carelessness — exactly the wrong message.</p>
<p>How to catch them:</p>
<ul>
  <li>Read your resume backwards (bottom to top) to catch spelling errors your brain autocorrects</li>
  <li>Read it out loud — awkward phrasing stands out</li>
  <li>Ask one other person to proofread it</li>
  <li>Check formatting consistency: are all dates in the same format? Same bullet style? Same font throughout?</li>
</ul>

<h2>Fix These in 30 Minutes</h2>
<p>None of these mistakes take hours to fix. Set a timer for 30 minutes and go through each one. Then run your updated resume through our <a href="/ats-checker">ATS checker</a> to get a compatibility score and catch any remaining keyword gaps.</p>
<p>Small improvements to your resume compound into dramatically better response rates. A 1-in-50 response rate that becomes 1-in-20 doubles your number of interviews without changing your job search volume at all.</p>
    `,
  },
  {
    slug: "ats-friendly-resume-tips",
    title: "ATS-Friendly Resume: 10 Tips to Get Past the Bots in 2026",
    description: "Learn how to create an ATS-friendly resume that passes scanning software. 10 expert tips to ensure recruiters actually see your application.",
    date: "2026-04-16",
    readTime: "8 min read",
    category: "ATS Optimization",
    gradient: "from-teal-500 to-emerald-600",
    content: `
<h2>What is an ATS and Why Should You Care?</h2>
<p>An Applicant Tracking System is software that companies use to manage job applications at scale. When you submit your resume online, it's immediately parsed by this software, which extracts information like your contact details, work experience, skills, and education. The ATS then scores your resume based on keywords and formatting, deciding whether you move forward or get automatically rejected.</p>
<p>Here's the reality: <strong>most candidates never know why they were rejected</strong>. They're likely not rejected for lacking skills—they're rejected because their resume couldn't be properly parsed by the ATS. According to industry research, <strong>75% of resumes never reach a human recruiter</strong>. The ATS is the gatekeeper, and you need to speak its language.</p>

<h2>10 Tips for Creating an ATS-Friendly Resume</h2>

<h3>1. Use a Simple, Clean Format</h3>
<p><strong>The Problem:</strong> Fancy formatting looks impressive but destroys ATS readability. Tables, text boxes, graphics, headers that span columns, and unusual fonts confuse the parsing software.</p>
<p><strong>The Solution:</strong> Use a straightforward, single-column layout with standard fonts like Arial, Calibri, or Times New Roman. Think of your resume as a plain text document, even if you save it as a PDF.</p>

<h3>2. Keyword Optimization is Non-Negotiable</h3>
<p>The ATS compares your resume to the job description. If you use different words for the same skills, the ATS thinks you don't have them. Mirror the <em>exact</em> language from the job posting — if they ask for "project management experience," don't just mention "managed projects."</p>
<p>Spend 15 minutes reading the job description and highlighting every technical term, skill, and software mentioned. Ensure these exact terms appear in your resume.</p>

<h3>3. Avoid Fancy Graphics, Icons, and Images</h3>
<p>That sleek resume with icons next to section headers and a professional headshot? The ATS sees symbols it can't parse and skips right over them. Stick to text-based formatting — no infographics, no charts, no icons, no photos.</p>

<h3>4. Save as PDF (When You Can)</h3>
<p>PDFs are more stable across systems and preserve formatting better. Save as PDF unless explicitly told otherwise. PDFs render consistently across different computers, preventing parsing problems.</p>

<h3>5. Use Standard Section Headings</h3>
<p>Creativity in section names confuses ATS software. Use headings the ATS recognizes:</p>
<ul>
  <li>PROFESSIONAL EXPERIENCE (not "Career Journey" or "Work History")</li>
  <li>EDUCATION</li>
  <li>SKILLS</li>
  <li>CERTIFICATIONS</li>
  <li>PROFESSIONAL SUMMARY (not "About Me")</li>
</ul>

<h3>6. List Skills Clearly in a Dedicated Section</h3>
<p>Burying your skills throughout the resume in narrative form means the ATS might miss them. Create a dedicated SKILLS section listing your competencies clearly, separated by commas or in bulleted format.</p>

<h3>7. Format Your Dates Consistently</h3>
<p>Inconsistent date formatting confuses ATS parsing. Pick one format and stick with it throughout your entire resume. Recommended: <strong>Jan 2022 – Present</strong>.</p>

<h3>8. Avoid Tables, Columns, and Text Boxes</h3>
<p>Even in modern software, ATS parsing of tables is unreliable. Use line breaks and bullet points instead. Your resume should be copyable into plain text and still be readable.</p>

<h3>9. Include Contact Information at the Top</h3>
<p>Put your full contact information at the very top of your resume: full name, city/state, phone, professional email, and LinkedIn URL. Many ATS systems can't read text placed in Word headers or footers.</p>

<h3>10. Proofread Ruthlessly for Typos and Formatting</h3>
<p>Typos don't just hurt your credibility with humans — they can cause ATS parsing errors. A misspelled word might break how the software reads an entire section. Read your resume out loud, and paste it into a plain text editor to catch formatting issues.</p>

<h2>Quick Checklist Before You Apply</h2>
<ul>
  <li>✅ Single-column or simple two-column layout</li>
  <li>✅ Keywords match the exact language of the job posting</li>
  <li>✅ Standard section headings (Work Experience, Education, Skills)</li>
  <li>✅ No tables, text boxes, or images</li>
  <li>✅ Contact info in the body, not in headers/footers</li>
  <li>✅ Submitted as PDF or .docx (not an image)</li>
  <li>✅ Acronyms spelled out at least once</li>
</ul>
<p>Getting past the ATS is the first gate. Once you're through, a polished, achievement-focused resume does the rest of the work.</p>
<p>Use our <a href="/ats-checker">ATS Checker</a> to score your resume before you apply.</p>
    `,
  },
  {
    slug: "best-resume-format-2026",
    title: "The Best Resume Format in 2026: Which One Gets You Hired?",
    description: "Compare chronological, functional, and combination resume formats in 2026. Learn which format works best for your situation and how AI tools help you choose.",
    date: "2026-04-16",
    readTime: "7 min read",
    category: "Resume Tips",
    gradient: "from-blue-500 to-indigo-600",
    content: `
<h2>The Three Main Resume Formats Explained</h2>

<h3>Format #1: Chronological Resume</h3>
<p>Your work history listed in reverse chronological order (most recent job first), with accomplishments and responsibilities under each position. <strong>This is the standard.</strong> Most hiring managers expect this format, and most ATS systems are optimized to parse it.</p>
<p><strong>Best for:</strong> Candidates with a clear progression of jobs in the same field, stable employment with minimal gaps, and career advancement within an industry.</p>
<p><strong>Challenges:</strong> Doesn't hide employment gaps, and may bury relevant skills if you change jobs frequently.</p>

<h3>Format #2: Functional Resume</h3>
<p>Your skills and competencies listed prominently, with work history playing a supporting role. The focus is on what you can do, not where you did it.</p>
<p><strong>Best for:</strong> Career changers, people with employment gaps, or those with unrelated job history who want to highlight transferable skills.</p>
<p><strong>Real talk:</strong> Many hiring managers are skeptical of functional resumes because they've been used to hide red flags. Unless you have a strong reason, chronological is safer in 2026.</p>

<h3>Format #3: Combination Resume (Hybrid)</h3>
<p>The best of both worlds. You lead with your relevant skills, then provide a reverse-chronological work history with accomplishments. <strong>This is the format gaining ground in 2026.</strong></p>
<p><strong>Best for:</strong> Most job seekers — career changers with transferable skills, senior candidates with diverse experience, and anyone targeting a specific competency set.</p>
<p><strong>Why it's winning in 2026:</strong> Companies want assurance. The combination format says "here's what I'm good at, and here's where I earned that expertise."</p>

<h2>Choosing Your Format: A Decision Framework</h2>

<p><strong>Use Chronological if:</strong> You're staying in the same field with steady job progression, no significant gaps, and your recent jobs are directly relevant.</p>
<p><strong>Use Combination if:</strong> You're changing roles within your industry, want to emphasize specific competencies the job posting mentions, or have a mix of relevant and less-relevant experience.</p>
<p><strong>Use Functional only if:</strong> You're making a significant career change and most of your experience is in a different field.</p>

<h2>Resume Format by Industry in 2026</h2>
<ul>
  <li><strong>Tech/Software:</strong> Combination or chronological. Emphasize technical skills prominently.</li>
  <li><strong>Sales/Business Dev:</strong> Chronological. Hiring managers want to see your progression.</li>
  <li><strong>Creative (Design, Marketing):</strong> Combination with a portfolio.</li>
  <li><strong>Healthcare:</strong> Chronological. Credentials and licensure history expected.</li>
  <li><strong>Executive/C-Level:</strong> Chronological. Clear progression to leadership is essential.</li>
</ul>

<h2>The Format Trend in 2026</h2>
<p>Here's what we're seeing across the job market:</p>
<ul>
  <li><strong>Chronological is still dominant</strong> — about 60% of resumes follow this format.</li>
  <li><strong>Combination is on the rise</strong> — up from ~15% three years ago to ~30% now.</li>
  <li><strong>Functional is declining</strong> — only about 10% of submissions now, and trending lower.</li>
</ul>
<p>The trend is clear: <strong>hiring managers want to know both what you can do AND where you proved it.</strong> The combination format delivers both.</p>

<h2>Quick Reference: Format Comparison</h2>
<ul>
  <li>✅ <strong>Chronological</strong> — ATS excellent, most trusted, best for stable career paths</li>
  <li>✅ <strong>Combination</strong> — ATS excellent, growing preference, best for career changers</li>
  <li>⚠️ <strong>Functional</strong> — ATS fair, declining preference, use only for major pivots</li>
</ul>
<p>Use our <a href="/builder/resume/new">AI-powered builder</a> to build your resume in the format that matches your background — and get it ATS-ready in minutes.</p>
    `,
  },
  {
    slug: "how-to-write-a-cover-letter",
    title: "How to Write a Cover Letter That Actually Gets You Interviews (2026 Guide)",
    description: "A no-fluff 2026 guide to writing cover letters that get read. The three-paragraph structure recruiters actually want, plus templates and examples.",
    date: "2026-04-17",
    readTime: "9 min read",
    category: "Cover Letters",
    gradient: "from-amber-500 to-orange-500",
    content: `
<p>Most cover letters get three things wrong: they repeat the resume, they open with "I am writing to apply for," and they run too long. Recruiters spend under 30 seconds on a cover letter. If you haven't earned their attention by line three, you've lost it.</p>
<p>This guide fixes that. You'll learn the three-paragraph structure that works, see a real example you can steal, and know exactly when to skip the cover letter entirely (yes — sometimes that's the right move).</p>

<h2>Do You Even Need a Cover Letter in 2026?</h2>
<p>Short answer: sometimes. Here's when each applies.</p>

<h3>Skip the cover letter when:</h3>
<ul>
  <li>The application form doesn't ask for one and you're applying to a big company (FAANG, major banks, Fortune 500). Recruiters there rarely read them.</li>
  <li>You're applying through a job board with 500+ competing applicants. A weak cover letter is worse than none.</li>
  <li>The role is heavily technical and your GitHub, portfolio, or resume speaks louder than prose.</li>
</ul>

<h3>Write a cover letter when:</h3>
<ul>
  <li>The application form asks for one (even if it says "optional" — treat that as required).</li>
  <li>You're applying to a startup, nonprofit, government, or academic role — all of which still read them.</li>
  <li>You're a career switcher and your resume doesn't obviously fit. The cover letter explains the connection.</li>
  <li>There's a specific reason you want this specific company. That reason deserves 200 words.</li>
  <li>The role has under 50 applicants and the hiring manager is likely to read each one.</li>
</ul>

<h2>The Only Cover Letter Structure You Need</h2>
<p>Forget the five-paragraph essay you were taught in school. Recruiters want three paragraphs, roughly 250–350 words total.</p>

<h3>Paragraph 1: Hook (2–3 sentences)</h3>
<p>Open with one specific, concrete sentence about why you want this role at this company. Not "I am writing to express my interest in the Marketing Manager position" — that's the default opener every recruiter sees 200 times a week. Start somewhere the reader wouldn't expect.</p>
<p><strong>Weak:</strong> "I am writing to express my interest in the Marketing Manager position at Acme Corp."</p>
<p><strong>Strong:</strong> "When Acme launched the rewards program rebuild last quarter, the post-mortem your VP of Marketing shared on LinkedIn was the first time I'd seen a growth team publicly admit what didn't work. That kind of thinking is why I'm applying."</p>
<p>The second version proves you did research, mentions something specific and recent, and opens with a thought — not a formality.</p>

<h3>Paragraph 2: Proof (4–6 sentences)</h3>
<p>Pick two or three accomplishments from your resume and expand them with context the resume couldn't hold. This is NOT a resume repeat — it's the story behind the bullets.</p>
<p>The formula: <em>[situation] → [what you did] → [measurable outcome] → [why it matters for this role].</em></p>
<p><strong>Example:</strong></p>
<p>"At my previous role, our email open rates had flatlined at 14% for over a year. I rebuilt the segmentation model using purchase behavior instead of demographics, ran a four-week A/B test against the existing approach, and pushed open rates to 31% while growing revenue per send by 47%. I'd bring that same diagnostic approach to Acme's lifecycle marketing, especially given what I've read about the upcoming loyalty program expansion."</p>
<p>Notice how it ties back to the company at the end. That's the part 90% of cover letters skip.</p>

<h3>Paragraph 3: Close (2–3 sentences)</h3>
<p>End with a confident, specific call to action. Don't beg. Don't grovel. Don't use "Thank you for your consideration" as your entire closing — it reads like filler.</p>
<p><strong>Weak:</strong> "Thank you for your time and consideration. I look forward to hearing from you."</p>
<p><strong>Strong:</strong> "I'd welcome the chance to walk through how I'd approach the first 90 days in this role — especially the loyalty migration. I'll be in the Bay Area the week of May 5 if an in-person conversation works, and happy to do video any week before that."</p>

<h2>A Full Cover Letter Example You Can Steal</h2>
<p>Change the details to match your situation.</p>
<p>Dear Hiring Team,</p>
<p>When Acme launched the rewards program rebuild last quarter, the post-mortem your VP of Marketing shared on LinkedIn was the first time I'd seen a growth team publicly admit what didn't work. That kind of thinking is why I'm applying for the Senior Marketing Manager role.</p>
<p>I've spent the last four years running lifecycle marketing at a mid-sized B2C SaaS company. Two pieces of that work are directly relevant: when our email open rates flatlined at 14%, I rebuilt the segmentation model using purchase behavior and pushed open rates to 31% with a 47% lift in revenue per send; and when our referral program underperformed against industry benchmarks, I rebuilt the incentive structure from flat-rate credits to tiered milestones, which tripled referrals in six months. Both projects required me to challenge assumptions the team had inherited — which is how I'd approach the loyalty program migration you're planning.</p>
<p>I'd welcome the chance to walk through how I'd approach the first 90 days, especially around the loyalty migration and what I'd want to learn before changing anything. I'll be in the Bay Area the week of May 5 if an in-person conversation works; happy to do video any week before that.</p>
<p>Best,<br/>[Your Name]</p>

<h2>Common Cover Letter Mistakes to Avoid</h2>
<ol>
  <li><strong>Repeating your resume verbatim.</strong> The recruiter has the resume right next to the cover letter. Tell them something the resume can't — context, reasoning, or a specific motivation.</li>
  <li><strong>Opening with "I am writing to apply for…"</strong> Dead on arrival. Start with something specific, unexpected, or about the company — not about you.</li>
  <li><strong>Using the same cover letter for every job.</strong> Recruiters spot templated cover letters in three seconds. If you're not going to customize, don't send one.</li>
  <li><strong>Making it about what YOU want.</strong> "I'm looking for an opportunity to grow" is about you. "I want to help Acme solve X because Y" is about them. Always flip to their perspective.</li>
  <li><strong>Overusing adjectives.</strong> "Dynamic, results-oriented, detail-oriented, self-starter." Every recruiter has a filter for this. Cut every adjective you can't back with a specific example.</li>
  <li><strong>Going over one page.</strong> Under 400 words is ideal. If it doesn't fit on one page, you're padding.</li>
  <li><strong>Attaching it as a separate file when the form has a text box.</strong> If they give you a paste-in field, paste. An attached cover letter gets opened half the time.</li>
</ol>

<h2>Cover Letter Templates for Specific Situations</h2>

<h3>Career Changer Template</h3>
<p><em>[Company] is rebuilding [specific function] — I've been following [specific detail] since [specific moment]. My background is in [old field], but what I've done there is much closer to [new field] than the job title suggests: [one example of transferable work].</em></p>
<p><em>In my current role, I [specific accomplishment with numbers that sounds like the new field, not the old one]. I also [second accomplishment]. Both projects are, functionally, [new field] work — even though they happened inside a [old field] org.</em></p>
<p><em>I'd love to walk you through the connection. I've also built [portfolio project / cert / side work] specifically because I wanted to show I'm serious about the switch, not just exploring.</em></p>

<h3>Recent Graduate Template</h3>
<p><em>I've been using [company's product] since [when/why], and I noticed [specific observation about what they do that's interesting]. That's what brought me to the [role] posting.</em></p>
<p><em>While my professional resume is short, the work I've done speaks to the role: I [specific project with scale/outcome], led [team project with quantified result], and [independent initiative that shows drive]. I'd bring that same approach to this role.</em></p>
<p><em>I'd love 20 minutes to walk through what I'd focus on in the first 90 days.</em></p>

<h3>Referral Template</h3>
<p><em>[Name of referrer] suggested I apply for the [role] after we talked about [specific topic they mentioned about the company].</em></p>
<p><em>Two pieces of my background are directly relevant to what [Name] described: [accomplishment 1] and [accomplishment 2]. I'd be particularly excited about [specific area of the role] because [genuine reason].</em></p>
<p><em>[Name] is happy to speak to my work, and I'd welcome a conversation whenever works for you.</em></p>

<h2>Make Sure Your Cover Letter Matches Your Resume</h2>
<p>The cover letter and resume need to tell the same story. If your resume buries "led a team of 8" in the third bullet of a 2019 role, but your cover letter opens with leadership as your strongest skill, something's misaligned.</p>
<p>Before sending, do this: read the cover letter first, then the resume. Do they reinforce each other? Or do they feel like two different candidates? If they don't match, the resume usually needs the fix — pull forward whatever the cover letter is highlighting.</p>
<p>Our <a href="/builder/resume/new">AI bullet rewriter</a> helps you do this in minutes. Drop in your current resume plus the job description you're targeting, and it rewrites your bullets to reinforce the same themes your cover letter leads with.</p>

<h2>Final Checklist Before You Hit Send</h2>
<ul>
  <li>✅ Under 400 words</li>
  <li>✅ Three paragraphs (Hook, Proof, Close)</li>
  <li>✅ Addresses a specific person or team — never "To Whom It May Concern"</li>
  <li>✅ Mentions something specific about this company (not generic praise)</li>
  <li>✅ Includes 2–3 accomplishments with measurable outcomes</li>
  <li>✅ Closes with a specific, confident call to action</li>
  <li>✅ Customized — not a copy-paste from a template</li>
  <li>✅ Free of typos (read it aloud; you'll catch half of them that way)</li>
  <li>✅ Saved as <code>FirstName_LastName_Cover_Letter.pdf</code> (never <code>cover_letter_v4_final.docx</code>)</li>
  <li>✅ Cover letter and resume tell the same story about who you are</li>
</ul>

<h2>The TL;DR</h2>
<p>Skip the cover letter when nobody's going to read it. Write a good one when someone will. Three paragraphs, under 400 words. Open with something specific about the company, not something generic about you. Use numbers, tie back to their problems, end with a confident call to action.</p>
<p>That's the whole framework. Everything else is details.</p>
    `,
  },
  {
    slug: "skills-to-put-on-a-resume",
    title: "Skills to Put on a Resume in 2026 (100+ Examples by Role)",
    description: "The right skills to put on your resume in 2026 — with role-specific examples, hard vs soft skill guidance, and how to match skills to ATS keywords.",
    date: "2026-04-17",
    readTime: "10 min read",
    category: "Resume Skills",
    gradient: "from-fuchsia-500 to-pink-600",
    content: `
<p>The "Skills" section is the most mishandled part of most resumes. Job seekers either stuff it with buzzwords ("team player, go-getter, self-starter") or leave it generic to the point of uselessness ("Microsoft Office, communication, problem solving").</p>
<p>Meanwhile, applicant tracking systems (ATS) use that exact section to decide whether you match the role. Get it wrong and you're filtered out before a human sees your name.</p>
<p>This guide fixes that. You'll get 100+ real skill examples by role, the difference between skills that help and skills that hurt, and how to match your skills section to the ATS keywords that actually trigger callbacks.</p>

<h2>The Two-Minute Rule for Picking Skills</h2>
<p>Before you list a single skill, open the job description you're targeting and do this:</p>
<ol>
  <li>Copy the job description into a text document.</li>
  <li>Highlight every noun that sounds like a skill (tool, language, framework, methodology, soft skill).</li>
  <li>Cross-reference against your actual experience. Which ones can you honestly claim?</li>
  <li>List those on your resume, exactly as worded in the JD.</li>
</ol>
<p>That's it. The skills section isn't about listing everything you've ever touched — it's about signaling "I have exactly what you asked for" to both the ATS and the human reader.</p>

<h2>Hard Skills vs Soft Skills — and Why the Balance Matters</h2>
<p><strong>Hard skills</strong> are specific, teachable, and usually tool- or process-based. They're the ones ATS parsers love because they're concrete and searchable. Examples: Python, SQL, Figma, Salesforce, French (B2), SEO, Agile/Scrum, financial modeling, CAD, video editing in Premiere Pro.</p>
<p><strong>Soft skills</strong> are harder to measure but often the thing that actually gets you hired once you're in the room. ATS parsers rarely trigger on soft skills, but human readers weight them heavily. Examples: stakeholder management, cross-functional collaboration, executive communication, mentoring, conflict resolution.</p>
<p><strong>The right ratio for 2026:</strong> About 70% hard skills, 30% soft skills in your skills section. List 8–12 skills total — more looks like padding, less looks like you're hiding something.</p>

<h2>What to Cut from Your Skills Section (Immediately)</h2>
<ul>
  <li><strong>"Microsoft Office" or "Microsoft Word."</strong> It's 2026. Recruiters assume you can use a word processor.</li>
  <li><strong>"Communication."</strong> Everyone claims it. Without context, it means nothing. Replace with "Executive presentation," "Technical writing," or "Client-facing communication."</li>
  <li><strong>"Hardworking" / "Team player" / "Go-getter."</strong> Not skills. Adjectives. Every candidate uses them.</li>
  <li><strong>Languages you took in high school.</strong> Unless you can hold a professional conversation, don't list it.</li>
  <li><strong>Software from 10 years ago</strong> (unless it's still industry-standard).</li>
  <li><strong>Generic buzzwords without a system attached.</strong> "Leadership" alone is weak. "Cross-functional team leadership" is fine and credible.</li>
</ul>

<h2>100+ Skills Organized by Role</h2>
<p>Pull from these based on what fits your actual experience AND the job description. Don't list skills you can't back up if asked in an interview.</p>

<h3>Software Engineering / Technical</h3>
<p><strong>Languages &amp; Frameworks:</strong> Python, JavaScript, TypeScript, Go, Rust, Java, C++, C#, Ruby, Swift, Kotlin, React, Next.js, Vue.js, Angular, Node.js, Django, Flask, Spring Boot, .NET, Laravel, Rails</p>
<p><strong>Data &amp; Infrastructure:</strong> PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, GraphQL, REST APIs, gRPC, AWS (EC2, S3, Lambda, RDS), GCP, Azure, Kubernetes, Docker, Terraform, CI/CD, GitHub Actions, Jenkins</p>
<p><strong>Practices:</strong> Test-driven development, Code review, Microservices architecture, Event-driven design, Agile/Scrum, System design, Performance optimization, Security best practices</p>

<h3>Data / Analytics</h3>
<p>SQL, Python (pandas, NumPy, scikit-learn), R, Tableau, Power BI, Looker, dbt, Snowflake, BigQuery, Databricks, Airflow, Statistical modeling, A/B testing, Experiment design, Cohort analysis, Regression analysis, Forecasting, Data visualization, ETL, Data warehousing</p>

<h3>Product Management</h3>
<p>Roadmap planning, User research, Product strategy, Stakeholder management, JIRA, Linear, Figma, Miro, Notion, Productboard, Amplitude, Mixpanel, A/B testing, OKR frameworks, Agile, Scrum, Kanban, User story writing, PRD writing, Cross-functional leadership, Technical fluency, Go-to-market strategy</p>

<h3>Design / UX</h3>
<p>Figma, Adobe XD, Sketch, Framer, Principle, InVision, Prototyping, Wireframing, User research, Usability testing, Design systems, Accessibility (WCAG), Interaction design, Information architecture, Motion design, Design ops, HTML/CSS, Adobe Creative Suite</p>

<h3>Marketing</h3>
<p>SEO, SEM, Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads, Google Analytics 4, Google Tag Manager, HubSpot, Marketo, Salesforce Marketing Cloud, Mailchimp, Klaviyo, Email marketing, Lifecycle marketing, Content strategy, Brand strategy, Marketing analytics, Attribution modeling, CRO, Performance marketing, Growth marketing, B2B marketing, B2C marketing</p>

<h3>Sales</h3>
<p>Salesforce CRM, HubSpot CRM, Outreach, Salesloft, Gong, Lead generation, Prospecting, Cold outreach, Discovery calls, Solution selling, MEDDIC, SPIN selling, Challenger sale, Pipeline management, Forecasting, Contract negotiation, Account management, Territory planning, Quota carrying, Upselling, Cross-selling, Customer retention</p>

<h3>Finance / Accounting</h3>
<p>Financial modeling, Forecasting, Budgeting, Variance analysis, Excel (advanced), SQL, Bloomberg Terminal, FactSet, NetSuite, QuickBooks, SAP, Oracle Financials, GAAP, IFRS, Audit, FP&amp;A, Capital planning, Cash flow analysis, Valuation (DCF, comps, precedent transactions), M&amp;A analysis</p>

<h3>Operations / Project Management</h3>
<p>PMP, PRINCE2, Agile, Scrum, Lean, Six Sigma, Kanban, JIRA, Asana, Monday, Smartsheet, Project scheduling, Resource allocation, Risk management, Vendor management, Process improvement, SOPs, KPI tracking, Cross-functional collaboration, Stakeholder communication</p>

<h3>General Soft Skills (Use Sparingly, With Context)</h3>
<p>Executive communication, Written communication, Public speaking, Cross-functional collaboration, Stakeholder management, Mentoring and coaching, Conflict resolution, Decision-making under uncertainty, Prioritization, Adaptability, Analytical thinking, Systems thinking, Customer empathy, Strategic thinking</p>

<h2>How to Match Your Skills to ATS Keywords</h2>
<p>This is the part most job seekers skip — and it's the single biggest lever on whether your resume gets through.</p>
<p><strong>Step 1: Scrape the exact keywords from the job description.</strong> Look at the "Requirements" and "Qualifications" sections. Every skill listed there is a keyword the ATS will scan for. If they wrote "Salesforce CRM," use "Salesforce CRM" on your resume — not "SFDC," not "CRM systems."</p>
<p><strong>Step 2: Check which of those keywords already appear on your resume.</strong> Go through your resume and highlight every instance. Missing a key term? Add it (if you can honestly claim it).</p>
<p><strong>Step 3: Prioritize keywords that appear multiple times in the JD.</strong> If a JD mentions "Python" once and "SQL" five times, SQL is clearly higher-weighted. Make sure SQL shows up in your skills section AND at least one bullet point.</p>
<p><strong>Step 4: Don't stuff keywords where they don't belong.</strong> ATS systems are reasonably good at detecting keyword stuffing.</p>

<h2>The Fastest Way to Do This</h2>
<p>Matching keywords manually is tedious. That's why we built our <a href="/ats-checker">ATS Checker</a> — paste your resume and any job description, and it tells you your match percentage, which required keywords are missing, which skills are underweighted, and where exactly to add each keyword in your resume.</p>

<h2>The Three Skills Section Formats That Work</h2>

<h3>Format 1: Grouped by Category (best for most roles)</h3>
<p><strong>SKILLS</strong><br/>
Technical: Python, SQL, Tableau, dbt, Snowflake, Airflow<br/>
Analytical: A/B testing, Cohort analysis, Forecasting, Regression modeling<br/>
Business: Stakeholder management, Cross-functional collaboration, Executive communication</p>

<h3>Format 2: Flat List (best for senior or technical roles)</h3>
<p><strong>SKILLS</strong><br/>
Python • SQL • Tableau • dbt • Snowflake • Airflow • A/B testing • Cohort analysis • Stakeholder management</p>

<h3>Format 3: Rated / Proficiency (USE WITH CAUTION)</h3>
<p><strong>Warning:</strong> Don't use the rated format unless you're fully willing to defend the ratings in interviews. "Expert in SQL" gets you a whiteboard test.</p>

<h2>Industry-Specific Keyword Patterns (2026)</h2>
<ul>
  <li><strong>AI / ML engineering:</strong> LLMs, prompt engineering, RAG, vector databases, fine-tuning, PyTorch, Transformers, LangChain, evaluation frameworks</li>
  <li><strong>Fintech:</strong> KYC/AML compliance, PCI DSS, fraud detection, SOC 2, real-time payments, risk modeling</li>
  <li><strong>Health tech:</strong> HIPAA, HL7/FHIR, clinical workflows, EHR integration (Epic, Cerner), medical coding (ICD-10, CPT)</li>
  <li><strong>Climate / clean energy:</strong> ESG reporting, carbon accounting (GHG Protocol), LCA, renewable energy systems, grid optimization</li>
  <li><strong>Creator economy / content:</strong> Short-form video strategy, community management, creator partnerships, influencer analytics, platform-specific growth</li>
</ul>

<h2>Skills Mistakes That Get You Rejected</h2>
<ol>
  <li><strong>Listing skills you can't back up.</strong> A single interview question exposes the lie. Never list a skill you can't discuss for three minutes.</li>
  <li><strong>Using the wrong level of seniority language.</strong> A senior resume that says "basic knowledge of Python" looks weaker than one that says "Python for data analysis."</li>
  <li><strong>Spelling errors in skill names.</strong> "Javscript." "Illustrater." "Kubernetees." It's 2026 and spellcheck exists.</li>
  <li><strong>Adding skills that contradict your resume.</strong> Skills should reinforce the story, not contradict it.</li>
  <li><strong>Forgetting to update for the target role.</strong> A static skills section = lower match rate.</li>
</ol>

<h2>Quick Checklist Before You Submit</h2>
<ul>
  <li>✅ Skills section has 8–12 skills, not 30</li>
  <li>✅ Hard skills and soft skills at roughly 70/30</li>
  <li>✅ Exact keywords from the job description are present</li>
  <li>✅ No "Microsoft Office" or "communication" without qualification</li>
  <li>✅ No skills you can't honestly defend in an interview</li>
  <li>✅ Spelling and capitalization match industry conventions</li>
  <li>✅ Your skills reinforce, not contradict, your experience bullets</li>
  <li>✅ Customized to this specific role — not the same list for every application</li>
</ul>

<h2>The TL;DR</h2>
<p>The skills section isn't a dumping ground. It's a precision tool for signaling to both ATS parsers and human readers that you match the role. Pull exact keywords from the job description, list 8–12 skills you can defend, skip the buzzwords, and update the section for every application. Do that, and your callback rate will jump — often dramatically.</p>
    `,
  },
  {
    slug: "ats-resume-checker-2026",
    title: "ATS Resume Checker 2026: What Actually Works",
    description: "Over 90% of Fortune 500 companies screen resumes with ATS software. Here's how to check yours — and the 30-point rubric most tools don't tell you about.",
    date: "2026-04-18",
    readTime: "9 min read",
    category: "ATS",
    gradient: "from-emerald-500 to-teal-600",
    content: `
<p>If you're applying to any job at a company with more than about 50 employees, your resume is almost certainly being read by software before a human ever sees it. That software — an Applicant Tracking System, or ATS — decides whether you make it to the recruiter's inbox or vanish into the "we'll keep your resume on file" void.</p>
<p>An ATS resume checker tells you whether your resume will actually pass that screen. This guide covers what ATS software actually checks, the top tools worth using in 2026, and the 30-point rubric we use internally at <a href="/">HiredTodayApp</a> to score resumes.</p>

<h2>What Does an ATS Actually Check?</h2>
<p>ATS systems are less sophisticated than most people think. They don't "understand" your resume — they parse it into structured fields, match it against the job description's keywords, and rank you on a handful of heuristics. Here's what they look for, in rough order of importance:</p>

<h3>1. Keyword match</h3>
<p>The ATS tokenises both the job posting and your resume, then compares word-for-word. "Project management" in the job description doesn't automatically match "project coordination" on your resume — even though they mean similar things. The rule: use the <em>exact</em> phrases from the job posting, somewhere on your resume, at least once each.</p>

<h3>2. Parseable formatting</h3>
<p>ATS parsers convert your document to plain text before analysis. Tables, text boxes, headers/footers (especially in .docx), multi-column layouts, and graphics often break this conversion. Text that rendered beautifully in Word can come out scrambled — or missing entirely — inside the ATS.</p>

<h3>3. Section structure</h3>
<p>The parser looks for standard section headings — "Work Experience", "Education", "Skills", "Certifications" — to categorise your content. Creative labels like "What I've Done" or "My Toolkit" often fail to map to the expected fields, and your experience ends up in the wrong bucket (or no bucket).</p>

<h3>4. Contact information completeness</h3>
<p>Most ATS systems require name, email, and phone at minimum. Missing any of these flags your resume for manual review — or rejection. LinkedIn URL, city/state, and personal website are optional bonuses.</p>

<h3>5. Length and content density</h3>
<p>ATS scoring often down-weights resumes that are too short (under ~300 words) or too long (over ~1,000 words for most roles). The sweet spot is 400–800 words on one to two pages, depending on your experience level.</p>

<h2>Try the HiredTodayApp ATS Checker</h2>
<p><a href="/ats-checker">Paste your resume text</a>, optionally paste the job description for keyword gap analysis, and get a 30-point breakdown across keywords, formatting, structure, contact info, and experience presentation. Each low-scoring category includes the specific issues and how to fix them.</p>
<p>Strengths: fastest to use, most detailed breakdown, highlights missing keywords from the job description specifically. Limitation: analyses plain text only — you have to paste the text, not upload a PDF.</p>
<p>Most ATS checkers either cap scans aggressively, focus on generic writing feedback rather than ATS-specific issues, or give vague scores without actionable fixes. HiredTodayApp's checker gives you the full 30-point rubric with specific improvement steps.</p>

<h2>The 30-Point ATS Rubric (The One We Actually Use)</h2>
<p>Our <a href="/ats-checker">ATS checker</a> scores your resume on 30 individual criteria grouped into five categories. Here they are — if you score yourself on each, you'll know exactly where you're losing points.</p>

<h3>Keywords (5 criteria, up to 20 points)</h3>
<ul>
  <li>Exact-match keywords from job description (weighted highest)</li>
  <li>Industry-standard tool/technology names</li>
  <li>Spelled-out acronyms (first reference)</li>
  <li>Soft skills named in the posting</li>
  <li>Experience-level descriptors ("senior", "lead", etc.) matching the role</li>
</ul>

<h3>Formatting (7 criteria, up to 25 points)</h3>
<ul>
  <li>No tables or text boxes</li>
  <li>No graphics or images</li>
  <li>Single- or simple two-column layout</li>
  <li>Standard fonts (Arial, Calibri, Helvetica, Times)</li>
  <li>Contact info in body (not header/footer)</li>
  <li>Consistent date formatting</li>
  <li>File format: .docx or PDF (not image)</li>
</ul>

<h3>Structure (6 criteria, up to 20 points)</h3>
<ul>
  <li>Professional summary (2–3 sentences) at top</li>
  <li>Work Experience section clearly labelled</li>
  <li>Education section present</li>
  <li>Skills section with dedicated list</li>
  <li>Reverse-chronological order</li>
  <li>Achievement-oriented bullets (not just duties)</li>
</ul>

<h3>Contact Info (5 criteria, up to 15 points)</h3>
<ul>
  <li>Full name</li>
  <li>Professional email (not AOL/Yahoo if you can help it)</li>
  <li>Phone number</li>
  <li>LinkedIn URL</li>
  <li>City &amp; state (no full address needed)</li>
</ul>

<h3>Experience presentation (7 criteria, up to 20 points)</h3>
<ul>
  <li>3–5 bullets per recent role, fewer for older ones</li>
  <li>Quantified achievements (%, $, time, people)</li>
  <li>Strong action verbs (Led, Shipped, Drove, Scaled)</li>
  <li>No first-person pronouns</li>
  <li>Tense consistency (past for past roles, present for current)</li>
  <li>Company name + location + dates for every role</li>
  <li>Relevant keywords naturally distributed across bullets</li>
</ul>

<h2>How to Interpret Your Score</h2>
<p>Here's a rough guide to what each ATS score band actually means:</p>
<ul>
  <li><strong>90–100:</strong> Excellent. You'll pass virtually every ATS you submit to. Focus on the human-read polish next.</li>
  <li><strong>75–89:</strong> Good. You'll pass most ATS filters. Address the top 2–3 flagged issues to push into the 90s.</li>
  <li><strong>60–74:</strong> Average. You'll clear some systems and fail others. Probably losing interview opportunities you should be getting — fix this before the next application.</li>
  <li><strong>Below 60:</strong> At risk. Likely being filtered out before humans see your resume. Rebuild from a plain-text foundation before applying further.</li>
</ul>
<p>A 90+ score isn't a guarantee you'll land the interview — but a score below 60 is a near-guarantee you'll be filtered out of roles you're otherwise qualified for. That's the asymmetry that makes ATS checking worth the 30 seconds.</p>

<h2>The Fastest Path to a High Score</h2>
<p>If you want to raise your ATS score in under 20 minutes:</p>
<ol>
  <li>Open the job description. Highlight every tool, methodology, and key phrase mentioned.</li>
  <li>Make sure each one appears at least once on your resume, using the exact wording.</li>
  <li>Add or beef up a dedicated <strong>Skills</strong> section with a comma- or bullet-separated list of those keywords.</li>
  <li>Replace any tables, text boxes, or two-column layouts with a single-column flow.</li>
  <li>Make sure your contact info (name, email, phone, LinkedIn, city) is at the top of the document body — not in a Word header.</li>
  <li>Save as .docx or PDF (whichever the posting allows), then <a href="/ats-checker">rescore</a>.</li>
</ol>
<p>Most resumes that started below 70 land in the 85+ range after these six steps. From there, the remaining gains come from tightening bullets — but that's a human-read problem, not an ATS problem.</p>

<h2>The Real Point</h2>
<p>An ATS checker isn't going to make your resume <em>good</em> — it's going to make sure your resume is <em>readable</em>. Those are different problems. Pass the ATS first; then worry about whether the content actually sells you.</p>
<p>If you're applying to anything above entry-level, running your resume through an <a href="/ats-checker">ATS checker</a> before submitting is the single highest-ROI 30 seconds you can spend on your job search.</p>
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
