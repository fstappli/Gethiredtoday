import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { RESUME_EXAMPLES } from "@/lib/resume-examples-data";
import { BLOG_POSTS } from "@/lib/blog-posts";
import type { Metadata } from "next";
import { clean } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on GetHiredToday: resume builder, ATS checker, resume examples, career advice and more.",
};

const staticSections = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Find jobs", href: "/jobs" },
      { label: "Auto-Apply", href: "/auto-apply" },
      { label: "Cover Letters", href: "/cover-letter" },
      { label: "ATS Checker", href: "/ats-checker" },
      { label: "Resume Templates", href: "/resume-templates" },
      { label: "Resume Examples", href: "/resume-examples" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Career advice", href: "/resources" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up", href: "/signup" },
      { label: "Sign In", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
          <h1 className="font-display m-0 text-4xl font-bold tracking-[-1px]">Sitemap</h1>

          {/* Static pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {staticSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-0">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block py-1.5 text-[15px] font-medium text-text-muted hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Blog posts */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand mb-4">
              Career advice
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/resources/${post.slug}`}
                    className="inline-block py-1.5 text-[15px] font-medium text-text-muted hover:text-brand"
                  >
                    {clean(post.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resume examples */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand mb-4">
              Resume Examples
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">
              {RESUME_EXAMPLES.map((ex) => (
                <li key={ex.slug}>
                  <Link
                    href={`/resume-examples/${ex.slug}`}
                    className="inline-block py-1.5 text-[15px] font-medium text-text-muted hover:text-brand"
                  >
                    {ex.title} Resume Example
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
