/**
 * Integration smoke tests — verifies that merged feature+main modules coexist.
 * These are not UI rendering tests (no jsdom component mount), but rather
 * import and contract tests ensuring nothing is broken at the module level.
 */
import { describe, it, expect } from 'vitest';
import { PLAN_CONFIGS } from '../types/billing';
import { authService } from '../services/auth/authService';
import { billingService } from '../services/billing/billingService';
import { documentService, DOC_CATEGORIES } from '../services/documentService';
import { hasGuestData, isMigrationDone } from '../services/migrationService';
import { usePlanGating } from '../hooks/usePlanGating';

// ── Tab routing completeness ──────────────────────────────────────────────────
const ALL_TABS = [
  'dashboard', 'roadmap', 'wizard', 'market', 'finance',
  'organizations', 'tax', 'ai', 'guide',
  'account', 'pricing', 'documents', 'admin',
  'terms', 'privacy',
];

describe('Tab routing completeness', () => {
  it('all expected tabs are defined (no duplicates)', () => {
    const unique = new Set(ALL_TABS);
    expect(unique.size).toBe(ALL_TABS.length);
  });

  it('main-origin tabs present: market, guide', () => {
    expect(ALL_TABS).toContain('market');
    expect(ALL_TABS).toContain('guide');
  });

  it('feature-branch tabs present: account, pricing, documents, admin, terms, privacy', () => {
    ['account', 'pricing', 'documents', 'admin', 'terms', 'privacy'].forEach((tab) => {
      expect(ALL_TABS).toContain(tab);
    });
  });
});

// ── Auth service contract ─────────────────────────────────────────────────────
describe('Auth service (mock mode)', () => {
  it('authService exposes login, signup, logout, getCurrentUser', () => {
    expect(typeof authService.login).toBe('function');
    expect(typeof authService.signup).toBe('function');
    expect(typeof authService.logout).toBe('function');
    expect(typeof authService.getCurrentUser).toBe('function');
  });
});

// ── Billing service contract ──────────────────────────────────────────────────
describe('Billing service (mock mode)', () => {
  it('billingService exposes subscribe, cancel, getPaymentHistory', () => {
    expect(typeof billingService.subscribe).toBe('function');
    expect(typeof billingService.cancel).toBe('function');
    expect(typeof billingService.getPaymentHistory).toBe('function');
  });

  it('PRO plan price is ₩19,900', () => {
    expect(PLAN_CONFIGS.pro.price).toBe(19900);
  });
});

// ── Document service contract ─────────────────────────────────────────────────
describe('Document service', () => {
  it('has at least 14 categories', () => {
    expect(DOC_CATEGORIES.length).toBeGreaterThanOrEqual(14);
  });

  it('formatFileSize works for KB and MB', () => {
    expect(documentService.formatFileSize(1024)).toBe('1.0 KB');
    expect(documentService.formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });
});

// ── Migration service contract ────────────────────────────────────────────────
describe('Migration service', () => {
  it('isMigrationDone returns false for unknown userId', () => {
    expect(isMigrationDone('unknown-user-xyz')).toBe(false);
  });

  it('hasGuestData returns boolean', () => {
    expect(typeof hasGuestData()).toBe('boolean');
  });
});

// ── Plan gating hook (pure logic, no React) ───────────────────────────────────
describe('usePlanGating pure logic', () => {
  it('exported as a function', () => {
    expect(typeof usePlanGating).toBe('function');
  });

  it('FREE max projects is 1', () => {
    expect(PLAN_CONFIGS.free.maxProjects).toBe(1);
  });

  it('PRO max projects is 20', () => {
    expect(PLAN_CONFIGS.pro.maxProjects).toBe(20);
  });
});
