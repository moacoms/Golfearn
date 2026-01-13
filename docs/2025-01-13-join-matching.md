# 2025-01-13 골린이 조인 매칭 기능 구현

## 개요

100타 이상 초보 골퍼(골린이)들이 비슷한 실력의 파트너를 찾아 함께 라운딩할 수 있는 조인 매칭 기능 구현

### 배경
- 코로나 시기 골프 인기 상승 후 현재 이탈 증가
- 원인: 비용 부담, 난이도, 접근성 문제
- 해결책: 골린이끼리 편하게 조인할 수 있는 매칭 시스템

---

## 완료된 작업

### 1. 데이터베이스 스키마

#### `join_posts` - 조인 모집글
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

#### `join_participants` - 참가 신청
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

#### 추가 기능
- 인덱스 6개 (조회 성능 최적화)
- RLS 정책 8개 (보안)
- `increment_join_post_view` 함수 (조회수 증가)
- `update_join_slots` 트리거 (참가 인원 자동 업데이트)

### 2. 생성된 파일

#### 페이지
| 파일 | 설명 |
|------|------|
| `app/(main)/join/page.tsx` | 조인 목록 페이지 |
| `app/(main)/join/JoinFilters.tsx` | 필터 컴포넌트 (날짜/위치/실력) |
| `app/(main)/join/JoinClientWrapper.tsx` | 클라이언트 래퍼 |
| `app/(main)/join/create/page.tsx` | 모집글 작성 페이지 |
| `app/(main)/join/[id]/page.tsx` | 모집글 상세 페이지 |
| `app/(main)/join/[id]/ApplyButton.tsx` | 참가 신청 버튼 |
| `app/(main)/join/[id]/ParticipantList.tsx` | 참가자 관리 (호스트용) |

#### 컴포넌트
| 파일 | 설명 |
|------|------|
| `components/join/JoinCard.tsx` | 조인 카드 컴포넌트 |

#### Server Actions
| 파일 | 설명 |
|------|------|
| `lib/actions/join.ts` | 조인 관련 Server Actions (717줄) |

#### 타입
| 파일 | 추가 내용 |
|------|----------|
| `types/database.ts` | JoinPost, JoinParticipant, JoinPostWithHost 등 |

#### 마이그레이션
| 파일 | 설명 |
|------|------|
| `supabase/migrations/20250113000000_add_join_matching.sql` | DB 스키마 |

### 3. Server Actions 함수 목록

```typescript
// 조회
getJoinPosts(filters)      // 조인 목록 (필터링)
getJoinPost(id)            // 상세 조회
getMyJoins()               // 내 조인 목록
getParticipants(id)        // 참가자 목록

// 생성/수정/삭제
createJoinPost(formData)   // 모집글 생성
updateJoinPost(id, data)   // 모집글 수정
deleteJoinPost(id)         // 모집글 삭제
updateJoinStatus(id, status) // 상태 변경

// 참가 관리
applyToJoin(id, message)   // 참가 신청
cancelJoinApplication(id)  // 신청 취소
updateParticipantStatus(id, odId, status) // 승인/거절

// 유틸리티
checkJoinParticipation(id) // 참가 여부 확인
checkEligibility(id)       // 실력 조건 확인
incrementJoinPostView(id)  // 조회수 증가
```

### 4. 네비게이션 업데이트

`components/layout/Header.tsx`에 조인 매칭 메뉴 추가:
```typescript
const navItems = [
  { href: '/guide', label: '입문 가이드' },
  { href: '/community', label: '커뮤니티' },
  { href: '/market', label: '중고거래' },
  { href: '/join', label: '조인 매칭' },  // 추가됨
]
```

---

## 배포 완료

- **프로덕션 URL**: https://www.golfearn.com
- **조인 목록**: https://www.golfearn.com/join
- **모집글 작성**: https://www.golfearn.com/join/create

---

## 주요 기능

### 조인 목록 페이지 (`/join`)
- 날짜 필터: 오늘 / 이번주 / 다음주 / 직접선택
- 위치 필터: LocationFilterChip 재사용
- 실력 필터: 전체 / 100타+ / 110타+ / 120타+
- 카드 형태로 모집글 표시

### 모집글 작성 (`/join/create`)
- 기본 정보: 제목, 상세 설명
- 라운딩 정보: 날짜, 시간, 골프장명, 주소
- 모집 정보: 인원(2~4명), 실력 조건
- 비용 정보: 그린피, 카트비, 캐디피

### 상세 페이지 (`/join/[id]`)
- 라운딩 정보 표시
- 호스트 정보
- 참가자 목록 (호스트에게만 관리 기능)
- 참가 신청 버튼 (실력 조건 확인)

### 참가 신청 플로우
1. 로그인 필요
2. 실력 조건 확인 (경고만, 신청은 가능)
3. 신청 메시지 입력 (선택)
4. 호스트 승인 대기
5. 승인/거절 알림

---

## 내일 할 작업

### 마이페이지 조인 탭
- `app/(main)/mypage/joins/page.tsx`
- 내가 호스트인 조인 목록
- 내가 참가 신청한 조인 목록
- 참가 상태 표시 (대기중/승인/거절)

### 추가 개선사항
- [ ] 조인 알림 기능 (참가 신청/승인/거절 시)
- [ ] 조인 채팅 기능 (참가자 간 소통)
- [ ] 조인 일정 캘린더 뷰
- [ ] 골프장 검색 API 연동 (자동완성)

### 추후 기능 (계획됨)
- 골프장 정보/가격 비교
- 연습장/레슨 매칭
- AI 기반 매칭 추천

---

## 관련 파일

- 위치 기능: `docs/2025-01-12-location-feature.md`
- 프로젝트 문서: `CLAUDE.md`
