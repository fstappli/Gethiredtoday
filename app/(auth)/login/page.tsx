'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = safeRedirect(searchParams.get('redirect') ?? searchParams.get('next'));

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setUnconfirmedEmail(null);
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      const raw = error.message ?? '';
      const isUnconfirmed =
        /email not confirmed/i.test(raw) ||
        /email_not_confirmed/i.test(raw) ||
        /confirm your email/i.test(raw);

      if (isUnconfirmed) {
        setUnconfirmedEmail(values.email);
        setServerError(null);
        return;
      }

      setServerError(error.message);
      return;
    }

    try {
      sessionStorage.setItem('dashboard_toast', 'Login successful. Welcome back!');
    } catch {}

    router.push(redirectUrl);
    router.refresh();
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    if (Date.now() < resendCooldownUntil) {
      const secs = Math.ceil((resendCooldownUntil - Date.now()) / 1000);
      setResendMessage({ kind: 'err', text: `Please wait ${secs}s before resending.` });
      return;
    }

    setResending(true);
    setResendMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });
    setResending(false);

    if (error) {
      setResendMessage({
        kind: 'err',
        text: error.message || 'Could not resend. Please try again in a moment.',
      });
      return;
    }

    setResendMessage({
      kind: 'ok',
      text: 'Confirmation email re-sent. Please check your inbox (and spam folder).',
    });
    setResendCooldownUntil(Date.now() + 60_000);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });
    if (error) {
      setServerError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="animate-auth-slide" style={{ '--stagger-delay': '0ms' } as React.CSSProperties}>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="mt-2 text-slate-500">Sign in to continue building your resume</p>
      </div>

      {/* Google button */}
      <div className="animate-auth-slide" style={{ '--stagger-delay': '60ms' } as React.CSSProperties}>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-full font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-[0.98]"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || isSubmitting}
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>
      </div>

      {/* OR divider */}
      <div className="relative animate-auth-slide" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 tracking-wider">or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {unconfirmedEmail && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#fffbeb' }}
              >
                <Mail className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  Please confirm your email first
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  We sent a confirmation link to{' '}
                  <span className="font-semibold">{unconfirmedEmail}</span>. Click the link in that
                  email, then come back and sign in. Check your spam folder if you don&apos;t see
                  it.
                </p>
              </div>
            </div>

            {resendMessage && (
              <div
                className={`text-xs font-medium ${
                  resendMessage.kind === 'ok' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {resendMessage.text}
              </div>
            )}

            <Button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || Date.now() < resendCooldownUntil}
              variant="outline"
              className="w-full h-10 rounded-full border-amber-300 bg-white text-amber-800 hover:bg-amber-100 text-sm font-semibold"
            >
              {resending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Resending…
                </>
              ) : (
                'Resend confirmation email'
              )}
            </Button>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5 animate-auth-slide" style={{ '--stagger-delay': '140ms' } as React.CSSProperties}>
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`h-12 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] transition-all duration-150 ${
              errors.email ? 'border-red-400 focus-visible:ring-red-300' : ''
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500 animate-fade-up">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5 animate-auth-slide" style={{ '--stagger-delay': '190ms' } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium link-animated"
              style={{ color: '#4AB7A6' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`h-12 pr-11 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] transition-all duration-150 ${
                errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''
              }`}
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-150 hover:scale-110"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 animate-fade-up">{errors.password.message}</p>
          )}
        </div>

        <div className="animate-auth-slide" style={{ '--stagger-delay': '240ms' } as React.CSSProperties}>
        <Button
          type="submit"
          className="w-full h-12 font-semibold rounded-full text-white active:scale-[0.98]"
          style={{ backgroundColor: '#4AB7A6', boxShadow: '0 4px 14px rgba(74,183,166,0.35)' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
        </div>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-slate-500 animate-auth-slide" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
        Don&apos;t have an account?{' '}
        <Link
          href={`/signup${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="font-semibold link-animated"
          style={{ color: '#4AB7A6' }}
        >
          Create one →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
