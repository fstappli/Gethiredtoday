import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { RESUME_EXAMPLES } from "@/lib/resume-examples-data";
import { BLOG_POSTS } from "@/lib/blog-posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap — HiredTodayApp",
  description: "Complete sitemap for HiredTodayApp — resume builder, ATS checker, resume examples, blog posts, and more.",
};

const staticSections = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "ATS Checker", href: "/ats-checker" },
      { label: "Resume Templates", href: "/resume-templates" },
      { label: "Resume Examples", href: "/resume-examples" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Resources & Guides", href: "/resources" },
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
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
          <h1 className="text-4xl font-bold text-gray-900">Sitemap</h1>

          {/* Static pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {staticSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-700 hover:text-teal-600 transition-colors"
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Blog Posts
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resume examples */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Resume Examples
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">
              {RESUME_EXAMPLES.map((ex) => (
                <li key={ex.slug}>
                  <Link
                    href={`/resume-examples/${ex.slug}`}
                    className="text-sm text-gray-700 hover:text-teal-600 transition-colors"
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
