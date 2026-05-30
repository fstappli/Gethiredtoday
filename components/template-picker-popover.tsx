'use client';

/**
 * Visual template picker popover for the builder header.
 * Click the trigger to open a grid of template thumbnails; click a card to switch.
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { TemplatePreview, type TemplateLayout } from '@/components/template-preview';

export interface PickerTemplate {
  id: string;
  label: string;
  layout: TemplateLayout;
  accent: string;
  isPro: boolean;
}

interface Props {
  templates: PickerTemplate[];
  currentId: string;
  onChange: (id: string) => void;
  isPro: boolean;
}

export function TemplatePickerPopover({ templates, currentId, onChange, isPro }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = templates.find((t) => t.id === currentId) ?? templates[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button — shows a mini preview of the current template */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:border-teal-400 transition-colors"
      >
        <div
          className="w-7 h-9 rounded overflow-hidden border border-slate-200 flex-shrink-0"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
        >
          <TemplatePreview layout={current.layout} accent={current.accent} />
        </div>
        <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
          {current.label}
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover with visual template grid */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-[540px] max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(15,23,42,0.15)' }}
        >
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="font-bold text-slate-900 text-sm">Choose a template</div>
            <div className="text-xs text-slate-500 mt-0.5">Switch anytime — your content stays intact.</div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-4 grid grid-cols-3 gap-3">
            {templates.map((t) => {
              const active = t.id === currentId;
              const locked = t.isPro && !isPro;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (locked) return;
                    onChange(t.id);
                    setOpen(false);
                  }}
                  disabled={locked}
                  className={`group relative text-left rounded-xl overflow-hidden border-2 transition-all ${
                    active ? 'border-teal-500 ring-2 ring-teal-100' : 'border-transparent hover:border-slate-300'
                  } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="aspect-[8.5/11] bg-slate-100 overflow-hidden relative">
                    <TemplatePreview layout={t.layout} accent={t.accent} />
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {t.isPro && (
                      <div className="absolute top-2 left-2 text-[9px] font-bold bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 shadow-sm">
                        {locked ? '🔒 PRO' : 'PRO'}
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5 bg-white">
                    <div className={`text-[11px] font-semibold truncate ${active ? 'text-teal-700' : 'text-slate-700'}`}>
                      {t.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {!isPro && (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center justify-between gap-3">
              <div className="text-xs text-amber-800">
                <span className="font-semibold">Unlock all {templates.filter((t) => t.isPro).length} Pro templates</span> — just $9.99/mo
              </div>
              <a
                href={`/upgrade${
                  typeof window !== 'undefined'
                    ? `?from=${encodeURIComponent(window.location.pathname + window.location.search)}`
                    : ''
                }`}
                className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition-colors"
              >
                Upgrade
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
