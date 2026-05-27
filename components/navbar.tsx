"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Zap } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import Logo from "@/components/logo";

const navLinks = [
  { label: "Resume Builder", href: "/builder/resume" },
  { label: "Cover Letter", href: "/builder/cover-letter" },
  { label: "Templates", href: "/resume-templates" },
  { label: "Examples", href: "/resume-examples" },
  { label: "ATS Checker", href: "/ats-checker" },
  { label: "Auto-Apply", href: "/builder/wizard", badge: "NEW" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect login state so logged-in users see "Dashboard" instead of "Log In".
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoaded(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthed(!!user);
      setAuthLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-200"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        boxShadow: scrolled
          ? "0 4px 24px 0 rgba(15,23,42,0.08), 0 1px 4px 0 rgba(15,23,42,0.04)"
          : "0 1px 3px 0 rgba(15,23,42,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Logo href="/" variant="default" size="md" className="flex-shrink-0" />

          {/* Desktop Nav — centered */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: isActive ? "#4AB7A6" : "#475569",
                    backgroundColor: isActive ? "#f0fdf9" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#4AB7A6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#475569";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!authLoaded ? (
              <div className="w-[200px] h-9" />
            ) : isAuthed ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: "#4AB7A6" }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:underline transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/builder/wizard"
                  className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#4AB7A6" }}
                >
                  Build Free Resume
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — slide down */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-slate-100"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium rounded-xl transition-colors"
                  style={{
                    color: isActive ? "#4AB7A6" : "#475569",
                    backgroundColor: isActive ? "#f0fdf9" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {isAuthed ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-center text-white rounded-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#4AB7A6" }}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-center text-slate-700 border border-slate-300 rounded-full hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/builder/wizard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-center text-white rounded-full transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#4AB7A6" }}
                  >
                    Build Free Resume
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
