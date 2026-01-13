-- products 테이블에 위치 좌표 컬럼 추가
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 인덱스 추가 (위치 기반 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_products_location
ON public.products (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 프로필에도 기본 위치 저장 (사용자 동네 설정용)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 거리 계산 함수 (Haversine 공식)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371; -- 지구 반경 (km)
  dLat DOUBLE PRECISION;
  dLon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  a := SIN(dLat/2) * SIN(dLat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLon/2) * SIN(dLon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 거리 기반 상품 조회 함수
CREATE OR REPLACE FUNCTION get_products_by_distance(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  price INTEGER,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.price,
    p.location,
    p.latitude,
    p.longitude,
    calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_km
  FROM public.products p
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.status = 'selling'
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
