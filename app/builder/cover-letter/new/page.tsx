"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NewCoverLetterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const templateId = searchParams.get("template") || "professional";
    fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Cover Letter",
        template_id: templateId,
        data: {},
        contact: {},
      }),
    })
      .then((r) => r.json())
      .then(({ coverLetter }) => {
        if (coverLetter?.id) {
          router.replace(`/builder/cover-letter/${coverLetter.id}`);
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [router, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#4AB7A6" }} />
        <p className="text-sm font-medium">Creating cover letter…</p>
      </div>
    </div>
  );
}

export default function NewCoverLetterPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#4AB7A6" }} />
      </div>
    }>
      <NewCoverLetterContent />
    </Suspense>
  );
}
