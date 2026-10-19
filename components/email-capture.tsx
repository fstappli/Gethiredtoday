"use client";

import EmailCaptureCard from "@/components/seo/email-capture-card";

/** Kept for existing imports. Delegates to the single shared email capture. */
export default function EmailCapture() {
  return (
    <section className="mx-auto w-full max-w-[860px] px-5 py-16">
      <EmailCaptureCard source="legacy_capture" />
    </section>
  );
}
