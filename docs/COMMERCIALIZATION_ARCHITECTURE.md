# BizFlow AtoZ - 상용화 아키텍처

## 서비스 개요
- 서비스명: BizFlow AtoZ / 아이디어투머니
- 대상: 대한민국 1인 사업자·창작자·예비창업자
- 배포: GitHub Pages (정적) + 외부 서비스 연동

## 아키텍처 레이어

```
┌─────────────────────────────────────────┐
│          Frontend (React/Vite)          │
│  - Auth UI (Login/Signup/Forgot/Migration)
│  - Pricing Page                         │
│  - My Page (Account)                    │
│  - Document Vault                       │
│  - Admin Dashboard                      │
│  - AI Task Assistant                    │
└────────────┬────────────────────────────┘
             │ Abstraction Layers
     ┌───────┼────────────────────┐
     ↓       ↓                    ↓
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ Auth    │ │Billing  │ │ AI Provider  │
│ Service │ │ Service │ │              │
└────┬────┘ └────┬────┘ └──────┬───────┘
     │           │              │
     ↓           ↓              ↓
┌─────────┐ ┌─────────┐ ┌──────────────┐
│Supabase │ │  Toss/  │ │  Backend API │
│  Auth   │ │PortOne  │ │  (Proxy)     │
└─────────┘ └─────────┘ └──────┬───────┘
                                │
                         ┌──────┴───────┐
                         │ Gemini/GPT/  │
                         │ Claude API   │
                         └──────────────┘
```

## 현재 구현 상태

### ✅ 완료
- Auth abstraction layer (mock + Supabase adapter skeleton)
- Billing abstraction layer (mock + Toss/PortOne adapter skeleton)
- AI Provider abstraction (mock + backend proxy adapter)
- Repository abstraction (localStorage + Supabase adapter skeleton)
- DB Schema + RLS (supabase/migrations/001_initial_schema.sql)
- 로그인/회원가입/비밀번호찾기 UI
- 개인정보/이용약관 동의 (필수/선택 분리, 타임스탬프+버전)
- Guest data migration modal
- My Page (계정/요금제/데이터/결제내역/설정)
- Pricing Page (FREE/PRO 비교)
- Mock 결제 플로우 (success/fail/cancel/refund)
- Document Vault UI (PRO gated)
- Admin Dashboard (사용자/플랜/환불 관리)
- AI Task Assistant 강화 (컨텍스트, expert badge, suggested actions)
- Plan gating hook (usePlanGating)
- Header auth 버튼, account 메뉴

### 🔜 사용자 확인 필요
- Supabase 프로젝트 생성 + 환경변수 설정
- PG 계정 (Toss Payments / PortOne) 실계정 신청
- AI 백엔드 서버 배포
- 이용약관/개인정보처리방침 법률 검토 및 확정
- 실제 도메인 연결
- 이메일 SMTP 설정

## 데이터 흐름

### Auth Flow
1. 사용자 → LoginModal → authService → mockAuthProvider (dev) / supabaseAuthProvider (prod)
2. AuthContext → useAuth hook → 전역 상태
3. 로그인 후 → DataMigrationModal (localStorage 데이터 있을 경우)

### Billing Flow
1. PricingView → billingService.subscribe()
2. mockPaymentProvider → success/fail mock
3. 성공 시 → updateUserPlanInStorage → AuthContext 갱신
4. 운영 시 → TossPayments 결제창 → 서버 검증 → DB 업데이트

### Project Data Flow
1. App.tsx → loadProjects() (localStorage)
2. 운영 시 → projectRepository.findAll(userId) → Supabase

## 파일 구조

```
src/
├── types/
│   ├── auth.ts          # Auth types
│   └── billing.ts       # Billing types + PLAN_CONFIGS
├── services/
│   ├── auth/
│   │   ├── authService.ts        # Abstraction
│   │   └── mockAuthProvider.ts   # Mock implementation
│   ├── billing/
│   │   ├── billingService.ts     # Abstraction
│   │   └── mockPaymentProvider.ts # Mock implementation
│   ├── ai/
│   │   └── aiProvider.ts         # AI abstraction + mock + backend adapter
│   ├── documentService.ts        # Document vault service
│   └── migrationService.ts       # Guest data migration
├── repositories/
│   └── projectRepository.ts      # Data access abstraction
├── contexts/
│   └── AuthContext.tsx           # Global auth state
├── hooks/
│   └── usePlanGating.ts         # Plan feature gating
├── components/
│   └── auth/
│       ├── LoginModal.tsx
│       ├── SignupModal.tsx
│       ├── ForgotPasswordModal.tsx
│       └── DataMigrationModal.tsx
├── views/
│   ├── AccountView.tsx          # My Page
│   ├── PricingView.tsx          # 요금제
│   ├── DocumentVaultView.tsx    # 문서 보관함 (PRO)
│   └── AdminView.tsx            # 관리자 (admin role)
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```
