# 위치 기반 중고거래 기능 추가 (2025-01-12)

## 작업 개요
- 당근마켓 스타일의 위치 기반 중고거래 기능 구현
- Google Maps API 연동
- 가이드 페이지 카테고리 필터 버그 수정

---

## 1. 위치 기반 기능 구현

### 새로 생성된 파일

#### `components/LocationPicker.tsx`
지도에서 거래 희망 장소를 선택하는 컴포넌트
- Google Maps 연동 (한글 지도)
- 현재 위치 가져오기 (Geolocation API)
- 주소 검색 기능
- 지도 클릭으로 위치 선택
- Reverse Geocoding으로 주소 자동 변환

#### `components/LocationMap.tsx`
상품 상세 페이지에서 거래 장소를 표시하는 읽기 전용 지도

#### `app/(main)/market/[id]/ProductLocation.tsx`
상품 상세 페이지의 위치 표시 래퍼 컴포넌트

#### `supabase/migrations/20250112000000_add_location_coordinates.sql`
위도/경도 컬럼 추가 마이그레이션
```sql
-- products 테이블에 위치 좌표 추가
ALTER TABLE products ADD COLUMN latitude double precision;
ALTER TABLE products ADD COLUMN longitude double precision;

-- profiles 테이블에도 추가 (사용자 기본 위치)
ALTER TABLE profiles ADD COLUMN latitude double precision;
ALTER TABLE profiles ADD COLUMN longitude double precision;

-- 거리 계산 함수 (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(...)
```

### 수정된 파일

| 파일 | 변경 사항 |
|------|----------|
| `app/(main)/market/sell/page.tsx` | LocationPicker 컴포넌트 추가, 위치 데이터 저장 |
| `app/(main)/market/page.tsx` | 거리순 정렬, 거리 계산 로직 추가 |
| `app/(main)/market/[id]/page.tsx` | 거래 장소 지도 표시 영역 추가 |
| `app/(main)/market/MarketFilters.tsx` | 정렬 옵션(거리순) 추가, 내 위치 버튼 |
| `lib/actions/products.ts` | latitude, longitude 저장 로직 추가 |
| `lib/utils.ts` | calculateDistance, formatDistance 함수 추가 |
| `types/database.ts` | products, profiles에 latitude, longitude 타입 추가 |

### 환경 변수

```env
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDhccBxrqdZ9YLWCMW7_5usxfBDAUaYksM
```

### Google Maps 설정
- `@react-google-maps/api` 패키지 사용
- 한글 지도 설정: `language: 'ko', region: 'KR'`
- 사용 라이브러리: `places`

### 주요 기능
1. **판매 등록 시**: 지도에서 거래 희망 장소 선택
2. **상품 목록**: 거리순 정렬 옵션
3. **상품 상세**: 거래 장소 지도로 표시

---

## 2. 가이드 페이지 카테고리 필터 수정

### 문제 상황
- `/guide?category=lesson` URL로 접근해도 전체 가이드가 표시됨
- 카테고리 버튼 클릭 시 필터가 작동하지 않음

### 원인
- 페이지 컴포넌트가 `searchParams`를 받지 않음
- 항상 전체 가이드(`guides`)를 표시

### 수정 내용

#### `app/(main)/guide/page.tsx`
```typescript
// Before
export default function GuidePage() {
  return (
    // guides.map() - 전체 표시
  )
}

// After
export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const selectedCategory = category || 'all'
  const filteredGuides = getGuidesByCategory(selectedCategory)

  return (
    // filteredGuides.map() - 필터링된 결과
    // 선택된 카테고리 버튼 활성화 표시
  )
}
```

### 변경 사항
1. `searchParams` prop 추가 (Next.js 14 App Router 방식)
2. `getGuidesByCategory()` 함수로 필터링
3. 선택된 카테고리 버튼에 `btn-primary` 스타일 적용

---

## Git 커밋 내역

```
fd30969 - Fix guide page category filter to use searchParams
(이전 커밋들 - 위치 기반 기능)
```

---

## 다음 작업 예정

1. 사용자 기본 위치 저장 (마이페이지에서 설정)
2. 거리별 필터링 (1km, 3km, 5km 이내)
3. 위치 기반 검색 성능 최적화 (PostGIS 또는 인덱스)
