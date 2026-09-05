// Billing abstraction layer
// ENV_REQUIRED: Toss Payments or PortOne credentials for production
// Currently uses mockPaymentProvider

import { PlanType } from '../../types/auth';
import { mockPaymentProvider, getSubscriptionState, SubscriptionState } from './mockPaymentProvider';

// TODO: ADAPTER - real PG adapter (Toss Payments / PortOne)
// import { tossPaymentsProvider } from './tossPaymentsProvider';
// const provider = import.meta.env.VITE_TOSS_CLIENT_KEY ? tossPaymentsProvider : mockPaymentProvider;

const provider = mockPaymentProvider;

export const billingService = {
  async subscribe(userId: string, planId: PlanType) {
    return provider.createSubscription(userId, planId);
  },

  async cancel(userId: string) {
    return provider.cancelSubscription(userId);
  },

  async requestRefund(paymentId: string, reason: string) {
    return provider.requestRefund(paymentId, reason);
  },

  async getPaymentHistory(userId: string) {
    return provider.getPaymentHistory(userId);
  },

  getSubscriptionState(userId: string): SubscriptionState | null {
    return getSubscriptionState(userId);
  },
};

export { getSubscriptionState };
export type { SubscriptionState };
