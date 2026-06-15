import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AtsCheckerView from "@/components/ats-checker-view";

export const metadata: Metadata = {
  title: "ATS Resume Checker — Score Your Resume Instantly",
  description: "Paste your resume and get an instant ATS compatibility score. Find missing keywords, formatting issues, and get actionable fixes in seconds.",
  alternates: { canonical: "https://hiredtodayapp.com/ats-checker" },
  openGraph: {
    title: "ATS Resume Checker — Score Your Resume Instantly",
    description: "Get an instant ATS score, keyword gap analysis, and actionable fixes.",
    url: "https://hiredtodayapp.com/ats-checker",
  },
};

export default function ATSCheckerPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AtsCheckerView />
      </main>
      <Footer />
    </div>
  );
}
