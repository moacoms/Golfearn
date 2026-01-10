# 작업 내역 정리 (2025-01-10)

## 구현된 기능

### 위치 기반 중고거래 (당근마켓 스타일)
- **위치 설정**: GPS 자동 감지 + 주소 검색
- **거리 필터**: 동네(읍면동) 단위 필터링
- **거리 표시**: 상품 카드에 거리 표시 (예: 1.2km)

---

## 생성된 파일

### DB 마이그레이션
| 파일 | 설명 |
|------|------|
| `supabase/migrations/20250110_add_location_fields.sql` | 위치 필드 추가 SQL |

### 유틸리티
| 파일 | 설명 |
|------|------|
| `lib/google-maps.ts` | Google Maps API 유틸리티 (역지오코딩, 주소 검색, 거리 계산) |
| `lib/actions/location.ts` | 위치 관련 서버 액션 (위치 조회/업데이트/범위 설정) |

### 위치 컴포넌트 (6개)
| 파일 | 설명 |
|------|------|
| `components/location/LocationSettingModal.tsx` | 위치 설정 모달 (GPS + 검색) |
| `components/location/LocationSearchInput.tsx` | 주소 검색 입력창 (디바운스, 자동완성) |
| `components/location/LocationDisplay.tsx` | 현재 동네 표시 컴포넌트 |
| `components/location/LocationFilterChip.tsx` | 마켓 필터 칩 (범위 선택) |
| `components/location/ProductLocationSelector.tsx` | 상품 등록 시 위치 선택 |
| `components/location/LocationPromptBanner.tsx` | 위치 미설정 시 안내 배너 |
| `components/location/index.ts` | 컴포넌트 export |

### 마켓 페이지
| 파일 | 설명 |
|------|------|
| `app/(main)/market/MarketClientWrapper.tsx` | 위치 필터 + 배너 클라이언트 래퍼 |

---

## 수정된 파일

### 타입 정의
| 파일 | 변경 내용 |
|------|----------|
| `types/database.ts` | 위치 관련 타입 추가 (LocationInfo, LocationRange, GoogleGeocodingResult 등) |

### 서버 액션
| 파일 | 변경 내용 |
|------|----------|
| `lib/actions/products.ts` | 위치 기반 필터링, 거리 계산 로직 추가 |
| `lib/actions/profile.ts` | Profile 타입에 위치 필드 추가 |

### 페이지
| 파일 | 변경 내용 |
|------|----------|
| `app/(main)/market/page.tsx` | 위치 필터 적용, 상품 카드에 거리 표시 |
| `app/(main)/market/MarketFilters.tsx` | LocationFilterChip 연동 |
| `app/(main)/market/sell/page.tsx` | ProductLocationSelector 연동 |
| `app/(main)/mypage/profile/page.tsx` | 동네 설정 UI 추가 |

---

## DB 스키마 변경

### profiles 테이블 추가 컬럼
```sql
location_address text           -- 전체 주소
location_dong text              -- 동 (역삼동)
location_gu text                -- 구 (강남구)
location_city text              -- 시/도 (서울특별시)
location_lat double precision   -- 위도
location_lng double precision   -- 경도
location_range integer DEFAULT 3 -- 검색 범위 (km)
```

### products 테이블 추가 컬럼
```sql
location_address text
location_dong text
location_gu text
location_city text
location_lat double precision
location_lng double precision
use_seller_location boolean DEFAULT true
```

### 생성된 함수
- `calculate_distance_km(lat1, lng1, lat2, lng2)` - 두 좌표 간 거리 계산 (km)

### 생성된 인덱스
- `idx_profiles_location_dong`, `idx_profiles_location_gu`, `idx_profiles_location_city`
- `idx_products_location_dong`, `idx_products_location_gu`, `idx_products_location_city`

---

## 현재 서비스 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 랜딩페이지 | ✅ | 사전예약 폼 포함 |
| 회원가입/로그인 | ✅ | 이메일 방식 |
| 로그인 상태 헤더 | ✅ | 닉네임 + 로그아웃 |
| 입문 가이드 | ✅ | 10개 완성 |
| 커뮤니티 게시판 | ✅ | CRUD + 댓글 |
| 중고거래 장터 | ✅ | 기본 CRUD |
| **위치 기반 필터링** | ✅ | 동네 단위 필터 |
| **거리 표시** | ✅ | 상품 카드에 km 표시 |
| **위치 설정** | ✅ | GPS + 주소 검색 |
| 카카오 로그인 | ❌ | 미구현 |

---

## 다음 작업 (예정)

1. **Google Maps API 키 설정**
   - Google Cloud Console에서 API 키 발급
   - Geocoding API, Places API 활성화
   - `.env.local` 및 Vercel 환경변수 추가

2. **위치 기능 테스트**
   - GPS 감지 테스트
   - 주소 검색 테스트
   - 거리 필터링 테스트

3. **카카오 로그인 (선택)**

---

## Git 커밋 (예정)

```
feat: 위치 기반 중고거래 기능 구현

- GPS 자동 감지 + 주소 검색으로 동네 설정
- 동네 단위 필터링 (1km, 3km, 5km, 10km, 20km)
- 상품 카드에 거리 표시
- 프로필 페이지에 동네 설정 UI 추가
- 상품 등록 시 위치 선택 기능
```

---

## 환경 설정

### 필요한 환경변수 (추가 예정)
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Supabase 마이그레이션
```bash
# 이미 실행 완료
SUPABASE_ACCESS_TOKEN=xxx npx supabase db push
```
