import Link from "next/link";
import LegalPage from "@/components/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description: "How GetHiredToday collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage doc="privacy" title="Privacy policy" updated="April 15, 2026">
            <section>
              <h2>1. Information We Collect</h2>
              <p>When you use GetHiredToday, we collect information you provide directly, including:</p>
              <ul>
                <li>Account information (name, email address, password)</li>
                <li>Resume content you create (work history, education, skills, contact details)</li>
                <li>Cover letter content</li>
                <li>Payment information (processed securely by Gumroad, we never store card numbers)</li>
                <li>Usage data and preferences</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide and improve our resume building services</li>
                <li>Generate AI-powered content suggestions using your resume data</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send service-related communications (password resets, billing)</li>
                <li>Analyze usage patterns to improve the product</li>
              </ul>
              <p>We do <strong>not</strong> sell your personal data to third parties. We do not use your resume content to train AI models without your explicit consent.</p>
            </section>

            <section>
              <h2>3. Data Storage and Security</h2>
              <p>Your data is stored securely using Supabase (PostgreSQL) with row-level security. We use industry-standard encryption in transit (TLS) and at rest. Payment data is handled exclusively by Gumroad, a PCI-DSS compliant processor.</p>
            </section>

            <section>
              <h2>4. Third-Party Services</h2>
              <p>GetHiredToday uses the following third-party services:</p>
              <ul>
                <li><strong>Supabase</strong>: database, authentication</li>
                <li><strong>Gumroad</strong>: payment processing</li>
                <li><strong>Anthropic Claude API</strong>: AI content generation</li>
                <li><strong>Vercel</strong>: hosting and deployment</li>
              </ul>
            </section>

            <section>
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access, correct, or delete your personal data at any time</li>
                <li>Export your resume data</li>
                <li>Cancel your subscription and request account deletion</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p>To exercise these rights, contact us at <a href="mailto:hello@hiredtodayapp.com">hello@hiredtodayapp.com</a>.</p>
            </section>

            <section>
              <h2>6. Cookies</h2>
              <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though this may affect functionality.</p>
            </section>

            <section>
              <h2>7. Children&apos;s Privacy</h2>
              <p>GetHiredToday is not directed to children under 13. We do not knowingly collect data from children. If you believe a child has provided us data, contact us immediately.</p>
            </section>

            <section>
              <h2>8. Changes to This Policy</h2>
              <p>We may update this policy periodically. We&apos;ll notify you of significant changes by email or in-app notification. Continued use after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2>9. Contact Us</h2>
              <p>Questions about this policy? Reach us at <a href="mailto:hello@hiredtodayapp.com">hello@hiredtodayapp.com</a> or visit our <Link href="/contact">Contact page</Link>.</p>
            </section>
    </LegalPage>
  );
}
