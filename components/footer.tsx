import Link from "next/link";
import Logo from "@/components/logo";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/builder/resume" },
      { label: "Cover Letter", href: "/builder/cover-letter" },
      { label: "Templates", href: "/resume-templates" },
      { label: "ATS Checker", href: "/ats-checker" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Examples", href: "/resume-examples" },
      { label: "Career Advice", href: "/resources?tab=career-advice" },
      { label: "Blog", href: "/resources" },
      { label: "Interview Tips", href: "/resources?tab=interview" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo href="/" variant="default" tone="light" size="lg" />
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              Build professional, ATS-optimized resumes in minutes with AI assistance.
              Land your dream job faster.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
              <span className="text-xs font-semibold text-[var(--teal)]">PRO</span>
              <span className="text-xs text-gray-300">Only $9.99/month — Cancel anytime</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[var(--teal)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2026 GetHiredToday. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
