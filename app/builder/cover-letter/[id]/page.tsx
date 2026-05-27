"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tone = "professional" | "friendly" | "enthusiastic" | "formal";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  company_name: string;
  job_title: string;
  recipient_name: string;
  recipient_title: string;
  tone: Tone;
  body: string;
}

const INITIAL_FORM: FormState = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  company_name: "",
  job_title: "",
  recipient_name: "",
  recipient_title: "",
  tone: "professional",
  body: "",
};

const TONE_LABELS: Record<Tone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  enthusiastic: "Enthusiastic",
  formal: "Formal",
};

const TEMPLATE_OPTIONS = ["Professional", "Modern", "Executive", "Creative", "Simple", "Academic"];

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CoverLetterBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === "new";
  const shouldDownload = searchParams.get("download") === "1";

  const [title, setTitle] = useState("My Cover Letter");
  const [selectedTemplate, setSelectedTemplate] = useState("Professional");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const previewRef = useRef<HTMLDivElement>(null);

  // Load existing cover letter from API
  useEffect(() => {
    if (isNew) { setDataLoaded(true); return; }
    fetch(`/api/cover-letter/${id}`)
      .then((r) => r.json())
      .then(({ coverLetter }) => {
        if (!coverLetter) return;
        if (coverLetter.title) setTitle(coverLetter.title);
        if (coverLetter.template_id) {
          const matched = TEMPLATE_OPTIONS.find(
            (t) => t.toLowerCase() === coverLetter.template_id.toLowerCase()
          );
          if (matched) setSelectedTemplate(matched);
        }
        const d = coverLetter.data ?? {};
        const c = coverLetter.contact ?? {};
        setForm({
          full_name: c.full_name ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          location: c.location ?? "",
          company_name: d.company_name ?? "",
          job_title: d.job_title ?? "",
          recipient_name: d.recipient_name ?? "",
          recipient_title: d.recipient_title ?? "",
          tone: d.tone ?? "professional",
          body: d.body ?? "",
        });
        setDataLoaded(true);
      })
      .catch(() => { setDataLoaded(true); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-download when ?download=1
  useEffect(() => {
    if (shouldDownload && dataLoaded) {
      const timer = setTimeout(() => handleDownloadPDF(), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldDownload, dataLoaded]);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleToneChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, tone: value as Tone }));
  }, []);

  const handleGenerateAI = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.job_title,
          company: form.company_name,
          recipientName: form.recipient_name,
          tone: form.tone,
          skills: [],
          experience: "",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setForm((prev) => ({ ...prev, body: data.letter }));
    } catch {
      setError("Failed to generate cover letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload = {
        title,
        template_id: selectedTemplate.toLowerCase(),
        data: {
          company_name: form.company_name,
          job_title: form.job_title,
          recipient_name: form.recipient_name,
          recipient_title: form.recipient_title,
          body: form.body,
          tone: form.tone,
        },
        contact: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          location: form.location,
        },
      };

      if (isNew) {
        const res = await fetch("/api/cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        const { coverLetter } = await res.json();
        if (!coverLetter?.id) throw new Error("Invalid response from server");
        router.replace(`/builder/cover-letter/${coverLetter.id}`);
      } else {
        const res = await fetch(`/api/cover-letter/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setDownloadingPdf(true);
    try {
      // Switched to PNG for the same reason the resume PDF did: at the
      // sizes we render, html-to-image's JPEG encoder smudges anti-aliased
      // text. PNG is lossless and the file is still small enough.
      const { toPng } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;

      const element = previewRef.current;
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Decode the captured PNG so we can compute the natural aspect ratio.
      // Previously we slammed the image into a fixed 210×297mm box, which
      // stretched the page vertically when the captured element was shorter
      // than a full A4 (e.g. a half-page cover letter), producing the same
      // distorted-band artifact the resume PDF used to have.
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = 210;
      const pageHeight = 297;
      const imgHeightMm = (img.height * pageWidth) / img.width;

      if (imgHeightMm <= pageHeight + 1) {
        // Render at natural size — no stretching.
        pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, imgHeightMm, undefined, "FAST");
      } else {
        // Cover letter overflowed a single page (long signature, large
        // letterhead, etc.) — slice into A4 pages with the same aspect-
        // preserving approach the resume PDF uses.
        const pageHeightPx = (pageHeight * img.width) / pageWidth;
        let y = 0;
        let pageIndex = 0;
        while (y < img.height) {
          const sliceHeight = Math.min(pageHeightPx, img.height - y);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = img.width;
          sliceCanvas.height = Math.ceil(sliceHeight);
          const sliceCtx = sliceCanvas.getContext("2d");
          if (!sliceCtx) throw new Error("2D canvas unavailable");
          sliceCtx.fillStyle = "#ffffff";
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(img, 0, y, img.width, sliceHeight, 0, 0, img.width, sliceHeight);
          if (pageIndex > 0) pdf.addPage();
          const sliceHeightMm = (sliceHeight * pageWidth) / img.width;
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, sliceHeightMm, undefined, "FAST");
          y += sliceHeight;
          pageIndex += 1;
        }
      }

      pdf.save(`${title || "cover-letter"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      setError("PDF generation failed. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const previewRecipient = form.recipient_name || "Hiring Manager";
  const previewName = form.full_name || "Your Name";
  const previewEmail = form.email || "your@email.com";
  const previewPhone = form.phone || "";
  const previewLocation = form.location || "";
  const previewCompany = form.company_name || "Company Name";
  const previewJobTitle = form.job_title || "Position";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">

      {/* Capture target for PDF — rendered off-screen so html-to-image can read it */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-9999px",
          width: "794px",   /* 210mm at 96dpi */
          pointerEvents: "none",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div
          ref={previewRef}
          style={{
            width: "794px",
            minHeight: "1123px",  /* 297mm at 96dpi */
            padding: "96px 86px",
            boxSizing: "border-box",
            fontFamily: "Georgia, serif",
            fontSize: "13px",
            lineHeight: 1.75,
            color: "#1a1a1a",
            background: "#ffffff",
          }}
        >
          <CoverLetterContent
            form={form}
            previewName={previewName}
            previewEmail={previewEmail}
            previewPhone={previewPhone}
            previewLocation={previewLocation}
            previewCompany={previewCompany}
            previewJobTitle={previewJobTitle}
            previewRecipient={previewRecipient}
          />
        </div>
      </div>

      {/* ======================== TOP HEADER ======================== */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex items-center gap-2 px-4 h-14 flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline font-medium">Dashboard</span>
        </Link>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-semibold text-gray-800 bg-transparent border-0 outline-none focus:border-b-2 focus:border-teal-500 px-1 min-w-0 max-w-[160px]"
          aria-label="Cover letter title"
        />

        <div className="flex-1" />

        {/* Template selector */}
        <div className="hidden sm:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Template</span>
          <div className="flex gap-0.5">
            {TEMPLATE_OPTIONS.slice(0, 4).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTemplate(t)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                  selectedTemplate === t
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0 hidden sm:block" />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
            saved
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-700"
          } disabled:opacity-60`}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? "Saved!" : saving ? "Saving…" : "Save"}
        </button>

        {/* Mobile tab toggle */}
        <div className="flex md:hidden rounded-full border border-gray-200 p-0.5 flex-shrink-0">
          <button
            onClick={() => setMobileTab('edit')}
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${mobileTab === 'edit' ? 'bg-teal-600 text-white' : 'text-gray-500'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${mobileTab === 'preview' ? 'bg-teal-600 text-white' : 'text-gray-500'}`}
          >
            Preview
          </button>
        </div>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPdf}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
        >
          {downloadingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{downloadingPdf ? "Generating…" : "Download PDF"}</span>
          <span className="sm:hidden">{downloadingPdf ? "…" : "PDF"}</span>
        </button>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 text-center border-b border-red-100 flex-shrink-0">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline text-xs">Dismiss</button>
        </div>
      )}

      {/* ======================== MAIN AREA ======================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* -------- LEFT PANEL: Editor -------- */}
        <aside className={`md:w-[400px] lg:w-[440px] flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200 p-4 sm:p-6 space-y-7 ${mobileTab === 'preview' ? 'hidden md:flex md:flex-col' : 'flex flex-col flex-1 md:flex-none'}`}>

          {/* Contact Info */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Contact Info</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="full_name" className="text-xs text-gray-500">Full Name</Label>
                <Input id="full_name" placeholder="Jane Smith" value={form.full_name} onChange={handleChange("full_name")} className="mt-1 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email" className="text-xs text-gray-500">Email</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange("email")} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs text-gray-500">Phone</Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange("phone")} className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="text-xs text-gray-500">Location</Label>
                <Input id="location" placeholder="San Francisco, CA" value={form.location} onChange={handleChange("location")} className="mt-1 text-sm" />
              </div>
            </div>
          </section>

          {/* Letter Details */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Letter Details</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="company_name" className="text-xs text-gray-500">Company Name</Label>
                <Input id="company_name" placeholder="Acme Corp" value={form.company_name} onChange={handleChange("company_name")} className="mt-1 text-sm" />
              </div>
              <div>
                <Label htmlFor="job_title" className="text-xs text-gray-500">Job Title</Label>
                <Input id="job_title" placeholder="Senior Software Engineer" value={form.job_title} onChange={handleChange("job_title")} className="mt-1 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="recipient_name" className="text-xs text-gray-500">Recipient Name</Label>
                  <Input id="recipient_name" placeholder="Alex Johnson" value={form.recipient_name} onChange={handleChange("recipient_name")} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="recipient_title" className="text-xs text-gray-500">Recipient Title</Label>
                  <Input id="recipient_title" placeholder="Hiring Manager" value={form.recipient_title} onChange={handleChange("recipient_title")} className="mt-1 text-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Tone */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tone</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TONE_LABELS) as Tone[]).map((tone) => (
                <label
                  key={tone}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
                    form.tone === tone
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <input type="radio" name="tone" value={tone} checked={form.tone === tone} onChange={() => handleToneChange(tone)} className="sr-only" />
                  {TONE_LABELS[tone]}
                </label>
              ))}
            </div>
          </section>

          {/* Body Editor */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Letter Body</h2>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generating}
                className="flex items-center gap-1.5 text-xs font-medium bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generating ? "Generating…" : "Generate with AI"}
              </button>
            </div>
            <Textarea
              placeholder="Write your cover letter body here, or click 'Generate with AI' to get started…"
              value={form.body}
              onChange={handleChange("body")}
              rows={13}
              className="resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1.5">{form.body.length} characters</p>
          </section>
        </aside>

        {/* -------- RIGHT PANEL: Preview -------- */}
        <main className={`flex-1 overflow-y-auto bg-gray-200 flex-col ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{selectedTemplate}</span>
            </div>
            <span className="text-[10px] text-gray-400">A4 · 210×297mm</span>
          </div>

          <div className="flex-1 flex justify-center py-8 px-4">
            <div
              style={{
                transform: "scale(0.62)",
                transformOrigin: "top center",
                width: "210mm",
                flexShrink: 0,
              }}
            >
              <div
                className="bg-white shadow-2xl ring-1 ring-black/5"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "20mm 18mm",
                  boxSizing: "border-box",
                  fontFamily: "Georgia, serif",
                  fontSize: "12pt",
                  lineHeight: 1.7,
                  color: "#1a1a1a",
                }}
              >
                <CoverLetterContent
                  form={form}
                  previewName={previewName}
                  previewEmail={previewEmail}
                  previewPhone={previewPhone}
                  previewLocation={previewLocation}
                  previewCompany={previewCompany}
                  previewJobTitle={previewJobTitle}
                  previewRecipient={previewRecipient}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Shared cover letter content component used by both preview and hidden capture div
function CoverLetterContent({
  form,
  previewName,
  previewEmail,
  previewPhone,
  previewLocation,
  previewCompany,
  previewJobTitle,
  previewRecipient,
}: {
  form: FormState;
  previewName: string;
  previewEmail: string;
  previewPhone: string;
  previewLocation: string;
  previewCompany: string;
  previewJobTitle: string;
  previewRecipient: string;
}) {
  return (
    <>
      {/* Sender block — top right */}
      <div style={{ textAlign: "right", marginBottom: "32px" }}>
        <p style={{ fontWeight: 700, fontSize: "14pt" }}>{previewName}</p>
        {previewEmail && <p style={{ fontSize: "11pt" }}>{previewEmail}</p>}
        {previewPhone && <p style={{ fontSize: "11pt" }}>{previewPhone}</p>}
        {previewLocation && <p style={{ fontSize: "11pt" }}>{previewLocation}</p>}
      </div>

      {/* Date */}
      <p style={{ marginBottom: "24px" }}>{formatDate()}</p>

      {/* Recipient block */}
      <div style={{ marginBottom: "24px" }}>
        {form.recipient_name && <p style={{ fontWeight: 600 }}>{form.recipient_name}</p>}
        {form.recipient_title && <p>{form.recipient_title}</p>}
        <p>{previewCompany}</p>
      </div>

      {/* Subject line */}
      <p style={{ marginBottom: "16px", fontWeight: 600 }}>
        Re: Application for {previewJobTitle}
      </p>

      {/* Salutation */}
      <p style={{ marginBottom: "16px" }}>
        Dear {form.recipient_name ? form.recipient_name : "Hiring Manager"},
      </p>

      {/* Body */}
      <div style={{ marginBottom: "32px" }}>
        {form.body ? (
          form.body
            .split(/\n\n+/)
            .filter((p) => p.trim())
            .map((paragraph, i) => (
              <p key={i} style={{ marginBottom: "16px", textAlign: "justify" }}>
                {paragraph.trim()}
              </p>
            ))
        ) : (
          <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
            Your cover letter body will appear here. Fill in the editor on the left or click
            &ldquo;Generate with AI&rdquo; to get started.
          </p>
        )}
      </div>

      {/* Closing */}
      <div>
        <p style={{ marginBottom: "24px" }}>Sincerely,</p>
        <p style={{ fontWeight: 700 }}>{previewName}</p>
      </div>
    </>
  );
}
