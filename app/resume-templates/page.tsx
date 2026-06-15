import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TemplatesView from "@/components/templates-view";

export const metadata: Metadata = {
  title: "Resume Templates — ATS-Friendly Professional Designs",
  description: "Choose from 60+ ATS-tested resume templates designed by professional writers. Classic, modern, creative, and executive styles — all included with Pro at $9.99/month.",
  alternates: { canonical: "https://hiredtodayapp.com/resume-templates" },
  openGraph: {
    title: "Resume Templates — ATS-Friendly Professional Designs",
    description: "60+ ATS-tested resume templates for every industry and career level. All included with Pro.",
    url: "https://hiredtodayapp.com/resume-templates",
  },
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">
        <TemplatesView />
      </main>
      <Footer />
    </div>
  );
}
