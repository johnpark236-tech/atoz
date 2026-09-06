# Environment Variables Guide

## 개요
BizFlow AtoZ는 GitHub Pages 정적 배포를 기본으로 하며, 모든 백엔드 기능은 external service adapter로 연결됩니다.

## 설정 방법

```bash
cp .env.example .env
# .env 파일에 실제 값 입력
```

## 변수 목록

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| `VITE_SUPABASE_URL` | 운영 필수 | — | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | 운영 필수 | — | Supabase 익명 키 (공개 가능) |
| `VITE_TOSS_CLIENT_KEY` | PG 필수 | — | Toss Payments 클라이언트 키 |
| `VITE_PORTONE_IMP_CODE` | PG 필수 | — | PortOne 가맹점 식별코드 |
| `VITE_AI_BACKEND_URL` | AI 필수 | — | AI 백엔드 프록시 URL |
| `VITE_STORAGE_BUCKET` | 문서 필수 | `bizflow-documents` | Supabase Storage 버킷명 |
| `GEMINI_API_KEY` | 서버 필수 | — | Gemini API 키 (서버에만) |

## Mock 모드 동작

환경변수가 없을 때 자동으로 mock 모드로 동작합니다:
- Auth: mockAuthProvider (localStorage)
- Payment: mockPaymentProvider (localStorage)
- AI: mockAiProvider (hardcoded responses)
- Document: metadata-only local storage

## GitHub Pages 배포

GitHub Actions에서 빌드 시 필요한 `VITE_*` 변수를 GitHub Secrets에 등록하세요:
- Repository → Settings → Secrets and variables → Actions

## 주의사항

- `VITE_*` 접두사 변수는 클라이언트 코드에 번들됩니다
- AI API 키, PG 시크릿 키는 절대 `VITE_*`로 시작하면 안 됩니다
- 서버 전용 키는 반드시 백엔드 환경변수에만 저장하세요
