import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import {
  Users, TrendingUp, CreditCard, AlertCircle,
  UserCheck, ShoppingCart, ArrowUpRight, Clock,
} from 'lucide-react';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function statusBadge(status: string | null) {
  const s = (status ?? 'free').toLowerCase();
  const map: Record<string, { label: string; bg: string; text: string }> = {
    active:    { label: 'Active',    bg: '#dcfce7', text: '#166534' },
    trialing:  { label: 'Trialing',  bg: '#dbeafe', text: '#1e40af' },
    pro:       { label: 'Pro',       bg: '#dcfce7', text: '#166534' },
    cancelled: { label: 'Cancelled', bg: '#fef9c3', text: '#854d0e' },
    past_due:  { label: 'Past Due',  bg: '#fee2e2', text: '#991b1b' },
    free:      { label: 'Free',      bg: '#f1f5f9', text: '#475569' },
  };
  const c = map[s] ?? map.free;
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

// ── Page (Server Component) ──────────────────────────────────────────────────

export default async function AdminPage() {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const admin = createAdminSupabaseClient();

  const [profilesRes, attemptsRes] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, email, subscription_status, subscription_ends_at, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('checkout_attempts')
      .select('id, user_id, email, from_path, created_at')
      .order('created_at', { ascending: false }),
  ]);

  const profiles: Profile[] = profilesRes.data ?? [];
  const attempts: CheckoutAttempt[] = attemptsRes.data ?? [];

  // ── Derived stats ──────────────────────────────────────────────────────────
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek  = new Date(startOfToday); startOfWeek.setDate(startOfToday.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalUsers      = profiles.length;
  const newToday        = profiles.filter(p => new Date(p.created_at) >= startOfToday).length;
  const newThisWeek     = profiles.filter(p => new Date(p.created_at) >= startOfWeek).length;
  const newThisMonth    = profiles.filter(p => new Date(p.created_at) >= startOfMonth).length;

  const proStatuses = ['active', 'trialing', 'pro'];
  const activePro   = profiles.filter(p => proStatuses.includes((p.subscription_status ?? '').toLowerCase()));
  const cancelled   = profiles.filter(p => (p.subscription_status ?? '').toLowerCase() === 'cancelled');
  const everUpgraded = profiles.filter(p => p.subscription_status && p.subscription_status !== 'free');

  const totalAttempts    = attempts.length;
  const attemptsToday    = attempts.filter(a => new Date(a.created_at) >= startOfToday).length;
  const convertedEmails  = new Set(everUpgraded.map(p => p.email).filter(Boolean));
  const nonConverted     = attempts.filter(a => a.email && !convertedEmails.has(a.email));
  const conversionRate   = totalAttempts > 0
    ? Math.round((convertedEmails.size / totalAttempts) * 100)
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live data · {now.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',       value: totalUsers,      sub: `+${newToday} today`,      icon: Users,        color: '#4AB7A6' },
            { label: 'Active Pro',        value: activePro.length, sub: `${cancelled.length} cancelled`, icon: UserCheck,   color: '#16a34a' },
            { label: 'Checkout Attempts', value: totalAttempts,   sub: `${attemptsToday} today`,  icon: ShoppingCart, color: '#2563eb' },
            { label: 'Conversion Rate',   value: `${conversionRate}%`, sub: `${convertedEmails.size} converted`, icon: TrendingUp, color: '#7c3aed' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-slate-500 font-medium">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Signup trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" style={{ color: '#4AB7A6' }} />
            Signup Trend
          </h2>
          <div className="flex gap-6">
            {[
              { label: 'Today',      value: newToday },
              { label: 'This Week',  value: newThisWeek },
              { label: 'This Month', value: newThisMonth },
              { label: 'All Time',   value: totalUsers },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active subscribers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <CreditCard className="w-4 h-4" style={{ color: '#4AB7A6' }} />
            <h2 className="font-semibold text-slate-800 text-sm">Subscribers ({everUpgraded.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {everUpgraded.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-6 italic">No subscribers yet.</p>
            ) : (
              everUpgraded.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.full_name || '—'}</p>
                    <p className="text-xs text-slate-400 truncate">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {statusBadge(p.subscription_status)}
                    {p.subscription_ends_at && (
                      <span className="text-xs text-slate-400">
                        ends {fmtDate(p.subscription_ends_at)}
                      </span>
                    )}
                    <span className="text-xs text-slate-300">joined {fmtDate(p.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Non-converted checkout attempts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-slate-800 text-sm">
              Dropped at Checkout ({nonConverted.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {nonConverted.length === 0 ? (
              <p className="text-sm text-slate-400 px-5 py-6 italic">No drop-offs yet.</p>
            ) : (
              nonConverted.slice(0, 50).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.email || 'Unknown'}</p>
                    <p className="text-xs text-slate-400 truncate">from: {a.from_path || '/'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-xs text-slate-400">{fmt(a.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <Users className="w-4 h-4" style={{ color: '#4AB7A6' }} />
            <h2 className="font-semibold text-slate-800 text-sm">All Users ({totalUsers})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.full_name || '—'}</p>
                  <p className="text-xs text-slate-400 truncate">{p.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {statusBadge(p.subscription_status)}
                  <span className="text-xs text-slate-300">{fmtDate(p.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
