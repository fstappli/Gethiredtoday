import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingToggle from "@/components/pricing-toggle";
import PricingFAQ from "@/components/pricing-faq";

export const metadata: Metadata = {
  title: "Pricing: Free to Build, Pro at $9.99/month",
  description:
    "Build and download your resume as a PDF for free. GetHiredToday Pro adds unlimited resumes, all templates, Word export, the full ATS report and Auto-Apply. Cancel in two clicks.",
  alternates: { canonical: "https://hiredtodayapp.com/pricing" },
  openGraph: {
    title: "Pricing | GetHiredToday",
    description: "Free while you build. Pro when you apply. PDF download is always free.",
    url: "https://hiredtodayapp.com/pricing",
  },
};

const ROWS: [string, string, string][] = [
  ["Resumes", "1", "Unlimited"],
  ["Templates", "Free set", "All 60+"],
  ["PDF download", "Yes", "Yes"],
  ["Word (.docx) export", "Not included", "Yes"],
  ["AI bullet writer", "5 per day", "Unlimited"],
  ["ATS report", "Score + top 3 fixes", "Full 30-point report"],
  ["Cover letter builder", "Write and preview", "Unlimited downloads"],
  ["Job search", "Search, save and apply", "Search, save and apply"],
  ["Job matches with match %", "Top 3 a day", "All matches"],
  ["Auto-Apply", "Not included", "Up to 50/day"],
];

const TRUST = [
  {
    t: "Secure checkout",
    d: "Handled by our payment provider, never stored by us",
    icon: (<><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>),
  },
  { t: "Cancel in two clicks", d: "From Plan & billing, any time", icon: <path d="M6 6l12 12M18 6L6 18" /> },
  { t: "Keep your work", d: "Resumes stay yours after you cancel", icon: <path d="M12 3v12M7 10l5 5 5-5M4 20h16" /> },
];

export default function PricingPage() {
  return (
    <div className="bg-ground-site text-ink">
      <Navbar />
      <main>
        <PricingToggle />

        <section className="mx-auto grid max-w-[1140px] gap-4 px-6 pb-[72px] [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
          {TRUST.map((x) => (
            <div key={x.t} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none">{x.icon}</svg>
              <span>
                <b>{x.t}</b>
                <br />
                <span className="text-sm text-text-muted">{x.d}</span>
              </span>
            </div>
          ))}
        </section>

        <section className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 py-[72px]">
            <h2 className="font-display m-0 text-4xl font-bold tracking-[-1px]">Compare plans</h2>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[560px] border-collapse text-[15px]">
                <thead>
                  <tr className="bg-ground-site text-left">
                    <th scope="col" className="p-4">Feature</th>
                    <th scope="col" className="w-[140px] p-4">Free</th>
                    <th scope="col" className="w-[140px] p-4 text-brand">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([f, a, b]) => (
                    <tr key={f} className="border-t border-line">
                      <th scope="row" className="px-4 py-3.5 text-left font-medium">{f}</th>
                      <td className="px-4 py-3.5 text-text-muted">{a}</td>
                      <td className="px-4 py-3.5 font-semibold">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <PricingFAQ />
      </main>
      <Footer />
    </div>
  );
}
