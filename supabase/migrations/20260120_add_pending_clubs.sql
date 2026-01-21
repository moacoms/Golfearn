-- =============================================
-- Pending Clubs Table for Auto-Update System
-- AI가 검색한 새 클럽 정보를 임시 저장
-- =============================================

-- 1. 대기 중인 클럽 테이블
CREATE TABLE IF NOT EXISTS pending_clubs (
  id BIGSERIAL PRIMARY KEY,

  -- AI가 수집한 기본 정보
  brand_name VARCHAR(100) NOT NULL,
  club_name VARCHAR(200) NOT NULL,
  club_name_ko VARCHAR(200),
  model_year INTEGER,
  club_type VARCHAR(50) NOT NULL,

  -- 스펙 정보 (AI가 수집)
  loft TEXT, -- JSON 배열 문자열
  shaft_flex TEXT,
  shaft_material TEXT,

  -- 가격 정보
  release_price INTEGER,
  estimated_used_price JSONB DEFAULT '{}'::JSONB,

  -- 추천 조건
  recommended_handicap_range TEXT, -- "15-36"
  recommended_swing_speed_range TEXT, -- "85-105"

  -- 특성
  forgiveness_level INTEGER,
  distance_level INTEGER,
  control_level INTEGER,
  feel_level INTEGER,

  -- 콘텐츠
  description TEXT,
  features TEXT[], -- 주요 특징
  source_url TEXT, -- 정보 출처 URL

  -- AI 수집 메타데이터
  ai_confidence DECIMAL(3,2), -- AI 신뢰도 (0.00-1.00)
  ai_model VARCHAR(50), -- 사용된 AI 모델
  raw_data JSONB, -- AI 원본 응답

  -- 상태 관리
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- 승인 시 생성된 club_id
  approved_club_id BIGINT REFERENCES golf_clubs(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI 검색 로그 테이블
CREATE TABLE IF NOT EXISTS club_search_logs (
  id BIGSERIAL PRIMARY KEY,

  search_query TEXT,
  search_type VARCHAR(50), -- 'new_release', 'brand_update', 'scheduled'

  -- 결과
  clubs_found INTEGER DEFAULT 0,
  clubs_added INTEGER DEFAULT 0,

  -- 실행 정보
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- 에러
  error_message TEXT,

  -- 메타데이터
  metadata JSONB DEFAULT '{}'::JSONB
);

-- 3. 관리자 알림 테이블
CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGSERIAL PRIMARY KEY,

  type VARCHAR(50) NOT NULL, -- 'new_pending_club', 'search_complete', 'error'
  title VARCHAR(200) NOT NULL,
  message TEXT,

  -- 관련 데이터
  related_table VARCHAR(50),
  related_id BIGINT,

  -- 상태
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 인덱스
-- =============================================

CREATE INDEX IF NOT EXISTS idx_pending_clubs_status ON pending_clubs(status);
CREATE INDEX IF NOT EXISTS idx_pending_clubs_brand ON pending_clubs(brand_name);
CREATE INDEX IF NOT EXISTS idx_pending_clubs_created ON pending_clubs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_club_search_logs_started ON club_search_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- =============================================
-- RLS 정책
-- =============================================

-- pending_clubs: 관리자만 접근
ALTER TABLE pending_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pending_clubs_admin_read" ON pending_clubs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "pending_clubs_admin_write" ON pending_clubs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- club_search_logs: 관리자만 접근
ALTER TABLE club_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club_search_logs_admin" ON club_search_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- admin_notifications: 관리자만 접근
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notifications_admin" ON admin_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =============================================
-- 트리거: updated_at 자동 업데이트
-- =============================================

CREATE OR REPLACE FUNCTION update_pending_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pending_clubs_updated_at ON pending_clubs;
CREATE TRIGGER trigger_pending_clubs_updated_at
BEFORE UPDATE ON pending_clubs
FOR EACH ROW EXECUTE FUNCTION update_pending_clubs_updated_at();

-- =============================================
-- 함수: 대기 클럽 승인
-- =============================================

CREATE OR REPLACE FUNCTION approve_pending_club(
  p_pending_id BIGINT,
  p_admin_id UUID
)
RETURNS BIGINT AS $$
DECLARE
  v_pending pending_clubs%ROWTYPE;
  v_brand_id BIGINT;
  v_new_club_id BIGINT;
BEGIN
  -- 대기 클럽 조회
  SELECT * INTO v_pending FROM pending_clubs WHERE id = p_pending_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending club not found or already processed';
  END IF;

  -- 브랜드 ID 조회 또는 생성
  SELECT id INTO v_brand_id FROM golf_club_brands WHERE name = v_pending.brand_name;

  IF NOT FOUND THEN
    INSERT INTO golf_club_brands (name, name_ko)
    VALUES (v_pending.brand_name, v_pending.brand_name)
    RETURNING id INTO v_brand_id;
  END IF;

  -- golf_clubs에 새 클럽 추가
  INSERT INTO golf_clubs (
    brand_id, name, name_ko, model_year, club_type,
    loft, shaft_flex, shaft_material,
    release_price, used_price_guide,
    forgiveness_level, distance_level, control_level, feel_level,
    description, features, is_active
  ) VALUES (
    v_brand_id,
    v_pending.club_name,
    v_pending.club_name_ko,
    v_pending.model_year,
    v_pending.club_type,
    CASE WHEN v_pending.loft IS NOT NULL THEN v_pending.loft::DECIMAL[] ELSE NULL END,
    CASE WHEN v_pending.shaft_flex IS NOT NULL THEN string_to_array(v_pending.shaft_flex, ',')::VARCHAR[] ELSE NULL END,
    CASE WHEN v_pending.shaft_material IS NOT NULL THEN string_to_array(v_pending.shaft_material, ',')::VARCHAR[] ELSE NULL END,
    v_pending.release_price,
    COALESCE(v_pending.estimated_used_price, '{}'::JSONB),
    COALESCE(v_pending.forgiveness_level, 3),
    COALESCE(v_pending.distance_level, 3),
    COALESCE(v_pending.control_level, 3),
    COALESCE(v_pending.feel_level, 3),
    v_pending.description,
    v_pending.features,
    true
  ) RETURNING id INTO v_new_club_id;

  -- pending_clubs 상태 업데이트
  UPDATE pending_clubs
  SET
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    approved_club_id = v_new_club_id
  WHERE id = p_pending_id;

  RETURN v_new_club_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 함수: 대기 클럽 거절
-- =============================================

CREATE OR REPLACE FUNCTION reject_pending_club(
  p_pending_id BIGINT,
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_clubs
  SET
    status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    rejection_reason = p_reason
  WHERE id = p_pending_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
SELECT 'Pending clubs system created successfully!';
