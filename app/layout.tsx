import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hiredtodayapp.com"),
  title: {
    default: "AI Resume Builder — Get Hired Today | GetHiredToday",
    template: "%s | GetHiredToday",
  },
  description:
    "Build an ATS-friendly resume in 3 minutes with AI. Tailored bullet points, professional templates, ATS checker, and Auto-Apply — everything you need to get hired, for $9.99/month.",
  keywords: [
    "AI resume builder", "ATS-friendly resume", "resume maker",
    "AI resume writer", "ATS checker", "resume templates 2026", "cover letter builder",
    "professional resume", "online resume builder", "CV builder",
  ],
  authors: [{ name: "GetHiredToday", url: "https://hiredtodayapp.com" }],
  creator: "GetHiredToday",
  publisher: "GetHiredToday",
  alternates: { canonical: "https://hiredtodayapp.com" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiredtodayapp.com",
    siteName: "GetHiredToday",
    title: "AI Resume Builder — Get Hired Today",
    description: "Build an ATS-friendly resume in 3 minutes with AI. Tailored bullet points, professional templates, ATS checking, and Auto-Apply — $9.99/month.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "GetHiredToday — AI Resume Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Builder — Get Hired Today",
    description: "Build an ATS-friendly resume in 3 minutes with AI. $9.99/month — cancel anytime.",
    images: ["/og-image.png"],
    creator: "@hiredtodayapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "GetHiredToday",
            "url": "https://hiredtodayapp.com",
            "logo": "https://hiredtodayapp.com/og-image.png",
            "description": "AI-powered resume builder that helps job seekers create ATS-friendly resumes and land more interviews.",
            "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://hiredtodayapp.com/contact" },
            "sameAs": []
          })}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GetHiredToday AI Resume Builder",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "url": "https://hiredtodayapp.com",
            "description": "AI resume builder with ATS compatibility checking, professional templates, Auto-Apply, and one-click PDF download.",
            "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "247" }
          })}}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Google Ads tag — always active */}
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
