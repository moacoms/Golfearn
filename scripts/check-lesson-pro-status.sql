-- 레슨프로 상태 확인 및 설정

-- 1. 현재 레슨프로 확인
SELECT id, full_name, is_admin, is_lesson_pro, pro_certification 
FROM profiles 
WHERE is_lesson_pro = TRUE;

-- 2. 다희아빠 계정 상태 확인
SELECT id, full_name, is_admin, is_lesson_pro, pro_certification 
FROM profiles 
WHERE id = '92d4bac6-4f8f-4d8b-8c4d-2ad25edd61cc';

-- 3. 다희아빠를 레슨프로로 다시 설정 (필요시)
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

-- 4. 확인
SELECT id, full_name, is_admin, is_lesson_pro, pro_certification 
FROM profiles 
WHERE id = '92d4bac6-4f8f-4d8b-8c4d-2ad25edd61cc';