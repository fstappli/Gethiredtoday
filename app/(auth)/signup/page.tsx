'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Check, Zap, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((p) => !/\s/.test(p), {
        message: 'Password cannot contain spaces',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;
type Plan = 'free' | 'pro';

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

function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (password.length === 0) return { level: 0, label: '' };
  if (password.length < 6) return { level: 1, label: 'Weak' };
  if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  ) {
    return { level: 3, label: 'Strong' };
  }
  return { level: 2, label: 'Fair' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label } = getPasswordStrength(password);
  if (!password) return null;

  const colors: Record<number, string> = {
    1: '#ef4444',
    2: '#f59e0b',
    3: '#22c55e',
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: level >= seg ? colors[level] : '#e2e8f0',
            }}
          />
        ))}
      </div>
      {label && (
        <p
          className="text-xs font-medium"
          style={{ color: colors[level] }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

const PLANS: Array<{
  id: Plan;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
}> = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 resume', '3 templates', 'Basic ATS check', 'TXT download only'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    badge: 'Recommended',
    features: ['Unlimited resumes', 'All 60+ templates', 'PDF + Word download', 'AI writing tools', 'Cover letter builder'],
  },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  // When Supabase has email confirmation enabled, signUp() returns a user but
  // no session. We surface a dedicated "check your inbox" state so the user is
  // never left wondering why they can't log in.
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    email: string;
  } | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [resendCooldownUntil, setResendCooldownUntil] = useState<number>(0);

  useEffect(() => {
    if (searchParams.get('plan') === 'pro') {
      setSelectedPlan('pro');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const watchedPassword = watch('password', '');

  useEffect(() => {
    setPasswordValue(watchedPassword ?? '');
  }, [watchedPassword]);

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        // Send the user back to our auth callback after they click the
        // confirmation link. The callback exchanges the code for a session
        // and redirects to /dashboard.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    // If Supabase has email confirmation enabled, signUp() returns a user
    // without a session. The old flow redirected to /dashboard which silently
    // kicked the user back to /login — now we show a clear "check your
    // inbox" state with a resend button so the user always knows what to do.
    if (data.user && !data.session) {
      // Save pro intent so dashboard can resume checkout after email confirmation
      if (selectedPlan === 'pro') {
        try { sessionStorage.setItem('pending_plan', 'pro'); } catch {}
      }
      setPendingConfirmation({ email: values.email });
      // Light 60-second cooldown to discourage hammering the resend button
      setResendCooldownUntil(Date.now() + 60_000);
      return;
    }

    if (selectedPlan === 'pro' && data.user) {
      window.location.href = '/api/lemonsqueezy/checkout-redirect?from=/dashboard';
      return;
    }

    // Fire Google Ads sign-up conversion
    try {
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-862628997/cOF0CO6vvbUcEIXZqpsD',
          value: 1.0,
          currency: 'AED',
        });
      }
    } catch {}

    setSuccess(true);
    try {
      sessionStorage.setItem('dashboard_toast', 'Account created! Welcome to GetHiredToday.');
    } catch {}
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  // Resend the signup confirmation email for a user who hasn't confirmed yet.
  // Rate-limited to once per 60 seconds on the client to match Supabase's own
  // server-side throttle (which otherwise returns an unhelpful error).
  const handleResendConfirmation = async () => {
    if (!pendingConfirmation) return;
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
      email: pendingConfirmation.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('root', { message: error.message || 'Google sign-up failed. Please try again.' });
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#f0fdf9' }}
        >
          <Check className="w-8 h-8" style={{ color: '#4AB7A6' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Account created!</h2>
          <p className="text-slate-500 text-sm mt-1">Taking you to your dashboard…</p>
        </div>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#4AB7A6' }} />
      </div>
    );
  }

  // Shown when Supabase requires the user to click a link in their email
  // before the account is active. Clear, explicit, resendable — no more silent
  // "nothing happens after signup".
  if (pendingConfirmation) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#f0fdf9' }}
          >
            <Mail className="w-8 h-8" style={{ color: '#4AB7A6' }} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Check your inbox</h1>
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            We just sent a confirmation link to{' '}
            <span className="font-semibold text-slate-900">{pendingConfirmation.email}</span>.
            Click the link to activate your account and start building your resume.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800 mb-1">
            Can&apos;t find it? Here&apos;s what to do:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Check your <span className="font-semibold">Spam</span> or{' '}
              <span className="font-semibold">Junk</span> folder — the email may have landed there.
            </li>
            <li>
              Look for a sender like{' '}
              <span className="font-mono">noreply@hiredtodayapp.com</span> (or a Supabase address if
              custom SMTP isn&apos;t configured yet).
            </li>
            <li>
              Double-check the email address above. If it&apos;s wrong, click &ldquo;Use a different
              email&rdquo; below.
            </li>
          </ul>
        </div>

        {resendMessage && (
          <div
            className={`p-3 rounded-xl text-sm border ${
              resendMessage.kind === 'ok'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {resendMessage.text}
          </div>
        )}

        <Button
          type="button"
          onClick={handleResendConfirmation}
          disabled={resending || Date.now() < resendCooldownUntil}
          className="w-full h-12 rounded-full text-white font-medium"
          style={{ backgroundColor: '#4AB7A6' }}
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resending…
            </>
          ) : (
            'Resend confirmation email'
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setPendingConfirmation(null);
              setResendMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Use a different email
          </button>
          <Link
            href="/login"
            className="font-semibold"
            style={{ color: '#4AB7A6' }}
          >
            Already confirmed? Log in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create your free account</h1>
        <p className="mt-2 text-slate-500">
          Start building your resume in minutes. No credit card required.
        </p>
      </div>

      {/* Google button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-full font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
        onClick={handleGoogleSignUp}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      {/* OR divider */}
      <div className="relative">
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

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            className={`h-12 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] ${
              errors.fullName ? 'border-red-400 focus-visible:ring-red-300' : ''
            }`}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`h-12 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] ${
              errors.email ? 'border-red-400 focus-visible:ring-red-300' : ''
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters, no spaces"
              className={`h-12 pr-11 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] ${
                errors.password ? 'border-red-400 focus-visible:ring-red-300' : ''
              }`}
              onKeyDown={(e) => {
                // Spaces are not allowed in passwords — block at the keystroke
                // level so the user gets immediate feedback and never ends up
                // with an invisible trailing space.
                if (e.key === ' ') e.preventDefault();
              }}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={passwordValue} />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`h-12 pr-11 rounded-xl border-slate-200 focus-visible:ring-[#4AB7A6] ${
                errors.confirmPassword ? 'border-red-400 focus-visible:ring-red-300' : ''
              }`}
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Plan selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Choose your plan</Label>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4AB7A6] ${
                    isSelected
                      ? 'border-[#4AB7A6] bg-[#f0fdf9]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span
                      className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: '#4AB7A6' }}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      {plan.badge}
                    </span>
                  )}
                  <div className="font-semibold text-slate-900 text-sm">{plan.name}</div>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span
                      className="text-xl font-bold"
                      style={{ color: isSelected ? '#4AB7A6' : '#0f172a' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400">/{plan.period}</span>
                  </div>
                  <ul className="mt-2.5 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#4AB7A6' }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold rounded-full text-white"
          style={{ backgroundColor: '#4AB7A6' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create Account →'
          )}
        </Button>

        <p className="text-center text-xs text-slate-400">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
        </p>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#4AB7A6] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
