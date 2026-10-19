import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PublicAtsChecker from "@/components/public-ats-checker";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker: Score Your Resume Instantly",
  description: "Upload or paste your resume and get an instant ATS compatibility score, plus the top fixes that matter most. Free, no sign-up.",
  alternates: { canonical: "https://hiredtodayapp.com/ats-checker" },
  openGraph: {
    title: "Free ATS Resume Checker: Score Your Resume Instantly",
    description: "Get an instant ATS score and the top 3 fixes.",
    url: "https://hiredtodayapp.com/ats-checker",
  },
};

export default function ATSCheckerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site">
      <Navbar />
      <main className="flex-1">
        <PublicAtsChecker />
      </main>
      <Footer />
    </div>
  );
}
