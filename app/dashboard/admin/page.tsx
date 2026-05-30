'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Users, TrendingUp, UserCheck, AlertCircle,
  ShoppingCart, Clock, Search, Plus, X, ChevronDown,
  RefreshCw, Shield, ArrowUpRight, KeyRound, Check,
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
  { value: 'active',    label: 'Pro (Active)',  bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  { value: 'trialing',  label: 'Trialing',      bg: '#dbeafe', text: '#1e40af', dot: '#2563eb' },
  { value: 'cancelled', label: 'Cancelled',     bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
  { value: 'free',      label: 'Free',          bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
  { value: 'past_due',  label: 'Past Due',      bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
];

function statusStyle(status: string | null) {
  return STATUS_OPTIONS.find(s => s.value === (status ?? 'free').toLowerCase())
    ?? STATUS_OPTIONS.find(s => s.value === 'free')!;
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function initials(name: string | null, email: string | null) {
  const src = name || email || '?';
  return src.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Status dropdown — portal-rendered so it's never clipped ─────────────────

function StatusDropdown({ userId, current, onChanged }: {
  userId: string;
  current: string | null;
  onChanged: (id: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const style = statusStyle(current);

  const MENU_HEIGHT = 190; // approx height of the dropdown in px

  const openMenu = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const top = spaceBelow < MENU_HEIGHT + 12
      ? r.top - MENU_HEIGHT - 6  // flip above
      : r.bottom + 6;            // default below
    setPos({ top, left: r.left });
    setOpen(true);
  };

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
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-50 select-none"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
        {loading ? 'Saving…' : style.label}
        {!loading && <ChevronDown size={10} />}
      </button>

      {open && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pb-1.5 pt-0.5">
              Change access
            </p>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => change(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left"
                style={{ color: opt.value === (current ?? 'free') ? opt.text : '#374151' }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
                {opt.label}
                {opt.value === (current ?? 'free') && (
                  <span className="ml-auto text-[10px] font-medium" style={{ color: opt.dot }}>current</span>
                )}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
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

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F7F5' }}>
              <Plus size={16} style={{ color: '#4AB7A6' }} />
            </div>
            <h2 className="font-semibold text-slate-900">Create User</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Access level</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/30 focus:border-[#4AB7A6] transition-colors bg-white"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#4AB7A6' }}
            >
              {loading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Reset password button ────────────────────────────────────────────────────

function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const send = async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password' }),
      });
      setState(res.ok ? 'sent' : 'error');
      if (res.ok) setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
    }
  };

  return (
    <button
      onClick={send}
      disabled={state === 'loading' || state === 'sent'}
      title="Send password reset email"
      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all disabled:opacity-60"
      style={
        state === 'sent'
          ? { backgroundColor: '#dcfce7', color: '#166534' }
          : state === 'error'
          ? { backgroundColor: '#fee2e2', color: '#991b1b' }
          : { backgroundColor: '#f1f5f9', color: '#64748b' }
      }
    >
      {state === 'loading' && <RefreshCw size={11} className="animate-spin" />}
      {state === 'sent'    && <Check size={11} />}
      {state === 'idle'    && <KeyRound size={11} />}
      {state === 'error'   && <AlertCircle size={11} />}
      {state === 'sent' ? 'Sent!' : state === 'error' ? 'Failed' : 'Reset pwd'}
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
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
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

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

  const refresh = () => {
    fetchUsers(debouncedSearch);
    fetchAttempts();
    setLastRefreshed(new Date());
  };

  useEffect(() => { fetchUsers(debouncedSearch); }, [debouncedSearch, fetchUsers]);
  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, subscription_status: newStatus } : u));
  };

  // Stats
  const proStatuses = ['active', 'trialing', 'pro'];
  const activePro = users.filter(u => proStatuses.includes((u.subscription_status ?? '').toLowerCase()));
  const convertedEmails = new Set(
    users.filter(u => u.subscription_status && u.subscription_status !== 'free').map(u => u.email)
  );
  const nonConverted = attempts.filter(a => a.email && !convertedEmails.has(a.email));
  const conversionRate = attempts.length > 0 ? Math.round((convertedEmails.size / attempts.length) * 100) : 0;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const newToday = users.filter(u => new Date(u.created_at) >= startOfToday).length;
  const attemptsToday = attempts.filter(a => new Date(a.created_at) >= startOfToday).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F7F5' }}>
              <Shield size={14} style={{ color: '#4AB7A6' }} />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Admin Dashboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1" title="Live" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Updated {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"       value={users.length}      sub={`+${newToday} joined today`}           icon={Users}        color="#4AB7A6" />
          <StatCard label="Active Pro"        value={activePro.length}  sub={`${users.length - activePro.length} on free plan`} icon={UserCheck}    color="#16a34a" />
          <StatCard label="Checkout Clicks"   value={attempts.length}   sub={`${attemptsToday} today`}              icon={ShoppingCart} color="#2563eb" />
          <StatCard label="Conversion Rate"   value={`${conversionRate}%`} sub={`${convertedEmails.size} converted total`} icon={TrendingUp}   color="#7c3aed" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'users',  label: 'Users',     count: users.length },
            { key: 'funnel', label: 'Drop-offs',  count: nonConverted.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'users' | 'funnel')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                activeTab === key
                  ? { backgroundColor: '#4AB7A6', color: '#fff', boxShadow: '0 2px 8px rgba(74,183,166,0.3)' }
                  : { backgroundColor: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }
              }
            >
              {label}
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={activeTab === key ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' } : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Users tab ── */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#4AB7A6]/20 focus-within:border-[#4AB7A6] transition-all">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shrink-0"
                style={{ backgroundColor: '#4AB7A6', boxShadow: '0 2px 8px rgba(74,183,166,0.3)' }}
              >
                <Plus size={15} />
                Create User
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-300">
                <RefreshCw size={22} className="animate-spin" />
                <span className="text-sm">Loading users…</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2">
                <Users size={32} className="text-slate-200" />
                <p className="text-sm text-slate-400">No users found{search ? ` for "${search}"` : ''}.</p>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-slate-50/80 border-b border-slate-100">
                  <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</span>
                  <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access</span>
                  <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</span>
                </div>

                <div className="divide-y divide-slate-50">
                  {users.map(u => (
                    <div key={u.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors group">
                      {/* Avatar + name */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                          style={{ backgroundColor: '#4AB7A6' }}
                        >
                          {initials(u.full_name, u.email)}
                        </div>
                        <span className="text-sm font-medium text-slate-800 truncate">{u.full_name || <span className="text-slate-300 italic">No name</span>}</span>
                      </div>

                      {/* Email */}
                      <div className="col-span-3 min-w-0">
                        <span className="text-sm text-slate-500 truncate block">{u.email}</span>
                      </div>

                      {/* Joined */}
                      <div className="col-span-2">
                        <span className="text-xs text-slate-400">{fmt(u.created_at)}</span>
                      </div>

                      {/* Status dropdown */}
                      <div className="col-span-2">
                        <StatusDropdown userId={u.id} current={u.subscription_status} onChanged={handleStatusChange} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <ResetPasswordButton userId={u.id} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                  <span className="text-xs text-slate-400">{users.length} user{users.length !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ''}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Funnel tab ── */}
        {activeTab === 'funnel' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertCircle size={15} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 text-sm">Upgrade drop-offs</h2>
                  <p className="text-xs text-slate-400">Clicked upgrade · never converted</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{nonConverted.length}</p>
                <p className="text-xs text-slate-400">potential conversions</p>
              </div>
            </div>

            {nonConverted.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2">
                <ArrowUpRight size={32} className="text-slate-200" />
                <p className="text-sm text-slate-400">No drop-offs yet — great conversion rate!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-slate-50/80 border-b border-slate-100">
                  <span className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="col-span-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Came from</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">When</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {nonConverted.slice(0, 100).map(a => (
                    <div key={a.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors">
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-xs font-bold text-amber-700">
                          {(a.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 truncate">{a.email || 'Unknown'}</span>
                      </div>
                      <div className="col-span-4 min-w-0">
                        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded truncate block">{a.from_path || '/'}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-1.5">
                        <Clock size={11} className="text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-400">{fmtTime(a.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                  <span className="text-xs text-slate-400">{nonConverted.length} drop-off{nonConverted.length !== 1 ? 's' : ''} recorded</span>
                </div>
              </>
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
