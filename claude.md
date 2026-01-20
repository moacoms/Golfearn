# CLAUDE.md - Golfearn 프로젝트

## 프로젝트 개요

### 서비스 정보
- **서비스명**: Golfearn (골프런)
- **의미**: Golf + Learn (배우다) / Golf + Earn (얻다)
- **핵심 슬로건**: "늦게 시작해도 괜찮아, 함께라면"
- **목적**: 30대 후반~50대 골프 입문자(골린이)가 겪는 정보 비대칭, 비용 부담, 심리적 장벽을 해소하는 올인원 플랫폼
- **창업자 배경**: 42살에 골프 시작한 실제 경험 보유 → 진정성 있는 콘텐츠 가능

### 도메인
- **메인**: www.golfearn.com (운영 중)

---

## 비전 & 목표

### 최종 비전
> **한국 골프 산업을 반전시키고, 부의 자유를 얻어 매주 라운딩하는 삶**

### 왜 Golfearn인가?
- 42살에 골프 시작한 실제 경험 → 골린이 고충을 진짜로 이해
- 골린이 전용 플랫폼 (기존 경쟁사에 없음)
- 입문자 여정 전체 커버 (장비 → 레슨 → 연습 → 조인)

### 성장 로드맵

#### Phase 1: 초기 유저 확보 (현재)
- [ ] 초기 유저 100명 확보
  - 골프 커뮤니티 홍보 (골프존 카페, 네이버 카페)
  - 지인 네트워크 활용
  - 추천인 시스템으로 바이럴
- [ ] 실제 사용 피드백 수집 및 빠른 개선
- [ ] 진정성 있는 콘텐츠 작성 ("42살에 골프 시작한 이유" 등)

#### Phase 2: 서비스 안정화
- [ ] MAU 1,000명 달성
- [ ] 조인 매칭 월 100건 이상
- [ ] 중고거래 월 50건 이상
- [ ] 레슨프로 등록 50명 이상

#### Phase 3: 수익화
- [ ] 중고거래 수수료 도입
- [ ] 프리미엄 멤버십 런칭 (월 9,900원)
- [ ] 레슨/피팅 예약 수수료
- [ ] 골프장/브랜드 광고 제휴

#### Phase 4: 확장
- [ ] 앱 출시 (React Native)
- [ ] AI 클럽 추천 기능
- [ ] 골프장 예약 연동
- [ ] 월 매출 1,000만원 달성

### 현재 보유 자산
- ✅ 조인 매칭, 중고거래, 레슨프로 연결 기능 완성
- ✅ 포인트/추천인 시스템으로 자연스러운 유저 확보 구조
- ✅ 15개 연습장 데이터
- ✅ 프로덕션 배포 완료 (www.golfearn.com)

---

## 기술 스택

```
프론트엔드: Next.js 14 (App Router)
백엔드/DB: Supabase (Auth + PostgreSQL + Storage + Realtime)
스타일링: Tailwind CSS
배포: Vercel
```

### 선택 이유
- Claude Code와 최고의 궁합
- 초기 비용 0원 (Vercel + Supabase 무료 티어)
- React Native로 앱 전환 용이
- 실시간 기능(채팅) Supabase Realtime으로 구현

---

## 타겟 고객

### 주 타겟
- **연령**: 35~55세 골프 입문자 (골린이)
- **특징**: 직장인, 자영업자, 사회적 목적으로 골프 시작
- **Pain Point**:
    - 뭘 사야 할지 모름 (장비)
    - 어디서 배워야 할지 모름 (레슨)
    - 혼자 라운딩 가기 어려움 (조인)
    - 비용이 얼마나 드는지 감이 안 옴

---

## 주요 기능

### Phase 1: MVP (1~2주)
1. **랜딩페이지**
    - 서비스 소개
    - 사전예약 폼 (이메일 수집)

2. **콘텐츠 허브**
    - 입문 가이드 (로드맵)
    - 장비 가이드 (체형별/예산별)
    - 연습/레슨 가이드

3. **회원 시스템**
    - Supabase Auth (카카오 로그인)
    - 마이페이지

4. **커뮤니티 게시판**
    - Q&A 게시판
    - 자유게시판
    - 후기 게시판

### Phase 2: 수익화 (3~4주)
5. **중고거래 장터**
    - 상품 등록 (이미지 업로드)
    - 카테고리 & 검색
    - 채팅 문의
    - 거래 상태 관리

6. **레슨프로 매칭** (추후)
    - 프로 DB
    - 지역/가격 필터
    - 리뷰/평점

### Phase 3: 확장
7. **골린이 조인 매칭**
    - 실력별 매칭 (100타 이상만)
    - 지역별 모임

8. **AI 기능**
    - 체형별 클럽 추천
    - 스윙 영상 분석

---

## 데이터베이스 스키마 (Supabase)

> 상세 SQL은 `supabase/migrations/` 폴더 참고

### 핵심 테이블

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 (auth.users 확장) |
| `posts` | 커뮤니티 게시글 |
| `comments` | 댓글 |
| `products` | 중고거래 상품 |
| `messages` | 채팅 메시지 |
| `favorites` | 찜 목록 |

### 조인 매칭

| 테이블 | 설명 |
|--------|------|
| `join_posts` | 조인 모집글 |
| `join_participants` | 조인 참가자 |
| `join_messages` | 조인 채팅 |

### 레슨/연습장

| 테이블 | 설명 |
|--------|------|
| `lesson_pros` | 레슨프로 정보 |
| `lesson_pro_reviews` | 레슨프로 리뷰 |
| `lesson_inquiries` | 레슨 문의 |
| `practice_ranges` | 연습장 정보 |
| `golf_course_reviews` | 골프장 리뷰 |

### BM/포인트 시스템

| 테이블 | 설명 |
|--------|------|
| `referral_codes` | 추천 코드 (GOLF-XXXXXX) |
| `referrals` | 추천 관계 기록 |
| `point_wallets` | 포인트 지갑 |
| `point_transactions` | 포인트 거래 내역 |
| `user_experience` | 경험치/레벨 |
| `xp_transactions` | 경험치 거래 내역 |
| `badges` | 뱃지 마스터 |
| `user_badges` | 사용자 획득 뱃지 |
| `daily_check_ins` | 출석 체크 |

### 이벤트/프로모션

| 테이블 | 설명 |
|--------|------|
| `events` | 이벤트 |
| `event_participants` | 이벤트 참가자 |
| `promo_codes` | 프로모션 코드 |
| `promo_code_usage` | 프로모션 코드 사용 내역 |
| `premium_subscriptions` | 프리미엄 멤버십 |

---

## 폴더 구조

```
/app
  /page.tsx                    # 랜딩페이지
  /layout.tsx                  # 루트 레이아웃
  /(auth)
    /login/page.tsx            # 로그인
    /signup/page.tsx           # 회원가입
  /(main)
    /guide                     # 입문 가이드
      /page.tsx                # 가이드 목록
      /[slug]/page.tsx         # 가이드 상세
    /community                 # 커뮤니티
      /page.tsx                # 게시글 목록
      /write/page.tsx          # 글쓰기
      /[id]/page.tsx           # 게시글 상세
    /market                    # 중고거래
      /page.tsx                # 상품 목록
      /sell/page.tsx           # 판매 등록
      /[id]/page.tsx           # 상품 상세
    /join                      # 조인 매칭
      /page.tsx                # 조인 목록
      /create/page.tsx         # 모집글 작성
      /[id]/page.tsx           # 모집글 상세
    /mypage                    # 마이페이지
      /page.tsx
      /profile/page.tsx
      /joins/page.tsx          # 내 조인 목록 (예정)
/components
  /ui                          # 공통 UI 컴포넌트
  /layout                      # 레이아웃 컴포넌트
    /Header.tsx
    /Footer.tsx
    /Sidebar.tsx
  /guide                       # 가이드 관련
  /community                   # 커뮤니티 관련
  /market                      # 중고거래 관련
  /join                        # 조인 관련
    /JoinCard.tsx              # 조인 카드
  /location                    # 위치 관련
    /LocationSettingModal.tsx
    /LocationFilterChip.tsx
/lib
  /supabase
    /client.ts                 # Supabase 클라이언트
    /server.ts                 # 서버 컴포넌트용
  /actions
    /products.ts               # 중고거래 Server Actions
    /join.ts                   # 조인 매칭 Server Actions
  /utils.ts                    # 유틸리티 함수
/content
  /guides                      # MDX 가이드 콘텐츠
/public
  /images
/types
  /database.ts                 # Supabase 타입
/supabase
  /migrations                  # DB 마이그레이션 파일
/docs                          # 개발 문서
```

---

## 페이지별 요구사항

### 1. 랜딩페이지 (/)
- 히어로 섹션: 슬로건 + CTA 버튼
- 서비스 소개: 4가지 핵심 기능
- 사전예약 폼: 이메일 입력 → Supabase에 저장
- 푸터: SNS 링크, 연락처

### 2. 입문 가이드 (/guide)
- MDX로 콘텐츠 관리
- 카테고리: 시작하기, 장비, 레슨, 연습, 라운딩
- 읽기 시간 표시
- 목차 자동 생성

### 3. 커뮤니티 (/community)
- 카테고리 탭: Q&A, 자유, 후기
- 게시글 목록: 제목, 작성자, 날짜, 조회수, 댓글수
- 글쓰기: 제목, 내용 (에디터), 카테고리 선택
- 상세: 본문, 댓글 목록, 댓글 작성

### 4. 중고거래 (/market)
- 필터: 카테고리, 상태, 가격대, 지역
- 상품 카드: 이미지, 제목, 가격, 상태, 지역
- 판매 등록: 이미지 업로드(최대 5장), 상품 정보 입력
- 상세: 이미지 슬라이더, 상품 정보, 판매자 정보, 채팅 버튼

### 5. 마이페이지 (/mypage)
- 프로필 정보 (수정 가능)
- 내 게시글 목록
- 내 판매 상품
- 관심 상품 (찜 목록)

---

## 경쟁사 분석 요약

### 시장 빈틈 (우리의 기회)
1. **골린이 전용 공간 부재**: 기존 서비스는 고수 위주
2. **입문 여정 통합 관리 없음**: 장비→레슨→연습→조인 각각 분산
3. **체형별 장비 추천 없음**: "키 175, 초보, 100만원" 맞춤 추천 없음
4. **실력별 조인 없음**: 100타 이상끼리만 매칭하는 곳 없음
5. **공감 콘텐츠 부족**: "나도 42살에 시작" 같은 진정성

### 주요 경쟁사
- 골프존: 모든 기능, 하지만 초보 특화 X
- 골프존마켓 이웃: 중고거래 특화
- 골팡/엑스골프: 조인 특화
- 골인원: 골린이 타겟이었으나 2021년 이후 방치

---

## 수익 모델

| 모델 | 설명 | 예상 비중 |
|------|------|----------|
| 중고거래 수수료 | 거래 성사시 5~10% | 25% |
| 레슨/피팅 예약 수수료 | 예약 건당 수수료 | 20% |
| 용품 커머스 | 직접 판매 마진 | 25% |
| 프리미엄 멤버십 | 월 9,900원 | 15% |
| 광고/제휴 | 골프장, 브랜드 광고 | 15% |

---

## 개발 타임라인

### 1월 1~2주: MVP 기반
- [x] 서비스 기획 완료
- [x] 서비스명 확정 - **Golfearn**
- [x] Next.js + Supabase 프로젝트 셋업
- [x] 기본 페이지 구조 생성 (랜딩, 가이드, 커뮤니티, 마켓, 마이페이지)
- [ ] 랜딩페이지 사전예약 기능 (Supabase 연동)
- [ ] 도메인 구매 (golfearn.com / golfearn.kr)
- [ ] Vercel 배포

### 1월 3~4주: 핵심 기능
- [ ] 회원가입/로그인 (카카오)
- [ ] 콘텐츠 허브 (입문 가이드)
- [ ] 커뮤니티 게시판

### 2월 1~2주: 중고거래
- [ ] 상품 등록/수정/삭제
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 검색 & 필터
- [ ] 채팅 기능

### 2월 3~4주: 런칭
- [ ] 정식 오픈
- [ ] 커뮤니티 홍보
- [ ] 초기 사용자 100명 목표

---

## 디자인 가이드

### 컬러
```css
--primary: #10B981;      /* 그린 (골프 느낌) */
--primary-dark: #059669;
--secondary: #3B82F6;    /* 블루 */
--background: #F9FAFB;
--foreground: #111827;
--muted: #6B7280;
--border: #E5E7EB;
```

### 폰트
- 한글: Pretendard
- 영문: Inter

### 톤앤매너
- 친근하고 따뜻한 느낌
- 초보자가 부담 없이 느끼는 UI
- 깔끔하고 모던한 디자인
- 과한 장식 배제

---

## 콘텐츠 리스트 (초기 작성)

### 입문 가이드 (10개)
1. 42살에 골프 시작한 이유
2. 골린이 첫 클럽 세트, 얼마짜리 사야 할까?
3. 중고채 vs 새 클럽, 뭐가 나을까?
4. 레슨프로 고르는 5가지 기준
5. 연습장 처음 가면 뭐부터 해야 하나?
6. 골프 시작 비용 총정리 (현실 버전)
7. 연습장에서 창피했던 순간들
8. 드라이버 샤프트, 쉽게 이해하기
9. 첫 필드 나가기 전 알아야 할 것들
10. 혼자 라운딩 가는 방법 (골린이 버전)

---

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 참고 명령어

### 프로젝트 생성
```bash
npx create-next-app@latest [서비스명] --typescript --tailwind --app --src-dir=false
cd [서비스명]
npm install @supabase/supabase-js @supabase/ssr
```

### 개발 서버
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### Supabase CLI
```bash
npx supabase init
npx supabase db push
npx supabase gen types typescript --local > types/database.ts
```

---

## 주의사항

1. **SEO 중요**: SSR/SSG 적극 활용, 메타태그 필수
2. **모바일 퍼스트**: 반응형 필수, 모바일 우선 디자인
3. **성능 최적화**: 이미지 최적화 (next/image), 코드 스플리팅
4. **보안**: Supabase RLS 정책 필수 설정
5. **접근성**: 시맨틱 HTML, aria 속성

---

## 개발 진행 현황 (2026-01-20 업데이트)

### ✅ 완료된 작업

#### 1월 4주차 (클럽 자동 업데이트 + 관리자 시스템) - 2026-01-20

38. **클럽 시드 데이터 적용**
    - 8개 브랜드, 50개 클럽 데이터 등록
    - 마이그레이션: `supabase/migrations/20260119_seed_clubs.sql`

39. **클럽 자동 업데이트 시스템**
    - AI가 새 클럽을 자동 검색하여 pending_clubs에 저장
    - 관리자가 검토 후 승인/거절
    - DB 테이블: `pending_clubs`, `club_search_logs`, `admin_notifications`
    - 마이그레이션: `supabase/migrations/20260120_add_pending_clubs.sql`
    - PostgreSQL 함수: `approve_pending_club()`, `reject_pending_club()`

40. **관리자 클럽 관리 페이지**
    - `/admin/clubs` - 클럽 목록 (검색, 필터, 페이지네이션)
    - `/admin/clubs/new` - 새 클럽 추가 폼
    - `/admin/clubs/pending` - 대기 클럽 검토 (승인/거절)
    - Server Actions: `lib/actions/admin-clubs.ts`

41. **AI 클럽 검색 Cron API**
    - `/api/cron/search-new-clubs` - Vercel Cron 엔드포인트
    - 매주 월요일 오전 9시 자동 실행
    - Claude API를 통한 새 클럽 정보 검색
    - Vercel 설정: `vercel.json`

42. **헤더 네비게이션 개선**
    - 연습장 (`/practice-range`) 메뉴 추가
    - 골프장 (`/golf-courses`) 메뉴 추가

43. **관리자 아이콘 기능**
    - `is_admin=true` 사용자에게 설정 아이콘(⚙️) 표시
    - 데스크탑: 이름 옆에 작은 아이콘
    - 모바일: 메뉴에 "관리자" 링크 추가
    - 클릭 시 `/admin` 페이지로 이동

#### 1월 4주차 (클럽 카탈로그 + AI 추천) - 2026-01-19

32. **골프 클럽 카탈로그 시스템**
    - DB 마이그레이션: `supabase/migrations/20260119_add_club_catalog.sql`
    - 5개 테이블: `golf_club_brands`, `golf_clubs`, `golf_club_reviews`, `golf_club_price_history`, `user_club_profiles`
    - `products` 테이블에 `club_id`, `club_specs` 컬럼 추가
    - 시드 데이터: 8개 브랜드, 50개 클럽

33. **클럽 카탈로그 페이지**
    - `/club-catalog` - 목록 (필터: 검색, 타입, 브랜드, 연도, 가격대)
    - `/club-catalog/[id]` - 상세 (스펙, 리뷰, 시세 가이드, 관련 클럽)
    - 컴포넌트: `ClubCard.tsx`, `ClubSelector.tsx`

34. **AI 클럽 추천 시스템**
    - `/club-recommend` - 5단계 마법사 (키 → 실력 → 미스샷 → 예산 → 결과)
    - 추천 알고리즘: 실력 매칭(30점), 스펙 매칭(25점), 예산 매칭(20점), 선호도 매칭(25점)
    - Server Actions: `lib/actions/club-recommendation.ts`

35. **시세 가이드 기능**
    - 상태별(S/A/B/C) 중고 시세
    - 월별 시세 추이, 시세 대비 가격 평가
    - Server Actions: `lib/actions/club-price.ts`

36. **중고거래 연동**
    - `/market/sell` 페이지에 ClubSelector 통합
    - 클럽 선택 시 제목/가격 자동 입력
    - 시세 가이드 라벨 표시

37. **네비게이션 업데이트**
    - Header에 "클럽 카탈로그", "AI 추천" 메뉴 추가

#### 1월 4주차 (BM/포인트 시스템) - 2026-01-16

24. **BM & 프로모션 시스템 구현**
    - `claude/bm-promotion-strategy-d9lIM` 브랜치 병합
    - 추천인 시스템, 포인트 시스템, 이벤트 시스템 통합
    - 마이그레이션 파일: `supabase/migrations/20260115_referral_points_events.sql`

25. **포인트/리워드 시스템**
    - 회원가입 시 3,000P 자동 지급
    - 출석 체크 기능 (연속 출석 보너스: 3일 200P, 7일 500P)
    - 포인트 거래 내역 관리
    - 마이페이지 포인트 탭: `/mypage/points`

26. **추천인 시스템**
    - 회원가입 시 추천 코드 자동 생성 (GOLF-XXXXXX)
    - 추천인 보상: 5,000P
    - 피추천인 보상: 3,000P 추가
    - 추천 통계 및 리더보드

27. **경험치/레벨 시스템**
    - 활동별 경험치 획득
    - 레벨업 자동 체크 (Lv1~Lv6)
    - XP 리더보드

28. **뱃지 시스템**
    - 10개 초기 뱃지 등록
    - 조건 달성 시 자동 부여
    - 뱃지: 첫 라운딩 완주, 7일 연속 출석, 댓글왕, 조인 달인 등

29. **이벤트/프로모션 시스템**
    - 이벤트 생성/참가 기능
    - 프로모션 코드 발급/사용
    - 프리미엄 멤버십 테이블

30. **연습장 데이터 임포트**
    - 전국 15개 연습장 샘플 데이터 등록
    - 지역: 서울(3), 경기(3), 인천(1), 부산(2), 대구(1), 대전(1), 광주(1), 제주(2), 강원(1)
    - 스크립트: `scripts/import-practice-ranges.js`

31. **빌드 에러 수정**
    - Button 컴포넌트 import 수정 (named → default export)
    - Supabase 테이블 타입 에러 수정 (`as any` 캐스팅)

#### 1월 1주차 (프로젝트 초기화)
1. **프로젝트 초기화**
   - Next.js 14 + TypeScript + Tailwind CSS 3 설정
   - Supabase 클라이언트 설정 (client, server, middleware)
   - ESLint 설정

2. **Supabase 연동**
   - 프로젝트 생성 완료
   - 환경변수 설정 완료 (`.env.local`)
   - URL: `https://bfcmjumgfrblvyjuvmbk.supabase.co`

3. **기본 페이지 생성**
   - `/` - 랜딩페이지 (히어로, 기능소개, 사전예약 폼 UI)
   - `/login` - 로그인 페이지 (카카오 + 이메일)
   - `/signup` - 회원가입 페이지
   - `/guide` - 입문 가이드 목록
   - `/community` - 커뮤니티 게시판
   - `/market` - 중고거래 장터
   - `/mypage` - 마이페이지

4. **기본 컴포넌트 생성**
   - `components/layout/Header.tsx` - 반응형 헤더 (모바일 메뉴 포함)
   - `components/layout/Footer.tsx` - 푸터
   - `components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`

#### 1월 2주차 (위치 기반 기능)
5. **위치 기반 중고거래 기능 (당근마켓 스타일)**
   - Google Maps API 연동 (한글 지도)
   - 판매 등록 시 지도에서 거래 희망 장소 선택
   - 상품 상세 페이지에서 거래 장소 지도 표시
   - 상품 목록 거리순 정렬

6. **사용자 위치 설정 기능**
   - GPS 현재 위치 감지
   - 주소 검색 기능
   - 검색 범위 선택 (1km, 3km, 5km, 10km, 20km)
   - 마이페이지 프로필에서 동네 설정 UI

7. **거리별 필터링**
   - `LocationFilterChip` 컴포넌트: 전국/거리 범위 선택
   - Haversine 공식으로 거리 계산
   - 범위 내 상품만 필터링 + 거리순 정렬

8. **위치 관련 컴포넌트**
   - `components/location/LocationSettingModal.tsx` - 동네 설정 모달
   - `components/location/LocationFilterChip.tsx` - 거리 필터 칩
   - `components/location/LocationSearchInput.tsx` - 주소 검색
   - `components/location/LocationDisplay.tsx` - 위치 표시

9. **가이드 페이지 카테고리 필터 수정**
   - searchParams를 사용한 카테고리 필터링

#### 1월 3주차 (조인 매칭 기능)
10. **골린이 조인 매칭 기능 (2025-01-13)**
    - 배경: 골프 비용/난이도/접근성 문제 해결
    - 100타 이상 초보 골퍼끼리 함께 라운딩
    - DB 테이블: `join_posts`, `join_participants`
    - RLS 정책 8개, 인덱스 6개

11. **조인 페이지 구현**
    - `/join` - 조인 목록 (날짜/위치/실력 필터)
    - `/join/create` - 모집글 작성
    - `/join/[id]` - 모집글 상세 + 참가 신청
    - `components/join/JoinCard.tsx` - 조인 카드

12. **조인 Server Actions** (`lib/actions/join.ts`)
    - `getJoinPosts` - 목록 조회 (필터링)
    - `createJoinPost` - 모집글 생성
    - `applyToJoin` - 참가 신청
    - `updateParticipantStatus` - 승인/거절
    - 참가 인원 자동 업데이트 트리거

13. **Vercel 배포 완료**
    - 프로덕션 URL: https://www.golfearn.com
    - 조인 매칭: https://www.golfearn.com/join

14. **마이페이지 조인 탭** - `/mypage/joins`
    - 내가 만든 조인, 참가한 조인 목록
    - 참가자 승인/거절 관리

15. **조인 알림 기능**
    - 참가 신청/승인/거절 실시간 알림
    - `/mypage/notifications` 알림 목록

16. **조인 채팅 기능**
    - `/join/[id]/chat` 참가자 간 실시간 채팅
    - Supabase Realtime 연동

#### 1월 3주차 (골프장 검색 기능)
17. **골프장 검색 기능 (2025-01-14)**
    - Google Places API 연동 (Text Search, Details API)
    - `/golf-courses` - 내 주변 골프장 목록
    - `/golf-courses/[id]` - 골프장 상세 (사진, 영업시간, 리뷰)
    - 위치 정보 실패 시 18개 한국 주요 지역 수동 선택
    - 골프장 리뷰 기능 (Supabase DB)

18. **이메일 인증 설정**
    - Supabase 이메일 인증 ON
    - 이메일 템플릿 한글화 완료
    - Custom SMTP 설정 방법 문서화 (CLAUDE.md)

#### 1월 3주차 (2025-01-15)
19. **SEO 최적화**
    - `app/robots.ts` - 검색엔진 크롤링 규칙
    - `app/sitemap.ts` - 동적 사이트맵 생성
    - `app/layout.tsx` - 메타데이터 강화 (OpenGraph, Twitter Cards)

20. **커뮤니티 좋아요/북마크 기능**
    - 게시글 좋아요 토글
    - 게시글 북마크 토글
    - `/mypage/bookmarks` - 북마크한 글 목록
    - DB 테이블: `post_likes`, `post_bookmarks`

21. **랜딩페이지 UI 개선**
    - Stats 섹션 추가 (사용자 수, 거래 건수 등)
    - Why 섹션 추가 (서비스 선택 이유)
    - Testimonials 섹션 추가 (사용자 후기)
    - 모바일 반응형 개선

22. **레슨프로 매칭 기능**
    - `/lesson-pro` - 레슨프로 목록 (필터: 지역, 전문 분야, 레슨 유형)
    - `/lesson-pro/[id]` - 레슨프로 상세 (프로필, 리뷰, 문의하기)
    - `/lesson-pro/register` - 레슨프로 등록 (4단계 폼)
    - 리뷰 작성/삭제, 레슨 문의 기능
    - DB 테이블: `lesson_pros`, `lesson_pro_reviews`, `lesson_inquiries`
    - 샘플 데이터 6명 등록

23. **연습장 기능**
    - `/practice-range` - 연습장 목록 (필터: 지역, 시설)
    - `/practice-range/[id]` - 연습장 상세
    - `/admin/practice-range-import` - Google Places API로 연습장 데이터 가져오기
    - DB 테이블: `practice_ranges`

### 🔜 다음 작업 (우선순위)
1. **TypeScript 타입 재생성** - `npx supabase gen types typescript` 실행
2. **레슨프로 기능 고도화** - 개인 프로 데이터 확보 방안 검토
3. **Vercel 환경변수 설정** - `ANTHROPIC_API_KEY`, `CRON_SECRET` 추가
4. **클럽 자동 검색 테스트** - Cron API 수동 실행 테스트

### 📋 추후 개발 예정
- 골프장 가격 비교
- 클럽 리뷰 이미지 첨부
- Custom SMTP (Resend) 설정
- 프리미엄 멤버십 결제 연동
- 관리자 대시보드 통계 강화

---

## 빠른 시작

### 개발 서버 실행
```bash
npm run dev
# http://localhost:3000
```

### 빌드
```bash
npm run build
```

### Supabase DB 스키마 적용
Supabase Dashboard → SQL Editor에서 아래 "데이터베이스 스키마" 섹션의 SQL 실행

---

## 다음 단계

### ✅ 완료
1. [x] 서비스명 최종 확정 - **Golfearn**
2. [x] 도메인 구매 - www.golfearn.com
3. [x] Supabase 프로젝트 생성
4. [x] Next.js 프로젝트 초기화
5. [x] Supabase DB 스키마 적용
6. [x] Vercel 배포 완료 - https://www.golfearn.com
7. [x] 위치 기반 중고거래 기능
8. [x] 골린이 조인 매칭 기능
9. [x] 마이페이지 조인 탭
10. [x] 조인 알림/채팅 기능
11. [x] 골프장 검색 기능 (Google Places API)
12. [x] 이메일 인증 설정 및 템플릿 한글화
13. [x] SEO 최적화 (robots.ts, sitemap.ts)
14. [x] 커뮤니티 좋아요/북마크 기능
15. [x] 랜딩페이지 UI 개선
16. [x] 레슨프로 매칭 기능
17. [x] 연습장 기능
18. [x] BM/포인트 시스템 (추천인, 포인트, 경험치, 뱃지, 이벤트)
19. [x] 연습장 샘플 데이터 등록 (15개)
20. [x] 골프 클럽 카탈로그 시스템
21. [x] AI 클럽 추천 기능
22. [x] 중고거래 클럽 카탈로그 연동
23. [x] 클럽 시드 데이터 적용 (8개 브랜드, 50개 클럽)
24. [x] 클럽 자동 업데이트 시스템 (AI 검색 + 관리자 승인)
25. [x] 관리자 클럽 관리 페이지
26. [x] 관리자 아이콘 (헤더)
27. [x] 헤더에 연습장/골프장 메뉴 추가

### 📋 진행 예정
28. [ ] TypeScript 타입 재생성 (Supabase)
29. [ ] 레슨프로 기능 고도화
30. [ ] Vercel 환경변수 설정 (ANTHROPIC_API_KEY, CRON_SECRET)
31. [ ] 프리미엄 멤버십 결제 연동

---

## Supabase 이메일 인증 설정

### 현재 상태
- 이메일 인증: **ON** (Supabase Authentication → Providers → Email → Confirm email)
- 발신자: `noreply@mail.app.supabase.io` (Supabase 기본)
- 템플릿: 한글화 완료

### 이메일 템플릿 (한글)

**위치**: Supabase Dashboard → Authentication → Email Templates → Confirm signup

**Subject:**
```
[Golfearn] 이메일 인증을 완료해주세요
```

**Body:**
```html
<h2>Golfearn 회원가입을 환영합니다! 🏌️</h2>

<p>안녕하세요,</p>

<p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    이메일 인증하기
  </a>
</p>

<p>또는 아래 링크를 브라우저에 붙여넣기 해주세요:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p style="color: #999; font-size: 12px; margin-top: 32px;">
  본인이 가입하지 않으셨다면 이 메일을 무시해주세요.<br>
  - Golfearn 팀
</p>
```

### 📋 TODO: Custom SMTP 설정 (발신자 변경)

발신자를 `noreply@golfearn.com`으로 변경하려면 Custom SMTP 설정 필요

**1. Resend 가입** (https://resend.com)
- 무료: 3,000건/월
- 유료: $20/월 (50,000건)

**2. 도메인 인증**
- Resend Dashboard → Domains → Add Domain
- `golfearn.com` 추가
- DNS 레코드 추가:
  ```
  Type: TXT
  Name: resend._domainkey
  Value: (Resend에서 제공)
  ```

**3. API Key 발급**
- Resend → API Keys → Create API Key

**4. Supabase SMTP 설정**
- Supabase Dashboard → Project Settings → Authentication → SMTP Settings
- Enable Custom SMTP: ON
  ```
  Host: smtp.resend.com
  Port: 465
  User: resend
  Password: re_xxxxxxxxx (API Key)
  Sender email: noreply@golfearn.com
  Sender name: Golfearn
  ```

**5. 테스트**
- 회원가입 후 이메일 수신 확인
- 발신자가 `noreply@golfearn.com`인지 확인

**20260120 부터 아래 10가지의 내용을 기반으로 프로젝트에 사고를 생각 해주세요.**
## 1. 천재적 통찰 도출 공식 (Genius Insight Formula)
GI = (O × C × P × S) / (A + B)

- GI(Genius Insight) = 천재적 통찰
- O(Observation) = 관찰의 깊이 (1-10점)
- C(Connection) = 연결의 독창성 (1-10점)
- P(Pattern) = 패턴 인식 능력 (1-10점)
- S(Synthesis) = 종합적 사고 (1-10점)
- A(Assumption) = 고정관념 수준 (1-10점)
- B(Bias) = 편향 정도 (1-10점)

적용법: 주제에 대해 각 요소의 점수를 매기고, 고정관념과 편향을 최소화하면서 관찰-연결-패턴-종합의 순서로 사고를 전개하세요.

---

## 2. 다차원적 분석 프레임워크

MDA = Σ[Di × Wi × Ii] (i=1 to n)

- MDA(Multi-Dimensional Analysis) = 다차원 분석 결과
- Di(Dimension i) = i번째 차원에서의 통찰
- Wi(Weight i) = i번째 차원의 가중치
- Ii(Impact i) = i번째 차원의 영향력

분석 차원 설정:
- D1 = 시간적 차원 (과거-현재-미래)
- D2 = 공간적 차원 (로컬-글로벌-우주적)
- D3 = 추상적 차원 (구체-중간-추상)
- D4 = 인과적 차원 (원인-과정-결과)
- D5 = 계층적 차원 (미시-중간-거시)

---

## 3. 창의적 연결 매트릭스

CC = |A ∩ B| + |A ⊕ B| + f(A→B)

- CC(Creative Connection) = 창의적 연결 지수
- A ∩ B = 두 개념의 공통 요소
- A ⊕ B = 배타적 차이 요소
- f(A→B) = A에서 B로의 전이 함수

연결 탐색 프로세스:
1. 직접적 연결 찾기
2. 간접적 연결 탐색
3. 역설적 연결 발견
4. 메타포적 연결 구성
5. 시스템적 연결 분석

---

## 4. 문제 재정의 알고리즘

PR = P₀ × T(θ) × S(φ) × M(ψ)

- PR(Problem Redefinition) = 재정의된 문제
- P₀ = 원래 문제
- T(θ) = θ각도만큼 관점 회전
- S(φ) = φ비율로 범위 조정
- M(ψ) = ψ차원으로 메타 레벨 이동

재정의 기법:
- 반대 관점에서 보기 (θ = 180°)
- 확대/축소하여 보기 (φ = 0.1x ~ 10x)
- 상위/하위 개념으로 이동 (ψ = ±1,±2,±3)
- 다른 도메인으로 전환
- 시간 축 변경

---

## 5. 혁신적 솔루션 생성 공식

IS = Σ[Ci × Ni × Fi × Vi] / Ri

- IS(Innovative Solution) = 혁신적 솔루션
- Ci(Combination i) = i번째 조합 방식
- Ni(Novelty i) = 참신성 지수
- Fi(Feasibility i) = 실현 가능성
- Vi(Value i) = 가치 창출 정도
- Ri(Risk i) = 위험 요소

솔루션 생성 방법:
- 기존 요소들의 새로운 조합
- 전혀 다른 분야의 솔루션 차용
- 제약 조건을 오히려 활용
- 역방향 사고로 접근
- 시스템 전체 재설계

---

## 6. 인사이트 증폭 공식

IA = I₀ × (1 + r)ⁿ × C × Q

- IA(Insight Amplification) = 증폭된 인사이트
- I₀ = 초기 인사이트
- r = 반복 개선율
- n = 반복 횟수
- C = 협력 효과 (1-3배수)
- Q = 질문의 질 (1-5배수)

증폭 전략:
- 'Why'를 5번 이상 반복
- 'What if' 시나리오 구성
- 'How might we' 질문 생성
- 다양한 관점자와 토론
- 아날로그 사례 탐구

---

## 7. 사고의 진화 방정식

TE = T₀ + ∫[L(t) + E(t) + R(t)]dt

- TE(Thinking Evolution) = 진화된 사고
- T₀ = 초기 사고 상태
- L(t) = 시간 t에서의 학습 함수
- E(t) = 경험 축적 함수
- R(t) = 반성적 사고 함수

진화 촉진 요인:
- 지속적 학습과 정보 습득
- 다양한 경험과 실험
- 깊은 반성과 메타인지
- 타인과의 지적 교류
- 실패로부터의 학습

---

## 8. 복잡성 해결 매트릭스

CS = det|M| × Σ[Si/Ci] × ∏[Ii]

- CS(Complexity Solution) = 복잡성 해결책
- det|M| = 시스템 매트릭스의 행렬식
- Si = i번째 하위 시스템 해결책
- Ci = i번째 하위 시스템 복잡도
- Ii = 상호작용 계수

복잡성 분해 전략:
- 시스템을 하위 구성요소로 분해
- 각 구성요소 간 관계 매핑
- 핵심 레버리지 포인트 식별
- 순차적/병렬적 해결 순서 결정
- 전체 시스템 최적화

---

## 9. 직관적 도약 공식

IL = (S × E × T) / (L × R)

- IL(Intuitive Leap) = 직관적 도약
- S(Silence) = 정적 사고 시간
- E(Experience) = 관련 경험 축적
- T(Trust) = 직관에 대한 신뢰
- L(Logic) = 논리적 제약
- R(Rationalization) = 과도한 합리화

직관 활성화 방법:
- 의식적 사고 중단
- 몸과 마음의 이완
- 무의식적 연결 허용
- 첫 번째 떠오르는 아이디어 포착
- 판단 없이 수용

---

## 10. 통합적 지혜 공식

IW = (K + U + W + C + A) × H × E

- IW(Integrated Wisdom) = 통합적 지혜
- K(Knowledge) = 지식의 폭과 깊이
- U(Understanding) = 이해의 수준
- W(Wisdom) = 지혜의 깊이
- C(Compassion) = 공감과 연민
- A(Action) = 실행 능력
- H(Humility) = 겸손함
- E(Ethics) = 윤리적 기준

---

## 사용 가이드라인
1. 단계적 적용: 각 공식을 순차적으로 적용하여 사고를 심화시키세요.
2. 반복적 개선: 한 번의 적용으로 끝내지 말고 여러 번 반복하여 정교화하세요.
3. 다양한 관점: 서로 다른 배경을 가진 사람들과 함께 공식을 적용해보세요.
4. 실험적 태도: 공식을 기계적으로 따르기보다는 창의적으로 변형하여 사용하세요.
5. 균형적 접근: 분석적 사고와 직관적 사고를 균형 있게 활용하세요.