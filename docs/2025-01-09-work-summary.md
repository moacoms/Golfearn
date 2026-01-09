# 작업 내역 정리 (2025-01-09)

## 해결된 문제

### 1. 로그인 상태 표시 안 됨
- **증상**: 로그인 성공 후에도 헤더에 "로그인/회원가입" 버튼이 그대로 표시
- **원인**: Header 컴포넌트에서 로그인 상태를 확인하지 않음
- **해결**: Header.tsx에 Supabase auth 상태 확인 로직 추가

### 2. 환경변수 URL 불일치
- **증상**: 인증 리다이렉트 실패
- **원인**: `NEXT_PUBLIC_SITE_URL=https://golfearn.com` (www 없음)
- **해결**: `NEXT_PUBLIC_SITE_URL=https://www.golfearn.com`으로 수정

### 3. 이메일 인증 PKCE 문제
- **증상**: 이메일 인증 링크 클릭 시 `otp_expired` 에러
- **원인**: PKCE 토큰이 브라우저에 저장되어 다른 브라우저에서 열면 실패
- **해결**: Supabase에서 "Confirm email" 옵션 OFF

## 수정된 파일

### `components/layout/Header.tsx`
로그인 상태에 따른 UI 변경
```typescript
// 추가된 기능
- useEffect로 현재 사용자 확인 (supabase.auth.getUser)
- onAuthStateChange로 인증 상태 변화 구독
- 로그인 시: "닉네임님" + 로그아웃 버튼 표시
- 비로그인 시: 로그인 + 회원가입 버튼 표시
- 모바일 메뉴에도 동일하게 적용
```

### `lib/guides.ts`
입문 가이드 4개 추가
```
- 연습장에서 창피했던 순간들 (practice)
- 드라이버 샤프트, 쉽게 이해하기 (equipment)
- 첫 필드 나가기 전 알아야 할 것들 (round)
- 혼자 라운딩 가는 방법 (골린이 버전) (round)
```

## 환경 설정 변경

### Vercel 환경변수
| 변수 | 이전 | 이후 |
|------|------|------|
| NEXT_PUBLIC_SITE_URL | https://golfearn.com | https://www.golfearn.com |

### Supabase 설정
| 설정 | 변경 |
|------|------|
| Authentication → Email → Confirm email | ON → OFF |

## 로컬 환경 설정

### Vercel CLI 연결
```bash
npx vercel login
npx vercel link --yes
npx vercel env pull .env.local
```

### 생성된 파일
- `.env.local` - Vercel에서 환경변수 pull
- `.vercel/` - Vercel 프로젝트 연결 정보

## 확인된 기존 기능

### DB 테이블 (모두 존재 확인)
- `pre_registrations` - 사전예약
- `profiles` - 사용자 프로필
- `posts` - 게시글
- `comments` - 댓글
- `increment_post_view` RPC - 조회수 증가 함수

## Git 커밋

```
8798128 - Add 4 more guide contents
86dd9aa - Fix header to show login state
```

## 현재 서비스 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 랜딩페이지 | ✅ | 사전예약 폼 포함 |
| 회원가입/로그인 | ✅ | 이메일 방식 |
| 로그인 상태 헤더 | ✅ | 닉네임 + 로그아웃 |
| 입문 가이드 | ✅ | 10개 완성 |
| 커뮤니티 게시판 | ✅ | CRUD + 댓글 |
| 중고거래 장터 | 🔜 | UI만 구현됨 |
| 카카오 로그인 | ❌ | 미구현 |

## 다음 작업 (예정)

1. 중고거래 장터 기능 구현
   - 상품 등록/수정/삭제
   - 이미지 업로드 (Supabase Storage)
   - 검색 & 필터
   - 채팅 기능

2. 카카오 로그인 (선택사항)
