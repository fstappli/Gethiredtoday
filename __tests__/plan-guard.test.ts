import { describe, it, expect } from 'vitest';
import {
  applyMatchLimit, canCreateResume, canUseAiRewrite, clampAutoApplyCap,
  dayKey, limitAtsReport, remainingToday,
} from '@/lib/plan-guard';
import { PLAN_LIMITS, canUseFeature, isTemplateAllowed } from '@/lib/subscription';

describe('plan limits', () => {
  it('PDF is free, Word is Pro', () => {
    expect(canUseFeature('free', 'pdfDownload')).toBe(true);
    expect(canUseFeature('free', 'wordDownload')).toBe(false);
    expect(canUseFeature('pro', 'wordDownload')).toBe(true);
    expect(PLAN_LIMITS.free.watermark).toBe(false);
  });
  it('resume count', () => {
    expect(canCreateResume('free', 0)).toBe(true);
    expect(canCreateResume('free', 1)).toBe(false);
    expect(canCreateResume('pro', 99)).toBe(true);
  });
  it('AI rewrites 5/day for free', () => {
    expect(canUseAiRewrite('free', 4)).toBe(true);
    expect(canUseAiRewrite('free', 5)).toBe(false);
    expect(canUseAiRewrite('pro', 500)).toBe(true);
    expect(remainingToday(5, 7)).toBe(0);
    expect(remainingToday(Infinity, 7)).toBe(Infinity);
  });
  it('templates', () => {
    expect(isTemplateAllowed('free', 'classic')).toBe(true);
    expect(isTemplateAllowed('free', 'timeline')).toBe(false);
    expect(isTemplateAllowed('pro', 'timeline')).toBe(true);
  });
  it('locks matches beyond top 3 for free', () => {
    const m = [10, 90, 50, 80, 70].map((s, i) => ({ id: i, match_score: s }));
    const free = applyMatchLimit('free', m);
    expect(free.filter((x) => !x.locked).map((x) => x.match_score)).toEqual([90, 80, 70]);
    expect(free.filter((x) => x.locked).every((x) => x.match_score === -1)).toBe(true);
    expect(applyMatchLimit('pro', m).some((x) => x.locked)).toBe(false);
  });
  it('limits the ATS report for free', () => {
    const r = { overall_score: 62, top_issues: ['a', 'b', 'c', 'd'], top_suggestions: ['1', '2', '3', '4', '5'], sections: {} };
    const free = limitAtsReport('free', r) as Record<string, unknown>;
    expect(free.top_suggestions).toEqual(['1', '2', '3']);
    expect(free.sections).toBeUndefined();
    expect(free.locked).toBe(true);
    expect(limitAtsReport('pro', r).locked).toBe(false);
  });
  it('auto-apply cap and day key', () => {
    expect(clampAutoApplyCap(500)).toBe(50);
    expect(clampAutoApplyCap(0)).toBe(1);
    expect(dayKey(new Date('2026-10-19T23:59:59Z'))).toBe('2026-10-19');
  });
});
