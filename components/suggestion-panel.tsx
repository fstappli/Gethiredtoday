'use client';

/**
 * "Expert Recommended" suggestion panel, reusable UI for AI-generated
 * bullets, skills, or summaries. Shows a searchable list of cards, each with
 * a (+) button that invokes onAdd(text). Pattern mirrors the category-standard builder UI.
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2, Star, RotateCw, Filter } from 'lucide-react';

export type SuggestionType = 'bullets' | 'skills' | 'summary';

interface Props {
  type: SuggestionType;
  jobTitle: string;
  /** Called when the user clicks (+) on a suggestion. Receives the suggestion text. */
  onAdd: (text: string) => void;
  /** Optional heading and placeholder overrides. */
  heading?: string;
  subheading?: string;
  /** Limit height of scroll area to this many pixels (default: unbounded). */
  maxHeight?: number;
  /** Render compactly (smaller cards, tighter spacing) */
  compact?: boolean;
}

const DEFAULTS: Record<SuggestionType, { heading: string; subheading: string; emptyJobTitle: string }> = {
  bullets: {
    heading: 'Expert-written examples',
    subheading: 'Pick bullets that match your experience, then edit them.',
    emptyJobTitle: 'Start typing a job title below, or pick a popular role to see expert bullet examples.',
  },
  skills: {
    heading: 'Top skills for this role',
    subheading: 'Add the skills that match your background.',
    emptyJobTitle: 'Start typing a job title below, or pick a popular role to see recommended skills.',
  },
  summary: {
    heading: 'Pre-written summary examples',
    subheading: 'Pick one and edit to make it yours.',
    emptyJobTitle: 'Start typing a job title below, or pick a popular role to see summary examples.',
  },
};

// Common roles to seed the AI when no job title is entered yet.
// Clicking one auto-fills the search and loads suggestions.
const POPULAR_TITLES = [
  'Software Engineer',
  'Product Manager',
  'Marketing Manager',
  'Data Analyst',
  'Customer Success',
  'Sales Representative',
  'Graphic Designer',
  'Project Manager',
] as const;

export function SuggestionPanel({
  type,
  jobTitle,
  onAdd,
  heading,
  subheading,
  maxHeight,
  compact = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState(jobTitle);
  const [filter, setFilter] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [relatedTitles, setRelatedTitles] = useState<string[]>([]);

  // Sync searchTitle when jobTitle prop changes
  useEffect(() => {
    setSearchTitle(jobTitle);
  }, [jobTitle]);

  const fetchSuggestions = useCallback(async (title: string) => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    setAdded(new Set());
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, jobTitle: title.trim() }),
      });
      if (res.ok) {
        const { suggestions } = await res.json();
        setSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } else {
        setError('Could not load suggestions. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const fetchRelated = useCallback(async (title: string) => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'related-titles', jobTitle: title.trim() }),
      });
      if (res.ok) {
        const { suggestions } = await res.json();
        // Keep every related title the API returned, previously we capped
        // at 6 here and then further capped at 4 in render, which hid
        // suggestions the user's screen had room for.
        setRelatedTitles(Array.isArray(suggestions) ? suggestions : []);
      }
    } catch {}
  }, []);

  // Auto-load on mount / when jobTitle changes.
  // When the job title is cleared, also clear stale suggestions so the panel
  // doesn't show results that no longer match what the user is editing.
  useEffect(() => {
    if (jobTitle.trim()) {
      fetchSuggestions(jobTitle);
      fetchRelated(jobTitle);
    } else {
      setSuggestions([]);
      setRelatedTitles([]);
      setError(null);
    }
  }, [jobTitle, fetchSuggestions, fetchRelated]);

  const handleSearch = () => {
    fetchSuggestions(searchTitle);
    fetchRelated(searchTitle);
  };

  const handleAdd = (text: string) => {
    onAdd(text);
    setAdded((prev) => new Set(prev).add(text));
  };

  const d = DEFAULTS[type];
  const filtered = filter
    ? suggestions.filter((s) => s.toLowerCase().includes(filter.toLowerCase()))
    : suggestions;

  return (
    <div className={`flex flex-col gap-${compact ? '2' : '3'}`}>
      {(heading || d.heading) && (
        <div>
          <h3 className={`font-bold text-slate-900 ${compact ? 'text-sm' : 'text-base'} flex items-center gap-1.5`}>
            <Star className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400 fill-amber-400`} />
            {heading ?? d.heading}
          </h3>
          <p className={`text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'} mt-0.5`}>
            {subheading ?? d.subheading}
          </p>
        </div>
      )}

      {/* Search box */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by job title…"
            className="w-full h-9 pl-9 pr-3 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/20 focus:border-[#4AB7A6]"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchTitle.trim()}
          className="h-9 w-9 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center disabled:opacity-40"
          title="Refresh suggestions"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-violet-700" /> : <RotateCw className="w-3.5 h-3.5 text-violet-700" />}
        </button>
      </div>

      {/* Related titles, show all returned, wrapped onto multiple lines */}
      {relatedTitles.length > 0 && (
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Related:</span>
          {relatedTitles.map((rt) => (
            <button
              key={rt}
              onClick={() => { setSearchTitle(rt); fetchSuggestions(rt); }}
              className="text-xs inline-flex items-center gap-1 text-blue-700 hover:underline"
            >
              <Search className="w-3 h-3" />
              {rt}
            </button>
          ))}
        </div>
      )}

      {/* Filter */}
      {suggestions.length > 4 && (
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by keyword"
            className="w-full h-8 pl-8 pr-3 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-200"
          />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!jobTitle.trim() && !searchTitle.trim() && suggestions.length === 0 && !loading && (
        <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 px-3 py-3">
          <div className="text-xs text-slate-600 mb-2">{d.emptyJobTitle}</div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TITLES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSearchTitle(t);
                  fetchSuggestions(t);
                  fetchRelated(t);
                }}
                className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-[#4AB7A6] hover:text-[#4AB7A6] rounded-full px-2.5 py-1 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion cards, scrollable column */}
      <div
        className="flex flex-col gap-2 overflow-y-auto pr-1"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {loading && suggestions.length === 0 &&
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 animate-pulse bg-slate-50 h-20" />
          ))}

        {filtered.map((s, i) => {
          const isAdded = added.has(s);
          const isExpert = i < 3; // top three are flagged "Expert Recommended"
          return (
            <button
              key={i}
              onClick={() => !isAdded && handleAdd(s)}
              disabled={isAdded}
              className={`group text-left border rounded-xl p-3 flex items-start gap-3 transition-all ${
                isAdded
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-[#4AB7A6] hover:shadow-sm'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isAdded ? 'bg-emerald-500' : 'bg-blue-600 group-hover:bg-[#4AB7A6]'
                }`}
              >
                {isAdded ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Plus className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isExpert && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    Expert Recommended
                  </div>
                )}
                <div className={`${compact ? 'text-xs' : 'text-sm'} text-slate-700 leading-relaxed`}>
                  {s}
                </div>
              </div>
            </button>
          );
        })}

        {!loading && !error && suggestions.length === 0 && jobTitle.trim() && (
          <div className="text-xs text-slate-400 text-center py-4">No suggestions yet. Try a different job title.</div>
        )}
      </div>
    </div>
  );
}
