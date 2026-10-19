'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const card = 'flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[22px]';
const input = 'min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white p-3 text-base font-normal';
const lbl = 'flex flex-col gap-1.5 text-sm font-semibold';
const secondaryBtn = 'min-h-[44px] rounded-[10px] border-[1.5px] border-line-strong bg-white px-3.5 font-bold';
const checkbox = 'h-[22px] w-[22px] accent-[#0B6E5F]';

interface Meta {
  job_prefs?: { role?: string; locations?: string };
  notifications?: { daily_matches?: boolean; follow_ups?: boolean };
}

const NAV = [
  ['profile', 'Profile'],
  ['prefs', 'Job preferences'],
  ['notif', 'Notifications'],
  ['signin', 'Sign-in'],
  ['data', 'Privacy & data'],
] as const;

export default function AccountPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [locations, setLocations] = useState('');
  const [dailyMatches, setDailyMatches] = useState(true);
  const [followUps, setFollowUps] = useState(true);
  const [productEmails, setProductEmails] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [status, setStatus] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const flash = (id: string, ok: boolean, text: string) => {
    setStatus({ id, ok, text });
    setTimeout(() => setStatus((s) => (s?.id === id ? null : s)), 4000);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, unsubscribed_at').eq('id', user.id).single();
      const full = (profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? '') as string;
      const [f, ...rest] = full.trim().split(/\s+/);
      setFirst(f ?? '');
      setLast(rest.join(' '));
      setEmail(user.email ?? '');
      setPhone((user.user_metadata?.phone as string) ?? '');
      setAvatar((profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null) as string | null);
      const meta = user.user_metadata as Meta;
      setRole(meta.job_prefs?.role ?? '');
      setLocations(meta.job_prefs?.locations ?? '');
      setDailyMatches(meta.notifications?.daily_matches ?? true);
      setFollowUps(meta.notifications?.follow_ups ?? true);
      setProductEmails(!profile?.unsubscribed_at);
      setProviders((user.identities ?? []).map((i) => i.provider));
    });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const fullName = `${first} ${last}`.trim();
    const { data: { user } } = await supabase.auth.getUser();
    const emailChanged = user?.email && user.email !== email;
    const { error } = await supabase.auth.updateUser({ ...(emailChanged ? { email } : {}), data: { full_name: fullName, phone } });
    if (user) await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    if (error) flash('profile', false, error.message);
    else flash('profile', true, emailChanged ? 'Saved. Check your new email to confirm the change.' : 'Saved.');
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return flash('profile', false, 'Use a JPG, PNG or WebP photo.');
    if (file.size > 5 * 1024 * 1024) return flash('profile', false, 'Photo must be under 5 MB.');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
    if (error) return flash('profile', false, error.message || 'Upload failed.');
    const url = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setAvatar(url);
    flash('profile', true, 'Photo updated.');
  };

  const savePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createClient().auth.updateUser({ data: { job_prefs: { role: role.trim(), locations: locations.trim() } } });
    flash('prefs', !error, error ? error.message : 'Saved.');
  };

  const saveNotif = async (next: { daily?: boolean; follow?: boolean; product?: boolean }) => {
    const d = next.daily ?? dailyMatches;
    const f = next.follow ?? followUps;
    const p = next.product ?? productEmails;
    setDailyMatches(d); setFollowUps(f); setProductEmails(p);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.auth.updateUser({ data: { notifications: { daily_matches: d, follow_ups: f } } });
    if (user) await supabase.from('profiles').update({ unsubscribed_at: p ? null : new Date().toISOString() }).eq('id', user.id);
    flash('notif', !error, error ? error.message : 'Saved.');
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return flash('signin', false, 'Use at least 8 characters.');
    if (pw !== pw2) return flash('signin', false, 'Passwords do not match.');
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (!error) { setPw(''); setPw2(''); }
    flash('signin', !error, error ? error.message : 'Password updated.');
  };

  const downloadData = async () => {
    const res = await fetch('/api/resume', { cache: 'no-store' });
    const body = res.ok ? await res.json() : { resumes: [] };
    const blob = new Blob([JSON.stringify({ email, name: `${first} ${last}`.trim(), resumes: body.resumes }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gethiredtoday-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  const msg = (id: string) => (status?.id === id ? <span role="status" className={`text-sm font-semibold ${status.ok ? 'text-brand-dark' : 'text-danger-ink'}`}>{status.text}</span> : null);
  const initial = (first || email || 'U').charAt(0).toUpperCase();

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-wrap items-start gap-6 px-5 pb-14 pt-7">
      <nav aria-label="Settings" className="flex max-w-[260px] min-w-0 flex-[1_1_220px] flex-col gap-1">
        <h1 className="font-display m-0 mb-3 text-[30px]">Settings</h1>
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="flex min-h-[44px] items-center rounded-[10px] px-3.5 font-bold text-text-muted no-underline hover:bg-mint-soft hover:text-brand-dark">{label}</a>
        ))}
        <Link href="/dashboard/billing" className="flex min-h-[44px] items-center rounded-[10px] px-3.5 font-bold text-text-muted no-underline hover:bg-mint-soft hover:text-brand-dark">Plan &amp; billing</Link>
        <button type="button" onClick={logout} className="mt-3 flex min-h-[44px] items-center rounded-[10px] px-3.5 text-left font-bold text-text-muted hover:bg-mint-soft">Log out</button>
      </nav>

      <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
        <form id="profile" onSubmit={saveProfile} className={card}>
          <h2 className="font-display m-0 text-[22px]">Profile</h2>
          <div className="flex items-center gap-3.5">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Your profile photo" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-full bg-ink text-2xl font-extrabold text-white">{initial}</span>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} className="sr-only" aria-label="Upload profile photo" tabIndex={-1} />
            <button type="button" onClick={() => fileRef.current?.click()} className={secondaryBtn}>Change photo</button>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
            <label className={lbl}>First name<input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" className={input} /></label>
            <label className={lbl}>Last name<input value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" className={input} /></label>
            <label className={lbl}>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} /></label>
            <label className={lbl}>Phone (optional)<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+971" className={input} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="min-h-[46px] rounded-xl bg-ink px-[18px] font-extrabold text-white">Save changes</button>
            {msg('profile')}
          </div>
        </form>

        <form id="prefs" onSubmit={savePrefs} className={card}>
          <h2 className="font-display m-0 text-[22px]">Job preferences</h2>
          <p className="m-0 text-[15px] text-text-muted">Used for job matches, AI suggestions and Auto-Apply.</p>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
            <label className={lbl}>Target role<input value={role} onChange={(e) => setRole(e.target.value)} className={input} /></label>
            <label className={lbl}>Locations<input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="City or Remote" className={input} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="min-h-[46px] rounded-xl bg-ink px-[18px] font-extrabold text-white">Save preferences</button>
            {msg('prefs')}
          </div>
        </form>

        <section id="notif" className={`${card} !gap-1`}>
          <h2 className="font-display m-0 mb-2 text-[22px]">Notifications</h2>
          <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 border-b border-[#EEEBE3]">
            <span><b>Daily job matches</b><br /><span className="text-sm text-text-muted">One email each morning</span></span>
            <input type="checkbox" className={checkbox} checked={dailyMatches} onChange={(e) => saveNotif({ daily: e.target.checked })} />
          </label>
          <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 border-b border-[#EEEBE3]">
            <b>Application follow-up reminders</b>
            <input type="checkbox" className={checkbox} checked={followUps} onChange={(e) => saveNotif({ follow: e.target.checked })} />
          </label>
          <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3">
            <span><b>Tips and product emails</b><br /><span className="text-sm text-text-muted">Turn off to stop all non-essential email</span></span>
            <input type="checkbox" className={checkbox} checked={productEmails} onChange={(e) => saveNotif({ product: e.target.checked })} />
          </label>
          {msg('notif')}
        </section>

        <section id="signin" className={card}>
          <h2 className="font-display m-0 text-[22px]">Sign-in methods</h2>
          {providers.map((p) => (
            <div key={p} className="flex flex-wrap items-center justify-between gap-3">
              <span><b className="capitalize">{p === 'email' ? 'Email' : p}</b>{p === 'email' ? ` · ${email}` : ''}</span>
              <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[13px] font-extrabold text-brand-dark">Connected</span>
            </div>
          ))}
          <form onSubmit={changePassword} className="flex flex-col gap-3 border-t border-[#EEEBE3] pt-3.5">
            <b>Set or change a password</b>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              <label className={lbl}>New password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" className={input} /></label>
              <label className={lbl}>Confirm password<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" className={input} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={secondaryBtn}>Update password</button>
              {msg('signin')}
            </div>
          </form>
        </section>

        <section id="data" className={card}>
          <h2 className="font-display m-0 text-[22px]">Privacy &amp; data</h2>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={downloadData} className={secondaryBtn}>Download my data</button>
            <Link href="/contact" className="inline-flex min-h-[44px] items-center rounded-[10px] border-[1.5px] border-[#E8A48A] bg-white px-3.5 font-bold text-danger-ink no-underline">Request account deletion</Link>
          </div>
          <span className="text-[13px] text-text-muted">Deleting removes your resumes, letters and history. Contact us and we will confirm before we delete anything.</span>
        </section>
      </div>
    </main>
  );
}
