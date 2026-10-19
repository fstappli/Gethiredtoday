import { ogImages } from "@/lib/seo/jsonld";
import type { Metadata } from "next";
import EmailCaptureCard from "@/components/seo/email-capture-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PublicAtsChecker from "@/components/public-ats-checker";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker: Score Your Resume Instantly",
  description: "Upload or paste your resume and get an instant ATS compatibility score, plus the top fixes that matter most. Free, no sign-up.",
  alternates: { canonical: "https://www.hiredtodayapp.com/ats-checker" },
  openGraph: {
    title: "Free ATS Resume Checker: Score Your Resume Instantly",
    description: "Get an instant ATS score and the top 3 fixes.",
    url: "https://www.hiredtodayapp.com/ats-checker",
    images: ogImages("Free ATS resume checker", "Get your score and the top 3 fixes"),
  },
  twitter: { card: "summary_large_image", images: ogImages("Free ATS resume checker", "Get your score and the top 3 fixes") },
};

export default function ATSCheckerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site">
      <Navbar />
      <main className="flex-1">
        <PublicAtsChecker />
        <section className="mx-auto w-full max-w-[860px] px-5 pb-16"><EmailCaptureCard source="ats_checker" /></section>
      </main>
      <Footer />
    </div>
  );
}
