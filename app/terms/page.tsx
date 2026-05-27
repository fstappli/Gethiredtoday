import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Terms of Service - GetHiredToday",
  description: "Terms and conditions governing the use of GetHiredToday.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Last updated: April 15, 2026</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By creating an account or using GetHiredToday (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>GetHiredToday is an AI-powered resume and cover letter builder. We offer both a free tier and a paid Pro subscription ($9.99/month) with expanded features including unlimited resumes, PDF downloads, ATS analysis, and AI content generation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You must be at least 13 years old to use the Service.</li>
                <li>One account per person. Creating multiple accounts to circumvent limits is prohibited.</li>
                <li>You must provide accurate information when registering.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Use the Service for any unlawful purpose or to violate any regulations</li>
                <li>Create resumes containing false, misleading, or fraudulent information intended to deceive employers</li>
                <li>Attempt to reverse engineer, scrape, or extract data from the Service</li>
                <li>Upload malicious code or attempt to compromise system security</li>
                <li>Resell or redistribute generated content as a competing service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Content</h2>
              <p>You retain ownership of all resume content you create. By using the Service, you grant GetHiredToday a limited license to store and process your content solely to provide the Service. We do not claim ownership of your resumes or cover letters.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payments and Subscriptions</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Pro subscriptions are billed monthly at $9.99/month via Stripe.</li>
                <li>You may cancel at any time; access continues until the end of the billing period.</li>
                <li>We offer a 7-day money-back guarantee for new Pro subscriptions.</li>
                <li>Prices may change with 30 days&apos; notice to existing subscribers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. AI-Generated Content</h2>
              <p>AI suggestions are generated automatically and may not always be accurate or appropriate. You are responsible for reviewing and editing all AI-generated content before using it in job applications. GetHiredToday is not liable for any outcomes resulting from the use of AI-generated content.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimers</h2>
              <p>The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that using GetHiredToday will result in employment. ATS scores and suggestions are estimates based on AI analysis and are not guarantees of recruiter or system compatibility.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, GetHiredToday is not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
              <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time from your account settings. Upon deletion, your data will be removed within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
              <p>We may update these terms. We&apos;ll notify you of material changes via email. Continued use after notice constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
              <p>Questions? Contact us at <a href="mailto:hello@hiredtodayapp.com" className="text-teal hover:underline">hello@hiredtodayapp.com</a> or visit our <Link href="/contact" className="text-teal hover:underline">Contact page</Link>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
