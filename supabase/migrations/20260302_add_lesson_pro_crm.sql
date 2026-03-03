-- =============================================
-- 레슨 프로 CRM 시스템 스키마
-- Version: 1.0
-- Date: 2026-03-02
-- Description: 골프 레슨 프로를 위한 고객 관리 시스템
-- =============================================

-- 1. 프로필 테이블 확장 (레슨 프로 정보 추가)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_lesson_pro BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_certification VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_specialties TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_introduction TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_monthly_fee INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_location VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_phone VARCHAR(20);

-- 2. 학생 관리 테이블
CREATE TABLE IF NOT EXISTS lesson_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_name VARCHAR(100) NOT NULL,
  student_phone VARCHAR(20),
  student_email VARCHAR(100),
  student_memo TEXT,
  current_level VARCHAR(50), -- '입문', '초급', '중급', '상급'
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_lesson_at TIMESTAMPTZ,
  total_lesson_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- 추가 정보
  birth_date DATE,
  gender VARCHAR(10),
  started_golf_at DATE,
  average_score INTEGER,
  
  UNIQUE(pro_id, student_phone)
);

-- 3. 수강권/패키지 테이블
CREATE TABLE IF NOT EXISTS lesson_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES lesson_students(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  package_type VARCHAR(50) DEFAULT 'count', -- 'count' (횟수제) or 'period' (기간제)
  total_count INTEGER, -- 횟수제일 경우
  used_count INTEGER DEFAULT 0,
  remaining_count INTEGER GENERATED ALWAYS AS (total_count - used_count) STORED,
  price INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'completed', 'cancelled'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
  paid_amount INTEGER DEFAULT 0,
  payment_method VARCHAR(50), -- 'cash', 'transfer', 'card'
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 레슨 스케줄 테이블
CREATE TABLE IF NOT EXISTS lesson_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES lesson_students(id) ON DELETE CASCADE,
  package_id UUID REFERENCES lesson_packages(id),
  lesson_date DATE NOT NULL,
  lesson_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  location VARCHAR(200),
  lesson_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'playing', 'short_game', 'putting'
  memo TEXT,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 중복 예약 방지
  UNIQUE(pro_id, lesson_date, lesson_time)
);

-- 5. AI 레슨 노트 테이블
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES lesson_schedules(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES lesson_students(id) ON DELETE CASCADE,
  
  -- 원본 입력
  voice_transcript TEXT, -- 음성 녹음 텍스트
  manual_note TEXT, -- 수동 입력 노트
  
  -- AI 생성 내용
  ai_structured_note JSONB, -- AI가 생성한 구조화된 노트
  key_points TEXT[], -- 핵심 포인트
  improvements TEXT[], -- 개선된 점
  homework TEXT, -- 과제
  next_focus TEXT, -- 다음 레슨 포커스
  
  -- 영상/이미지
  video_urls TEXT[],
  image_urls TEXT[],
  
  -- 메타데이터
  weather VARCHAR(50),
  practice_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 수입 관리 테이블
CREATE TABLE IF NOT EXISTS pro_income_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES lesson_students(id),
  package_id UUID REFERENCES lesson_packages(id),
  amount INTEGER NOT NULL,
  income_type VARCHAR(50) DEFAULT 'lesson', -- 'lesson', 'package', 'equipment', 'other'
  payment_method VARCHAR(50), -- 'cash', 'transfer', 'card'
  payment_date DATE NOT NULL,
  tax_included BOOLEAN DEFAULT false,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 프로 알림 설정 테이블
CREATE TABLE IF NOT EXISTS pro_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- 알림 채널
  kakao_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  
  -- 알림 타입
  lesson_reminder BOOLEAN DEFAULT true, -- 레슨 리마인더
  package_expiry BOOLEAN DEFAULT true, -- 수강권 만료 알림
  payment_reminder BOOLEAN DEFAULT true, -- 결제 알림
  student_absence BOOLEAN DEFAULT true, -- 학생 장기 미방문
  
  -- 알림 타이밍
  lesson_reminder_hours INTEGER DEFAULT 24, -- 레슨 몇 시간 전 알림
  package_expiry_days INTEGER DEFAULT 7, -- 만료 며칠 전 알림
  student_absence_days INTEGER DEFAULT 30, -- 며칠 미방문시 알림
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_lesson_students_pro ON lesson_students(pro_id);
CREATE INDEX IF NOT EXISTS idx_lesson_students_active ON lesson_students(pro_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_packages_student ON lesson_packages(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_packages_status ON lesson_packages(status);
CREATE INDEX IF NOT EXISTS idx_lesson_schedules_date ON lesson_schedules(lesson_date);
CREATE INDEX IF NOT EXISTS idx_lesson_schedules_pro ON lesson_schedules(pro_id);
CREATE INDEX IF NOT EXISTS idx_lesson_schedules_student ON lesson_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_schedules_pro_date ON lesson_schedules(pro_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_pro_income_date ON pro_income_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_pro_income_pro ON pro_income_records(pro_id);

-- RLS (Row Level Security) 정책
ALTER TABLE lesson_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_notification_settings ENABLE ROW LEVEL SECURITY;

-- 프로는 자신의 학생만 관리 가능
CREATE POLICY "프로는 자신의 학생만 조회" ON lesson_students
  FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 학생만 추가" ON lesson_students
  FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 학생만 수정" ON lesson_students
  FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 학생만 삭제" ON lesson_students
  FOR DELETE USING (auth.uid() = pro_id);

-- 패키지 정책
CREATE POLICY "프로는 자신의 패키지만 조회" ON lesson_packages
  FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 패키지만 추가" ON lesson_packages
  FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 패키지만 수정" ON lesson_packages
  FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 패키지만 삭제" ON lesson_packages
  FOR DELETE USING (auth.uid() = pro_id);

-- 스케줄 정책
CREATE POLICY "프로는 자신의 스케줄만 조회" ON lesson_schedules
  FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 스케줄만 추가" ON lesson_schedules
  FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 스케줄만 수정" ON lesson_schedules
  FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 스케줄만 삭제" ON lesson_schedules
  FOR DELETE USING (auth.uid() = pro_id);

-- 노트 정책
CREATE POLICY "프로는 자신의 노트만 조회" ON lesson_notes
  FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 노트만 추가" ON lesson_notes
  FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 노트만 수정" ON lesson_notes
  FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 노트만 삭제" ON lesson_notes
  FOR DELETE USING (auth.uid() = pro_id);

-- 수입 정책
CREATE POLICY "프로는 자신의 수입만 조회" ON pro_income_records
  FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 수입만 추가" ON pro_income_records
  FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 수입만 수정" ON pro_income_records
  FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "프로는 자신의 수입만 삭제" ON pro_income_records
  FOR DELETE USING (auth.uid() = pro_id);

-- 알림 설정 정책
CREATE POLICY "프로는 자신의 알림 설정만 관리" ON pro_notification_settings
  FOR ALL USING (auth.uid() = pro_id);

-- 트리거 함수: 레슨 완료 시 자동 업데이트
CREATE OR REPLACE FUNCTION update_lesson_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- 학생의 총 레슨 수 증가
    UPDATE lesson_students 
    SET total_lesson_count = total_lesson_count + 1,
        last_lesson_at = NEW.completed_at
    WHERE id = NEW.student_id;
    
    -- 패키지의 사용 횟수 증가
    IF NEW.package_id IS NOT NULL THEN
      UPDATE lesson_packages 
      SET used_count = used_count + 1
      WHERE id = NEW.package_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lesson_counts
  AFTER UPDATE ON lesson_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_counts();

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_students_updated_at BEFORE UPDATE ON lesson_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lesson_packages_updated_at BEFORE UPDATE ON lesson_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lesson_schedules_updated_at BEFORE UPDATE ON lesson_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lesson_notes_updated_at BEFORE UPDATE ON lesson_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pro_income_records_updated_at BEFORE UPDATE ON pro_income_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pro_notification_settings_updated_at BEFORE UPDATE ON pro_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();