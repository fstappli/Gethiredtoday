/**
 * Redesign UI kit: buttons, inputs, cards, chips.
 * Values come straight from the design files (design-tokens.json).
 */
import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export type BtnVariant = "primary" | "dark" | "outline" | "sun" | "mint" | "ghost" | "danger";

const BTN_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-[18px] py-3 text-[15px] font-bold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  dark: "bg-ink text-white hover:bg-ink-soft",
  outline: "border-[1.5px] border-line-strong bg-white text-ink hover:border-ink",
  sun: "bg-sun text-ink hover:brightness-95",
  mint: "bg-mint-bright text-ink hover:brightness-95",
  ghost: "bg-transparent text-brand hover:bg-mint-soft",
  danger: "bg-danger-soft text-danger-ink hover:brightness-95",
};

export function btnClass(variant: BtnVariant = "primary", extra = "") {
  return `${BTN_BASE} ${BTN_VARIANTS[variant]} ${extra}`.trim();
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: { href: string; variant?: BtnVariant; className?: string; children: ReactNode } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={btnClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Btn({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: { variant?: BtnVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={btnClass(variant, className)} {...rest} />;
}

export function Field({
  label,
  hint,
  error,
  className = "",
  ...input
}: { label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold ${className}`}>
      {label}
      <input
        {...input}
        aria-invalid={error ? true : undefined}
        className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base font-normal text-ink placeholder:text-text-subtle"
      />
      {hint && !error ? <span className="text-[13px] font-normal text-text-subtle">{hint}</span> : null}
      {error ? <span role="alert" className="text-[13px] font-semibold text-danger-ink">{error}</span> : null}
    </label>
  );
}

export function Card({ className = "", children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: "div" | "section" | "article" }) {
  return <Tag className={`rounded-[20px] border border-line bg-white p-6 ${className}`}>{children}</Tag>;
}

export function Chip({
  active = false,
  tone = "neutral",
  children,
  className = "",
  ...rest
}: { active?: boolean; tone?: "neutral" | "brand" | "sun" | "danger"; children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    neutral: "bg-white text-ink border-line-strong",
    brand: "bg-mint-soft text-brand-dark border-transparent",
    sun: "bg-sun-soft text-warning-ink border-transparent",
    danger: "bg-danger-soft text-danger-ink border-transparent",
  } as const;
  return (
    <button
      type="button"
      aria-pressed={rest.onClick ? active : undefined}
      className={`inline-flex min-h-[44px] items-center rounded-full border-[1.5px] px-4 py-2 text-sm font-bold ${active ? "border-ink bg-ink text-white" : tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Non-interactive pill for labels such as FREE / PRO / match %. */
export function Pill({ tone = "brand", children, className = "" }: { tone?: "brand" | "sun" | "ink" | "danger"; children: ReactNode; className?: string }) {
  const tones = {
    brand: "bg-mint-soft text-brand-dark",
    sun: "bg-sun-soft text-warning-ink",
    ink: "bg-ink text-white",
    danger: "bg-danger-soft text-danger-ink",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${tones[tone]} ${className}`}>{children}</span>;
}
