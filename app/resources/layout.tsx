import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume & Job Search Resources — Guides, Tips & Tools",
  description: "Free guides and resources on resume writing, cover letters, ATS optimization, job search strategy, and interview prep. Everything you need to land your next job.",
  alternates: { canonical: "https://hiredtodayapp.com/resources" },
  openGraph: {
    title: "Resume & Job Search Resources — Guides, Tips & Tools",
    description: "Free guides on resume writing, ATS optimization, cover letters, and job search strategy.",
    url: "https://hiredtodayapp.com/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
