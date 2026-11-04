import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { safeInternalPath } from '@/lib/safe-path';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { unsubscribeToken, verifyUnsubscribeToken } from '@/lib/unsubscribe-token';
import { zipUncompressedSize } from '@/lib/zip-guard';
import { rateLimit } from '@/lib/rate-limit';

describe('safeInternalPath (open redirect)', () => {
  it.each(['/dashboard', '/dashboard?x=1#a', '/builder/resume/abc'])('keeps %s', (p) => expect(safeInternalPath(p)).toBe(p));
  it.each([
    '//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', 'https://evil.com', 'javascript:alert(1)', 'evil.com', '', null, undefined, '/%0d%0a//evil.com\r',
  ])('rejects %j', (p) => expect(safeInternalPath(p as string)).toBe('/dashboard'));
  it('uses the given fallback', () => expect(safeInternalPath('//x.com', '/home')).toBe('/home'));
});

describe('isAuthorizedCron (fails closed)', () => {
  const orig = process.env.CRON_SECRET;
  afterEach(() => { if (orig === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = orig; });
  const req = (auth?: string) => new Request('http://x/api/cron', { headers: auth ? { authorization: auth } : {} });
  it('rejects everything when CRON_SECRET is unset, including "Bearer undefined"', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCron(req('Bearer undefined'))).toBe(false);
    expect(isAuthorizedCron(req())).toBe(false);
  });
  it('accepts only the exact secret', () => {
    process.env.CRON_SECRET = 's3cret';
    expect(isAuthorizedCron(req('Bearer s3cret'))).toBe(true);
    expect(isAuthorizedCron(req('Bearer s3cre'))).toBe(false);
    expect(isAuthorizedCron(req('s3cret'))).toBe(false);
    expect(isAuthorizedCron(req())).toBe(false);
  });
});

describe('unsubscribe tokens', () => {
  beforeEach(() => { process.env.UNSUBSCRIBE_SECRET = 'unit-test-secret'; });
  it('verifies its own token and nothing else', () => {
    const t = unsubscribeToken({ uid: 'u1' });
    expect(verifyUnsubscribeToken({ uid: 'u1' }, t)).toBe(true);
    expect(verifyUnsubscribeToken({ uid: 'u2' }, t)).toBe(false);
    expect(verifyUnsubscribeToken({ uid: 'u1' }, 'x'.repeat(32))).toBe(false);
    expect(verifyUnsubscribeToken({ uid: 'u1' }, undefined)).toBe(false);
    expect(verifyUnsubscribeToken({}, t)).toBe(false);
  });
  it('treats email case-insensitively', () => {
    const t = unsubscribeToken({ email: 'Jane@X.com' });
    expect(verifyUnsubscribeToken({ email: 'jane@x.com' }, t)).toBe(true);
    expect(verifyUnsubscribeToken({ uid: 'jane@x.com' }, t)).toBe(false);
  });
});

describe('zipUncompressedSize', () => {
  function zipWith(sizes: number[]): Buffer {
    const entries = sizes.map((size, i) => {
      const name = Buffer.from(`f${i}.xml`);
      const h = Buffer.alloc(46);
      h.writeUInt32LE(0x02014b50, 0); h.writeUInt32LE(size, 24); h.writeUInt16LE(name.length, 28);
      return Buffer.concat([h, name]);
    });
    const cd = Buffer.concat(entries);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(sizes.length, 10); eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(0, 16);
    return Buffer.concat([cd, eocd]);
  }
  it('sums declared uncompressed sizes', () => expect(zipUncompressedSize(zipWith([100, 250, 5]))).toBe(355));
  it('flags a bomb-sized declaration', () => expect(zipUncompressedSize(zipWith([4_000_000_000, 4_000_000_000]))).toBeGreaterThan(40 * 1024 * 1024));
  it('returns null for non-zip data', () => expect(zipUncompressedSize(Buffer.from('not a zip at all, just text'))).toBeNull());
});

describe('rateLimit', () => {
  it('allows up to the limit then blocks', () => {
    const k = 'k' + Math.random();
    expect([1, 2, 3].map(() => rateLimit(k, 3, 60_000))).toEqual([true, true, true]);
    expect(rateLimit(k, 3, 60_000)).toBe(false);
    expect(rateLimit(k + 'other', 3, 60_000)).toBe(true);
  });
});
