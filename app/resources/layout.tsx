import { ogImages } from "@/lib/seo/jsonld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career advice: resume, interview and job search guides",
  description: "Short, practical guides on resume writing, cover letters, ATS optimization, job search and interview prep.",
  alternates: { canonical: "https://www.hiredtodayapp.com/resources" },
  openGraph: {
    title: "Career advice that's actually useful",
    description: "Short, practical guides on resumes, interviews and job search.",
    url: "https://www.hiredtodayapp.com/resources",
    images: ogImages("Career advice that is actually useful", "Guides on resumes, interviews and job search"),
  },
  twitter: { card: "summary_large_image", images: ogImages("Career advice that is actually useful", "Guides on resumes, interviews and job search") },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
