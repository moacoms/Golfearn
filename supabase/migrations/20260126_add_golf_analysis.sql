-- =============================================
-- 나의골프분석 (My Golf Analysis) 스키마
-- Version: 1.0
-- Date: 2026-01-26
-- =============================================

-- 1. 사용자 골프 프로필 (확장)
CREATE TABLE IF NOT EXISTS user_golf_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- 신체 정보
  height_cm INTEGER,
  weight_kg INTEGER,
  gender VARCHAR(10), -- male, female, other
  handedness VARCHAR(10) DEFAULT 'right', -- right, left

  -- 골프 정보
  handicap DECIMAL(4,1),
  experience_years INTEGER,
  swing_speed_level VARCHAR(20), -- slow, moderate, fast, very_fast
  typical_miss VARCHAR(50), -- slice, hook, fat, thin, top

  -- 목표
  primary_goal VARCHAR(100), -- distance, accuracy, consistency
  target_handicap DECIMAL(4,1),

  -- 선호 단위
  distance_unit VARCHAR(10) DEFAULT 'yards', -- yards, meters
  speed_unit VARCHAR(10) DEFAULT 'mph', -- mph, kmh

  -- 언어 설정
  preferred_language VARCHAR(5) DEFAULT 'en', -- en, ko, ja, zh

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 스윙 세션 (연습/라운드 단위)
CREATE TABLE IF NOT EXISTS swing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 세션 정보
  session_date DATE NOT NULL,
  session_type VARCHAR(20) NOT NULL, -- practice, round, fitting
  location_name VARCHAR(200),
  data_source VARCHAR(50) NOT NULL, -- trackman, golfzon, gdr, kakao, manual, ocr

  -- 메타데이터
  weather_condition VARCHAR(50), -- clear, cloudy, windy, rainy
  temperature_celsius INTEGER,
  notes TEXT,

  -- 분석 상태
  analysis_status VARCHAR(20) DEFAULT 'pending', -- pending, analyzing, completed, failed
  analysis_credits_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 개별 샷 데이터
CREATE TABLE IF NOT EXISTS shot_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 클럽 정보
  club_type VARCHAR(20) NOT NULL, -- driver, 3wood, 5wood, hybrid, 3iron...pw, gw, sw, lw, putter
  club_name VARCHAR(100), -- 구체적인 클럽명

  -- 거리 데이터 (야드 기준 저장, 표시시 변환)
  carry_distance DECIMAL(5,1),
  total_distance DECIMAL(5,1),
  offline_distance DECIMAL(5,1), -- 좌우 편차 (+ = 오른쪽)

  -- 볼 데이터
  ball_speed_mph DECIMAL(5,1),
  launch_angle DECIMAL(4,1),
  peak_height DECIMAL(5,1), -- 최고점 (야드)
  land_angle DECIMAL(4,1), -- 낙하각

  -- 스핀 데이터
  back_spin_rpm INTEGER,
  side_spin_rpm INTEGER, -- + = 오른쪽 스핀
  spin_axis DECIMAL(4,1), -- 스핀 축 각도

  -- 클럽 데이터
  club_speed_mph DECIMAL(5,1),
  attack_angle DECIMAL(4,1), -- + = 업, - = 다운
  club_path DECIMAL(4,1), -- + = 인투아웃
  face_angle DECIMAL(4,1), -- + = 오픈
  face_to_path DECIMAL(4,1), -- 페이스 vs 패스 차이
  dynamic_loft DECIMAL(4,1),

  -- 임팩트
  smash_factor DECIMAL(4,2),
  impact_location VARCHAR(50), -- center, toe, heel, high, low

  -- 샷 결과
  shot_result VARCHAR(50), -- straight, fade, draw, slice, hook, push, pull
  shot_quality INTEGER, -- 1-10 자체 평가

  -- OCR 원본 (이미지에서 추출한 경우)
  ocr_raw_data JSONB,
  ocr_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI 분석 결과
CREATE TABLE IF NOT EXISTS swing_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES swing_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 분석 유형
  analysis_type VARCHAR(30) NOT NULL, -- session, weekly, monthly, club_specific
  club_type VARCHAR(20), -- 특정 클럽 분석인 경우

  -- AI 분석 결과
  summary TEXT NOT NULL, -- 요약 (다국어)
  strengths JSONB, -- 강점 리스트
  weaknesses JSONB, -- 약점 리스트
  recommendations JSONB, -- 추천 사항 리스트

  -- 상세 분석
  distance_analysis JSONB,
  accuracy_analysis JSONB,
  consistency_analysis JSONB,
  spin_analysis JSONB,

  -- 비교 분석
  comparison_to_previous JSONB, -- 이전 세션 대비
  comparison_to_average JSONB, -- 전체 평균 대비
  comparison_to_peers JSONB, -- 비슷한 실력 대비

  -- 연습 추천
  drill_recommendations JSONB, -- 추천 드릴
  focus_areas JSONB, -- 집중 영역

  -- AI 메타데이터
  ai_model_version VARCHAR(50),
  analysis_language VARCHAR(5),
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 목표 및 달성
CREATE TABLE IF NOT EXISTS swing_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 목표 정보
  goal_type VARCHAR(50) NOT NULL, -- driver_distance, accuracy, handicap, consistency
  club_type VARCHAR(20), -- 특정 클럽인 경우

  -- 목표값
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  start_value DECIMAL(10,2),

  -- 기간
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,

  -- 상태
  status VARCHAR(20) DEFAULT 'active', -- active, achieved, failed, cancelled
  achieved_at TIMESTAMPTZ,

  -- 진행률
  progress_percentage DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 구독 관리
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Lemon Squeezy 연동
  lemon_squeezy_customer_id VARCHAR(100),
  lemon_squeezy_subscription_id VARCHAR(100),
  lemon_squeezy_order_id VARCHAR(100),

  -- 구독 정보
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- free, basic, pro, annual
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, past_due, expired

  -- 기간
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- 사용량
  monthly_analysis_count INTEGER DEFAULT 0,
  monthly_analysis_limit INTEGER DEFAULT 3, -- free: 3, basic: unlimited (-1)
  monthly_ocr_count INTEGER DEFAULT 0,
  monthly_ocr_limit INTEGER DEFAULT 5, -- free: 5, basic: 50, pro: unlimited (-1)

  -- 결제 정보
  currency VARCHAR(3) DEFAULT 'USD',
  price_paid DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 사용량 로그
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 사용 유형
  usage_type VARCHAR(30) NOT NULL, -- analysis, ocr, ai_chat

  -- 상세
  session_id UUID REFERENCES swing_sessions(id),
  tokens_used INTEGER,

  -- 결과
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 클럽별 통계 (캐시 테이블)
CREATE TABLE IF NOT EXISTS club_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  club_type VARCHAR(20) NOT NULL,

  -- 통계 (자동 계산)
  total_shots INTEGER DEFAULT 0,
  avg_carry DECIMAL(5,1),
  avg_total DECIMAL(5,1),
  avg_ball_speed DECIMAL(5,1),
  avg_club_speed DECIMAL(5,1),
  avg_launch_angle DECIMAL(4,1),
  avg_back_spin INTEGER,
  avg_smash_factor DECIMAL(4,2),

  -- 일관성 지표
  carry_std_dev DECIMAL(5,1),
  offline_std_dev DECIMAL(5,1),

  -- 최고 기록
  max_carry DECIMAL(5,1),
  max_ball_speed DECIMAL(5,1),

  -- 기간
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, club_type)
);

-- 9. 다국어 콘텐츠 (드릴, 팁 등)
CREATE TABLE IF NOT EXISTS localized_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key VARCHAR(100) NOT NULL UNIQUE, -- drill_slice_fix, tip_driver_distance
  content_type VARCHAR(50) NOT NULL, -- drill, tip, feedback_template

  -- 다국어 콘텐츠
  content_en TEXT NOT NULL,
  content_ko TEXT,
  content_ja TEXT,
  content_zh TEXT,

  -- 메타데이터
  category VARCHAR(50),
  tags TEXT[],
  video_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX IF NOT EXISTS idx_shot_data_session ON shot_data(session_id);
CREATE INDEX IF NOT EXISTS idx_shot_data_user ON shot_data(user_id);
CREATE INDEX IF NOT EXISTS idx_shot_data_club ON shot_data(club_type);
CREATE INDEX IF NOT EXISTS idx_swing_sessions_user_date ON swing_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_swing_analyses_user ON swing_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, created_at DESC);

-- =============================================
-- RLS 정책
-- =============================================
ALTER TABLE user_golf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE swing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE localized_content ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 접근
CREATE POLICY "Users can manage own golf profile" ON user_golf_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON swing_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shots" ON shot_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analyses" ON swing_analyses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON swing_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own statistics" ON club_statistics
  FOR ALL USING (auth.uid() = user_id);

-- 다국어 콘텐츠는 모두 읽기 가능
CREATE POLICY "Everyone can read localized content" ON localized_content
  FOR SELECT USING (true);

-- =============================================
-- 트리거: 클럽 통계 자동 업데이트
-- =============================================
CREATE OR REPLACE FUNCTION update_club_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO club_statistics (user_id, club_type, total_shots, avg_carry, avg_total, avg_ball_speed, avg_club_speed, avg_launch_angle, avg_back_spin, avg_smash_factor, max_carry, max_ball_speed, last_updated)
  SELECT
    NEW.user_id,
    NEW.club_type,
    COUNT(*),
    AVG(carry_distance),
    AVG(total_distance),
    AVG(ball_speed_mph),
    AVG(club_speed_mph),
    AVG(launch_angle),
    AVG(back_spin_rpm)::INTEGER,
    AVG(smash_factor),
    MAX(carry_distance),
    MAX(ball_speed_mph),
    NOW()
  FROM shot_data
  WHERE user_id = NEW.user_id AND club_type = NEW.club_type
  GROUP BY user_id, club_type
  ON CONFLICT (user_id, club_type)
  DO UPDATE SET
    total_shots = EXCLUDED.total_shots,
    avg_carry = EXCLUDED.avg_carry,
    avg_total = EXCLUDED.avg_total,
    avg_ball_speed = EXCLUDED.avg_ball_speed,
    avg_club_speed = EXCLUDED.avg_club_speed,
    avg_launch_angle = EXCLUDED.avg_launch_angle,
    avg_back_spin = EXCLUDED.avg_back_spin,
    avg_smash_factor = EXCLUDED.avg_smash_factor,
    max_carry = EXCLUDED.max_carry,
    max_ball_speed = EXCLUDED.max_ball_speed,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_club_statistics
AFTER INSERT ON shot_data
FOR EACH ROW
EXECUTE FUNCTION update_club_statistics();

-- =============================================
-- 트리거: 구독 월간 사용량 리셋
-- =============================================
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 결제 주기 시작 시 사용량 리셋
  IF NEW.current_period_start != OLD.current_period_start THEN
    NEW.monthly_analysis_count := 0;
    NEW.monthly_ocr_count := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_monthly_usage
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION reset_monthly_usage();

-- =============================================
-- 함수: 무료 분석 횟수 체크
-- =============================================
CREATE OR REPLACE FUNCTION check_analysis_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type VARCHAR(20);
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan_type, monthly_analysis_count, monthly_analysis_limit
  INTO v_plan_type, v_count, v_limit
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- 구독 없으면 무료 플랜으로 생성
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan_type, status, monthly_analysis_limit, monthly_ocr_limit)
    VALUES (p_user_id, 'free', 'active', 3, 5);
    RETURN TRUE;
  END IF;

  -- unlimited (-1) 체크
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;

  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 함수: 분석 사용량 증가
-- =============================================
CREATE OR REPLACE FUNCTION increment_analysis_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET monthly_analysis_count = monthly_analysis_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
