'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import ResumeThumb from '@/components/resume-thumb';
import UpgradePrompt from '@/components/upgrade-prompt';
import { createClient } from '@/lib/supabase';
import { isProActive } from '@/lib/subscription';
import type { UpgradeTrigger } from '@/lib/upgrade-triggers';
import type { TemplateLayout } from '@/components/template-preview';

/* ─── Template data ──────────────────────────────────────────────────── */
type Category = 'All' | 'Professional' | 'Modern' | 'Creative' | 'Simple' | 'Executive' | 'Academic';
const CATEGORIES: Category[] = ['All', 'Professional', 'Modern', 'Creative', 'Simple', 'Executive', 'Academic'];

interface Template {
  id: string;
  builderId: string;
  name: string;
  category: Exclude<Category, 'All'>;
  isPro: boolean;
  accent: string;
  layout: TemplateLayout;
  description: string;
}

const TEMPLATES: Template[] = [
  { id: 'classic-professional', builderId: 'classic',   name: 'Classic Professional', category: 'Professional', isPro: false, accent: '#4AB7A6', layout: 'classic',   description: 'Clean ATS-friendly single-column' },
  { id: 'modern-sidebar',       builderId: 'modern',    name: 'Modern Sidebar',       category: 'Modern',       isPro: false, accent: '#1e293b', layout: 'sidebar',   description: 'Two-column with dark sidebar' },
  { id: 'executive-bold',       builderId: 'executive', name: 'Executive Bold',       category: 'Executive',    isPro: true,  accent: '#0f172a', layout: 'executive', description: 'Authoritative dark header' },
  { id: 'creative-spectrum',    builderId: 'creative',  name: 'Creative Spectrum',    category: 'Creative',     isPro: true,  accent: '#7c3aed', layout: 'creative',  description: 'Side-column with photo circle' },
  { id: 'academic-harvard',     builderId: 'minimal',   name: 'Academic Harvard',     category: 'Academic',     isPro: false, accent: '#1d4ed8', layout: 'minimal',   description: 'Traditional centered header' },
  { id: 'contemporary-teal',    builderId: 'classic',   name: 'Contemporary Teal',    category: 'Professional', isPro: false, accent: '#0d9488', layout: 'classic',   description: 'Fresh teal accent lines' },
  { id: 'corporate-elite',      builderId: 'executive', name: 'Corporate Elite',      category: 'Executive',    isPro: true,  accent: '#1f2937', layout: 'executive', description: 'Prestige dark header' },
  { id: 'tech-engineer',        builderId: 'modern',    name: 'Tech Engineer',        category: 'Modern',       isPro: false, accent: '#4338ca', layout: 'sidebar',   description: 'Indigo sidebar for tech roles' },
  { id: 'healthcare-pro',       builderId: 'classic',   name: 'Healthcare Pro',       category: 'Professional', isPro: false, accent: '#059669', layout: 'classic',   description: 'Clean emerald accents' },
  { id: 'sales-champion',       builderId: 'executive', name: 'Sales Champion',       category: 'Professional', isPro: false, accent: '#ea580c', layout: 'executive', description: 'Bold orange impact header' },
  { id: 'graduate-fresh',       builderId: 'simple',    name: 'Graduate Fresh',       category: 'Simple',       isPro: false, accent: '#0891b2', layout: 'centered',  description: 'Simple centered design' },
  { id: 'creative-bold',        builderId: 'creative',  name: 'Creative Bold',        category: 'Creative',     isPro: true,  accent: '#e11d48', layout: 'creative',  description: 'Vibrant rose side-column' },
];

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function ResumeTemplatePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isPro, setIsPro] = useState(false);
  const [prompt, setPrompt] = useState<UpgradeTrigger | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_ends_at').eq('id', user.id).single();
      setIsPro(isProActive(profile));
    });
  }, []);

  const filtered =
    activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleSelect = async (tpl: Template) => {
    setError(null);
    if (tpl.isPro && !isPro) { setPrompt('templates'); return; }
    const id = tpl.builderId;
    try {
      const { getTemplateStarterData } = await import('@/lib/example-to-resume');
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'My Resume', template_id: id, data: getTemplateStarterData() }),
      });
      if (res.status === 401) { router.push('/login?redirect=/builder/resume'); return; }
      if (res.status === 403) { setPrompt('second_resume'); return; }
      if (res.ok) {
        const { resume } = await res.json();
        track('resume_created', { source: 'builder_picker', template: id });
        router.push(`/builder/resume/${resume.id}?wizard=1&template=${id}`);
        return;
      }
      setError('We could not create your resume. Please try again.');
    } catch {
      router.push(`/builder/resume/new?template=${id}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />

      <section className="border-b border-line px-5 pb-8 pt-12">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4">
          <h1 className="font-display m-0 text-4xl font-extrabold tracking-[-1px] min-[761px]:text-[52px]">Choose your resume template</h1>
          <p className="m-0 max-w-[620px] text-lg leading-relaxed text-text-muted">
            Pick a design that fits you. You can switch templates at any point while editing and no work is lost.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Template category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[44px] rounded-full border-[1.5px] px-4 text-sm font-bold ${activeCategory === cat ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="m-0 text-sm font-semibold text-danger-ink">{error}</p>}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] flex-1 px-5 py-10">
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr))]">
          {filtered.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl)}
              aria-label={`Use the ${tpl.name} template`}
              className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white text-left hover:border-brand"
            >
              <span className="relative flex justify-center bg-[#F2EFE7] pt-4">
                <ResumeThumb layout={tpl.layout} accent={tpl.accent} width={176} className="rounded-t shadow-[0_8px_20px_rgba(13,27,25,.12)]" />
                {tpl.isPro && <span className="absolute left-3 top-3 rounded-full bg-sun px-2 py-0.5 text-[11px] font-extrabold">PRO</span>}
              </span>
              <span className="flex flex-col gap-0.5 p-3.5">
                <b>{tpl.name}</b>
                <span className="text-[13px] text-text-muted">{tpl.description}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-text-muted">
          Cannot decide?{' '}
          <button type="button" onClick={() => handleSelect(TEMPLATES[0])} className="font-bold text-brand underline">Start with Classic Professional</button>
          {' · '}
          <Link href="/resume-templates" className="font-bold text-brand">Browse all templates</Link>
        </p>
      </section>
      <UpgradePrompt trigger={prompt ?? 'templates'} open={prompt !== null} onClose={() => setPrompt(null)} />
    </div>
  );
}
