'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomeJobSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('query', q.trim());
    if (loc.trim()) sp.set('location', loc.trim());
    router.push(`/jobs${sp.toString() ? `?${sp}` : ''}`);
  };
  return (
    <form role="search" onSubmit={submit} className="flex flex-wrap gap-2 rounded-2xl bg-white p-2">
      <label className="flex min-h-[52px] flex-[2_1_240px] items-center gap-2.5 rounded-xl bg-ground-site px-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <span className="sr-only">Job title or keyword</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-text-subtle" />
      </label>
      <label className="flex min-h-[52px] flex-[1_1_180px] items-center gap-2.5 rounded-xl bg-ground-site px-3">
        <span className="sr-only">Location</span>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City or Remote" className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-text-subtle" />
      </label>
      <button type="submit" className="grid min-h-[52px] flex-[0_1_auto] place-items-center rounded-xl bg-brand px-6 font-extrabold text-white hover:bg-brand-dark">Search jobs</button>
    </form>
  );
}
