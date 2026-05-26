'use client';

import { useState } from 'react';

interface ScoreBadgeProps {
  score: number;
  reasons?: string[];
  size?: 'sm' | 'md';
}

function badgeColors(score: number) {
  if (score >= 80) return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  if (score >= 60) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  if (score >= 40) return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
  return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
}

function badgeLabel(score: number) {
  if (score >= 80) return 'Excellent match';
  if (score >= 60) return 'Good match';
  if (score >= 40) return 'Moderate match';
  return 'Low match';
}

export function ScoreBadge({ score, reasons, size = 'md' }: ScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { bg, text, border } = badgeColors(score);
  const label = badgeLabel(score);

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className={`inline-flex items-center gap-1 rounded-full font-semibold border ${padding} cursor-help`}
        style={{ backgroundColor: bg, color: text, borderColor: border }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Match score: ${score}%. ${label}. ${reasons?.join('. ') ?? ''}`}
      >
        {score}% match
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 w-64 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl pointer-events-none"
          role="tooltip"
        >
          <p className="font-semibold mb-1.5" style={{ color: '#a3e8df' }}>{label} — {score}%</p>
          {reasons && reasons.length > 0 ? (
            <ul className="space-y-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#4AB7A6]" />
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">Score is based on skills, title, seniority, and industry alignment.</p>
          )}
        </div>
      )}
    </div>
  );
}
