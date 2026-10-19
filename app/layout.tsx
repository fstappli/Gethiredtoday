import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import JsonLd from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema, softwareApplicationSchema } from "@/lib/seo/jsonld";
import { SITE, SITE_URL } from "@/lib/site-config";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
});

const DEFAULT_TITLE = "Free AI Resume Builder, ATS Checker and Job Search";
const DEFAULT_DESCRIPTION =
  "Build an ATS-friendly resume in about 3 minutes, check your ATS score, search jobs and apply with a tailored resume. Free to start, PDF download always free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name}: ${DEFAULT_TITLE}`,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "AI resume builder", "ATS-friendly resume", "resume maker", "free resume builder",
    "AI resume writer", "ATS checker", "ATS resume checker", "resume templates", "cover letter builder",
    "online resume builder", "CV builder", "job search",
  ],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  // './' resolves to each page's own URL, so every page is self-canonical.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    siteName: SITE.name,
    title: `${SITE.name}: ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/og?title=Get%20hired%20faster%20with%20a%20resume%20that%20passes%20the%20ATS&sub=Free%20resume%20builder%2C%20ATS%20checker%20and%20job%20search", width: 1200, height: 630, alt: `${SITE.name}, resume builder and job search` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: ${DEFAULT_TITLE}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og?title=Get%20hired%20faster%20with%20a%20resume%20that%20passes%20the%20ATS&sub=Free%20resume%20builder%2C%20ATS%20checker%20and%20job%20search"],
    creator: SITE.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim();

  return (
    <html lang="en" className={`${figtree.variable} ${bricolage.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd data={[organizationSchema(), websiteSchema(), softwareApplicationSchema()]} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Google Ads tag, always active */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-862628997"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments)}
          gtag('js',new Date());
          gtag('config','AW-862628997');
          ${ga4Id ? `gtag('config','${ga4Id}');` : ''}
        `}</Script>
      </body>
    </html>
  );
}
