"use client";

import { MiniResume } from "@/components/mini-resume-cards";

const cards = [
  { layout: "classic",   accent: "#4AB7A6", label: "Classic",   rotate: "-2deg"   },
  { layout: "sidebar",   accent: "#334155", label: "Modern",    rotate: "1.5deg"  },
  { layout: "executive", accent: "#1d4ed8", label: "Executive", rotate: "-1deg"   },
  { layout: "creative",  accent: "#7c3aed", label: "Creative",  rotate: "2deg"    },
  { layout: "timeline",  accent: "#0d9488", label: "Timeline",  rotate: "-1.5deg" },
];

function TemplateCard({
  card,
  style,
  zIndex,
  labelPos = "left",
}: {
  card: typeof cards[0];
  style: React.CSSProperties;
  zIndex: number;
  labelPos?: "left" | "right";
}) {
  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const base = style.transform as string;
    el.style.transform = base.includes("translate(-44%")
      ? "translate(-44%, -50%) rotate(0deg) translateY(-8px) scale(1.03)"
      : "rotate(0deg) translateY(-8px) scale(1.03)";
    el.style.boxShadow = "0 28px 64px rgba(15,23,42,0.22), 0 6px 20px rgba(15,23,42,0.08)";
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = style.transform as string;
    el.style.boxShadow = style.boxShadow as string;
  };

  return (
    <div
      className="absolute overflow-hidden rounded-2xl bg-white group cursor-pointer"
      style={{ ...style, zIndex, transition: "transform 320ms cubic-bezier(0.22,1,0.36,1), box-shadow 320ms ease" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>
      {/* Beautiful mini resume — fills container */}
      <div style={{ flex: 1, overflow: "hidden", height: "calc(100% - 22px)" }}>
        <MiniResume layout={card.layout} accent={card.accent} />
      </div>
      {/* Hover label chip */}
      <div
        className={`absolute bottom-2.5 ${labelPos === "left" ? "left-2.5" : "right-2.5"} text-[9px] font-bold px-2 py-0.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        style={{ backgroundColor: card.accent }}
      >
        {card.label}
      </div>
    </div>
  );
}

export default function FeatureVisualTemplates() {
  return (
    <div className="relative select-none" style={{ height: 420, minWidth: 340 }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 55% 45%, rgba(74,183,166,0.12) 0%, rgba(29,78,216,0.06) 55%, transparent 80%)",
        filter: "blur(4px)",
      }} />

      {/* Card 5 — ghost behind */}
      <div className="absolute overflow-hidden rounded-2xl bg-white" style={{
        width: 175, height: 228, bottom: -10, right: -6,
        transform: `rotate(${cards[4].rotate})`,
        boxShadow: "0 6px 24px rgba(15,23,42,0.10)",
        border: "1px solid #e2e8f0", opacity: 0.6, zIndex: 1,
      }}>
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        <div style={{ height: "calc(100% - 22px)", overflow: "hidden" }}>
          <MiniResume layout={cards[4].layout} accent={cards[4].accent} />
        </div>
      </div>

      {/* Card 1 — top-left */}
      <TemplateCard card={cards[0]} zIndex={3} labelPos="left" style={{
        width: 210, height: 270, top: 8, left: 0,
        transform: `rotate(${cards[0].rotate})`,
        boxShadow: "0 16px 48px rgba(15,23,42,0.16), 0 4px 12px rgba(15,23,42,0.08)",
        border: "1px solid #e2e8f0",
      }} />

      {/* Card 2 — top-right */}
      <TemplateCard card={cards[1]} zIndex={4} labelPos="right" style={{
        width: 195, height: 252, top: 0, right: 10,
        transform: `rotate(${cards[1].rotate})`,
        boxShadow: "0 12px 36px rgba(15,23,42,0.13), 0 3px 10px rgba(15,23,42,0.07)",
        border: "1px solid #e2e8f0",
      }} />

      {/* Card 3 — bottom-left */}
      <TemplateCard card={cards[2]} zIndex={3} labelPos="left" style={{
        width: 188, height: 244, bottom: 0, left: 28,
        transform: `rotate(${cards[2].rotate})`,
        boxShadow: "0 12px 36px rgba(15,23,42,0.12), 0 3px 10px rgba(15,23,42,0.06)",
        border: "1px solid #e2e8f0",
      }} />

      {/* Card 4 — center hero */}
      <TemplateCard card={cards[3]} zIndex={5} labelPos="left" style={{
        width: 200, height: 260, top: "50%", left: "50%",
        transform: `translate(-44%, -50%) rotate(${cards[3].rotate})`,
        boxShadow: "0 20px 56px rgba(15,23,42,0.18), 0 6px 18px rgba(124,58,237,0.10)",
        border: "1.5px solid #e2e8f0",
      }} />

      {/* Floating badge */}
      <div className="absolute flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-slate-200" style={{
        bottom: 28, right: 0,
        boxShadow: "0 4px 16px rgba(15,23,42,0.10)", zIndex: 6,
        animation: "heroFloat 5s ease-in-out infinite", animationDelay: "0.8s",
      }}>
        <span className="text-lg font-bold" style={{ color: "#4AB7A6" }}>60+</span>
        <span className="text-xs font-semibold text-slate-500">Templates</span>
      </div>
    </div>
  );
}
