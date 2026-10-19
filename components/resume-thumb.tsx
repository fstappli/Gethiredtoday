import { TemplatePreview, type PreviewContent, type TemplateLayout } from "@/components/template-preview";

/**
 * Template thumbnail. Renders the real TemplatePreview layout scaled to fit,
 * with sample data unless `content` is supplied (e.g. a user's own resume).
 * Aspect ratio is US Letter (200 x 259 native).
 */
const BASE_W = 200;
const BASE_H = 259;

export default function ResumeThumb({
  layout = "classic",
  accent = "#0B6E5F",
  content,
  width = 200,
  className,
}: {
  layout?: TemplateLayout;
  accent?: string;
  content?: PreviewContent;
  width?: number;
  className?: string;
}) {
  const scale = width / BASE_W;
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-white ${className ?? ""}`}
      style={{ width, height: Math.round(BASE_H * scale) }}
    >
      <div style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <TemplatePreview layout={layout} accent={accent} content={content} />
      </div>
    </div>
  );
}
