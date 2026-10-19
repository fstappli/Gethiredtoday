import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career advice: guides on resumes, interviews and job search",
  description: "Short, practical guides on resume writing, cover letters, ATS optimization, job search and interview prep.",
  alternates: { canonical: "https://hiredtodayapp.com/resources" },
  openGraph: {
    title: "Career advice that's actually useful",
    description: "Short, practical guides on resumes, interviews and job search.",
    url: "https://hiredtodayapp.com/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
