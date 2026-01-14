-- 골프장 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS public.golf_course_reviews (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  place_id text NOT NULL, -- Google Places ID
  golf_course_name text NOT NULL, -- 골프장 이름 (검색용)
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5점
  title text, -- 리뷰 제목
  content text NOT NULL, -- 리뷰 내용
  visit_date date, -- 방문 날짜
  -- 세부 평점 (선택)
  course_condition integer CHECK (course_condition >= 1 AND course_condition <= 5), -- 코스 상태
  facilities integer CHECK (facilities >= 1 AND facilities <= 5), -- 시설
  service integer CHECK (service >= 1 AND service <= 5), -- 서비스
  value_for_money integer CHECK (value_for_money >= 1 AND value_for_money <= 5), -- 가성비
  -- 메타
  helpful_count integer DEFAULT 0, -- 도움됨 수
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_golf_course_reviews_place_id ON public.golf_course_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_golf_course_reviews_user_id ON public.golf_course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_course_reviews_rating ON public.golf_course_reviews(place_id, rating);
CREATE INDEX IF NOT EXISTS idx_golf_course_reviews_created_at ON public.golf_course_reviews(created_at DESC);

-- RLS 활성화
ALTER TABLE public.golf_course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 누구나 리뷰 조회 가능
CREATE POLICY "Anyone can view golf course reviews"
  ON public.golf_course_reviews FOR SELECT
  USING (true);

-- RLS 정책: 로그인 사용자만 리뷰 작성 가능
CREATE POLICY "Authenticated users can insert reviews"
  ON public.golf_course_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인 리뷰만 수정 가능
CREATE POLICY "Users can update own reviews"
  ON public.golf_course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 본인 리뷰만 삭제 가능
CREATE POLICY "Users can delete own reviews"
  ON public.golf_course_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 리뷰 도움됨 테이블 (중복 방지)
CREATE TABLE IF NOT EXISTS public.golf_course_review_helpful (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  review_id bigint REFERENCES public.golf_course_reviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- RLS 활성화
ALTER TABLE public.golf_course_review_helpful ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can view helpful"
  ON public.golf_course_review_helpful FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert helpful"
  ON public.golf_course_review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own helpful"
  ON public.golf_course_review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- 도움됨 카운트 업데이트 트리거
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.golf_course_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.golf_course_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_helpful_count
AFTER INSERT OR DELETE ON public.golf_course_review_helpful
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();
