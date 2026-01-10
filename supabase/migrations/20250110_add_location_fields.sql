-- 위치 기반 중고거래 기능을 위한 DB 스키마 변경
-- 실행: Supabase Dashboard > SQL Editor에서 실행

-- =============================================
-- 1. profiles 테이블 위치 필드 추가
-- =============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location_address text,           -- 전체 주소 (서울특별시 강남구 역삼동)
ADD COLUMN IF NOT EXISTS location_dong text,              -- 동 (역삼동)
ADD COLUMN IF NOT EXISTS location_gu text,                -- 구 (강남구)
ADD COLUMN IF NOT EXISTS location_city text,              -- 시/도 (서울특별시)
ADD COLUMN IF NOT EXISTS location_lat double precision,   -- 위도
ADD COLUMN IF NOT EXISTS location_lng double precision,   -- 경도
ADD COLUMN IF NOT EXISTS location_range integer DEFAULT 3; -- 검색 범위 (km)

-- profiles 위치 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_location_dong ON public.profiles(location_dong);
CREATE INDEX IF NOT EXISTS idx_profiles_location_gu ON public.profiles(location_gu);
CREATE INDEX IF NOT EXISTS idx_profiles_location_city ON public.profiles(location_city);

-- =============================================
-- 2. products 테이블 위치 필드 추가
-- =============================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS location_address text,           -- 전체 주소
ADD COLUMN IF NOT EXISTS location_dong text,              -- 동
ADD COLUMN IF NOT EXISTS location_gu text,                -- 구
ADD COLUMN IF NOT EXISTS location_city text,              -- 시/도
ADD COLUMN IF NOT EXISTS location_lat double precision,   -- 위도
ADD COLUMN IF NOT EXISTS location_lng double precision,   -- 경도
ADD COLUMN IF NOT EXISTS use_seller_location boolean DEFAULT true; -- 판매자 위치 사용 여부

-- products 위치 인덱스
CREATE INDEX IF NOT EXISTS idx_products_location_dong ON public.products(location_dong);
CREATE INDEX IF NOT EXISTS idx_products_location_gu ON public.products(location_gu);
CREATE INDEX IF NOT EXISTS idx_products_location_city ON public.products(location_city);

-- =============================================
-- 3. 거리 계산 함수 (Haversine formula)
-- =============================================
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision AS $$
DECLARE
  R constant double precision := 6371; -- 지구 반지름 (km)
  dlat double precision;
  dlng double precision;
  a double precision;
  c double precision;
BEGIN
  IF lat1 IS NULL OR lng1 IS NULL OR lat2 IS NULL OR lng2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 4. 범위 내 상품 조회 함수
-- =============================================
CREATE OR REPLACE FUNCTION get_products_within_range(
  user_lat double precision,
  user_lng double precision,
  range_km integer DEFAULT 5
)
RETURNS TABLE(
  product_id bigint,
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as product_id,
    calculate_distance_km(user_lat, user_lng, p.location_lat, p.location_lng) as distance_km
  FROM products p
  WHERE p.location_lat IS NOT NULL
    AND p.location_lng IS NOT NULL
    AND p.status = 'selling'
    AND calculate_distance_km(user_lat, user_lng, p.location_lat, p.location_lng) <= range_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- 완료 메시지
-- =============================================
-- 위치 기반 기능을 위한 스키마 변경이 완료되었습니다.
-- profiles: location_address, location_dong, location_gu, location_city, location_lat, location_lng, location_range
-- products: location_address, location_dong, location_gu, location_city, location_lat, location_lng, use_seller_location
