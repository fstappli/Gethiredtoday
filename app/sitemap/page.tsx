import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Sitemap - GetHiredToday",
};

const sections = [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/builder" },
      { label: "Cover Letter Builder", href: "/builder/cover-letter" },
      { label: "ATS Checker", href: "/ats-checker" },
      { label: "Resume Templates", href: "/resume-templates" },
      { label: "Resume Examples", href: "/resume-examples" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resources & Blog", href: "/resources" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up", href: "/signup" },
      { label: "Sign In", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-10">Sitemap</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-700 hover:text-teal transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
