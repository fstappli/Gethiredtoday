'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, TrendingUp, CreditCard, AlertCircle, UserCheck,
  ShoppingCart, Clock, Search, Plus, X, ChevronDown,
  RefreshCw, Shield,
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  subscription_status: string | null;
  subscription_ends_at: string | null;
  created_at: string;
}

interface CheckoutAttempt {
  id: string;
  user_id: string | null;
  email: string | null;
  from_path: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Pro (Active)',  bg: '#dcfce7', text: '#166534' },
  { value: 'trialing',  label: 'Trialing',      bg: '#dbeafe', text: '#1e40af' },
  { value: 'cancelled', label: 'Cancelled',     bg: '#fef9c3', text: '#854d0e' },
  { value: 'free',      label: 'Free',          bg: '#f1f5f9', text: '#475569' },
  { value: 'past_due',  label: 'Past Due',      bg: '#fee2e2', text: '#991b1b' },
];

function statusStyle(status: string | null) {
  return STATUS_OPTIONS.find(s => s.value === (status ?? 'free').toLowerCase())
    ?? STATUS_OPTIONS.find(s => s.value === 'free')!;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtTime(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ── Status badge + dropdown ───────────────────────────────────────────────────

function StatusDropdown({
  userId, current, onChanged,
}: {
  userId: string;
  current: string | null;
  onChanged: (id: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const style = statusStyle(current);

  const change = async (newStatus: string) => {
    if (newStatus === (current ?? 'free')) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_status: newStatus }),
      });
      if (res.ok) onChanged(userId, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {loading ? <RefreshCw size={10} className="animate-spin" /> : null}
        {style.label}
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => change(opt.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: opt.text }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Create user modal ─────────────────────────────────────────────────────────

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name, subscription_status: status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create user'); return; }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900 text-lg">Create User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#4AB7A6' } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Access Level</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-white"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#4AB7A6' }}
            >
              {loading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [attempts, setAttempts] = useState<CheckoutAttempt[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'funnel'>('users');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      if (res.status === 403) { router.replace('/dashboard'); return; }
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchAttempts = useCallback(async () => {
    const res = await fetch('/api/admin/checkout-attempts');
    if (res.ok) {
      const data = await res.json();
      setAttempts(data.attempts ?? []);
    }
  }, []);

  useEffect(() => { fetchUsers(debouncedSearch); }, [debouncedSearch, fetchUsers]);
  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, subscription_status: newStatus } : u
    ));
  };

  // Computed stats (from unfiltered users — search only affects display)
  const proStatuses = ['active', 'trialing', 'pro'];
  const activePro = users.filter(u => proStatuses.includes((u.subscription_status ?? '').toLowerCase()));
  const convertedEmails = new Set(
    users.filter(u => u.subscription_status && u.subscription_status !== 'free').map(u => u.email)
  );
  const nonConverted = attempts.filter(a => a.email && !convertedEmails.has(a.email));
  const conversionRate = attempts.length > 0
    ? Math.round((convertedEmails.size / attempts.length) * 100)
    : 0;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const newToday = users.filter(u => new Date(u.created_at) >= startOfToday).length;
  const attemptsToday = attempts.filter(a => new Date(a.created_at) >= startOfToday).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield size={20} style={{ color: '#4AB7A6' }} />
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Live data from Supabase</p>
          </div>
          <button
            onClick={() => { fetchUsers(debouncedSearch); fetchAttempts(); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',        value: users.length,      sub: `+${newToday} today`,           icon: Users,        color: '#4AB7A6' },
            { label: 'Active Pro',         value: activePro.length,  sub: `${users.length - activePro.length} free`, icon: UserCheck, color: '#16a34a' },
            { label: 'Checkout Attempts',  value: attempts.length,   sub: `${attemptsToday} today`,       icon: ShoppingCart, color: '#2563eb' },
            { label: 'Conversion Rate',    value: `${conversionRate}%`, sub: `${convertedEmails.size} converted`, icon: TrendingUp, color: '#7c3aed' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(['users', 'funnel'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize"
              style={activeTab === tab ? { backgroundColor: '#4AB7A6', color: '#fff' } : { color: '#64748b' }}
            >
              {tab === 'users' ? `Users (${users.length})` : `Drop-offs (${nonConverted.length})`}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#4AB7A6' }}
              >
                <Plus size={14} />
                Create User
              </button>
            </div>

            {/* User list */}
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-slate-300" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-8 text-center italic">No users found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-slate-50/60">
                  <span className="col-span-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">User</span>
                  <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Joined</span>
                  <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Access</span>
                </div>

                {users.map(u => (
                  <div key={u.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                        style={{ backgroundColor: '#4AB7A6' }}
                      >
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-800 truncate">{u.full_name || '—'}</span>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <span className="text-xs text-slate-500 truncate block">{u.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-400">{fmt(u.created_at)}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <StatusDropdown
                        userId={u.id}
                        current={u.subscription_status}
                        onChanged={handleStatusChange}
                      />
                      {u.subscription_ends_at && (
                        <span className="text-[10px] text-slate-400 hidden xl:block">
                          ends {fmt(u.subscription_ends_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Funnel / drop-offs tab */}
        {activeTab === 'funnel' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <AlertCircle size={15} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800 text-sm">
                Clicked upgrade but didn&apos;t convert ({nonConverted.length})
              </h2>
            </div>

            {nonConverted.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-8 text-center italic">No drop-offs yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-slate-50/60">
                  <span className="col-span-5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="col-span-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Came from</span>
                  <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">When</span>
                </div>
                {nonConverted.slice(0, 100).map(a => (
                  <div key={a.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center">
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-xs font-bold text-amber-700">
                        {(a.email || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-700 truncate">{a.email || 'Unknown'}</span>
                    </div>
                    <div className="col-span-4">
                      <span className="text-xs text-slate-400 font-mono truncate block">{a.from_path || '/'}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-300 shrink-0" />
                      <span className="text-xs text-slate-400">{fmtTime(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchUsers(debouncedSearch)}
        />
      )}
    </div>
  );
}
