'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Target,
  Layout,
  BookOpen,
  Settings,
  CreditCard,
  Briefcase,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import Logo from '@/components/logo';

const navSections = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard',               label: 'Dashboard',         icon: LayoutDashboard, exact: true,  proOnly: false },
      { href: '/dashboard/resumes',        label: 'My Resumes',        icon: FileText,                      proOnly: false },
      { href: '/dashboard/cover-letters',  label: 'Cover Letters',     icon: Mail,                          proOnly: true  },
    ],
  },
  {
    label: 'JOB SEARCH',
    items: [
      { href: '/dashboard/find-jobs',    label: 'Find Jobs',    icon: Briefcase,    proOnly: true },
      { href: '/dashboard/applied-jobs', label: 'Applied Jobs', icon: CheckCircle2, proOnly: true },
      { href: '/dashboard/auto-apply',   label: 'Auto-Apply',  icon: Zap,          proOnly: true },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { href: '/dashboard/ats-checker', label: 'ATS Checker',       icon: Target,   proOnly: true  },
      { href: '/dashboard/templates',   label: 'Resume Templates',   icon: Layout,   proOnly: false },
      { href: '/dashboard/examples',    label: 'Examples',           icon: BookOpen, proOnly: false },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { href: '/dashboard/account', label: 'Account Settings', icon: Settings,   proOnly: false },
      { href: '/dashboard/billing', label: 'Billing',          icon: CreditCard, proOnly: false },
    ],
  },
];

export default function DashboardSidebar({ isAdmin = false, isPro = false }: { isAdmin?: boolean; isPro?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 flex flex-col bg-white border-r border-slate-100 h-full overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
        <Logo href="/dashboard" variant="default" size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact, proOnly }) => {
                const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
                const locked = proOnly && !isPro;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : locked
                        ? 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: '#4AB7A6' } : {}}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {locked && !isActive && (
                      <Lock size={13} className="shrink-0 text-slate-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin — only visible to kreativecasaentertainment@gmail.com */}
        {isAdmin && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
              Admin
            </p>
            <div className="space-y-0.5">
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard/admin'
                    ? 'text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={pathname === '/dashboard/admin' ? { backgroundColor: '#4AB7A6' } : {}}
              >
                <ShieldCheck size={18} className="shrink-0" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Free upgrade nudge at bottom of sidebar */}
      {!isPro && (
        <div className="p-3 border-t border-slate-100 shrink-0">
          <Link
            href="/upgrade?from=%2Fdashboard"
            className="flex flex-col gap-1 rounded-xl p-3 text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
              boxShadow: '0 4px 12px -3px rgba(74,183,166,0.5)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Zap size={13} />
              Upgrade to Pro
            </div>
            <p className="text-[11px] text-white/80 leading-snug">
              Unlock all features · $9.99/mo
            </p>
          </Link>
        </div>
      )}
    </aside>
  );
}
