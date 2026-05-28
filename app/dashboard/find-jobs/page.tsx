'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Search, SlidersHorizontal, X, Briefcase, MapPin, AlertCircle, Globe, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobCard, JobCardSkeleton } from '@/components/jobs/job-card';
import { useJobSearch } from '@/hooks/use-job-search';
import type { EmploymentType } from '@/types/jobs';

const COUNTRIES = [
  { value: 'us', label: '🇺🇸 United States' },
  { value: 'gb', label: '🇬🇧 United Kingdom' },
  { value: 'ae', label: '🇦🇪 UAE' },
  { value: 'ca', label: '🇨🇦 Canada' },
  { value: 'au', label: '🇦🇺 Australia' },
  { value: 'in', label: '🇮🇳 India' },
  { value: 'de', label: '🇩🇪 Germany' },
  { value: 'pk', label: '🇵🇰 Pakistan' },
];

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

function UnconfiguredBanner() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-900">Job search not configured</p>
        <p className="text-amber-700 mt-0.5">
          Add <code className="bg-amber-100 px-1 rounded font-mono text-xs">ADZUNA_APP_ID</code> and{' '}
          <code className="bg-amber-100 px-1 rounded font-mono text-xs">ADZUNA_APP_KEY</code> to your
          environment variables to enable live job search.
        </p>
      </div>
    </div>
  );
}

// ─── Country selector ─────────────────────────────────────────────────────────

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative shrink-0">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-9 pr-7 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6] bg-white cursor-pointer"
        aria-label="Select country"
      >
        {COUNTRIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▾</span>
    </div>
  );
}

// ─── Location autocomplete input ─────────────────────────────────────────────

function LocationInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/jobs/locations?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
          setOpen((data.suggestions?.length ?? 0) > 0);
        }
      } catch {}
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (s: string) => {
    onChange(s);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="City, state, or country…"
        autoComplete="off"
        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6]"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); setSuggestions([]); setOpen(false); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          aria-label="Clear location"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(s); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-[#f0fdfa] hover:text-[#0f766e] flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Filter rail ──────────────────────────────────────────────────────────────

function FilterRail({
  filters,
  categories,
  onSetFilter,
  onClearAll,
  onClose,
}: {
  filters: ReturnType<typeof useJobSearch>['filters'];
  categories: { label: string; tag: string }[];
  onSetFilter: ReturnType<typeof useJobSearch>['setFilter'];
  onClearAll: () => void;
  onClose?: () => void;
}) {
  const toggleEmploymentType = (type: EmploymentType) => {
    const current = filters.employment_types ?? [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onSetFilter('employment_types', next);
  };

  const toggleIndustry = (tag: string) => {
    const current = filters.industries ?? [];
    const next = current.includes(tag)
      ? current.filter((i) => i !== tag)
      : [...current, tag];
    onSetFilter('industries', next);
  };

  return (
    <aside className="w-full">
      {onClose && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Filters</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Work type */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Work type</p>
          <div className="space-y-2">
            {([
              { key: 'remote' as const, label: 'Remote' },
              { key: 'hybrid' as const, label: 'Hybrid' },
              { key: 'on_site' as const, label: 'On-site' },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={Boolean(filters[key])}
                  onChange={(e) => onSetFilter(key, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#4AB7A6]"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment type */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Employment type</p>
          <div className="space-y-2">
            {EMPLOYMENT_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters.employment_types ?? []).includes(value)}
                  onChange={() => toggleEmploymentType(value)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#4AB7A6]"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relocation */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Relocation</p>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={Boolean(filters.relocation)}
              onChange={(e) => onSetFilter('relocation', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-[#4AB7A6]"
            />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">Open to relocation</span>
          </label>
        </div>

        {/* Industries */}
        {categories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Industry</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <label key={cat.tag} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={(filters.industries ?? []).includes(cat.tag)}
                    onChange={() => toggleIndustry(cat.tag)}
                    className="w-4 h-4 rounded border-slate-300 accent-[#4AB7A6]"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 truncate">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClearAll} className="text-sm text-[#4AB7A6] hover:underline">
          Clear all filters
        </button>
      </div>
    </aside>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function FindJobsContent() {
  const {
    jobs,
    total,
    loading,
    loadingMore,
    filters,
    unconfigured,
    setFilter,
    clearFilter,
    clearAllFilters,
    loadMore,
    activeFilterCount,
  } = useJobSearch();

  const [categories, setCategories] = useState<{ label: string; tag: string }[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeResume, setActiveResume] = useState<{ id: string; title: string; jobTitle: string } | null>(null);
  const resumeInitialized = useRef(false);

  // On mount: fetch the active (finalized) resume and pre-populate the search query
  useEffect(() => {
    if (resumeInitialized.current) return;
    resumeInitialized.current = true;

    fetch('/api/resume')
      .then((r) => r.json())
      .then((d) => {
        const resumes: Array<{ id: string; title: string; finalized_at?: string | null; data?: Record<string, unknown> }> = d.resumes ?? [];
        const active = resumes.find((r) => r.finalized_at);
        if (!active) return;
        // Extract the most recent job title from work experience
        const workExp = (active.data?.work_experience as Array<{ job_title?: string }> | undefined) ?? [];
        const jobTitle = workExp[0]?.job_title ?? '';
        setActiveResume({ id: active.id, title: active.title, jobTitle });
        // Only pre-populate if no query is already set from the URL
        if (!filters.query && jobTitle) {
          setFilter('query', jobTitle);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/jobs/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const toggleEmploymentType = (type: EmploymentType) => {
    const current = filters.employment_types ?? [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilter('employment_types', next);
  };

  // Active filter chips
  const chips: { label: string; clear: () => void }[] = [];
  if (filters.query) chips.push({ label: `"${filters.query}"`, clear: () => clearFilter('query') });
  if (filters.remote) chips.push({ label: 'Remote', clear: () => setFilter('remote', false) });
  if (filters.hybrid) chips.push({ label: 'Hybrid', clear: () => setFilter('hybrid', false) });
  if (filters.on_site) chips.push({ label: 'On-site', clear: () => setFilter('on_site', false) });
  if (filters.relocation) chips.push({ label: 'Relocation open', clear: () => setFilter('relocation', false) });
  (filters.employment_types ?? []).forEach((t) => {
    const label = EMPLOYMENT_TYPES.find((e) => e.value === t)?.label ?? t;
    chips.push({ label, clear: () => toggleEmploymentType(t as EmploymentType) });
  });
  (filters.industries ?? []).forEach((ind) => {
    const cat = categories.find((c) => c.tag === ind);
    chips.push({
      label: cat?.label ?? ind,
      clear: () => setFilter('industries', (filters.industries ?? []).filter((i) => i !== ind)),
    });
  });

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 shrink-0" style={{ color: '#4AB7A6' }} />
          Find Jobs
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Search real job listings from thousands of employers.</p>

        {/* Search bar */}
        <div className="flex gap-3 mt-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.query ?? ''}
              onChange={(e) => setFilter('query', e.target.value)}
              placeholder="Job title, skills, or company…"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6]"
            />
          </div>

          <CountrySelect
            value={filters.country ?? 'us'}
            onChange={(v) => setFilter('country', v)}
          />

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            className="sm:hidden flex items-center gap-2 rounded-xl"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters{activeFilterCount > 0 && (
              <Badge className="ml-1 text-[10px] px-1.5 h-4 bg-[#4AB7A6] text-white">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3" role="list" aria-label="Active filters">
            {chips.map((chip) => (
              <button
                key={chip.label}
                onClick={chip.clear}
                role="listitem"
                className="inline-flex items-center gap-1.5 text-xs bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4] rounded-full px-3 py-1 hover:bg-[#ccfbf1] transition-colors"
                aria-label={`Remove filter: ${chip.label}`}
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-slate-400 hover:text-slate-600 px-1">
              Clear all
            </button>
          </div>
        )}

        {unconfigured && <div className="mt-4"><UnconfiguredBanner /></div>}

        {/* Active resume context banner */}
        {activeResume && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs font-medium text-teal-800">
              <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: '#4AB7A6' }} />
              Showing jobs matched to: <span className="font-semibold ml-0.5">{activeResume.title}</span>
            </div>
            <a href="/dashboard" className="text-xs text-slate-400 hover:text-[#4AB7A6] transition-colors">
              Change resume →
            </a>
          </div>
        )}

        {/* Auto-Apply promo banner */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl" style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #e6f7f5 100%)", border: "1px solid #99f6e4" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#4AB7A6" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
              Auto-Apply is now available — let GetHiredToday apply to matching jobs for you automatically.
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              Build your resume, set your criteria, and apply to up to 50 jobs per day without lifting a finger.
            </p>
          </div>
          <a
            href="/dashboard/auto-apply"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4AB7A6" }}
          >
            Enable →
          </a>
        </div>
      </div>

      <div className="flex gap-0 lg:gap-8 px-6 lg:px-8 py-6">
        {/* Desktop filter rail */}
        <div className="hidden lg:block w-60 shrink-0">
          <FilterRail
            filters={filters}
            categories={categories}
            onSetFilter={setFilter}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {total > 0 && !loading && (
            <p className="text-sm text-slate-500 mb-4">
              {total.toLocaleString()} job{total !== 1 ? 's' : ''} found
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 && !unconfigured ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No jobs found</h3>
              <p className="text-slate-500 text-sm mb-4">
                Try broadening your search — remove some filters or use a more general title.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {jobs.length > 0 && jobs.length < total && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-xl"
                  >
                    {loadingMore ? 'Loading…' : `Load more (${total - jobs.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <FilterRail
              filters={filters}
              categories={categories}
              onSetFilter={setFilter}
              onClearAll={clearAllFilters}
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense>
      <FindJobsContent />
    </Suspense>
  );
}
