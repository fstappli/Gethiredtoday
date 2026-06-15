'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Mail,
  Target,
  Briefcase,
  Zap,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isProActive } from '@/lib/subscription';
import Logo from '@/components/logo';

const mobileNavItems = [
  { href: '/dashboard',               label: 'Dashboard',      icon: LayoutDashboard, proOnly: false },
  { href: '/dashboard/resumes',        label: 'My Resumes',     icon: FileText,        proOnly: false },
  { href: '/dashboard/cover-letters',  label: 'Cover Letters',  icon: Mail,            proOnly: true  },
  { href: '/dashboard/find-jobs',      label: 'Find Jobs',      icon: Briefcase,       proOnly: true  },
  { href: '/dashboard/auto-apply',     label: 'Auto-Apply',     icon: Zap,             proOnly: true  },
  { href: '/dashboard/ats-checker',    label: 'ATS Checker',    icon: Target,          proOnly: true  },
  { href: '/dashboard/account',        label: 'Account',        icon: User,            proOnly: false },
  { href: '/dashboard/billing',        label: 'Billing',        icon: CreditCard,      proOnly: false },
];

export default function DashboardHeader({ isPro: initialIsPro = false }: { isPro?: boolean }) {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creating] = useState(false);
  const [isPro, setIsPro] = useState(initialIsPro);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserName(
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        'User'
      );
      setUserEmail(user.email ?? '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, full_name')
        .eq('id', user.id)
        .single();
      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
      setIsPro(isProActive(profile));
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('[logout] signOut failed:', e);
    }
    // Hard redirect to the homepage so any in-memory auth state is cleared
    // and the user lands on the public marketing page (per UX expectation).
    window.location.assign('/');
  };

  const handleNewResume = async () => {
    // Route to the guided wizard flow — it handles template picking + resume creation.
    router.push('/builder/wizard');
  };

  const initials = userName
    ? userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3 shrink-0 z-30 sticky top-0">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo (hidden on desktop — sidebar has it) */}
        <div className="lg:hidden flex-1">
          <Logo href="/dashboard" size="sm" />
        </div>

        {/* Spacer on desktop */}
        <div className="hidden lg:flex flex-1" />

        {/* Right side: New Resume + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Resume button — visible to all users */}
          <button
            onClick={handleNewResume}
            disabled={creating}
            className="flex items-center gap-1.5 text-sm font-medium text-white rounded-full px-3 sm:px-4 py-2 transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#4AB7A6' }}
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">New Resume</span>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: '#4AB7A6' }}
              >
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {userName || '…'}
              </span>
              {isPro && (
                <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: '#4AB7A6' }}>
                  PRO
                </span>
              )}
              <ChevronDown
                className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {/* User info — show full name (no truncation) and email.
                    Widened the dropdown and removed the truncate so the
                    user's full name is visible at a glance. */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold text-gray-800 break-words leading-tight" title={userName}>
                      {userName}
                    </p>
                    {isPro && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: '#4AB7A6' }}>
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 break-all mt-0.5" title={userEmail}>
                    {userEmail}
                  </p>
                </div>
                <Link
                  href="/dashboard/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Account Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  Billing
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100">
              <Logo href="/dashboard" size="md" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
              {mobileNavItems.map(({ href, label, icon: Icon, proOnly }) => {
                const locked = proOnly && !isPro;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      locked ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="flex-1">{label}</span>
                    {locked && <Lock className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile user section */}
            <div className="border-t border-gray-100 px-3 py-4 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: '#4AB7A6' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold text-gray-800 break-words leading-tight" title={userName}>
                      {userName || '…'}
                    </p>
                    {isPro && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: '#4AB7A6' }}>
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 break-all mt-0.5" title={userEmail}>{userEmail}</p>
                </div>
              </div>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
