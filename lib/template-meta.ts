import type { TemplateLayout } from '@/components/template-preview';

export const TEMPLATE_META: Record<string, { layout: TemplateLayout; accent: string; label: string }> = {
  classic:        { layout: 'classic',      accent: '#0B6E5F', label: 'Classic' },
  modern:         { layout: 'sidebar',      accent: '#1e293b', label: 'Modern Sidebar' },
  minimal:        { layout: 'minimal',      accent: '#1d4ed8', label: 'Minimal' },
  executive:      { layout: 'executive',    accent: '#0f172a', label: 'Executive' },
  creative:       { layout: 'creative',     accent: '#7c3aed', label: 'Creative' },
  simple:         { layout: 'centered',     accent: '#0891b2', label: 'Simple' },
  'bold-header':  { layout: 'bold-header',  accent: '#0B6E5F', label: 'Bold Header' },
  'split-right':  { layout: 'split-right',  accent: '#1d4ed8', label: 'Split Right' },
  timeline:       { layout: 'timeline',     accent: '#7c3aed', label: 'Timeline' },
  mono:           { layout: 'mono',         accent: '#0d9488', label: 'Mono' },
  'photo-card':   { layout: 'photo-card',   accent: '#2563eb', label: 'Photo Card' },
  compact:        { layout: 'compact',      accent: '#475569', label: 'Compact' },
  serif:          { layout: 'serif',        accent: '#9f1239', label: 'Serif' },
  'split-accent': { layout: 'split-accent', accent: '#7c3aed', label: 'Split Accent' },
};

export function templateMeta(id: string | null | undefined) {
  return TEMPLATE_META[id ?? ''] ?? TEMPLATE_META.classic;
}

/** Pill colours for an ATS score, per the redesign (good / ok / needs work). */
export function atsPill(score: number | null | undefined): { bg: string; fg: string; label: string } {
  if (score == null) return { bg: '#EEEBE3', fg: '#3F4D49', label: 'Not checked' };
  if (score >= 80) return { bg: '#E3F4EE', fg: '#08574B', label: `ATS ${score}` };
  if (score >= 65) return { bg: '#FFF0C2', fg: '#6B4A00', label: `ATS ${score}` };
  return { bg: '#FFE1D6', fg: '#8A2A0B', label: `ATS ${score}` };
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'edited today';
  if (days === 1) return 'edited yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
