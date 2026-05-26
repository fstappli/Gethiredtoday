import { describe, it, expect } from 'vitest';
import type { ApplicationStatus } from '../types/jobs';

// Mirrors the counting logic in /api/jobs/applications/route.ts
const APPLIED_STATUSES: ApplicationStatus[] = ['applied', 'viewed', 'interview', 'offer', 'rejected'];

function computeAppliedCount(applications: { status: ApplicationStatus }[]): number {
  return applications.filter((a) => APPLIED_STATUSES.includes(a.status)).length;
}

function computeRedirectedCount(applications: { status: ApplicationStatus }[]): number {
  return applications.filter((a) => a.status === 'redirected').length;
}

describe('KPI: applied count', () => {
  it('counts applied, viewed, interview, offer, rejected as "applied"', () => {
    const apps: { status: ApplicationStatus }[] = [
      { status: 'applied' },
      { status: 'viewed' },
      { status: 'interview' },
      { status: 'offer' },
      { status: 'rejected' },
    ];
    expect(computeAppliedCount(apps)).toBe(5);
  });

  it('does NOT count matched or redirected in the applied headline number', () => {
    const apps: { status: ApplicationStatus }[] = [
      { status: 'matched' },
      { status: 'redirected' },
      { status: 'applied' },
    ];
    expect(computeAppliedCount(apps)).toBe(1);
  });

  it('returns 0 when no applications exist', () => {
    expect(computeAppliedCount([])).toBe(0);
  });

  it('counts redirected separately', () => {
    const apps: { status: ApplicationStatus }[] = [
      { status: 'redirected' },
      { status: 'redirected' },
      { status: 'applied' },
    ];
    expect(computeRedirectedCount(apps)).toBe(2);
    expect(computeAppliedCount(apps)).toBe(1);
  });
});
