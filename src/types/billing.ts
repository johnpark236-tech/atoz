import { PlanType, SubscriptionStatus } from './auth';

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number; // KRW per month
  maxProjects: number;
  features: string[];
  proOnly: string[];
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'FREE',
    price: 0,
    maxProjects: 1,
    features: [
      '프로젝트 1개',
      '기본 A to Z 로드맵',
      '사업화 체크리스트',
      '행정·기관 포털',
      '세무 캘린더',
      '매출·정산 기초 관리',
    ],
    proOnly: [],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    price: 19900,
    maxProjects: 20,
    features: [
      '프로젝트 최대 20개',
      '기본 A to Z 로드맵',
      '사업화 체크리스트',
      '행정·기관 포털',
      '세무 캘린더',
      '매출·정산 고급 관리',
      'AI 창업비서 (컨텍스트 강화)',
      '문서 보관함',
      '고급 세무·정산 분석',
      '향후 알림 기능',
    ],
    proOnly: [
      'AI Task Assistant (컨텍스트 강화)',
      '문서 보관함',
      '고급 분석 리포트',
      '멀티 프로젝트',
    ],
  },
};

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type RefundStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRecord {
  id: string;
  userId: string;
  planId: PlanType;
  amount: number;
  currency: 'KRW';
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  pgTransactionId?: string; // TODO: real PG transaction ID
  description: string;
}

export interface RefundRequest {
  id: string;
  userId: string;
  paymentId: string;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  refundedAmount?: number;
}

export interface PaymentProvider {
  createSubscription(userId: string, planId: PlanType): Promise<{ success: boolean; paymentId?: string; error?: string }>;
  cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }>;
  requestRefund(paymentId: string, reason: string): Promise<{ success: boolean; refundId?: string; error?: string }>;
  getPaymentHistory(userId: string): Promise<PaymentRecord[]>;
}
