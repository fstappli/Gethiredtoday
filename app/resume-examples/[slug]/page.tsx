import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb, Sparkles, Eye } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { RESUME_EXAMPLES, getExampleBySlug } from '@/lib/resume-examples-data';
import { exampleToResumeData } from '@/lib/example-to-resume';
import ClassicTemplate from '@/components/resume-templates/classic';
import ModernTemplate from '@/components/resume-templates/modern';
import ExecutiveTemplate from '@/components/resume-templates/executive';
import CreativeTemplate from '@/components/resume-templates/creative';
import MinimalTemplate from '@/components/resume-templates/minimal';
import SimpleTemplate from '@/components/resume-templates/simple';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return RESUME_EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ex = getExampleBySlug(slug);
  if (!ex) return {};
  return {
    title: ex.metaTitle,
    description: ex.metaDescription,
    alternates: { canonical: `https://hiredtodayapp.com/resume-examples/${ex.slug}` },
    openGraph: {
      title: ex.metaTitle,
      description: ex.metaDescription,
      url: `https://hiredtodayapp.com/resume-examples/${ex.slug}`,
      type: 'article',
    },
  };
}

// Map industry → a best-fit template to showcase the example
function pickTemplate(industry: string): { key: string; color: string } {
  const i = industry.toLowerCase();
  if (i.includes('technology')) return { key: 'modern', color: 'blue' };
  if (i.includes('creative') || i.includes('design')) return { key: 'creative', color: 'purple' };
  if (i.includes('executive') || i.includes('finance')) return { key: 'executive', color: 'slate' };
  if (i.includes('academic') || i.includes('education')) return { key: 'minimal', color: 'blue' };
  if (i.includes('healthcare')) return { key: 'classic', color: 'teal' };
  return { key: 'classic', color: 'teal' };
}

// Render the chosen template at full size, but scale it visually to fit inside
// a card using a CSS transform (wrapper sets a width, inner template is always A4).
function ExampleResumeRender({ tpl, resumeData }: { tpl: { key: string; color: string }; resumeData: ReturnType<typeof exampleToResumeData> }) {
  const props = { data: resumeData, colorScheme: tpl.color, fontSize: 'medium' as const };
  switch (tpl.key) {
    case 'modern':    return <ModernTemplate {...props} />;
    case 'creative':  return <CreativeTemplate {...props} />;
    case 'executive': return <ExecutiveTemplate {...props} />;
    case 'minimal':   return <MinimalTemplate {...props} />;
    case 'simple':    return <SimpleTemplate {...props} />;
    default:          return <ClassicTemplate {...props} />;
  }
}

export default async function ExamplePage({ params }: Props) {
  const { slug } = await params;
  const ex = getExampleBySlug(slug);
  if (!ex) notFound();

  const tpl = pickTemplate(ex.industry);
  const resumeData = exampleToResumeData(ex);
  // Inject a plausible fake name & contact so the rendered resume reads as a real person
  // (the example data itself keeps contact fields empty for the builder pre-fill).
  const displayData = {
    ...resumeData,
    contact: {
      full_name: `${ex.title.split(/\s+/).slice(-1)[0]} Sample`.replace(/^[^A-Z]/, 'A'),
      email: 'candidate@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: `linkedin.com/in/${ex.slug}`,
      website: '',
      github: '',
    },
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ex.metaTitle,
    "description": ex.metaDescription,
    "url": `https://hiredtodayapp.com/resume-examples/${ex.slug}`,
    "publisher": { "@type": "Organization", "name": "GetHiredToday", "url": "https://hiredtodayapp.com" },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb + hero */}
        <section className="bg-gradient-to-b from-[var(--teal-50)] to-white py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/resume-examples" className="inline-flex items-center gap-1.5 text-sm text-teal hover:underline mb-5">
              <ArrowLeft className="w-4 h-4" /> Back to all examples
            </Link>

            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ex.gradient} flex-shrink-0`} />
              <div>
                <span className="text-xs font-semibold text-teal uppercase tracking-wider">{ex.industry} · {ex.level}</span>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">{ex.title} Resume Example</h1>
              </div>
            </div>

            <p className="text-base text-gray-600 leading-relaxed max-w-2xl">{ex.intro}</p>
          </div>
        </section>

        {/* ─── Rendered resume example ─────────────────────────────────── */}
        <section className="py-12 bg-slate-50 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal uppercase tracking-wider">
                <Eye className="w-4 h-4" />
                Full Example Resume
              </div>
              <Link
                href={`/builder/resume/new?example=${ex.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-2 text-white"
                style={{ backgroundColor: '#4AB7A6' }}
              >
                Use this example <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Paper container: A4 aspect, horizontally scrollable on very narrow mobile */}
            <div className="bg-white shadow-xl mx-auto overflow-auto border border-slate-200 rounded-lg"
              style={{ maxWidth: '794px', maxHeight: '1120px' }}
            >
              <div style={{ minWidth: '794px' }}>
                <ExampleResumeRender tpl={tpl} resumeData={displayData} />
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4">
              Example candidate • Replace with your own details in the builder
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Sample summary */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal" /> Sample Professional Summary
            </h2>
            <div className="bg-[var(--teal-50)] border-l-4 border-teal rounded-r-xl p-5">
              <p className="text-gray-700 leading-relaxed italic">&ldquo;{ex.sampleSummary}&rdquo;</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">Use this as a starting point — customise it with your own metrics and experience.</p>
          </section>

          {/* Sample experience */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Work Experience Entry</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-bold text-gray-900 text-base">{ex.sampleExperience.role}</span>
                <span className="text-xs text-gray-400">Jan 2022 – Present</span>
              </div>
              <div className="text-sm font-semibold text-teal mb-3">{ex.sampleExperience.company}</div>
              <ul className="space-y-2">
                {ex.sampleExperience.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-teal font-bold mt-0.5 flex-shrink-0">›</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Must-have section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> What to Include in a {ex.title} Resume
            </h2>
            <ul className="space-y-3">
              {ex.mustHave.map((item, i) => (
                <li key={i} className="flex gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Tips */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" /> Expert Tips for {ex.title} Resumes
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {ex.tips.map((tip, i) => (
                <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Tip {i + 1}</span>
                  <p className="text-sm text-gray-700 mt-1">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related examples */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Resume Examples</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {RESUME_EXAMPLES.filter((e) => e.slug !== ex.slug && e.industry === ex.industry).slice(0, 3).concat(
                RESUME_EXAMPLES.filter((e) => e.slug !== ex.slug && e.industry !== ex.industry).slice(0, 3)
              ).slice(0, 3).map((rel) => (
                <Link key={rel.slug} href={`/resume-examples/${rel.slug}`}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-[var(--teal-200)] hover:bg-[var(--teal-50)] transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rel.gradient} flex-shrink-0`} />
                  <span className="text-sm font-medium text-gray-700">{rel.title}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <section className="gradient-teal py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Build Your {ex.title} Resume Now
            </h2>
            <p className="text-white/80 mb-8">
              Use our AI-powered builder. Free to start — takes under 10 minutes.
            </p>
            <Link href={`/builder/resume/new?example=${ex.slug}`}
              className="inline-flex items-center gap-2 bg-white text-teal font-semibold rounded-full px-8 py-3 hover:bg-gray-50 transition-colors">
              Use This Example & Edit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
