/**
 * Role-specific cover letter examples. Letters are editable templates:
 * anything in [square brackets] is a placeholder the reader replaces.
 * No statistics or invented facts are used.
 */
export interface CoverLetterExample {
  slug: string;
  /** Matches a RESUME_EXAMPLES slug, for cross-linking. */
  resumeSlug: string;
  title: string;
  quickAnswer: string;
  intro: string;
  letter: string[];
  include: string[];
  mistakes: string[];
  faqs: { q: string; a: string }[];
}

export const COVER_LETTER_EXAMPLES: CoverLetterExample[] = [
  {
    slug: "software-engineer",
    resumeSlug: "software-engineer",
    title: "Software Engineer",
    quickAnswer:
      "A software engineer cover letter should name the role, show one or two projects with concrete technical outcomes, mention the stack the job uses and explain why you want to work on this company's product. Keep it under one page and skip the list of every language you know.",
    intro:
      "Engineering managers read cover letters to learn how you communicate and what you care about building. A good letter turns one project from your resume into a short story about a problem, your decision and the result.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am excited to apply for the Software Engineer role at [Company]. Your work on [product or problem the company solves] is the kind of challenge I enjoy, and my experience building and maintaining [type of systems, e.g. web services and APIs] fits what your team is looking for.",
      "At [Current or Previous Company], I led the redesign of [system or feature] using [technologies]. The old approach was slow to change and hard to test, so I [what you did, e.g. split the module, added automated tests, introduced a queue]. As a result, [real outcome, e.g. releases became easier and incidents dropped]. I enjoy this kind of work because it combines careful design with practical trade-offs.",
      "I also care about working well with others. I regularly review code, write documentation for new team members and talk with product colleagues early, so we agree on what to build before we start. I noticed that [Company] values [something from the job ad, e.g. ownership or testing], and that matches how I like to work.",
      "I would welcome the chance to discuss how I could contribute to [team or product]. Thank you for your time and consideration.",
      "Sincerely,\n[Your Name]\n[Phone] | [Email] | [GitHub or portfolio link]",
    ],
    include: [
      "The exact role title and one reason the company's product interests you.",
      "One or two projects described as problem, action and result.",
      "The main technologies in the job ad that you have genuinely used.",
      "How you work with others: code review, documentation, collaboration with design or product.",
      "A link to a repository, portfolio or demo that backs up your claims.",
    ],
    mistakes: [
      "Listing every language and framework you have touched instead of the ones the job needs.",
      "Describing what the project was without saying what you personally built.",
      "Claiming impact numbers you cannot explain in an interview.",
      "Writing only about technology and never about the problem it solved.",
      "Sending a letter that could be pasted into any company without changes.",
    ],
    faqs: [
      { q: "Do software engineers need a cover letter?", a: "Not always, but when it is optional a short, specific letter can set you apart, especially if you are early in your career or changing stacks. If you only have time for one thing, tailor your resume first." },
      { q: "How technical should a software engineer cover letter be?", a: "Technical enough to name the stack and the problem, but readable by a non-engineer such as a recruiter. Put the deep detail in your resume and portfolio." },
      { q: "Should I mention open-source or side projects?", a: "Yes, when they are relevant to the role. Explain what you built, why, and what you learned." },
    ],
  },
  {
    slug: "marketing-manager",
    resumeSlug: "marketing-manager",
    title: "Marketing Manager",
    quickAnswer:
      "A marketing manager cover letter should show that you tie campaigns to business goals. Open with the role, give one example of a campaign or programme you owned, say what you measured and show you understand the company's audience.",
    intro:
      "Hiring managers in marketing read your letter as a sample of your own writing. Clear, specific copy that respects the reader's time is part of the pitch.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am applying for the Marketing Manager position at [Company]. I have spent [number] years planning and running [type of marketing, e.g. lifecycle, content or demand generation] campaigns, and I was drawn to [Company] because of how clearly you speak to [audience].",
      "In my current role at [Company], I own [programme or channel]. When [problem, e.g. engagement was flat or leads were low quality], I [what you changed, e.g. rebuilt the segmentation, tested new messaging, partnered with sales]. The result was [real outcome and the metric you tracked]. I like to set a clear goal, test one change at a time and share what we learn with the wider team.",
      "I also enjoy the coordination side of marketing: briefing designers, working with sales and keeping a calendar of campaigns on track. Your job description mentions [skill or priority from the ad], and I have experience with [matching experience].",
      "I would be glad to talk about how I could help [Company] reach [goal]. Thank you for considering my application.",
      "Best regards,\n[Your Name]\n[Phone] | [Email] | [Portfolio link]",
    ],
    include: [
      "A campaign you owned from idea to results, with the metric you used.",
      "Evidence that you understand the company's customers and tone of voice.",
      "Experience coordinating across design, sales, product or agencies.",
      "The tools the job lists, such as analytics, email or CRM platforms, where you have real experience.",
      "One sentence on why this brand, not just any brand.",
    ],
    mistakes: [
      "Using buzzwords such as \"synergy\" and \"game-changer\" instead of plain, specific language.",
      "Describing activity (posts, emails sent) without any outcome.",
      "Writing generic copy for a role that requires strong writing.",
      "Ignoring the company's actual audience and product.",
      "Taking credit for team results without saying what you did.",
    ],
    faqs: [
      { q: "What should a marketing cover letter highlight?", a: "Results you influenced, the channels you know and your ability to work across teams. Pick one campaign story instead of listing everything you have done." },
      { q: "Should I include metrics?", a: "Yes, if they are accurate and you can explain how they were measured. If you do not have a number, describe the effect in words." },
      { q: "Can I show creativity in my letter?", a: "Yes, through clear, lively writing and a specific idea for the company, but avoid gimmicks that make it harder to read." },
    ],
  },
  {
    slug: "registered-nurse",
    resumeSlug: "registered-nurse",
    title: "Registered Nurse",
    quickAnswer:
      "A registered nurse cover letter should state your licence and specialty, describe the patient populations and settings you have worked in, show teamwork and communication under pressure, and explain why you want to work at this facility. Keep it professional and focused on patient care.",
    intro:
      "Nurse recruiters scan for licence status, clinical experience and fit with the unit. Your letter adds the human side: how you communicate, how you handle pressure and why this setting suits you.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am writing to apply for the Registered Nurse position in [unit or department] at [Facility]. I hold an active [state or national] RN licence and have [number] years of experience in [specialty, e.g. medical-surgical, emergency or paediatric] care.",
      "In my current role at [Hospital or Clinic], I care for [type of patients and typical ratio if relevant]. I am comfortable managing changing priorities, documenting accurately and communicating clearly with patients, families and the wider care team. One example I am proud of: [brief real situation, e.g. noticed early signs of deterioration, escalated promptly and worked with the physician on a plan].",
      "I also value continuing education. I hold [certifications, e.g. BLS, ACLS] and recently completed [training or course]. [Facility] stands out to me because of [specific reason, e.g. its focus on patient safety or its mentoring programme for nurses].",
      "I would welcome the opportunity to discuss how my experience can support your team. Thank you for your time.",
      "Sincerely,\n[Your Name], RN\n[Phone] | [Email]",
    ],
    include: [
      "Your licence status and any relevant certifications.",
      "Your specialty and the typical patient population you have cared for.",
      "A brief example of clinical judgement, communication or teamwork.",
      "Your familiarity with the electronic records system, if the job names one.",
      "Why you want this facility or unit specifically.",
    ],
    mistakes: [
      "Including any patient information that could identify a person.",
      "Leaving out your licence or certification status.",
      "Focusing on duties instead of examples of care and judgement.",
      "Using a generic letter for different specialties.",
      "Sounding negative about a previous employer or workload.",
    ],
    faqs: [
      { q: "Do nurses need a cover letter?", a: "Many hospitals ask for one or accept one. A concise letter helps if you are changing specialty, returning to work or moving to a new location." },
      { q: "How do I write a nursing cover letter with limited experience?", a: "Highlight clinical placements, preceptor feedback, certifications and your reason for choosing the specialty. Be specific about what you did and learned." },
      { q: "Should I mention shift preferences?", a: "Only if the posting asks. Usually it is better to discuss scheduling after you have made a strong first impression." },
    ],
  },
  {
    slug: "product-manager",
    resumeSlug: "product-manager",
    title: "Product Manager",
    quickAnswer:
      "A product manager cover letter should show how you identify problems, make decisions with incomplete information and work with engineering and design. Use one product story with a clear problem, your decision and the outcome, and tie it to the company's product.",
    intro:
      "Product roles are about judgement and communication, and the cover letter is a short test of both. Show how you think, not just what you shipped.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am excited to apply for the Product Manager role at [Company]. I have spent [number] years working on [type of product, e.g. onboarding or B2B tools], and I am drawn to your focus on [problem or user group].",
      "At [Current Company], I owned [product area]. Research showed that [user problem, based on real data or interviews]. I worked with design and engineering to [decision or solution], deciding to [prioritisation trade-off] because [reason]. After launch, [real outcome and how you measured it]. I also learned [lesson], which changed how we approach [process].",
      "I enjoy the full cycle: talking to users, writing clear requirements, aligning stakeholders and looking at the data after release. From your job description I can see that [specific responsibility], which is similar to [your experience].",
      "I would love to discuss how I could help [Company] with [goal]. Thank you for your consideration.",
      "Best,\n[Your Name]\n[Phone] | [Email] | [Profile link]",
    ],
    include: [
      "One product decision, the trade-offs you weighed and what happened.",
      "How you gather evidence: user research, data, feedback.",
      "How you work with engineers, designers and stakeholders.",
      "Your understanding of the company's product and users.",
      "Honesty about what you learned, including from something that did not go to plan.",
    ],
    mistakes: [
      "Listing frameworks and buzzwords instead of describing real decisions.",
      "Claiming sole credit for work that was a team effort.",
      "Skipping the user problem and jumping to features.",
      "Not mentioning how success was measured.",
      "Writing about product in general rather than the company's product.",
    ],
    faqs: [
      { q: "What if I have never held a product manager title?", a: "Describe product work you have done under another title, such as running a feature, writing requirements or analysing user feedback, and explain why you want to move into product." },
      { q: "How long should a product manager cover letter be?", a: "About 250 to 350 words. Product managers are expected to be concise." },
      { q: "Should I include a product teardown?", a: "A short, thoughtful observation about the company's product can help, but keep it respectful and brief, or link to a longer piece in your portfolio." },
    ],
  },
  {
    slug: "data-analyst",
    resumeSlug: "data-analyst",
    title: "Data Analyst",
    quickAnswer:
      "A data analyst cover letter should show that you can turn data into decisions. Name the tools you use, describe one analysis from question to recommendation and show how you communicate findings to people who are not analysts.",
    intro:
      "Hiring managers know many analysts can write queries. What sets people apart is asking good questions and explaining the answer clearly. Your letter is your chance to show that.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am applying for the Data Analyst position at [Company]. I enjoy turning messy data into clear answers, and I use [tools, e.g. SQL, Excel, Python, Tableau or Power BI] to support decisions in [area, e.g. operations or marketing].",
      "In my role at [Company], I was asked to understand why [business question, e.g. customer churn or delivery delays] was changing. I [what you did, e.g. combined three data sources, cleaned inconsistent records, and built a dashboard], and found that [real finding]. I presented the result to [audience] and recommended [action]. The team [outcome, e.g. changed the process and tracked the effect].",
      "I put effort into making analysis understandable: simple charts, plain-language summaries and a clear recommendation. Your posting mentions [requirement from the ad], which is something I have done by [matching experience].",
      "I would be glad to discuss how I can help [Company] make better use of its data. Thank you for your time.",
      "Sincerely,\n[Your Name]\n[Phone] | [Email] | [Portfolio or dashboard link]",
    ],
    include: [
      "The tools and languages the job lists that you have actually used.",
      "One analysis told as question, method, finding and action.",
      "How you communicate results to non-technical colleagues.",
      "Attention to data quality and checking your work.",
      "A link to a portfolio, dashboard or project if you can share one.",
    ],
    mistakes: [
      "Listing tools without showing what you did with them.",
      "Describing the method but never the business question or result.",
      "Using jargon that a hiring manager outside analytics will not follow.",
      "Sharing confidential data or company details from past employers.",
      "Claiming advanced skills you cannot demonstrate in a technical interview.",
    ],
    faqs: [
      { q: "What if I have no professional data experience?", a: "Use personal or academic projects. Describe the question, the data source, your method and what you found, and link to the work if possible." },
      { q: "Should I include charts in the letter?", a: "No. Keep the letter as text and link to a portfolio or dashboard instead." },
      { q: "Which skills matter most for a data analyst letter?", a: "The ones listed in the job ad, plus your ability to explain findings clearly. Tools change, but clear thinking and communication are consistently valued." },
    ],
  },
  {
    slug: "project-manager",
    resumeSlug: "project-manager",
    title: "Project Manager",
    quickAnswer:
      "A project manager cover letter should show that you deliver on scope, time and budget and keep people aligned. Describe one project with its goal, the main risk you handled and the result, and mention the methods and tools you use.",
    intro:
      "Project managers are hired to create order and trust. A well-organised, concise letter is already evidence of that.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am writing to apply for the Project Manager role at [Company]. I have [number] years of experience delivering [type of projects, e.g. software, construction or marketing projects], and I was interested to see that you are looking for someone who can [requirement from the ad].",
      "Most recently at [Company], I managed [project] with a team of [number] across [functions]. The main challenge was [risk or constraint, e.g. a tight deadline and shifting requirements]. I [what you did, e.g. broke the work into phases, set up weekly check-ins and a risk log, and agreed priorities with stakeholders]. The project [real outcome, e.g. was delivered on the agreed date]. I also documented lessons learned for future projects.",
      "I am comfortable with [methods, e.g. Agile, Scrum or waterfall] and tools such as [tools you really use]. I believe projects go well when people know what is expected, issues surface early and communication is honest.",
      "I would welcome the chance to discuss how I can support [Company]'s projects. Thank you for your consideration.",
      "Kind regards,\n[Your Name]\n[Phone] | [Email] | [Certifications]",
    ],
    include: [
      "A project with scope, team size, constraints and outcome.",
      "How you handled a specific risk or change in plan.",
      "Your communication style with stakeholders and teams.",
      "Methods, tools and any certifications such as PMP, if you hold them.",
      "A sentence that shows you understand the company's type of projects.",
    ],
    mistakes: [
      "Listing responsibilities instead of delivered results.",
      "Claiming credit for a project's success without explaining your role.",
      "Writing a disorganised, overly long letter.",
      "Using methodology jargon without showing how you applied it.",
      "Ignoring the budget, time or quality constraints that defined the project.",
    ],
    faqs: [
      { q: "Do I need a certification to get a project manager role?", a: "Not always. Some employers prefer certifications, but many value demonstrated delivery. Mention any you hold and focus on results." },
      { q: "How do I show leadership without direct authority?", a: "Describe how you aligned people through clear goals, regular communication and trust. That is the core of project management." },
      { q: "What if my projects went over time?", a: "Pick a project with a good outcome, or be honest about a challenge and explain how you managed it and what you changed afterwards." },
    ],
  },
  {
    slug: "high-school-teacher",
    resumeSlug: "high-school-teacher",
    title: "High School Teacher",
    quickAnswer:
      "A high school teacher cover letter should show your subject expertise, classroom approach and commitment to students. Describe how you plan lessons and support different learners, mention your certification, and explain why you want to teach at this school.",
    intro:
      "Principals and hiring committees look for evidence that you will connect with students and colleagues. A warm, specific letter with a real classroom example is more persuasive than general statements about passion.",
    letter: [
      "Dear [Principal or Hiring Committee Name],",
      "I am applying for the [Subject] Teacher position at [School]. I hold [certification or licence] and have [number] years of experience teaching [grade levels] in [type of school].",
      "In my classroom, I plan lessons around clear goals and give students several ways to show what they have learned. For example, when I noticed that [specific challenge, e.g. many students struggled with essay structure], I [what you did, e.g. introduced short writing workshops and peer feedback]. Over the term, [real outcome, e.g. students' writing became more confident and organised]. I use assessments to adjust my teaching and keep families informed.",
      "I also enjoy contributing beyond the classroom. At [Previous School], I [activity, e.g. ran a debate club or helped plan a curriculum]. I was drawn to [School] because of [specific reason, e.g. its focus on project-based learning or student wellbeing].",
      "I would be glad to talk with you about how I can contribute to your students and staff. Thank you for your time.",
      "Sincerely,\n[Your Name]\n[Phone] | [Email]",
    ],
    include: [
      "Your certification, subject area and grade levels.",
      "A specific classroom example showing how you support learners.",
      "Your approach to assessment, behaviour and communication with families.",
      "Extracurricular or committee involvement.",
      "Why this school, drawing on something you learned about it.",
    ],
    mistakes: [
      "Writing only about passion and never about practice.",
      "Using education jargon without examples.",
      "Leaving out your certification or licence status.",
      "Using the same letter for every school without mentioning its values.",
      "Including identifying details about students.",
    ],
    faqs: [
      { q: "How can a new teacher write a strong cover letter?", a: "Use student teaching, placements, tutoring or volunteering. Describe a lesson or project, what you did and what you learned, and show you take feedback seriously." },
      { q: "Should I include my teaching philosophy?", a: "A short version works well in two or three sentences, backed by an example. Save the long version for a portfolio if the school asks." },
      { q: "How long should a teacher cover letter be?", a: "One page. Principals read many applications, so be clear and concise." },
    ],
  },
  {
    slug: "sales-representative",
    resumeSlug: "sales-representative",
    title: "Sales Representative",
    quickAnswer:
      "A sales representative cover letter should show that you understand customers, hit targets and build relationships. Lead with a real result against quota or goals, explain how you achieved it and show you have researched the company's product and market.",
    intro:
      "Sales managers expect a sales letter to sell. That means a confident, concise and personalised message that is clearly written for this company.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am excited to apply for the Sales Representative role at [Company]. I have [number] years of experience selling [type of product or service] to [type of customers], and I admire how [Company] helps [customer group] solve [problem].",
      "At [Current Company], I [real achievement, e.g. consistently met my targets or grew my territory]. I do this by listening carefully to what the customer needs, preparing before every call and following up reliably. For example, when a prospect hesitated because of [objection], I [what you did, e.g. arranged a demo with their team and addressed their concerns with a clear example]. They [outcome].",
      "I am comfortable with [tools, e.g. a CRM and outreach tools] and with keeping a clear record of every conversation. I would bring the same discipline and curiosity to your team, especially in [area from the ad].",
      "I would welcome the chance to discuss how I can help [Company] grow. Thank you for your time.",
      "Best regards,\n[Your Name]\n[Phone] | [Email]",
    ],
    include: [
      "A real result against a target, quota or goal.",
      "How you discover customer needs and handle objections.",
      "The type of customer and sales cycle you have worked with.",
      "Your CRM and tool experience.",
      "Evidence you researched the company and its customers.",
    ],
    mistakes: [
      "Making big claims about performance without specifics.",
      "Writing a generic letter that does not mention the company.",
      "Focusing on yourself instead of the customer's problems.",
      "Being pushy or overly casual.",
      "Failing to ask for a conversation at the end.",
    ],
    faqs: [
      { q: "Should I include my sales numbers?", a: "Yes, if they are accurate and you are comfortable sharing them. Express them in a way that does not reveal confidential company data." },
      { q: "What if I have no sales experience?", a: "Highlight customer-facing work, persuasion, communication and any results-driven roles. Show that you are coachable and motivated." },
      { q: "Is it okay to be informal in a sales letter?", a: "Be friendly but professional. Match the company's tone, and avoid slang or jokes that might not land." },
    ],
  },
  {
    slug: "graphic-designer",
    resumeSlug: "graphic-designer",
    title: "Graphic Designer",
    quickAnswer:
      "A graphic designer cover letter should be short and well designed in its writing, point to your portfolio, and explain how your work solves communication problems for clients or brands. Show your process and your ability to take feedback.",
    intro:
      "Your portfolio does the heavy lifting, so the letter should be short, clear and specific. It tells the reader which pieces to look at and why they fit the role.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am applying for the Graphic Designer position at [Company]. I design [type of work, e.g. brand identities, marketing materials and digital campaigns], and I admire how [Company] uses design to [specific observation about their work].",
      "My portfolio at [link] includes [project], which I created for [client or context]. The brief was to [goal]. I explored [approaches], gathered feedback from [stakeholders] and refined the work until it [outcome, e.g. felt consistent across print and digital]. I enjoy the process of turning a vague idea into a clear visual message.",
      "I work in [tools, e.g. Figma, Adobe Illustrator, Photoshop and InDesign] and I am used to working with copywriters, marketers and developers. Your job description mentions [requirement from the ad], and I have experience with [matching work].",
      "Thank you for considering my application. I would love to talk about how I can contribute to [Company]'s design work.",
      "Kind regards,\n[Your Name]\n[Phone] | [Email] | [Portfolio link]",
    ],
    include: [
      "A direct link to your portfolio and the one or two projects most relevant to the role.",
      "The brief, your approach and the outcome for at least one project.",
      "Your tools and how you collaborate with other teams.",
      "How you handle feedback and revisions.",
      "A specific comment on the company's design that shows you looked closely.",
    ],
    mistakes: [
      "Repeating your resume instead of directing attention to your portfolio.",
      "Writing a long letter for a role about visual communication.",
      "Listing software but not showing how you solve problems.",
      "Sending portfolio files as large attachments when a link is requested.",
      "Criticising the company's current design.",
    ],
    faqs: [
      { q: "Should a designer's cover letter be creative?", a: "It can have personality, but clarity matters most. Use plain, well-organised writing and let your portfolio show the creativity." },
      { q: "How do I choose projects to mention?", a: "Pick the one or two that match the job ad most closely, and say what the problem was, what you did and what changed." },
      { q: "Can I use a designed cover letter PDF?", a: "Only if the application allows it and it stays readable. For many applications, plain text in the form or a simple PDF is safer." },
    ],
  },
  {
    slug: "human-resources-manager",
    resumeSlug: "human-resources-manager",
    title: "Human Resources Manager",
    quickAnswer:
      "A human resources manager cover letter should show sound judgement, confidentiality and the ability to support both employees and the business. Describe one initiative, such as improving hiring, onboarding or employee relations, with the result, and mention the laws and systems you know.",
    intro:
      "HR roles are about trust. Your letter should be professional, balanced and specific, and show that you can partner with leaders while treating people fairly.",
    letter: [
      "Dear [Hiring Manager Name],",
      "I am applying for the Human Resources Manager position at [Company]. I have [number] years of experience in [areas, e.g. recruitment, employee relations and onboarding], and I am interested in [Company]'s commitment to [value or initiative from the company].",
      "In my current role at [Company], I led [initiative, e.g. a redesign of the onboarding programme]. Managers told us that [problem], so I [what you did, e.g. worked with department heads to create a clear 30-day plan and a checklist]. New hires [real outcome], and managers reported [real feedback]. I take care to handle sensitive matters with confidentiality and fairness.",
      "I am familiar with [regulations or frameworks relevant to your region] and with [HR systems, e.g. an HRIS or applicant tracking system]. I enjoy partnering with leaders to solve people challenges in a practical way.",
      "I would be glad to discuss how I could support [Company]'s people strategy. Thank you for your time.",
      "Sincerely,\n[Your Name]\n[Phone] | [Email] | [Certifications]",
    ],
    include: [
      "An initiative you led, with the problem, action and result.",
      "Experience with the HR areas the job emphasises: hiring, employee relations, learning, compensation.",
      "Your knowledge of relevant employment regulations and systems.",
      "How you handle confidential and sensitive situations.",
      "Your approach to partnering with managers and employees.",
    ],
    mistakes: [
      "Sharing confidential or identifying details from past employers.",
      "Describing HR as only administration and compliance.",
      "Using vague claims such as \"great with people\" without examples.",
      "Ignoring the business side of the role.",
      "Being too informal or too stiff, instead of professional and warm.",
    ],
    faqs: [
      { q: "Which HR qualifications should I mention?", a: "Any relevant degrees and professional certifications you hold, such as those from recognised HR bodies in your country. Do not list any you do not have." },
      { q: "How do I show impact in HR?", a: "Use results such as better onboarding feedback, faster hiring, improved retention practices or clearer policies, as long as you can describe them accurately." },
      { q: "Can I mention a difficult employee situation?", a: "Only in general terms, without identifying anyone, and focus on how you handled it fairly and what you learned." },
    ],
  },
];

export function getCoverLetterExample(slug: string): CoverLetterExample | undefined {
  return COVER_LETTER_EXAMPLES.find((e) => e.slug === slug);
}
