# 골프 클럽 카탈로그 + AI 추천 시스템 구현 (2026-01-19)

## 개요
중고거래 기능과 연동되는 골프 클럽 카탈로그 및 AI 기반 클럽 추천 시스템 구현 완료

## 주요 기능
1. **클럽 카탈로그**: 브랜드/종류/연도별 클럽 정보 DB
2. **AI 추천**: 사용자 프로필(키, 실력, 예산) 기반 클럽 추천
3. **중고거래 연동**: 판매 등록 시 카탈로그에서 선택 → 스펙/가격 자동 입력
4. **시세 가이드**: 상태별(S/A/B/C) 중고 평균 가격

---

## 구현 내용

### 1. 데이터베이스 마이그레이션
**파일**: `supabase/migrations/20260119_add_club_catalog.sql`

#### 생성된 테이블
| 테이블 | 설명 |
|--------|------|
| `golf_club_brands` | 브랜드 마스터 (8개 브랜드) |
| `golf_clubs` | 클럽 카탈로그 (스펙, 가격, 추천 조건) |
| `golf_club_reviews` | 클럽 리뷰 (1인 1리뷰) |
| `golf_club_price_history` | 중고 시세 히스토리 |
| `user_club_profiles` | 사용자 골프 프로필 (추천용) |

#### products 테이블 확장
```sql
ALTER TABLE products
ADD COLUMN club_id BIGINT REFERENCES golf_clubs(id),
ADD COLUMN club_specs JSONB;
```

---

### 2. 타입 정의
**파일**: `types/club.ts`

```typescript
// 주요 타입
export type ClubType = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter'
export type ShaftFlex = 'L' | 'A' | 'SR' | 'R' | 'S' | 'X'
export type ShaftMaterial = 'steel' | 'graphite'
export type ProductCondition = 'S' | 'A' | 'B' | 'C'
export type MissTendency = 'slice' | 'hook' | 'thin' | 'fat'

// 인터페이스
export interface GolfClubBrand { ... }
export interface GolfClub { ... }
export interface GolfClubWithBrand { ... }
export interface ClubRecommendation { ... }
export interface UserClubProfile { ... }
```

---

### 3. 시드 데이터
**파일**: `scripts/seed-clubs.ts`

#### 브랜드 (8개)
- TaylorMade, Callaway, Titleist, PING, Mizuno, Srixon, Cobra, Cleveland

#### 클럽 데이터 (50개)
- **드라이버** (15개): Qi10, Paradym Ai Smoke, GT2, G430 등
- **아이언** (15개): P770, Apex Pro, T200, i230 등
- **하이브리드/우드** (10개)
- **웨지/퍼터** (10개)

---

### 4. Server Actions

#### `lib/actions/club-catalog.ts`
```typescript
// 브랜드/클럽 조회
getBrands()                    // 브랜드 목록
getClubs(filters)              // 클럽 목록 (필터링/정렬/페이지네이션)
getClub(id)                    // 클럽 상세
getFeaturedClubs(limit)        // 추천 클럽
getClubsByType(type, limit)    // 타입별 클럽
searchClubs(query, limit)      // 검색
getModelYears()                // 출시년도 목록
getClubStats()                 // 타입별 통계
getRelatedClubs(...)           // 관련 클럽

// 관리자용
createClub(data)               // 클럽 등록
updateClub(id, data)           // 클럽 수정
```

#### `lib/actions/club-reviews.ts`
```typescript
getClubReviews(clubId, options)     // 리뷰 목록
getClubReviewStats(clubId)          // 리뷰 통계
createClubReview(formData)          // 리뷰 작성
updateClubReview(reviewId, formData) // 리뷰 수정
deleteClubReview(reviewId)          // 리뷰 삭제
markReviewHelpful(reviewId)         // 도움됨 카운트 증가
getMyReviews()                      // 내 리뷰 목록
```

#### `lib/actions/club-recommendation.ts`
```typescript
getClubRecommendations(input)   // AI 추천 (메인)
getQuickRecommendation(input)   // 빠른 추천
getUserClubProfile()            // 사용자 프로필 조회
saveUserClubProfile(formData)   // 프로필 저장
```

**추천 알고리즘 점수 체계**:
- 실력 매칭: 30점
- 스펙 매칭: 25점 (스윙스피드 기반 샤프트 플렉스)
- 예산 매칭: 20점
- 선호도 매칭: 25점 (미스샷 경향, 우선 요소)

#### `lib/actions/club-price.ts`
```typescript
getClubPriceGuide(clubId)           // 시세 가이드
getClubPriceHistory(clubId, opts)   // 시세 히스토리
getAveragePriceByCondition(clubId)  // 상태별 평균 시세
getPriceTrend(clubId, months)       // 월별 시세 추이
getRecentSalePrices(clubId, limit)  // 최근 거래 가격
evaluatePrice(clubId, price, cond)  // 시세 대비 평가
comparePrices(clubId)               // 비슷한 클럽 시세 비교
recordSalePrice(...)                // 거래 시세 기록
```

---

### 5. 페이지

#### `/club-catalog` (클럽 카탈로그 목록)
**파일**: `app/(main)/club-catalog/page.tsx`

- 필터: 검색, 클럽 타입, 브랜드, 출시년도, 가격대
- 정렬: 인기순, 최신순, 가격순, 평점순
- 페이지네이션
- AI 추천 페이지 링크

#### `/club-catalog/[id]` (클럽 상세)
**파일**: `app/(main)/club-catalog/[id]/page.tsx`

- 클럽 이미지 갤러리
- 상세 스펙 (로프트, 샤프트, 헤드 볼륨 등)
- 특징 목록
- 리뷰 섹션 (평점, 통계, 목록)
- 시세 가이드 (상태별 가격)
- 관련 클럽 추천
- "이 클럽 중고로 팔기" 버튼

#### `/club-recommend` (AI 추천)
**파일**: `app/(main)/club-recommend/page.tsx`

5단계 마법사 형식:
1. **키 입력** - 클럽 길이 추천용
2. **실력 입력** - 평균 타수, 스윙 스피드(선택)
3. **미스샷 경향** - 슬라이스/훅/뒤땅/탑핑
4. **예산 설정** - 클럽 1개당 예산
5. **결과 표시** - 타입별 추천 클럽 (점수, 추천 이유)

---

### 6. 컴포넌트

#### `components/club/ClubCard.tsx`
```typescript
// 클럽 카드 컴포넌트
interface ClubCardProps {
  club: GolfClubWithBrand
  compact?: boolean  // 작은 버전
}
```
- 이미지, 브랜드, 클럽명
- 클럽 타입, 출시년도, 평점
- 신품가, 중고 시세

#### `components/club/ClubSelector.tsx`
```typescript
// 클럽 선택 모달
interface ClubSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (club: GolfClubWithBrand, priceGuide: UsedPriceGuide | null) => void
  initialType?: ClubType
}

// 선택된 클럽 표시
interface SelectedClubDisplayProps {
  club: GolfClubWithBrand
  priceGuide: UsedPriceGuide | null
  condition?: ProductCondition
  onRemove: () => void
}
```
- 검색 기능
- 클럽 타입 필터
- 브랜드 필터
- 시세 가이드 표시

#### `components/club/index.ts`
```typescript
export { default as ClubCard } from './ClubCard'
export { default as ClubSelector, SelectedClubDisplay } from './ClubSelector'
```

---

### 7. 중고거래 연동

#### 수정된 파일: `app/(main)/market/sell/page.tsx`

**추가된 기능**:
- 카테고리(드라이버, 우드, 아이언, 퍼터, 웨지) 선택 시 "클럽 카탈로그에서 선택하기" 버튼 표시
- ClubSelector 모달에서 클럽 선택
- 선택 시 자동 입력:
  - 제목: `{브랜드} {클럽명}`
  - 가격: 선택한 상태(S/A/B/C)에 따른 추천 시세
- 시세 가이드 라벨 표시
- 선택된 클럽 정보 표시 (SelectedClubDisplay)

**폼 데이터에 추가**:
```typescript
formData.set('club_id', selectedClub.id.toString())
formData.set('club_specs', JSON.stringify({
  brand: selectedClub.brand?.name || '',
  model_year: selectedClub.model_year,
  club_type: selectedClub.club_type,
  loft: selectedClub.loft,
  shaft_flex: selectedClub.shaft_flex,
}))
```

---

### 8. 네비게이션 업데이트

**수정된 파일**: `components/layout/Header.tsx`

```typescript
const navItems = [
  { href: '/guide', label: '입문 가이드' },
  { href: '/club-catalog', label: '클럽 카탈로그' },  // 추가
  { href: '/club-recommend', label: 'AI 추천' },     // 추가
  { href: '/market', label: '중고거래' },
  { href: '/community', label: '커뮤니티' },
  { href: '/join', label: '조인' },
  { href: '/lesson-pro', label: '레슨프로' },
]
```

---

## 빌드 시 수정된 사항

### 타입 에러 수정
Supabase 생성 타입에 새 테이블이 없어서 `as any` 캐스팅 추가:
- `lib/actions/club-catalog.ts`
- `lib/actions/club-price.ts`
- `lib/actions/club-reviews.ts`
- `lib/actions/club-recommendation.ts`

### Suspense 바운더리 추가
`app/(main)/market/sell/page.tsx`에서 `useSearchParams()` 사용으로 인한 에러 수정:
```typescript
function SellPageContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function SellPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SellPageContent />
    </Suspense>
  )
}
```

---

## 다음 단계

### 필수
1. **마이그레이션 적용**: Supabase Dashboard에서 SQL 실행
2. **시드 데이터 적용**: `scripts/seed-clubs.ts` 실행
3. **타입 재생성**: `npx supabase gen types typescript --local > types/database.ts`

### 선택
- 클럽 이미지 업로드 기능
- 리뷰 이미지 첨부
- 시세 자동 업데이트 (거래 완료 시)
- 관리자 페이지에서 클럽 관리

---

## 파일 목록

### 새로 생성된 파일
```
supabase/migrations/20260119_add_club_catalog.sql
scripts/seed-clubs.ts
types/club.ts
lib/actions/club-catalog.ts
lib/actions/club-reviews.ts
lib/actions/club-recommendation.ts
lib/actions/club-price.ts
app/(main)/club-catalog/page.tsx
app/(main)/club-catalog/[id]/page.tsx
app/(main)/club-recommend/page.tsx
components/club/ClubCard.tsx
components/club/ClubSelector.tsx
components/club/index.ts
```

### 수정된 파일
```
app/(main)/market/sell/page.tsx  - ClubSelector 연동
components/layout/Header.tsx     - 네비게이션 메뉴 추가
```

---

## 검증 완료
- ✅ `npm run build` 성공
- ✅ 모든 페이지 정적 생성 완료
- ✅ 타입 에러 없음
