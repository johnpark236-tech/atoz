# BizFlow AtoZ - Database Schema

Supabase(PostgreSQL) 기반 스키마입니다.
전체 SQL: `supabase/migrations/001_initial_schema.sql`

## 테이블 목록

| 테이블 | 설명 | RLS |
|--------|------|-----|
| `profiles` | 사용자 프로필 | ✓ |
| `consents` | 약관 동의 기록 | ✓ |
| `projects` | 사업화 프로젝트 | ✓ |
| `checklist_completions` | 체크리스트 완료 상태 | ✓ |
| `user_settings` | 글자크기 등 사용자 설정 | ✓ |
| `subscriptions` | 구독 상태 이력 | ✓ |
| `payments` | 결제 내역 | ✓ |
| `refund_requests` | 환불 요청 | ✓ |
| `documents` | 문서 메타데이터 | ✓ |
| `audit_logs` | 감사 로그 | ✓ |

## 주요 관계

```
auth.users (Supabase 내장)
  └── profiles (1:1)
        ├── consents (1:many)
        ├── projects (1:many)
        │     └── checklist_completions (1:1 per project)
        ├── user_settings (1:1)
        ├── subscriptions (1:many)
        ├── payments (1:many)
        ├── refund_requests (1:many)
        └── documents (1:many)
```

## RLS 정책 원칙

- 모든 테이블: `auth.uid() = user_id` 기반 row-level 격리
- 사용자는 자신의 데이터만 SELECT/INSERT/UPDATE/DELETE 가능
- Admin 역할: profiles.role = 'admin' 확인 후 전체 접근
- 결제/환불: SELECT는 본인만, INSERT는 서버에서만 (service_role key 사용)

## 데이터 전략

### projects 테이블
현재 `tasks`, `sales`, `documents` 배열을 JSONB로 저장합니다.
운영 규모가 커지면 각각 별도 테이블로 분리를 권장합니다.

### 개인정보 보유기간
- 회원탈퇴 후 즉시 anonymize 또는 삭제
- 결제 내역: 세법에 따라 5년 보관
- 감사 로그: 1년 보관
