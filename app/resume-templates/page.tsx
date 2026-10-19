import { ogImages } from "@/lib/seo/jsonld";
import type { Metadata } from "next";
import EmailCaptureCard from "@/components/seo/email-capture-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TemplatesView from "@/components/templates-view";

export const metadata: Metadata = {
  title: "Resume Templates: ATS-Friendly Professional Designs",
  description: "Choose from ATS-friendly resume templates in classic, modern, creative and executive styles. Start free and download your PDF for free; Pro unlocks every design.",
  alternates: { canonical: "https://www.hiredtodayapp.com/resume-templates" },
  openGraph: {
    title: "Resume Templates: ATS-Friendly Professional Designs",
    description: "ATS-friendly resume templates for every industry and career level. Start free.",
    url: "https://www.hiredtodayapp.com/resume-templates",
    images: ogImages("Resume templates", "ATS-friendly designs you can edit and download"),
  },
  twitter: { card: "summary_large_image", images: ogImages("Resume templates", "ATS-friendly designs you can edit and download") },
};

export default function TemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <TemplatesView />
        <section className="mx-auto w-full max-w-[860px] px-5 pb-16"><EmailCaptureCard source="templates" /></section>
      </main>
      <Footer />
    </div>
  );
}
