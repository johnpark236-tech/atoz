export type TaskStatus =
  | '미착수'
  | '준비중'
  | '신청준비'
  | '신청완료'
  | '심사중'
  | '보완요청'
  | '승인'
  | '완료'
  | '불필요';

export type TaskCategory =
  | '01_아이디어'
  | '02_지식재산'
  | '03_인증인허가'
  | '04_제조시제품'
  | '05_사업자세무'
  | '06_판매준비'
  | '07_주문배송'
  | '08_정산입금'
  | '09_세무회계'
  | '10_사업성장';

export interface Task {
  task_id: string;
  category: TaskCategory;
  sub_category: string;
  task_name: string;
  description: string;
  why_needed: string;
  mandatory: boolean;
  condition?: string; // Rule key or condition description
  dependency?: string[]; // IDs of tasks that must be done first
  organization: string;
  official_url: string;
  estimated_cost: string;
  estimated_days: string;
  required_documents: string[];
  result_document: string;
  step_by_step: string[];
  cautions: string;
  status: TaskStatus;
  due_date?: string;
  completed_date?: string;
  memo?: string;
  is_industry_specific?: boolean;
  industry_tag?: string;
}

export interface TaskRule {
  id: string;
  name: string;
  description: string;
  condition: {
    businessTypes?: string[];
    targetCustomers?: string[];
    salesChannels?: string[];
    corporateStatus?: string[];
    staffing?: string[];
    hasOverseasSales?: string[];
  };
  add_tasks: Omit<Task, 'status' | 'completed_date' | 'memo'>[];
}

export interface ProjectProfile {
  businessTypes: string[]; // e.g., ["실물 제품", "교육 교구"]
  targetCustomers: string[]; // e.g., ["일반 소비자 B2C", "학교/교육기관"]
  salesChannels: string[]; // e.g., ["네이버 스마트스토어", "쿠팡"]
  stage: string; // e.g., "아이디어만 있음"
  corporateStatus: string; // e.g., "없음" | "개인사업자" | "법인사업자"
  staffing: string; // e.g., "없음" | "외주만 사용"
  hasOverseasSales: string; // e.g., "없음" | "검토 중" | "있음"
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  profile: ProjectProfile;
  tasks: Task[];
  sales: SaleRecord[];
  documents: DocumentItem[];
}

export type SaleStatus =
  | '결제'
  | '배송중'
  | '구매확정'
  | '정산예정'
  | '입금완료'
  | '취소'
  | '환불';

export interface SaleRecord {
  id: string;
  orderDate: string;
  channel: string; // 네이버, 쿠팡, 자사몰 등
  productName: string;
  quantity: number;
  unitPrice: number; // 판매가
  totalRevenue: number; // 매출 (수량 * 단가)
  platformFee: number; // 플랫폼 수수료
  shippingCost: number; // 배송비
  manufacturingCost: number; // 제품 원가
  adCost: number; // 광고비
  settlementExpectedAmount: number; // 정산예정액
  settlementExpectedDate: string; // 정산예정일
  depositDate?: string; // 실제 입금일
  actualDepositAmount?: number; // 실입금액
  netProfit: number; // 순이익
  status: SaleStatus;
}

export interface TaxEvent {
  id: string;
  title: string;
  period: string;
  dueDate: string;
  targetType: 'all' | 'individual' | 'corporate' | 'simplified';
  category: '부가가치세' | '종합소득세' | '원천세' | '지방세' | '행정신고';
  description: string;
  officialUrl: string;
  filingTip: string;
}

export interface DocumentItem {
  id: string;
  folder: string; // 사업자등록증, KC인증서, 상표등록증, etc.
  name: string;
  size: string;
  uploadedAt: string;
  fileType: string;
  note?: string;
}

export interface Organization {
  id: string;
  category: '지식재산' | '사업자/세금' | '판매' | '인증' | '지원사업';
  name: string;
  purpose: string;
  keyTasks: string[];
  officialUrl: string;
  badge: string;
}
