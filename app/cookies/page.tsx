import LegalPage from "@/components/legal-page";

export const metadata = {
  title: "Cookie policy",
  description: "Which cookies GetHiredToday uses, why we use only essential cookies for sign-in and sessions, and how to control cookies in your browser.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      doc="cookies"
      title="Cookie policy"
      updated="April 15, 2026"
      summary="We only use essential cookies for sign-in and sessions."
    >
      <h2>1. Cookies</h2>
      <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though this may affect functionality.</p>
      <h2>2. Questions</h2>
      <p>Questions about this policy? Reach us at <a href="mailto:hello@hiredtodayapp.com">hello@hiredtodayapp.com</a>.</p>
    </LegalPage>
  );
}
