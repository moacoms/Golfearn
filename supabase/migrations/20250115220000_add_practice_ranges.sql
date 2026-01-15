-- 연습장 테이블 생성
CREATE TABLE IF NOT EXISTS practice_ranges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,

  -- 위치 정보
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),

  -- 시설 정보
  facilities TEXT[], -- ['indoor', 'outdoor', 'screen', 'putting', 'bunker', 'parking', 'shower', 'locker', 'cafe']
  floor_count INTEGER, -- 타석 층수
  booth_count INTEGER, -- 타석 수

  -- 영업 정보
  operating_hours TEXT,
  price_info TEXT,

  -- Google Places 연동
  google_place_id TEXT UNIQUE,
  google_rating DECIMAL(2, 1) DEFAULT 0,
  google_review_count INTEGER DEFAULT 0,

  -- 이미지
  images TEXT[],

  -- 지역
  region TEXT,

  -- 상태
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_practice_ranges_region ON practice_ranges(region);
CREATE INDEX IF NOT EXISTS idx_practice_ranges_is_active ON practice_ranges(is_active);
CREATE INDEX IF NOT EXISTS idx_practice_ranges_google_place_id ON practice_ranges(google_place_id) WHERE google_place_id IS NOT NULL;

-- RLS 활성화
ALTER TABLE practice_ranges ENABLE ROW LEVEL SECURITY;

-- 읽기는 누구나 가능
CREATE POLICY "Practice ranges are viewable by everyone"
ON practice_ranges FOR SELECT
USING (is_active = true);

-- 인증된 사용자만 생성/수정 가능
CREATE POLICY "Authenticated users can insert practice ranges"
ON practice_ranges FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update practice ranges"
ON practice_ranges FOR UPDATE
TO authenticated
USING (true);
