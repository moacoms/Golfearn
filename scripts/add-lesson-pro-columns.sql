-- profiles 테이블에 레슨프로 관련 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_lesson_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pro_certification TEXT,
ADD COLUMN IF NOT EXISTS pro_experience_years INTEGER,
ADD COLUMN IF NOT EXISTS pro_specialties TEXT[],
ADD COLUMN IF NOT EXISTS pro_introduction TEXT,
ADD COLUMN IF NOT EXISTS pro_location TEXT,
ADD COLUMN IF NOT EXISTS pro_phone TEXT,
ADD COLUMN IF NOT EXISTS pro_monthly_fee INTEGER;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_profiles_is_lesson_pro ON profiles(is_lesson_pro);

-- 알림 설정 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS pro_notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pro_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  lesson_reminder BOOLEAN DEFAULT TRUE,
  payment_reminder BOOLEAN DEFAULT TRUE,
  package_expiry_reminder BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pro_id)
);

-- 테스트: 관리자를 레슨프로로 설정
UPDATE profiles 
SET 
  is_lesson_pro = TRUE,
  pro_certification = 'KPGA 티칭프로',
  pro_experience_years = 10,
  pro_specialties = ARRAY['드라이버', '아이언', '숏게임'],
  pro_introduction = '10년 경력의 티칭프로입니다. 초보자도 쉽게 배울 수 있도록 체계적인 레슨을 제공합니다.',
  pro_location = '서울 강남구',
  pro_phone = '010-1234-5678',
  pro_monthly_fee = 300000
WHERE id = '92d4bac6-4f8f-4d8b-8c4d-2ad25edd61cc';

-- 결과 확인
SELECT id, full_name, is_admin, is_lesson_pro, pro_certification 
FROM profiles 
WHERE is_lesson_pro = TRUE;