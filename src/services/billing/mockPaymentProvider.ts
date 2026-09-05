import { PaymentProvider, PaymentRecord, RefundRequest } from '../../types/billing';
import { PlanType } from '../../types/auth';
import { PLAN_CONFIGS } from '../../types/billing';
import { updateUserPlanInStorage } from '../auth/mockAuthProvider';

const PAYMENTS_KEY = 'bizflow_payments_v1';
const REFUNDS_KEY = 'bizflow_refunds_v1';
const SUBSCRIPTION_KEY = 'bizflow_subscription_v1';

function getPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch {}
}

function getRefunds(): RefundRequest[] {
  try {
    const raw = localStorage.getItem(REFUNDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRefunds(refunds: RefundRequest[]): void {
  try {
    localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds));
  } catch {}
}

export interface SubscriptionState {
  userId: string;
  plan: PlanType;
  status: string;
  nextBillingDate?: string;
  startDate?: string;
  endDate?: string;
  latestPaymentId?: string;
}

export function getSubscriptionState(userId: string): SubscriptionState | null {
  try {
    const raw = localStorage.getItem(`${SUBSCRIPTION_KEY}:${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSubscriptionState(state: SubscriptionState): void {
  try {
    localStorage.setItem(`${SUBSCRIPTION_KEY}:${state.userId}`, JSON.stringify(state));
  } catch {}
}

export const mockPaymentProvider: PaymentProvider = {
  async createSubscription(userId: string, planId: PlanType) {
    await new Promise((r) => setTimeout(r, 1200)); // simulate PG call

    if (planId === 'free') {
      updateUserPlanInStorage(userId, 'free', 'free');
      saveSubscriptionState({ userId, plan: 'free', status: 'free' });
      return { success: true };
    }

    const plan = PLAN_CONFIGS[planId];
    // MOCK: simulate 90% success rate for demo
    const mockSuccess = Math.random() > 0.1;

    if (!mockSuccess) {
      return { success: false, error: '결제에 실패했습니다. 카드사를 확인해주세요.' };
    }

    const paymentId = `pay_mock_${Date.now()}`;
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const payment: PaymentRecord = {
      id: paymentId,
      userId,
      planId,
      amount: plan.price,
      currency: 'KRW',
      status: 'success',
      createdAt: now.toISOString(),
      paidAt: now.toISOString(),
      pgTransactionId: `MOCK_${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
      description: `BizFlow AtoZ ${plan.name} 구독`,
    };

    const payments = getPayments();
    payments.unshift(payment);
    savePayments(payments);

    updateUserPlanInStorage(userId, planId, 'active');
    saveSubscriptionState({
      userId,
      plan: planId,
      status: 'active',
      startDate: now.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      latestPaymentId: paymentId,
    });

    return { success: true, paymentId };
  },

  async cancelSubscription(userId: string) {
    await new Promise((r) => setTimeout(r, 800));
    const sub = getSubscriptionState(userId);
    if (!sub) {
      return { success: false, error: '구독 정보를 찾을 수 없습니다.' };
    }

    const endDate = sub.nextBillingDate || new Date().toISOString();
    saveSubscriptionState({
      ...sub,
      status: 'canceled',
      endDate,
    });

    updateUserPlanInStorage(userId, sub.plan, 'canceled');
    return { success: true };
  },

  async requestRefund(paymentId: string, reason: string) {
    await new Promise((r) => setTimeout(r, 600));
    const payments = getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) {
      return { success: false, error: '결제 내역을 찾을 수 없습니다.' };
    }

    const refundId = `ref_${Date.now()}`;
    const refund: RefundRequest = {
      id: refundId,
      userId: payment.userId,
      paymentId,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const refunds = getRefunds();
    refunds.unshift(refund);
    saveRefunds(refunds);

    return { success: true, refundId };
  },

  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    await new Promise((r) => setTimeout(r, 300));
    return getPayments().filter((p) => p.userId === userId);
  },
};

export function getRefundRequests(userId?: string): RefundRequest[] {
  const refunds = getRefunds();
  if (userId) return refunds.filter((r) => r.userId === userId);
  return refunds;
}

export function updateRefundStatus(refundId: string, status: RefundRequest['status']): void {
  const refunds = getRefunds();
  const idx = refunds.findIndex((r) => r.id === refundId);
  if (idx >= 0) {
    refunds[idx] = { ...refunds[idx], status, processedAt: new Date().toISOString() };
    saveRefunds(refunds);
  }
}
