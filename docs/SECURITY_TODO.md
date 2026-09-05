# BizFlow AtoZ - Security TODO

운영 전 반드시 해결해야 할 보안 항목 목록입니다.
각 항목의 우선순위: 🔴 Critical / 🟡 High / 🟢 Medium

---

## 🔴 Critical (운영 전 필수)

### AI API 키 노출 방지
- **현재 상태**: AI API 키를 프런트엔드에 직접 노출하지 않고, backend proxy 구조로 설계됨
- **필요 작업**: 
  - 백엔드 API 서버 구축 (Express/Fastify)
  - API 키는 서버 환경변수에만 저장
  - VITE_AI_BACKEND_URL 설정 후 실제 AI 연동
  - Rate limiting 적용 (per user/IP)

### 실제 Auth 구현
- **현재 상태**: localStorage 기반 mock auth (비밀번호 평문 저장)
- **필요 작업**:
  - Supabase Auth 연동 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - Supabase는 bcrypt 기반 비밀번호 해싱 처리
  - JWT 세션 관리 자동화
  - 이메일 인증 활성화 (Supabase 대시보드에서 설정)

### 결제 보안
- **현재 상태**: Mock 결제, 실제 PG 없음
- **필요 작업**:
  - Toss Payments 또는 PortOne 실계정 연동
  - 결제 금액 변조 방지: 클라이언트에서 금액을 전송하지 말고 서버에서 검증
  - 결제 완료 후 서버에서 PG사 API로 재검증
  - Webhook 서명 검증

### 데이터 격리
- **현재 상태**: localStorage는 브라우저 단위 격리만
- **필요 작업**:
  - Supabase RLS 정책 활성화 및 테스트
  - 모든 DB 쿼리에 user_id 필터 확인
  - 관리자 전용 API 엔드포인트에 role 검증 미들웨어 추가

---

## 🟡 High

### XSS 방지
- **현재 상태**: React는 기본적으로 JSX 내 텍스트를 escape 처리
- **확인 필요**:
  - dangerouslySetInnerHTML 사용 여부 확인 → 현재 없음 ✓
  - 마크다운 렌더링 시 라이브러리 sanitize 설정 확인
  - AI 응답 렌더링: 현재 whitespace-pre-wrap 텍스트만 사용 ✓

### 파일 업로드 검증
- **현재 상태**: 클라이언트에서 MIME type과 파일 크기 검증
- **필요 작업**:
  - 서버에서도 MIME type 재검증 (Content-Type 헤더는 조작 가능)
  - 파일 내용 기반 magic bytes 검증
  - Supabase Storage: 버킷 정책으로 허용 파일 타입 제한
  - 파일명 sanitization (path traversal 방지)

### Admin Route 보호
- **현재 상태**: 클라이언트 role 체크 (user.role === 'admin')
- **필요 작업**:
  - 서버 API에서도 admin role 재검증
  - Supabase: Admin API는 service_role key로만 호출 (프런트에서 직접 불가)

### CSRF 보호
- **현재 상태**: SPA라 전통적 CSRF 위험 낮음
- **확인 필요**:
  - API 서버 구축 시 CORS 정책 명시 (특정 origin만 허용)
  - Supabase는 JWT 기반이라 CSRF 위험 낮음 ✓

---

## 🟢 Medium

### localStorage 민감정보 저장
- **현재 상태**: 사용자 프로필(이메일, 플랜), 비밀번호(mock)가 localStorage에 저장됨
- **운영에서**: Supabase JWT는 httpOnly cookie 또는 memory에만 저장 권장
- **필요 작업**: Supabase 연동 시 localStorage auth 제거

### Rate Limiting
- **필요 작업**:
  - 로그인 시도 제한 (5회 실패 시 5분 잠금)
  - AI 질문 API rate limiting (Free: 10회/일, Pro: 100회/일)
  - 파일 업로드 rate limiting

### Input Validation
- **현재 상태**: 기본적인 HTML validation 사용
- **필요 작업**:
  - 이메일 형식 검증 (서버에서도)
  - 비밀번호 강도 검증 강화
  - 파일명, 메모 최대 길이 제한

### Audit Log
- **현재 상태**: DB 스키마에 audit_logs 테이블 설계됨
- **필요 작업**:
  - 민감한 작업 로깅: 로그인/로그아웃, 결제, 환불, 계정 삭제
  - 관리자 작업 로깅

### 의존성 취약점
```bash
npm audit
```
정기적으로 실행하고 취약점 패치 적용

---

## 법률/컴플라이언스 TODO

### 이용약관 및 개인정보처리방침
- **현재 상태**: 임시 템플릿 사용 (TODO 표시)
- **필요 작업**: 법무사/법률 전문가 최종 검토 후 확정

### 개인정보보호법 (PIPA)
- 개인정보 보유기간 명시
- 개인정보 파기 절차 (회원탈퇴 후 즉시 또는 법정 보유기간 후)
- 개인정보 처리 방침 공개 (서비스 하단에 링크)
- 개인정보 보호책임자 지정

### 전자상거래 등에서의 소비자보호에 관한 법률
- 환불 정책 명시 (7일 이내 청약철회)
- 구독 해지 방법 명시
- 사업자 정보 공개

### 정보통신망법
- 개인정보 수집·이용 동의 → 구현됨 ✓
- 선택 동의 분리 → 구현됨 ✓
- 동의 일시 기록 → 구현됨 ✓

---

## 운영 배포 체크리스트

- [ ] Supabase 프로젝트 생성 및 설정
- [ ] 실제 환경변수 설정 (GitHub Secrets 또는 Vercel Env)
- [ ] DB 마이그레이션 실행
- [ ] RLS 정책 검증 테스트
- [ ] Supabase Auth 이메일 템플릿 커스터마이징
- [ ] PG(Toss/PortOne) 테스트 결제 검증
- [ ] AI 백엔드 API 서버 배포
- [ ] CORS 정책 설정
- [ ] SSL/TLS 인증서 확인
- [ ] 백업 정책 설정
- [ ] 모니터링/알림 설정 (Sentry 등)
- [ ] 법률 문안 최종 검토
