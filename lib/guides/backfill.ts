/** Quick answers and FAQs for the original posts. Keyed by slug and merged in lib/blog-posts.ts. */
export const BACKFILL: Record<string, { quickAnswer: string; faqs: { q: string; a: string }[] }> = {
  "how-to-write-ats-friendly-resume-2025": {
    quickAnswer:
      "An ATS-friendly resume uses a clean single-column layout, standard section headings, plain fonts and keywords that match the job description, and is saved as a PDF or Word file the software can read. Avoid tables, text boxes and images of text.",
    faqs: [
      { q: "What is an ATS?", a: "An applicant tracking system is software employers use to collect, organise and search job applications. It reads your resume and stores the text so recruiters can filter and rank candidates." },
      { q: "Which resume format is best for an ATS?", a: "A simple, single-column, reverse-chronological layout with standard headings such as Experience, Education and Skills is the safest choice." },
      { q: "Is a PDF or Word file better for ATS?", a: "Both are usually fine. Use the format the employer asks for. A text-based PDF is read correctly by most systems, while scanned or image-based PDFs are not." },
      { q: "How can I check whether my resume is ATS-friendly?", a: "Run it through an ATS checker, paste the text into a plain-text editor to see if the order survives, and compare your keywords with the job ad. GetHiredToday's free ATS checker shows a score and the top fixes." },
    ],
  },
  "resume-summary-examples-that-get-interviews": {
    quickAnswer:
      "A strong resume summary is two to four lines that name your role and experience level, highlight one or two results and state what you are looking for. Tailor it to each job and keep it specific.",
    faqs: [
      { q: "How long should a resume summary be?", a: "Two to four lines, or roughly 40 to 70 words. Long enough to show your strengths, short enough to read in a few seconds." },
      { q: "Should I use a summary or an objective?", a: "A summary focused on what you offer is usually stronger than an objective focused on what you want. Use an objective only if you are a student or changing fields and need to state the target role." },
      { q: "Do I need a different summary for each job?", a: "A quick tailoring is worth it. Change the role title and the strengths you mention so they match the job description." },
    ],
  },
  "resume-mistakes-costing-you-interviews": {
    quickAnswer:
      "The most common resume mistakes are a vague or missing summary, bullets that list duties instead of results, typos, a generic resume sent to every job, cluttered formatting and missing contact details. Fixing these improves how both recruiters and software read your resume.",
    faqs: [
      { q: "What is the biggest resume mistake?", a: "Listing duties instead of achievements. Employers want to see what changed because you were there, not a list of what the job required." },
      { q: "Do typos really matter on a resume?", a: "Yes. A typo can suggest carelessness, and many hiring managers use it as an easy reason to move on. Proofread aloud and ask someone else to read it." },
      { q: "Should I send the same resume to every job?", a: "It is better to adjust your summary, skills and top bullets for each role so the match is obvious. The adjustment can take ten to fifteen minutes." },
    ],
  },
  "ats-friendly-resume-tips": {
    quickAnswer:
      "To pass an ATS, use a simple layout, standard headings, the keywords from the job description, plain bullets and a readable file format, and avoid tables, images and headers that hide key details. Then check the result with an ATS checker.",
    faqs: [
      { q: "What fonts are safe for an ATS resume?", a: "Common, plain fonts such as Arial, Calibri, Helvetica or Times New Roman at a readable size are safe choices." },
      { q: "Should I put contact details in the header?", a: "Some systems skip headers and footers, so put your name and contact details in the main body at the top to be safe." },
      { q: "How many keywords should I include?", a: "Include the important skills and terms from the job description where they honestly apply to you, in your summary, skills and bullets. Do not repeat them unnaturally." },
    ],
  },
  "best-resume-format-2026": {
    quickAnswer:
      "Reverse-chronological is the best resume format for most people, because recruiters and ATS software expect it. Use a combination format if you are changing careers or have gaps, and avoid purely functional formats.",
    faqs: [
      { q: "What are the three main resume formats?", a: "Reverse-chronological lists your experience from newest to oldest, functional organises by skill, and combination puts a skills summary above a chronological history." },
      { q: "Which format is best for a career change?", a: "A combination format works well because it highlights transferable skills while still showing a clear work history." },
      { q: "How long should my resume be?", a: "One page for early-career candidates and up to two pages for most experienced professionals. Cut anything that does not support the job you want." },
    ],
  },
  "how-to-write-a-cover-letter": {
    quickAnswer:
      "A good cover letter is three or four short paragraphs: a hook that names the role and your strongest relevant achievement, a paragraph connecting your experience to the job, and a closing that shows interest in the company and asks for a conversation. Keep it under one page.",
    faqs: [
      { q: "How long should a cover letter be?", a: "Under one page, usually 250 to 400 words. Recruiters read quickly, so keep it focused." },
      { q: "Should I repeat my resume in the cover letter?", a: "No. Use the letter to explain why you want this job and to expand on one or two achievements that matter most for it." },
      { q: "Do I need a cover letter if it is optional?", a: "A tailored cover letter can help you stand out, especially for roles where communication matters or when you are changing fields. If you have limited time, prioritise a tailored resume." },
    ],
  },
  "skills-to-put-on-a-resume": {
    quickAnswer:
      "Put the hard and soft skills from the job description that you genuinely have on your resume, with the most relevant first. Use specific skill names, show them in your bullets as well as in a skills list, and remove skills that do not matter for the role.",
    faqs: [
      { q: "How many skills should I list on a resume?", a: "Eight to twelve relevant skills is a good range for most resumes. A shorter, targeted list is more convincing than a long one." },
      { q: "Should I list soft skills?", a: "Include a few that the job asks for, but prove them in your bullets with examples. Soft skills listed with no evidence carry little weight." },
      { q: "How do I know which skills to include?", a: "Read the job description and note the skills mentioned repeatedly. Compare them with your experience and include the ones you can back up." },
    ],
  },
  "ats-resume-checker-2026": {
    quickAnswer:
      "An ATS resume checker scores how readable and relevant your resume is for applicant tracking systems and tells you what to fix, such as formatting problems, missing sections and missing keywords from a job ad. Use it as a guide and keep the content honest.",
    faqs: [
      { q: "Are ATS checkers accurate?", a: "They approximate how a system reads your resume and flag common problems. No checker can replicate every employer's software, so use the results as guidance, not a guarantee." },
      { q: "Is the GetHiredToday ATS checker free?", a: "Yes. You can check your resume and see your score and the top 3 fixes for free. Pro adds the full 30-point report and job ad matching." },
      { q: "What score should I aim for?", a: "Aim to fix the issues the checker highlights rather than chase a number. A resume that is clear, well formatted and matched to the job will score well." },
    ],
  },
};
