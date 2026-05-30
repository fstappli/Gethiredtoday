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
} from 'lucide-react';
import Logo from '@/components/logo';

// User info + logout intentionally live ONLY in the header dropdown
// to avoid duplicate profile/logout controls. Do not re-add them here.

const navSections = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/resumes', label: 'My Resumes', icon: FileText },
      { href: '/dashboard/cover-letters', label: 'Cover Letters', icon: Mail },
    ],
  },
  {
    label: 'JOB SEARCH',
    items: [
      { href: '/dashboard/find-jobs', label: 'Find Jobs', icon: Briefcase },
      { href: '/dashboard/applied-jobs', label: 'Applied Jobs', icon: CheckCircle2 },
      { href: '/dashboard/auto-apply', label: 'Auto-Apply', icon: Zap },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { href: '/dashboard/ats-checker', label: 'ATS Checker', icon: Target },
      { href: '/dashboard/templates', label: 'Resume Templates', icon: Layout },
      { href: '/dashboard/examples', label: 'Examples', icon: BookOpen },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { href: '/dashboard/account', label: 'Account Settings', icon: Settings },
      { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

export default function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
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
              {section.items.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: '#4AB7A6' } : {}}
                  >
                    <Icon size={18} className="shrink-0" />
                    {label}
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
    </aside>
  );
}
