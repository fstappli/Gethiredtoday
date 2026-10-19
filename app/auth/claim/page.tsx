'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearLazyDraft, readLazyDraft } from '@/lib/lazy-draft';
import { safeNext } from '@/lib/auth-flow';
import { createClient } from '@/lib/supabase';
import { track } from '@/lib/analytics';

/**
 * Post-auth landing. Moves logged-out work (lib/lazy-draft.ts) into the new
 * account, then continues to `next`.
 */
function Claim() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get('next'));
  const [msg, setMsg] = useState('Getting things ready...');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        const fresh = user?.created_at && Date.now() - new Date(user.created_at).getTime() < 10 * 60 * 1000;
        if (fresh) track('sign_up', { method: user?.app_metadata?.provider ?? 'email' });
      } catch { /* analytics only */ }
      const draft = readLazyDraft();
      if (!draft) {
        router.replace(next);
        return;
      }
      if (draft.kind === 'ats') {
        // The portal ATS page reads and clears the draft itself.
        router.replace('/dashboard/ats-checker?claim=1');
        return;
      }
      setMsg('Saving your resume to your account...');
      try {
        const res = await fetch('/api/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: typeof draft.targetRole === 'string' && draft.targetRole ? `${draft.targetRole} resume` : 'My Resume',
            template_id: draft.templateId || 'classic',
            data: draft.data,
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { resume?: { id?: string }; id?: string };
          const id = body.resume?.id ?? body.id;
          clearLazyDraft();
          track('resume_created', { source: 'lazy_draft' });
          if (!cancelled) router.replace(id ? `/builder/resume/${id}` : '/dashboard/resumes');
          return;
        }
        clearLazyDraft();
      } catch {
        /* fall through to next */
      }
      if (!cancelled) router.replace(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-ground-site px-5">
      <p role="status" className="font-semibold text-text-muted">{msg}</p>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={null}>
      <Claim />
    </Suspense>
  );
}
