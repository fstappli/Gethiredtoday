import LegalPage from "@/components/legal-page";

export const metadata = {
  title: "Cookie policy",
  description: "Which cookies GetHiredToday uses and how to opt out.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      doc="cookies"
      title="Cookie policy"
      updated="[date]"
      summary="[Plain-language summary of which cookies you use and how to opt out.]"
    >
      <h2>1. [Section heading]</h2>
      <p>[Paste your cookie policy copy here. Keep headings short and plain so people can scan.]</p>
      <h2>2. [Section heading]</h2>
      <p>[Cookie policy copy]</p>
    </LegalPage>
  );
}
