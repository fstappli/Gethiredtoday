import Link from "next/link";
import { FileText, Sparkles, Target, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "About - GetHiredToday",
  description: "Learn about GetHiredToday's mission to help job seekers build better resumes with AI.",
};

const values = [
  {
    icon: Sparkles,
    title: "AI That Actually Helps",
    description: "We built GetHiredToday because generic resume advice fails people. Our AI is trained to write real, specific, impactful content — not filler.",
  },
  {
    icon: Target,
    title: "ATS-First Design",
    description: "Over 90% of large companies filter resumes automatically. Every template and feature is built to pass those filters, not just look good.",
  },
  {
    icon: Users,
    title: "Accessible to Everyone",
    description: "Career tools shouldn't cost a fortune. At $9.99/month, professional-grade resume help is available to everyone, not just those who can afford career coaches.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[var(--teal-50)] to-white py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              We&apos;re on a mission to help everyone land their dream job
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              GetHiredToday was built by job seekers, for job seekers. We know how painful the resume process can be — so we built the tool we always wished existed.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Applying for jobs is one of the most stressful experiences in a person&apos;s career. You spend hours crafting the perfect resume, only to get silence. You don&apos;t know if the ATS rejected it before a human even saw it. You don&apos;t know if your bullet points are strong enough.
              </p>
              <p>
                We built GetHiredToday to fix that. Our AI analyzes job descriptions, suggests powerful bullet points, scores your resume for ATS compatibility, and helps you write a cover letter tailored to each application — all in minutes.
              </p>
              <p>
                Your resume is your professional life story — we help you tell it in the most compelling way possible. No fabricated metrics, no invented achievements, no keyword-stuffing that breaks down in interviews. Just your real work, written clearly enough to get past the robots and into a recruiter&apos;s hands.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="bg-white rounded-2xl p-8 card-shadow text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--teal-50)] flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-teal" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to build your resume?</h2>
            <p className="text-gray-500 mb-8">Join thousands of job seekers using GetHiredToday to land interviews faster.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/builder/resume/new" className="btn-teal inline-flex items-center gap-2">
                Build Your Resume Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="btn-teal-outline inline-flex items-center gap-2">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
