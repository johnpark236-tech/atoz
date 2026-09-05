import { ChecklistCategory } from '../types';

export const BUSINESS_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'market-research',
    title: '시장조사',
    sections: [
      {
        id: 'market-customer',
        title: '고객 검증',
        tasks: [
          { id: 'market-customer-persona', title: '핵심 고객군 정의', completed: false },
          { id: 'market-customer-pain', title: '고객 문제 인터뷰', completed: false },
          { id: 'market-customer-demand', title: '구매 의향 확인', completed: false },
        ],
      },
      {
        id: 'market-competitor',
        title: '경쟁 분석',
        tasks: [
          { id: 'market-competitor-list', title: '직접 경쟁사 목록화', completed: false },
          { id: 'market-competitor-price', title: '가격대 비교', completed: false },
          { id: 'market-competitor-review', title: '리뷰 불만 포인트 수집', completed: false },
        ],
      },
      {
        id: 'market-feasibility',
        title: '사업성 검토',
        tasks: [
          { id: 'market-feasibility-size', title: '시장 규모 추정', completed: false },
          { id: 'market-feasibility-margin', title: '예상 마진 계산', completed: false },
          { id: 'market-feasibility-risk', title: '초기 리스크 정리', completed: false },
        ],
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '지식재산권',
    sections: [
      {
        id: 'ip-trademark',
        title: '상표',
        tasks: [
          { id: 'ip-trademark-kipris', title: 'KIPRIS 사전검색', completed: false },
          { id: 'ip-trademark-class', title: '상품류 결정', completed: false },
          { id: 'ip-trademark-goods', title: '지정상품 결정', completed: false },
          { id: 'ip-trademark-apply', title: '상표 출원', completed: false },
          { id: 'ip-trademark-number', title: '출원번호 저장', completed: false },
        ],
      },
      {
        id: 'ip-copyright',
        title: '저작권',
        tasks: [
          { id: 'ip-copyright-assets', title: '보호 대상 저작물 목록화', completed: false },
          { id: 'ip-copyright-proof', title: '창작 증빙 자료 보관', completed: false },
          { id: 'ip-copyright-register', title: '저작권 등록 필요성 판단', completed: false },
        ],
      },
      {
        id: 'ip-design',
        title: '디자인권',
        tasks: [
          { id: 'ip-design-scope', title: '제품 외관 보호 범위 정리', completed: false },
          { id: 'ip-design-search', title: '유사 디자인 검색', completed: false },
          { id: 'ip-design-apply', title: '디자인 출원 검토', completed: false },
        ],
      },
    ],
  },
  {
    id: 'product-certification',
    title: '제품/인증',
    sections: [
      {
        id: 'product-spec',
        title: '제품 정의',
        tasks: [
          { id: 'product-spec-material', title: '소재 및 구성품 확정', completed: false },
          { id: 'product-spec-manual', title: '사용 설명 문구 작성', completed: false },
          { id: 'product-spec-safety', title: '안전 주의사항 정리', completed: false },
        ],
      },
      {
        id: 'product-cert',
        title: '인증 검토',
        tasks: [
          { id: 'product-cert-kc', title: 'KC 인증 대상 여부 확인', completed: false },
          { id: 'product-cert-test', title: '시험기관 견적 확인', completed: false },
          { id: 'product-cert-label', title: '표시사항 기준 확인', completed: false },
        ],
      },
      {
        id: 'product-sample',
        title: '시제품',
        tasks: [
          { id: 'product-sample-maker', title: '제작처 후보 비교', completed: false },
          { id: 'product-sample-order', title: '시제품 제작 의뢰', completed: false },
          { id: 'product-sample-feedback', title: '사용 테스트 피드백 반영', completed: false },
        ],
      },
    ],
  },
  {
    id: 'business-tax',
    title: '사업자/세무',
    sections: [
      {
        id: 'business-registration',
        title: '사업자 등록',
        tasks: [
          { id: 'business-registration-type', title: '개인/법인 형태 결정', completed: false },
          { id: 'business-registration-code', title: '업종코드 확인', completed: false },
          { id: 'business-registration-submit', title: '사업자등록 신청', completed: false },
        ],
      },
      {
        id: 'business-tax-basic',
        title: '세무 기초',
        tasks: [
          { id: 'business-tax-account', title: '사업용 계좌 준비', completed: false },
          { id: 'business-tax-card', title: '사업용 카드 등록', completed: false },
          { id: 'business-tax-vat', title: '부가세 신고 주기 확인', completed: false },
        ],
      },
      {
        id: 'business-commerce',
        title: '통신판매',
        tasks: [
          { id: 'business-commerce-permit', title: '통신판매업 신고', completed: false },
          { id: 'business-commerce-escrow', title: '구매안전서비스 확인증 발급', completed: false },
        ],
      },
    ],
  },
  {
    id: 'sales-channel',
    title: '판매채널',
    sections: [
      {
        id: 'sales-smartstore',
        title: '스마트스토어',
        tasks: [
          { id: 'sales-smartstore-signup', title: '판매자 가입', completed: false },
          { id: 'sales-smartstore-product', title: '상품 상세페이지 등록', completed: false },
          { id: 'sales-smartstore-delivery', title: '배송 정책 설정', completed: false },
        ],
      },
      {
        id: 'sales-coupang',
        title: '쿠팡',
        tasks: [
          { id: 'sales-coupang-signup', title: '판매자 계정 생성', completed: false },
          { id: 'sales-coupang-fee', title: '수수료 및 정산 조건 확인', completed: false },
          { id: 'sales-coupang-product', title: '상품 등록', completed: false },
        ],
      },
      {
        id: 'sales-marketing',
        title: '마케팅 준비',
        tasks: [
          { id: 'sales-marketing-photo', title: '제품 사진 촬영', completed: false },
          { id: 'sales-marketing-copy', title: '핵심 판매 문구 작성', completed: false },
          { id: 'sales-marketing-launch', title: '출시 프로모션 계획', completed: false },
        ],
      },
    ],
  },
  {
    id: 'revenue-settlement',
    title: '매출/정산',
    sections: [
      {
        id: 'revenue-order',
        title: '주문 관리',
        tasks: [
          { id: 'revenue-order-template', title: '주문 처리 템플릿 준비', completed: false },
          { id: 'revenue-order-cs', title: '교환/환불 기준 작성', completed: false },
        ],
      },
      {
        id: 'revenue-settle',
        title: '정산 관리',
        tasks: [
          { id: 'revenue-settle-cycle', title: '채널별 정산 주기 확인', completed: false },
          { id: 'revenue-settle-ledger', title: '매출 장부 입력', completed: false },
          { id: 'revenue-settle-deposit', title: '실입금액 대조', completed: false },
        ],
      },
      {
        id: 'revenue-profit',
        title: '수익성 점검',
        tasks: [
          { id: 'revenue-profit-cost', title: '원가 및 수수료 반영', completed: false },
          { id: 'revenue-profit-ad', title: '광고비 대비 수익 확인', completed: false },
          { id: 'revenue-profit-next', title: '다음 발주 수량 결정', completed: false },
        ],
      },
    ],
  },
];
