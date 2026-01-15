-- 레슨프로 테이블
CREATE TABLE IF NOT EXISTS lesson_pros (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  introduction TEXT,
  experience_years INTEGER,
  specialties TEXT[], -- 전문 분야: 'beginner', 'swing', 'short_game', 'putting', 'course_management'
  certifications TEXT[], -- 자격증
  regions TEXT[], -- 활동 지역
  lesson_types TEXT[], -- 레슨 유형: 'individual', 'group', 'online'
  price_individual INTEGER, -- 1:1 레슨 가격 (1회)
  price_group INTEGER, -- 그룹 레슨 가격 (1회)
  available_times TEXT, -- 가능 시간대 설명
  profile_image TEXT,
  gallery_images TEXT[],
  contact_phone TEXT,
  contact_kakao TEXT,
  instagram TEXT,
  youtube TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 레슨프로 리뷰 테이블
CREATE TABLE IF NOT EXISTS lesson_pro_reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pro_id BIGINT NOT NULL REFERENCES lesson_pros(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  lesson_type TEXT, -- 어떤 레슨을 받았는지
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pro_id, user_id)
);

-- 레슨 문의 테이블
CREATE TABLE IF NOT EXISTS lesson_inquiries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pro_id BIGINT NOT NULL REFERENCES lesson_pros(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  preferred_time TEXT,
  lesson_type TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'replied', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lesson_pros_regions ON lesson_pros USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_lesson_pros_specialties ON lesson_pros USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_lesson_pros_rating ON lesson_pros(rating DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_pros_is_active ON lesson_pros(is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_pro_reviews_pro_id ON lesson_pro_reviews(pro_id);
CREATE INDEX IF NOT EXISTS idx_lesson_inquiries_pro_id ON lesson_inquiries(pro_id);
CREATE INDEX IF NOT EXISTS idx_lesson_inquiries_user_id ON lesson_inquiries(user_id);

-- RLS 정책
ALTER TABLE lesson_pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_pro_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_inquiries ENABLE ROW LEVEL SECURITY;

-- 레슨프로: 모두 조회 가능, 본인만 수정
CREATE POLICY "lesson_pros_select" ON lesson_pros FOR SELECT USING (is_active = true);
CREATE POLICY "lesson_pros_insert" ON lesson_pros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lesson_pros_update" ON lesson_pros FOR UPDATE USING (auth.uid() = user_id);

-- 리뷰: 모두 조회 가능, 본인만 추가/삭제
CREATE POLICY "lesson_pro_reviews_select" ON lesson_pro_reviews FOR SELECT USING (true);
CREATE POLICY "lesson_pro_reviews_insert" ON lesson_pro_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lesson_pro_reviews_delete" ON lesson_pro_reviews FOR DELETE USING (auth.uid() = user_id);

-- 문의: 본인(작성자 또는 프로)만 조회/수정
CREATE POLICY "lesson_inquiries_select" ON lesson_inquiries
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM lesson_pros WHERE id = pro_id)
  );
CREATE POLICY "lesson_inquiries_insert" ON lesson_inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lesson_inquiries_update" ON lesson_inquiries
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT user_id FROM lesson_pros WHERE id = pro_id)
  );

-- 평점 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_lesson_pro_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE lesson_pros SET
      rating = (SELECT COALESCE(AVG(rating), 0) FROM lesson_pro_reviews WHERE pro_id = NEW.pro_id),
      review_count = (SELECT COUNT(*) FROM lesson_pro_reviews WHERE pro_id = NEW.pro_id)
    WHERE id = NEW.pro_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lesson_pros SET
      rating = (SELECT COALESCE(AVG(rating), 0) FROM lesson_pro_reviews WHERE pro_id = OLD.pro_id),
      review_count = (SELECT COUNT(*) FROM lesson_pro_reviews WHERE pro_id = OLD.pro_id)
    WHERE id = OLD.pro_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_lesson_pro_rating ON lesson_pro_reviews;
CREATE TRIGGER trigger_update_lesson_pro_rating
  AFTER INSERT OR UPDATE OR DELETE ON lesson_pro_reviews
  FOR EACH ROW EXECUTE FUNCTION update_lesson_pro_rating();
