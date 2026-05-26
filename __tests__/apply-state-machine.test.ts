import { describe, it, expect } from 'vitest';
import type { ApplicationStatus, ApplicationType } from '../types/jobs';

// State machine for application status transitions
type Transition = {
  from: ApplicationStatus;
  action: string;
  to: ApplicationStatus;
  allowed: boolean;
};

function canTransition(from: ApplicationStatus, action: string): { allowed: boolean; to: ApplicationStatus | null } {
  const transitions: Record<string, Record<string, ApplicationStatus>> = {
    redirected: {
      confirm_applied: 'applied',
    },
    applied: {
      view: 'viewed',
      interview: 'interview',
      reject: 'rejected',
      offer: 'offer',
    },
    viewed: {
      interview: 'interview',
      reject: 'rejected',
      offer: 'offer',
    },
    interview: {
      reject: 'rejected',
      offer: 'offer',
    },
    matched: {
      redirect: 'redirected',
    },
  };

  const map = transitions[from] ?? {};
  const to = map[action] ?? null;
  return { allowed: Boolean(to), to };
}

// External redirect guardrail — auto-apply must never auto-submit external jobs
function canAutoSubmit(applicationType: ApplicationType): boolean {
  return applicationType === 'native' || applicationType === 'provider_api';
}

describe('apply state machine', () => {
  it('redirected → applied on user confirmation', () => {
    const result = canTransition('redirected', 'confirm_applied');
    expect(result.allowed).toBe(true);
    expect(result.to).toBe('applied');
  });

  it('cannot go backwards from applied to redirected', () => {
    const result = canTransition('applied', 'redirect');
    expect(result.allowed).toBe(false);
  });

  it('applied → interview is valid', () => {
    const result = canTransition('applied', 'interview');
    expect(result.allowed).toBe(true);
    expect(result.to).toBe('interview');
  });

  it('matched → redirected on apply click', () => {
    const result = canTransition('matched', 'redirect');
    expect(result.allowed).toBe(true);
    expect(result.to).toBe('redirected');
  });

  it('terminal states cannot transition', () => {
    for (const terminal of ['rejected', 'offer'] as ApplicationStatus[]) {
      const result = canTransition(terminal, 'confirm_applied');
      expect(result.allowed).toBe(false);
    }
  });
});

describe('external redirect guardrail', () => {
  it('native jobs can be auto-submitted', () => {
    expect(canAutoSubmit('native')).toBe(true);
  });

  it('provider_api jobs can be auto-submitted', () => {
    expect(canAutoSubmit('provider_api')).toBe(true);
  });

  it('external_redirect jobs can NEVER be auto-submitted', () => {
    expect(canAutoSubmit('external_redirect')).toBe(false);
  });
});
