"use client";

import EmailCaptureCard from "@/components/seo/email-capture-card";

/** Kept for existing imports. Delegates to the single shared email capture. */
export default function WeeklyTipsForm() {
  return (
    <EmailCaptureCard
      source="resources"
      heading="Get the 5-point ATS resume checklist"
      body="A short checklist to run before you send your resume anywhere. Free, one email."
      className="flex-[1_1_360px]"
    />
  );
}
