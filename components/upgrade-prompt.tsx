'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import * as Dialog from '@radix-ui/react-dialog';
import { UPGRADE_COPY, upgradeHref, type UpgradeTrigger } from '@/lib/upgrade-triggers';

const PERKS = [
  'See every match and what each one is missing',
  'Auto-Apply up to 50 a day, you approve first',
  'Word export, all templates, unlimited resumes',
];

/** Contextual, always-dismissible upgrade prompt. Never a hard wall. */
export default function UpgradePrompt({
  trigger,
  open,
  onClose,
}: {
  trigger: UpgradeTrigger;
  open: boolean;
  onClose: () => void;
}) {
  const copy = UPGRADE_COPY[trigger];
  useEffect(() => {
    if (open) track('upgrade_prompt_view', { trigger });
  }, [open, trigger]);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(13,27,25,.55)]" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[460px] flex-col gap-4 rounded-t-[26px] bg-white px-5 pb-7 pt-2.5 text-ink min-[640px]:bottom-auto min-[640px]:top-1/2 min-[640px]:-translate-y-1/2 min-[640px]:rounded-[24px]"
          aria-describedby="upgrade-desc"
        >
          <div className="flex justify-center min-[640px]:hidden" aria-hidden="true">
            <span className="h-[5px] w-10 rounded-[3px] bg-[#DCE2DD]" />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-bold text-brand">PRO</div>
              <Dialog.Title className="font-display mt-0.5 text-[26px] font-bold leading-[1.1] tracking-[-0.6px]">
                {copy.title}
              </Dialog.Title>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#EEF1EE] text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </Dialog.Close>
          </div>
          <Dialog.Description id="upgrade-desc" className="text-[15px] leading-normal text-text-muted">
            {copy.body}
          </Dialog.Description>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
            {PERKS.map((p) => (
              <li key={p} className="flex gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="flex-none"><path d="M5 12l5 5 9-10" /></svg>
                {p}
              </li>
            ))}
          </ul>
          <Link
            href={upgradeHref(trigger)}
            onClick={() => track('upgrade_prompt_click', { trigger })}
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-brand px-4 py-3.5 text-base font-extrabold text-white no-underline hover:bg-brand-dark"
          >
            Go Pro
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-transparent px-4 py-2.5 text-[15px] font-bold text-text-muted hover:bg-ground-portal"
          >
            Not now
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
