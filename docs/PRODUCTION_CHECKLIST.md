# Production Readiness Checklist

## 사용자가 직접 해야 할 작업 (Claude가 할 수 없음)

### 1. Supabase 설정 [필수]
- [ ] Supabase 프로젝트 생성: https://app.supabase.com
- [ ] SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
- [ ] Authentication → Email 설정 (이메일 인증 활성화)
- [ ] Authentication → Email Templates 커스터마이징 (한국어)
- [ ] Storage → Bucket 생성: `bizflow-documents` (private)
- [ ] `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정
- [ ] GitHub Actions Secrets에 동일 변수 설정

### 2. PG 연동 [결제 운영 필수]
- [ ] Toss Payments 또는 PortOne 계정 신청
- [ ] 테스트 키로 결제 플로우 검증
- [ ] 실제 결제 서버 구현 (billingService adapter)
- [ ] `.env`에 PG 키 설정

### 3. AI 백엔드 [AI 기능 운영 필수]
- [ ] Express/Fastify 백엔드 서버 구축
- [ ] Gemini/GPT/Claude API 키를 서버 환경변수에 설정
- [ ] `/api/ai/consult` 엔드포인트 구현
- [ ] Rate limiting 적용
- [ ] `VITE_AI_BACKEND_URL` 설정

### 4. 법률 [서비스 런칭 필수]
- [ ] 이용약관 법률 전문가 검토 및 확정
- [ ] 개인정보처리방침 법률 전문가 검토 및 확정
- [ ] 환불 정책 명시 (7일 청약철회)
- [ ] 통신판매업 신고 (오픈마켓 판매 시)
- [ ] 개인정보 보호책임자 지정

### 5. 도메인 & 인프라
- [ ] 도메인 구입 및 DNS 설정
- [ ] HTTPS 인증서 (자동: Vercel/Netlify, 수동: Let's Encrypt)
- [ ] GitHub Pages 커스텀 도메인 설정 (또는 Vercel 배포)

### 6. 모니터링
- [ ] Sentry 에러 트래킹 설정
- [ ] 사용자 분석 (Google Analytics 또는 Plausible)
- [ ] 서버 모니터링

---

## Claude Code가 추가로 할 수 있는 작업

### 즉시 가능 (환경변수 없이)
- [ ] Supabase Auth Provider 실제 구현 (`supabaseAuthProvider.ts`)
- [ ] Supabase Project Repository 실제 구현
- [ ] Supabase Document Repository 구현
- [ ] Toss Payments adapter 구현 (클라이언트 연동 코드)
- [ ] PortOne adapter 구현
- [ ] 이용약관 / 개인정보처리방침 임시 템플릿 뷰 구현
- [ ] Terms/Privacy 전용 페이지 뷰 구현
- [ ] 비밀번호 강도 표시기 UI 추가
- [ ] 알림 설정 UI (PRO placeholder)
- [ ] 이메일 인증 안내 UI
- [ ] 챠트 기반 매출 분석 대시보드 강화
- [ ] 로드맵 진행률 시각화 개선
- [ ] 모바일 반응형 추가 개선
- [ ] 단위 테스트 추가 (Vitest)
- [ ] E2E 테스트 스텁 (Playwright)

---

## 현재 상태 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| Auth UI | ✅ 완료 | Mock 동작 |
| Auth 로직 | ✅ Mock | Supabase 연결 대기 |
| 동의 관리 | ✅ 완료 | |
| DB 스키마 | ✅ 완료 | Supabase 실행 대기 |
| 마이페이지 | ✅ 완료 | |
| 가격표 | ✅ 완료 | |
| Mock 결제 | ✅ 완료 | |
| 구독 관리 | ✅ Mock | PG 연결 대기 |
| 문서 보관함 | ✅ PRO UI | Storage 연결 대기 |
| 관리자 UI | ✅ Mock | DB 연결 대기 |
| AI Assistant | ✅ Mock | 백엔드 연결 대기 |
| 보안 리뷰 | ✅ TODO 문서 | 운영 전 필수 |
| Build | ✅ PASS | |
| GitHub Pages | ✅ 기존 동작 | |
