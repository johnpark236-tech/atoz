import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPaymentProvider } from '../services/billing/mockPaymentProvider';
import { mockAuthProvider } from '../services/auth/mockAuthProvider';

beforeEach(() => {
  localStorage.clear();
});

async function createTestUser(email: string) {
  const result = await mockAuthProvider.signup({
    email,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    consent: { terms: true, privacy: true, marketing: false },
  });
  return result.user!;
}

describe('Billing - Subscribe', () => {
  it('PRO 구독 성공 (mock 90% 성공)', async () => {
    const user = await createTestUser('billing1@example.com');
    // Mock to always succeed
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.1 = success
    const result = await mockPaymentProvider.createSubscription(user.id, 'pro');
    expect(result.success).toBe(true);
    expect(result.paymentId).toBeTruthy();
    vi.restoreAllMocks();
  });

  it('무료 플랜으로 설정', async () => {
    const user = await createTestUser('billing2@example.com');
    const result = await mockPaymentProvider.createSubscription(user.id, 'free');
    expect(result.success).toBe(true);
  });

  it('결제 실패 시 error 반환', async () => {
    const user = await createTestUser('billing3@example.com');
    vi.spyOn(Math, 'random').mockReturnValue(0.05); // < 0.1 = fail
    const result = await mockPaymentProvider.createSubscription(user.id, 'pro');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    vi.restoreAllMocks();
  });
});

describe('Billing - Payment History', () => {
  it('결제 내역 조회', async () => {
    const user = await createTestUser('history@example.com');
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    await mockPaymentProvider.createSubscription(user.id, 'pro');
    vi.restoreAllMocks();

    const history = await mockPaymentProvider.getPaymentHistory(user.id);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].userId).toBe(user.id);
    expect(history[0].status).toBe('success');
  });

  it('결제 내역 없는 사용자는 빈 배열', async () => {
    const history = await mockPaymentProvider.getPaymentHistory('nonexistent-user');
    expect(history).toEqual([]);
  });
});

describe('Billing - Cancel', () => {
  it('구독 해지', async () => {
    const user = await createTestUser('cancel@example.com');
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    await mockPaymentProvider.createSubscription(user.id, 'pro');
    vi.restoreAllMocks();

    const result = await mockPaymentProvider.cancelSubscription(user.id);
    expect(result.success).toBe(true);
  });

  it('구독 없는 사용자 해지 시도 실패', async () => {
    const result = await mockPaymentProvider.cancelSubscription('no-sub-user');
    expect(result.success).toBe(false);
  });
});

describe('Billing - Refund', () => {
  it('환불 요청 성공', async () => {
    const user = await createTestUser('refund@example.com');
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const subResult = await mockPaymentProvider.createSubscription(user.id, 'pro');
    vi.restoreAllMocks();

    if (subResult.paymentId) {
      const refundResult = await mockPaymentProvider.requestRefund(
        subResult.paymentId,
        '서비스 불만족'
      );
      expect(refundResult.success).toBe(true);
      expect(refundResult.refundId).toBeTruthy();
    }
  });

  it('존재하지 않는 결제 ID 환불 실패', async () => {
    const result = await mockPaymentProvider.requestRefund('invalid-payment-id', '테스트');
    expect(result.success).toBe(false);
    expect(result.error).toContain('결제 내역을 찾을 수 없습니다');
  });
});
