import { ogImages } from "@/lib/seo/jsonld";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ExamplesView from "@/components/examples-view";

export const metadata: Metadata = {
  title: "Resume Examples by Job Title",
  description: "Browse professionally written resume examples across industries and experience levels. Find your job title and build a better resume in minutes.",
  alternates: { canonical: "https://www.hiredtodayapp.com/resume-examples" },
  openGraph: {
    title: "Resume Examples by Job Title",
    description: "Find resume examples for your industry. Software engineers, nurses, teachers, marketers and more.",
    url: "https://www.hiredtodayapp.com/resume-examples",
    images: ogImages("Resume examples by job title", "Copy, edit and download"),
  },
  twitter: { card: "summary_large_image", images: ogImages("Resume examples by job title", "Copy, edit and download") },
};

export default function ExamplesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <ExamplesView />
      </main>
      <Footer />
    </div>
  );
}
