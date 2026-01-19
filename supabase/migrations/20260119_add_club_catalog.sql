-- =============================================
-- Golf Club Catalog + AI Recommendation System
-- =============================================

-- 1. 브랜드 마스터 테이블
CREATE TABLE IF NOT EXISTS golf_club_brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ko VARCHAR(100), -- 한글명
  logo_url TEXT,
  country VARCHAR(50),
  website_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 골프 클럽 카탈로그 테이블
CREATE TABLE IF NOT EXISTS golf_clubs (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT REFERENCES golf_club_brands(id) ON DELETE SET NULL,

  -- 기본 정보
  name VARCHAR(200) NOT NULL,
  name_ko VARCHAR(200), -- 한글명
  model_year INTEGER, -- 출시년도
  club_type VARCHAR(50) NOT NULL, -- driver, wood, hybrid, iron, wedge, putter

  -- 스펙 정보
  loft DECIMAL(4,1)[], -- 로프트 각도 배열 (아이언은 여러개)
  shaft_flex VARCHAR(50)[], -- SR, R, S, X 등
  shaft_material VARCHAR(50)[], -- steel, graphite
  hand VARCHAR(20) DEFAULT 'right', -- right, left, both

  -- 상세 스펙 (JSON)
  specs JSONB DEFAULT '{}'::JSONB,
  -- 예: { "head_volume": "460cc", "length": "45.75", "weight": "300g", "MOI": "5000" }

  -- 가격 정보
  release_price INTEGER, -- 출시가
  current_price INTEGER, -- 현재 정가
  used_price_guide JSONB DEFAULT '{}'::JSONB,
  -- 예: { "S": 250000, "A": 200000, "B": 150000, "C": 100000 }

  -- 추천 조건 (AI 추천용)
  recommended_handicap_min INTEGER, -- 추천 핸디캡 최소
  recommended_handicap_max INTEGER, -- 추천 핸디캡 최대
  recommended_swing_speed_min INTEGER, -- 추천 스윙스피드 최소 (mph)
  recommended_swing_speed_max INTEGER, -- 추천 스윙스피드 최대 (mph)
  recommended_height_min INTEGER, -- 추천 키 최소 (cm)
  recommended_height_max INTEGER, -- 추천 키 최대 (cm)

  -- 특성 태그
  forgiveness_level INTEGER DEFAULT 3, -- 1-5 (관용성)
  distance_level INTEGER DEFAULT 3, -- 1-5 (비거리)
  control_level INTEGER DEFAULT 3, -- 1-5 (컨트롤)
  feel_level INTEGER DEFAULT 3, -- 1-5 (타감)

  -- 미스샷 보정
  miss_tendency_fix VARCHAR(50)[], -- slice, hook, thin, fat

  -- 콘텐츠
  description TEXT,
  features TEXT[], -- 주요 특징 배열
  image_urls TEXT[],
  video_url TEXT,

  -- 통계
  rating DECIMAL(2,1) DEFAULT 0, -- 평균 평점
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- 상태
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 클럽 리뷰 테이블
CREATE TABLE IF NOT EXISTS golf_club_reviews (
  id BIGSERIAL PRIMARY KEY,
  club_id BIGINT REFERENCES golf_clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,

  -- 상세 평점
  forgiveness_rating INTEGER CHECK (forgiveness_rating >= 1 AND forgiveness_rating <= 5),
  distance_rating INTEGER CHECK (distance_rating >= 1 AND distance_rating <= 5),
  control_rating INTEGER CHECK (control_rating >= 1 AND control_rating <= 5),
  feel_rating INTEGER CHECK (feel_rating >= 1 AND feel_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- 리뷰어 정보 (리뷰 작성 시점)
  reviewer_handicap INTEGER,
  reviewer_height INTEGER,
  ownership_period VARCHAR(50), -- 1개월 미만, 1-6개월, 6개월-1년, 1년 이상

  -- 이미지
  images TEXT[],

  -- 도움됨 카운트
  helpful_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 한 사용자가 같은 클럽에 하나의 리뷰만
  UNIQUE(club_id, user_id)
);

-- 4. 중고 시세 히스토리
CREATE TABLE IF NOT EXISTS golf_club_price_history (
  id BIGSERIAL PRIMARY KEY,
  club_id BIGINT REFERENCES golf_clubs(id) ON DELETE CASCADE,

  condition VARCHAR(5) NOT NULL, -- S, A, B, C
  price INTEGER NOT NULL,
  source VARCHAR(50), -- golfearn, danggeun, junggo, etc
  source_id VARCHAR(100), -- 거래 ID (있는 경우)

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 사용자 골프 프로필 (AI 추천용)
CREATE TABLE IF NOT EXISTS user_club_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- 신체 정보
  height INTEGER, -- cm
  arm_length INTEGER, -- cm

  -- 골프 실력
  handicap INTEGER,
  average_score INTEGER,
  swing_speed INTEGER, -- mph (드라이버 기준)

  -- 플레이 스타일
  miss_tendency VARCHAR(50)[], -- slice, hook, thin, fat
  priority_factor VARCHAR(50)[], -- distance, accuracy, feel

  -- 장비 선호
  preferred_shaft_flex VARCHAR(50), -- SR, R, S, X
  preferred_shaft_material VARCHAR(50), -- steel, graphite

  -- 예산
  budget_driver INTEGER,
  budget_iron INTEGER,
  budget_putter INTEGER,

  -- 보유 클럽 (참고용)
  current_driver_id BIGINT REFERENCES golf_clubs(id),
  current_iron_id BIGINT REFERENCES golf_clubs(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. products 테이블에 club_id 컬럼 추가
ALTER TABLE products
ADD COLUMN IF NOT EXISTS club_id BIGINT REFERENCES golf_clubs(id) ON DELETE SET NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS club_specs JSONB DEFAULT '{}'::JSONB;

-- =============================================
-- 인덱스
-- =============================================

-- 브랜드
CREATE INDEX IF NOT EXISTS idx_golf_club_brands_active ON golf_club_brands(is_active);
CREATE INDEX IF NOT EXISTS idx_golf_club_brands_order ON golf_club_brands(display_order);

-- 클럽
CREATE INDEX IF NOT EXISTS idx_golf_clubs_brand ON golf_clubs(brand_id);
CREATE INDEX IF NOT EXISTS idx_golf_clubs_type ON golf_clubs(club_type);
CREATE INDEX IF NOT EXISTS idx_golf_clubs_year ON golf_clubs(model_year DESC);
CREATE INDEX IF NOT EXISTS idx_golf_clubs_active ON golf_clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_golf_clubs_featured ON golf_clubs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_golf_clubs_rating ON golf_clubs(rating DESC);
CREATE INDEX IF NOT EXISTS idx_golf_clubs_price ON golf_clubs(current_price);

-- 리뷰
CREATE INDEX IF NOT EXISTS idx_golf_club_reviews_club ON golf_club_reviews(club_id);
CREATE INDEX IF NOT EXISTS idx_golf_club_reviews_user ON golf_club_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_club_reviews_rating ON golf_club_reviews(rating);

-- 시세 히스토리
CREATE INDEX IF NOT EXISTS idx_golf_club_price_history_club ON golf_club_price_history(club_id);
CREATE INDEX IF NOT EXISTS idx_golf_club_price_history_condition ON golf_club_price_history(condition);
CREATE INDEX IF NOT EXISTS idx_golf_club_price_history_date ON golf_club_price_history(recorded_at DESC);

-- 사용자 프로필
CREATE INDEX IF NOT EXISTS idx_user_club_profiles_user ON user_club_profiles(user_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_club ON products(club_id) WHERE club_id IS NOT NULL;

-- =============================================
-- RLS 정책
-- =============================================

-- 브랜드: 누구나 읽기 가능
ALTER TABLE golf_club_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "브랜드 읽기" ON golf_club_brands
  FOR SELECT USING (true);

CREATE POLICY "브랜드 관리 - 관리자" ON golf_club_brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 클럽: 누구나 읽기 가능
ALTER TABLE golf_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "클럽 읽기" ON golf_clubs
  FOR SELECT USING (true);

CREATE POLICY "클럽 관리 - 관리자" ON golf_clubs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 리뷰: 누구나 읽기, 본인 리뷰 작성/수정/삭제
ALTER TABLE golf_club_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "리뷰 읽기" ON golf_club_reviews
  FOR SELECT USING (true);

CREATE POLICY "리뷰 작성" ON golf_club_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "리뷰 수정" ON golf_club_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "리뷰 삭제" ON golf_club_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 시세 히스토리: 누구나 읽기
ALTER TABLE golf_club_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "시세 읽기" ON golf_club_price_history
  FOR SELECT USING (true);

CREATE POLICY "시세 기록 - 관리자" ON golf_club_price_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 사용자 프로필: 본인만 읽기/수정
ALTER TABLE user_club_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필 읽기" ON user_club_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "프로필 작성" ON user_club_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "프로필 수정" ON user_club_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 트리거: 리뷰 통계 자동 업데이트
-- =============================================

CREATE OR REPLACE FUNCTION update_club_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE golf_clubs
    SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM golf_club_reviews WHERE club_id = OLD.club_id), 0),
      review_count = (SELECT COUNT(*) FROM golf_club_reviews WHERE club_id = OLD.club_id),
      updated_at = NOW()
    WHERE id = OLD.club_id;
    RETURN OLD;
  ELSE
    UPDATE golf_clubs
    SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM golf_club_reviews WHERE club_id = NEW.club_id), 0),
      review_count = (SELECT COUNT(*) FROM golf_club_reviews WHERE club_id = NEW.club_id),
      updated_at = NOW()
    WHERE id = NEW.club_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_club_review_stats ON golf_club_reviews;
CREATE TRIGGER trigger_update_club_review_stats
AFTER INSERT OR UPDATE OR DELETE ON golf_club_reviews
FOR EACH ROW EXECUTE FUNCTION update_club_review_stats();

-- =============================================
-- 트리거: 거래 완료 시 시세 히스토리 자동 기록
-- =============================================

CREATE OR REPLACE FUNCTION record_price_history_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 sold로 변경되고, club_id가 있는 경우에만
  IF NEW.status = 'sold' AND OLD.status != 'sold' AND NEW.club_id IS NOT NULL THEN
    INSERT INTO golf_club_price_history (club_id, condition, price, source, source_id)
    VALUES (NEW.club_id, COALESCE(NEW.condition, 'B'), NEW.price, 'golfearn', NEW.id::TEXT);

    -- 시세 가이드 업데이트 (최근 10건 평균)
    UPDATE golf_clubs
    SET used_price_guide = (
      SELECT jsonb_object_agg(
        condition,
        avg_price::INTEGER
      )
      FROM (
        SELECT
          condition,
          AVG(price) as avg_price
        FROM (
          SELECT condition, price
          FROM golf_club_price_history
          WHERE club_id = NEW.club_id
          ORDER BY recorded_at DESC
          LIMIT 40 -- 각 상태별 최대 10건씩
        ) recent
        GROUP BY condition
      ) averages
    ),
    updated_at = NOW()
    WHERE id = NEW.club_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_record_price_history ON products;
CREATE TRIGGER trigger_record_price_history
AFTER UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION record_price_history_on_sale();

-- =============================================
-- 클럽 조회수 증가 함수
-- =============================================

CREATE OR REPLACE FUNCTION increment_club_view(club_id_param BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE golf_clubs
  SET view_count = view_count + 1
  WHERE id = club_id_param;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 초기 브랜드 데이터
-- =============================================

INSERT INTO golf_club_brands (name, name_ko, country, description, display_order) VALUES
  ('TaylorMade', '테일러메이드', 'USA', '혁신적인 기술과 투어 선수 사용률 1위 브랜드', 1),
  ('Callaway', '캘러웨이', 'USA', 'AI 기반 페이스 설계와 관용성 높은 클럽', 2),
  ('Titleist', '타이틀리스트', 'USA', '정확성과 컨트롤의 대명사, 투어 신뢰도 1위', 3),
  ('PING', '핑', 'USA', '커스텀 피팅의 선구자, MOI 최적화 기술', 4),
  ('Mizuno', '미즈노', 'Japan', '그레인플로우 단조 아이언의 명가', 5),
  ('Srixon', '스릭슨', 'Japan', '가성비와 성능의 균형', 6),
  ('Cobra', '코브라', 'USA', '혁신적 디자인과 젊은 감성', 7),
  ('Cleveland', '클리블랜드', 'USA', '웨지와 숏게임의 전문가', 8)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE golf_club_brands IS '골프 클럽 브랜드 마스터';
COMMENT ON TABLE golf_clubs IS '골프 클럽 카탈로그';
COMMENT ON TABLE golf_club_reviews IS '클럽 리뷰';
COMMENT ON TABLE golf_club_price_history IS '중고 시세 히스토리';
COMMENT ON TABLE user_club_profiles IS '사용자 골프 프로필 (AI 추천용)';
