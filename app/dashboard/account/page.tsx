'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Camera,
  Loader2,
  CheckCircle,
  Crown,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase';
import { isProActive, isCancelledWithGrace, formatEndsAt } from '@/lib/subscription';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((p) => !/\s/.test(p), {
        message: 'Password cannot contain spaces',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real subscription status from the profiles table (was hardcoded to false).
  const [isPro, setIsPro] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [subEndsAt, setSubEndsAt] = useState<string | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '' },
  });

  // Load real user + subscription status on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      profileForm.reset({
        fullName:
          profile?.full_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          '',
        email: user.email ?? '',
      });
      if (profile?.avatar_url || user.user_metadata?.avatar_url) {
        setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url);
      }
      setIsPro(isProActive(profile));
      setIsCancelled(isCancelledWithGrace(profile));
      setSubEndsAt((profile?.subscription_ends_at as string | null) ?? null);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side guards before hitting Supabase
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setProfileError('Unsupported image format. Please upload a JPG, PNG, or WebP file.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Photo is larger than 5MB. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    setAvatarUploading(true);
    setProfileError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You need to be signed in to upload a photo.');

      // Normalise extension from MIME type so upload paths are predictable
      // regardless of whether the original filename had an extension.
      const extFromMime =
        file.type === 'image/jpeg' ? 'jpg' :
        file.type === 'image/png'  ? 'png' :
        file.type === 'image/webp' ? 'webp' :
        (file.name.split('.').pop() ?? 'jpg');
      const path = `${user.id}/avatar.${extFromMime}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

      if (uploadError) {
        // Supabase-specific: surface the message (bucket missing, RLS denied, etc.)
        throw new Error(
          uploadError.message ||
          'Upload failed. If this keeps happening, the avatars storage bucket may not be set up yet.'
        );
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
      // Add a cache-buster so the <img> re-fetches when the same path is
      // overwritten (upsert: true keeps the same URL).
      const publicUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      // Persist to profiles table so the avatar survives a refresh.
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      if (profileUpdateError) {
        console.warn('profiles.avatar_url update failed', profileUpdateError);
      }

      // Also mirror into auth metadata as a fallback source.
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      setAvatarUrl(publicUrl);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Avatar upload failed', err);
      setProfileError(
        err instanceof Error && err.message
          ? err.message
          : 'Photo upload failed. Please try again.'
      );
    } finally {
      setAvatarUploading(false);
      // Reset the input so re-picking the same file triggers onChange again.
      e.target.value = '';
    }
  };

  const onProfileSubmit = async (values: ProfileValues) => {
    setProfileError(null);
    setProfileSuccess(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      email: values.email,
      data: { full_name: values.fullName },
    });

    if (error) {
      setProfileError(error.message);
      return;
    }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    const supabase = createClient();

    // Re-authenticate first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setPasswordError('Unable to verify current user');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: values.currentPassword,
    });

    if (signInError) {
      setPasswordError('Current password is incorrect');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSuccess(true);
    passwordForm.reset();
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Profile
          </h2>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-opacity"
                style={{ backgroundColor: '#4AB7A6' }}
                aria-label="Upload avatar"
              >
                {avatarUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Profile photo</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP · max 5MB</p>
            </div>
          </div>

          <Separator />

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4" noValidate>
            {profileError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Profile updated successfully
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full name</Label>
              <Input
                id="fullName"
                className={`h-10 ${profileForm.formState.errors.fullName ? 'border-red-400' : ''}`}
                {...profileForm.register('fullName')}
              />
              {profileForm.formState.errors.fullName && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                className={`h-10 ${profileForm.formState.errors.email ? 'border-red-400' : ''}`}
                {...profileForm.register('email')}
              />
              {profileForm.formState.errors.email && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="rounded-full font-medium text-white"
              style={{ backgroundColor: '#4AB7A6' }}
              disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
            >
              {profileForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            Change Password
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Password changed successfully
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                className="h-10"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Min. 8 characters, no spaces"
                className="h-10"
                onKeyDown={(e) => {
                  // Spaces are not allowed in passwords — block keystroke.
                  if (e.key === ' ') e.preventDefault();
                }}
                {...passwordForm.register('newPassword')}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="h-10"
                onKeyDown={(e) => {
                  if (e.key === ' ') e.preventDefault();
                }}
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="rounded-full font-medium text-white"
              style={{ backgroundColor: '#4AB7A6' }}
              disabled={passwordForm.formState.isSubmitting || !passwordForm.formState.isDirty}
            >
              {passwordForm.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Subscription
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {isPro ? 'Pro Plan' : 'Free Plan'}
                {isCancelled && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}
                  >
                    Cancelling
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPro && isCancelled && subEndsAt
                  ? `Pro access continues until ${formatEndsAt(subEndsAt)}. You won't be charged again.`
                  : isPro
                  ? 'You have full access to all features'
                  : 'Upgrade to unlock AI features and unlimited resumes'}
              </p>
            </div>

            {isPro ? (
              <Button
                variant="outline"
                className="rounded-full font-medium border-gray-200"
                onClick={() => window.location.href = '/dashboard/billing'}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Manage
              </Button>
            ) : (
              <Button
                className="rounded-full font-medium text-white"
                style={{ backgroundColor: '#4AB7A6' }}
                onClick={() => {
                  window.location.href = '/upgrade?from=%2Fdashboard%2Faccount';
                }}
              >
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
