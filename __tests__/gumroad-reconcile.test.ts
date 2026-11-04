import { afterEach, describe, expect, it, vi } from 'vitest';
import { findActiveGumroadSale, ilikeExact } from '@/lib/gumroad-reconcile';

const day = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * day).toISOString();

function mockSales(sales: Array<Record<string, unknown>>, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => ({ success: true, sales }) }))
  );
}

const base = { id: 's1', paid: true, product_permalink: 'kxtcbs', subscription_id: 'sub1', created_at: ago(1) };

afterEach(() => vi.unstubAllGlobals());

describe('findActiveGumroadSale', () => {
  it('accepts a recent paid sale for the product', async () => {
    mockSales([base]);
    expect(await findActiveGumroadSale('a@b.com', 't')).toEqual({ saleId: 's1', subscriptionId: 'sub1' });
  });

  it.each([
    ['refunded', { refunded: true }],
    ['charged back', { chargedback: true }],
    ['unpaid', { paid: false }],
    ['wrong product', { product_permalink: 'other' }],
    ['subscription ended', { subscription_ended_at: ago(2) }],
    ['subscription cancelled', { subscription_cancelled_at: ago(2) }],
    ['payment failed', { subscription_failed_at: ago(2) }],
    ['older than 35 days', { created_at: ago(60) }],
    ['missing created_at', { created_at: undefined }],
  ])('rejects a sale that is %s', async (_label, patch) => {
    mockSales([{ ...base, ...patch }]);
    expect(await findActiveGumroadSale('a@b.com', 't')).toBeNull();
  });

  it('picks the live sale when old ended ones come first', async () => {
    mockSales([{ ...base, id: 'old', subscription_ended_at: ago(40), created_at: ago(70) }, { ...base, id: 'new' }]);
    expect((await findActiveGumroadSale('a@b.com', 't'))?.saleId).toBe('new');
  });

  it('returns null when the Gumroad API errors', async () => {
    mockSales([base], false);
    expect(await findActiveGumroadSale('a@b.com', 't')).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network'); }));
    expect(await findActiveGumroadSale('a@b.com', 't')).toBeNull();
  });
});

describe('ilikeExact', () => {
  it('escapes LIKE wildcards so emails match literally', () => {
    expect(ilikeExact('jane_doe%x@a.com')).toBe('jane\\_doe\\%x@a.com');
    expect(ilikeExact('plain@a.com')).toBe('plain@a.com');
  });
});
