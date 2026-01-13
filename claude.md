# CLAUDE.md - Golfearn 프로젝트

## 프로젝트 개요

### 서비스 정보
- **서비스명**: Golfearn (골프런)
- **의미**: Golf + Learn (배우다) / Golf + Earn (얻다)
- **핵심 슬로건**: "늦게 시작해도 괜찮아, 함께라면"
- **목적**: 30대 후반~50대 골프 입문자(골린이)가 겪는 정보 비대칭, 비용 부담, 심리적 장벽을 해소하는 올인원 플랫폼
- **창업자 배경**: 42살에 골프 시작한 실제 경험 보유 → 진정성 있는 콘텐츠 가능

### 도메인 (확인 필요)
- golfearn.com
- golfearn.kr
- golfearn.co.kr

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

### users (auth.users 확장)
```sql
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  avatar_url text,
  height integer,           -- 키 (cm)
  golf_started_at date,     -- 골프 시작일
  average_score integer,    -- 평균 스코어
  location text,            -- 지역
  created_at timestamptz default now()
);
```

### posts (게시판)
```sql
create table public.posts (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles,
  category text,            -- 'qna', 'free', 'review'
  title text not null,
  content text not null,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### comments (댓글)
```sql
create table public.comments (
  id bigint primary key generated always as identity,
  post_id bigint references public.posts,
  user_id uuid references public.profiles,
  content text not null,
  created_at timestamptz default now()
);
```

### products (중고거래)
```sql
create table public.products (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles,
  category text,            -- 'driver', 'iron', 'putter', 'wedge', 'set', 'etc'
  title text not null,
  description text,
  price integer not null,
  condition text,           -- 'S', 'A', 'B', 'C'
  images text[],
  status text default 'selling', -- 'selling', 'reserved', 'sold'
  location text,
  created_at timestamptz default now()
);
```

### messages (채팅)
```sql
create table public.messages (
  id bigint primary key generated always as identity,
  product_id bigint references public.products,
  sender_id uuid references public.profiles,
  receiver_id uuid references public.profiles,
  content text not null,
  created_at timestamptz default now()
);
```

### join_posts (조인 매칭)
```sql
create table public.join_posts (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles not null,
  title text not null,
  description text,
  round_date date not null,
  round_time time not null,
  golf_course_name text not null,
  golf_course_address text,
  total_slots int not null default 4,
  current_slots int not null default 1,
  min_score int,
  max_score int,
  green_fee int,
  cart_fee int,
  caddie_fee int,
  location_dong text,
  location_gu text,
  location_city text,
  location_lat double precision,
  location_lng double precision,
  status text not null default 'recruiting',
  view_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### join_participants (조인 참가)
```sql
create table public.join_participants (
  id bigint primary key generated always as identity,
  join_post_id bigint references public.join_posts on delete cascade not null,
  user_id uuid references public.profiles not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(join_post_id, user_id)
);
```

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

## 개발 진행 현황 (2025-01-13 업데이트)

### ✅ 완료된 작업

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

### 🔜 다음 작업 (우선순위)
1. **마이페이지 조인 탭** - `/mypage/joins`
2. **조인 알림 기능** - 참가 신청/승인/거절 알림
3. **조인 채팅 기능** - 참가자 간 소통
4. **골프장 검색 API 연동** - 자동완성

### 📋 추후 개발 예정
- 골프장 정보/가격 비교
- 연습장/레슨 매칭
- AI 기반 매칭 추천

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

1. [x] 서비스명 최종 확정 - **Golfearn**
2. [x] 도메인 구매 - www.golfearn.com
3. [x] Supabase 프로젝트 생성
4. [x] Next.js 프로젝트 초기화
5. [x] Supabase DB 스키마 적용
6. [x] Vercel 배포 완료 - https://www.golfearn.com
7. [x] 위치 기반 중고거래 기능
8. [x] 골린이 조인 매칭 기능
9. [ ] 마이페이지 조인 탭
10. [ ] 조인 알림/채팅 기능
