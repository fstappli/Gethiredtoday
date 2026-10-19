/**
 * HiredTodayApp brand mark + wordmark.
 *
 * Single source of truth for the logo — used in navbar, footer, dashboard
 * sidebar, auth pages, and anywhere else the brand appears. Keep the typography
 * and mark geometry identical everywhere so the identity is consistent.
 *
 * Variants:
 *   • default  — full logo (mark + wordmark) for navbar/footer
 *   • icon     — just the mark (square, e.g. for app icon, dashboard sidebar
 *                collapsed, or tight spaces)
 *   • wordmark — just the text
 *
 * The text uses the site's Inter font (loaded in `app/layout.tsx`). The mark is
 * a stylized "G" inside a rounded teal square, chosen to stay legible at
 * 16×16 (favicon) and crisp at billboard scale.
 */

import Link from "next/link";

type Variant = "default" | "icon" | "wordmark";
type Tone = "dark" | "light"; // dark = use on light bg (slate-900 text); light = on dark bg (white text)

interface LogoProps {
  href?: string | null; // null = render as <div>, not <a>
  variant?: Variant;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TEAL = "#0B6E5F";
const TEAL_DARK = "#0B6E5F";
const SLATE_900 = "#0D1B19";

const SIZE_MAP = {
  sm: { mark: 24, text: 16, gap: 7 },
  md: { mark: 28, text: 18, gap: 8 },
  lg: { mark: 36, text: 22, gap: 10 },
};

function Mark({ size }: { size: number }) {
  // Rounded teal square with a stylized "G" glyph.
  // The G is intentionally drawn as a clean geometric shape (not a raw
  // character) so it renders identically regardless of the rendering engine.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ght-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#0B6E5F" />
          <stop offset="100%" stopColor={TEAL_DARK} />
        </linearGradient>
      </defs>
      {/* Rounded background */}
      <rect x="0" y="0" width="48" height="48" rx="11" fill="url(#ght-grad)" />
      {/* Clean G: outer arc open at the right + short horizontal crossbar */}
      <path
        d="M34 18 A11 11 0 1 0 34 32 L34 26 L26 26"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Wordmark({ size, tone }: { size: number; tone: Tone }) {
  const getHireColor = tone === "light" ? "#ffffff" : SLATE_900;
  const todayColor = tone === "light" ? "#5FD3B3" : TEAL;
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-0.3px",
        fontFamily: 'var(--font-bricolage), Georgia, serif',
        color: getHireColor,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      GetHired<span style={{ color: todayColor }}>Today</span>
    </span>
  );
}

export default function Logo({
  href = "/",
  variant = "default",
  tone = "dark",
  size = "md",
  className,
}: LogoProps) {
  const dim = SIZE_MAP[size];

  const inner = (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: dim.gap }}
    >
      {variant !== "wordmark" && <Mark size={dim.mark} />}
      {variant !== "icon" && <Wordmark size={dim.text} tone={tone} />}
    </span>
  );

  if (href === null) return inner;

  return (
    <Link
      href={href}
      className="inline-flex items-center"
      aria-label="GetHiredToday home"
      style={{ lineHeight: 1 }}
    >
      {inner}
    </Link>
  );
}
