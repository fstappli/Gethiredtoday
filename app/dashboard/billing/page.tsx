'use client';

import { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Loader2,
  CreditCard,
  AlertTriangle,
  Zap,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase';
import { isProActive, isCancelledWithGrace, formatEndsAt } from '@/lib/subscription';

const PRO_FEATURES = [
  'Unlimited resumes & cover letters',
  'AI-powered writing & suggestions',
  'ATS compatibility analysis',
  'Priority customer support',
  'All premium templates',
];


export default function BillingPage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberSince, setMemberSince] = useState<string>('');
  const [activatedAt, setActivatedAt] = useState<Date | null>(null);
  const [subEndsAt, setSubEndsAt] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [gumroadCancelled, setGumroadCancelled] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, created_at, updated_at')
        .eq('id', user.id)
        .single();
      // Use the central helper so "cancelled but still within grace" counts
      // as Pro. Without this, paying users briefly lost their Pro UI the
      // moment they hit cancel.
      setIsPro(isProActive(profile));
      setCancelled(isCancelledWithGrace(profile) || profile?.subscription_status === 'cancelled');
      setSubEndsAt((profile?.subscription_ends_at as string | null) ?? null);
      if (profile?.created_at) {
        setMemberSince(new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      }
      if (isProActive(profile) && profile?.updated_at) {
        setActivatedAt(new Date(profile.updated_at));
      }
      setLoading(false);

      // Billing history is managed by Gumroad — no local invoices to fetch.
    });
  }, []);

  const handleUpgrade = () => {
    setUpgradeLoading(true);
    // Carry the current path as `from` so the user bounces back here after
    // payment with Pro status already reflected.
    const from = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
    window.location.href = `/upgrade?from=${encodeURIComponent(from)}`;
  };

  const handleManageSubscription = () => {
    window.open('https://app.gumroad.com/library', '_blank', 'noopener,noreferrer');
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError(null);
    setCancelMessage(null);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setCancelError(
          json?.error ||
          'We could not cancel your subscription. Please contact support and we\'ll take care of it.'
        );
        return;
      }
      // Flip the UI in place — no redirect. Keep isPro so the user still
      // sees their Pro benefits until the billing period ends.
      setCancelled(true);
      setShowCancelConfirm(false);
      setGumroadCancelled(json.gumroadCancelled === true);
      setCancelMessage(
        json.gumroadCancelled === true
          ? (json.message || 'Subscription cancelled. Your Pro access remains active until the end of your current billing period.')
          : null
      );
    } catch {
      setCancelError('Network error. Please try again in a moment.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Prefer the real subscription_ends_at from the DB. Fall back to a
  // computed "activated_at + 1 month" if we don't have one (older users
  // who signed up before the ends_at column existed).
  const nextBillingDate = (() => {
    if (subEndsAt) return formatEndsAt(subEndsAt);
    const base = activatedAt ? new Date(activatedAt) : new Date();
    base.setMonth(base.getMonth() + 1);
    return base.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  })();


  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and payment details</p>
      </div>

      {/* Current Plan */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Current Plan
          </h2>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">Pro Plan</span>
                    {cancelled ? (
                      <Badge
                        className="text-xs rounded-full"
                        style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                      >
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge
                        className="text-white text-xs rounded-full"
                        style={{ backgroundColor: '#4AB7A6' }}
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#4AB7A6' }}>
                    $9.99<span className="text-sm font-normal text-gray-400">/month</span>
                  </p>
                  {cancelled ? (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Pro access continues until <span className="font-semibold text-gray-700">{nextBillingDate}</span>. You won&apos;t be charged again.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-0.5">Next billing date: {nextBillingDate}</p>
                  )}
                  {memberSince && <p className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</p>}
                </div>
                {!cancelled && (
                  <Button
                    variant="outline"
                    className="rounded-full font-medium border-gray-200"
                    onClick={handleManageSubscription}
                    disabled={upgradeLoading}
                  >
                    {upgradeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage'}
                  </Button>
                )}
              </div>

              {/* Post-cancellation banners */}
              {cancelled && gumroadCancelled === true && cancelMessage && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">{cancelMessage}</p>
                </div>
              )}
              {cancelled && gumroadCancelled === false && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-amber-800">
                      One more step to stop future charges
                    </p>
                    <p className="text-sm text-amber-700">
                      We updated your account, but we couldn&apos;t automatically cancel your Gumroad subscription. To make sure you&apos;re not charged again, please cancel directly on Gumroad.
                    </p>
                    <a
                      href="https://app.gumroad.com/library"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-semibold text-amber-900 underline hover:text-amber-700 transition-colors"
                    >
                      Cancel on Gumroad →
                    </a>
                  </div>
                </div>
              )}

              <Separator />

              <ul className="space-y-1.5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#4AB7A6' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Separator />

              {cancelled ? (
                <Button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="rounded-full text-white font-semibold"
                  style={{ backgroundColor: '#4AB7A6' }}
                >
                  {upgradeLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting…</>
                  ) : (
                    <><Crown className="w-4 h-4 mr-2" />Resubscribe to Pro — $9.99/mo</>
                  )}
                </Button>
              ) : !showCancelConfirm ? (
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
                  onClick={() => {
                    setShowCancelConfirm(true);
                    setCancelError(null);
                  }}
                >
                  Cancel subscription
                </button>
              ) : (
                <div className="p-4 rounded-xl border border-red-100 bg-red-50 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Cancel your subscription?</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        You&apos;ll lose access to Pro features at the end of your billing period. You can re-subscribe any time.
                      </p>
                    </div>
                  </div>
                  {cancelError && (
                    <p className="text-xs font-medium text-red-600 bg-white border border-red-100 rounded-lg px-3 py-2">
                      {cancelError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-gray-200"
                      onClick={() => {
                        setShowCancelConfirm(false);
                        setCancelError(null);
                      }}
                      disabled={cancelLoading}
                    >
                      Keep subscription
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full bg-red-500 hover:bg-red-600 text-white font-medium"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Cancelling…</>
                      ) : (
                        'Yes, cancel'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">Free Plan</span>
                    <Badge variant="outline" className="text-xs rounded-full text-gray-500 border-gray-200">
                      Current
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Limited to 1 resume, basic templates only</p>
                </div>
              </div>

              <div
                className="rounded-xl p-5 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa090 100%)' }}
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-white/90" />
                    <span className="font-bold text-lg">Upgrade to Pro</span>
                    <span className="ml-auto text-2xl font-bold">$9.99<span className="text-sm font-normal opacity-80">/mo</span></span>
                  </div>
                  <ul className="space-y-1">
                    {PRO_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/90">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-2 bg-white font-semibold rounded-full hover:bg-gray-50 transition-colors"
                    style={{ color: '#4AB7A6' }}
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                  >
                    {upgradeLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting…</>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Now – $9.99/month
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      {isPro && (
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              Payment Method
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-gray-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Managed via Gumroad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Billing History
          </h2>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-sm text-gray-500">
            Your receipts and invoices are managed by Gumroad.{' '}
            <a
              href="https://app.gumroad.com/library"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-gray-700 transition-colors"
            >
              View in Gumroad →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
