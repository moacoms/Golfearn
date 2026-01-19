/**
 * Golf Club Seed Data
 *
 * 실행 방법:
 * npx ts-node --esm scripts/seed-clubs.ts
 *
 * 또는 Supabase Dashboard SQL Editor에서 직접 실행
 */

// SQL Insert 문 생성 (Supabase Dashboard에서 실행)
const clubsSQL = `
-- =============================================
-- Golf Clubs Seed Data (50개 클럽)
-- =============================================

-- 먼저 브랜드 ID 확인
-- SELECT * FROM golf_club_brands;

-- =============================================
-- 드라이버 (15개)
-- =============================================

-- TaylorMade 드라이버
INSERT INTO golf_clubs (
  brand_id, name, name_ko, model_year, club_type,
  loft, shaft_flex, shaft_material, hand,
  specs, release_price, current_price, used_price_guide,
  recommended_handicap_min, recommended_handicap_max,
  recommended_swing_speed_min, recommended_swing_speed_max,
  forgiveness_level, distance_level, control_level, feel_level,
  miss_tendency_fix, description, features, is_featured
) VALUES
-- 1. TaylorMade Qi10 Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Qi10 Max', 'Qi10 맥스', 2024, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.75", "MOI": "10000+", "adjustability": "8 positions"}'::JSONB,
  799000, 699000, '{"S": 550000, "A": 480000, "B": 400000, "C": 320000}'::JSONB,
  15, 36, 85, 105,
  5, 5, 3, 4,
  ARRAY['slice']::VARCHAR[], '최고의 관용성과 비거리를 제공하는 Qi10 시리즈의 최상위 모델. 60층 카본 크라운과 확장된 솔 디자인으로 MOI를 극대화했습니다.',
  ARRAY['60층 카본 크라운', '카본 챔피언 시스템', 'Speed Pocket', '슬라이딩 웨이트', '최대 MOI'], true
),
-- 2. TaylorMade Qi10
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Qi10', 'Qi10', 2024, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.75", "MOI": "9500+"}'::JSONB,
  699000, 599000, '{"S": 480000, "A": 420000, "B": 350000, "C": 280000}'::JSONB,
  10, 30, 90, 110,
  4, 5, 4, 4,
  ARRAY['slice', 'hook']::VARCHAR[], '밸런스 잡힌 성능의 Qi10 스탠다드 모델. 높은 MOI와 낮은 스핀으로 안정적인 비거리를 제공합니다.',
  ARRAY['카본 크라운', 'Speed Pocket', '인핀니티 카본 페이스', '최적화된 무게 배치'], true
),
-- 3. TaylorMade Stealth 2
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Stealth 2', '스텔스 2', 2023, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.75", "face_material": "Carbon"}'::JSONB,
  599000, 499000, '{"S": 400000, "A": 350000, "B": 280000, "C": 220000}'::JSONB,
  10, 28, 90, 115,
  4, 5, 4, 4,
  ARRAY['slice']::VARCHAR[], '2세대 카본 페이스 기술로 더욱 향상된 볼 스피드와 관용성을 제공합니다.',
  ARRAY['카본 트위스트 페이스', '나노 텍스처', 'Speed Pocket', '인버티드 콘 기술'], false
),
-- 4. Callaway Paradym Ai Smoke Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym Ai Smoke Max', '패러다임 Ai 스모크 맥스', 2024, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  799000, 699000, '{"S": 560000, "A": 490000, "B": 410000, "C": 330000}'::JSONB,
  15, 36, 80, 100,
  5, 5, 3, 4,
  ARRAY['slice', 'fat']::VARCHAR[], 'AI 설계 Smoke 페이스로 모든 미스샷에서 일관된 비거리를 제공하는 최대 관용성 모델.',
  ARRAY['AI Smoke 페이스', '카본 섀시', 'Jailbreak AI', '최대 MOI 설계'], true
),
-- 5. Callaway Paradym Ai Smoke
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym Ai Smoke', '패러다임 Ai 스모크', 2024, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "450cc", "length": "45.5"}'::JSONB,
  699000, 599000, '{"S": 480000, "A": 420000, "B": 340000, "C": 270000}'::JSONB,
  8, 25, 95, 115,
  4, 5, 4, 4,
  NULL, '투어 선수들이 선호하는 밸런스 잡힌 성능과 조작성의 스탠다드 모델.',
  ARRAY['AI Smoke 페이스', '360 카본 섀시', 'Jailbreak AI 바', '낮은 스핀'], true
),
-- 6. Callaway Paradym X
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym X', '패러다임 X', 2023, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  599000, 499000, '{"S": 400000, "A": 340000, "B": 270000, "C": 210000}'::JSONB,
  15, 36, 85, 105,
  5, 4, 3, 4,
  ARRAY['slice']::VARCHAR[], '높은 관용성과 드로우 바이어스로 슬라이스를 줄여주는 모델.',
  ARRAY['AI 페이스', '트라이액셜 카본', 'Jailbreak 바', '드로우 바이어스'], false
),
-- 7. Titleist GT2
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'GT2', 'GT2', 2024, 'driver',
  ARRAY[8.0, 9.0, 10.0, 11.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  749000, 649000, '{"S": 520000, "A": 450000, "B": 370000, "C": 290000}'::JSONB,
  5, 20, 100, 120,
  3, 5, 5, 5,
  NULL, 'Titleist의 새로운 GT 시리즈. 최고의 볼 스피드와 정확성을 제공합니다.',
  ARRAY['새로운 GT 페이스', '다이나믹 마이크로 윈드 터널', 'MOI 최적화', '프리미엄 타감'], true
),
-- 8. Titleist TSR3
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'TSR3', 'TSR3', 2023, 'driver',
  ARRAY[8.0, 9.0, 10.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5", "adjustability": "SureFit hosel"}'::JSONB,
  599000, 499000, '{"S": 420000, "A": 360000, "B": 290000, "C": 230000}'::JSONB,
  5, 18, 100, 120,
  3, 5, 5, 5,
  NULL, '투어 선수들이 선호하는 조절 가능한 무게 시스템의 저스핀 드라이버.',
  ARRAY['ATI 425 티타늄', '조절 가능한 무게', 'SureFit 호젤', '낮은 스핀'], false
),
-- 9. PING G430 Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'G430 Max', 'G430 맥스', 2023, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.75", "MOI": "10000"}'::JSONB,
  649000, 549000, '{"S": 450000, "A": 390000, "B": 320000, "C": 250000}'::JSONB,
  15, 36, 80, 105,
  5, 5, 3, 4,
  ARRAY['slice']::VARCHAR[], 'PING 역사상 가장 높은 MOI로 최대의 관용성을 제공하는 드라이버.',
  ARRAY['카본플라이 랩 크라운', '탄성 터보레이터', '26g 텅스텐 무게', '가변 웨이트'], true
),
-- 10. PING G430 LST
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'G430 LST', 'G430 LST', 2023, 'driver',
  ARRAY[9.0, 10.5], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "450cc", "length": "45.75"}'::JSONB,
  649000, 549000, '{"S": 450000, "A": 390000, "B": 310000, "C": 240000}'::JSONB,
  0, 15, 100, 120,
  3, 5, 5, 4,
  NULL, '낮은 스핀과 관통하는 탄도로 상급자에게 적합한 LST 모델.',
  ARRAY['카본플라이 랩 크라운', '낮은 스핀', '투어 형상', '가변 웨이트'], false
),
-- 11. Cobra Darkspeed Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cobra'),
  'Darkspeed Max', '다크스피드 맥스', 2024, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  599000, 499000, '{"S": 400000, "A": 340000, "B": 270000, "C": 210000}'::JSONB,
  15, 36, 80, 105,
  5, 5, 3, 4,
  ARRAY['slice']::VARCHAR[], '공기역학 설계와 높은 MOI로 슬라이서에게 최적화된 드라이버.',
  ARRAY['PWR-BRIDGE 기술', 'H.O.T 페이스', '공기역학 설계', '높은 MOI'], false
),
-- 12. Mizuno ST-Max 230
(
  (SELECT id FROM golf_club_brands WHERE name = 'Mizuno'),
  'ST-Max 230', 'ST-맥스 230', 2023, 'driver',
  ARRAY[9.5, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  549000, 449000, '{"S": 360000, "A": 310000, "B": 250000, "C": 190000}'::JSONB,
  15, 36, 85, 105,
  5, 4, 3, 4,
  ARRAY['slice']::VARCHAR[], '미즈노 특유의 타감과 최대 관용성을 결합한 드라이버.',
  ARRAY['베타 티타늄 페이스', 'SAT 2041', 'Wave 솔', '드로우 바이어스'], false
),
-- 13. Srixon ZX5 Mk II
(
  (SELECT id FROM golf_club_brands WHERE name = 'Srixon'),
  'ZX5 Mk II', 'ZX5 Mk II', 2023, 'driver',
  ARRAY[9.5, 10.5], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.5"}'::JSONB,
  499000, 399000, '{"S": 320000, "A": 280000, "B": 220000, "C": 170000}'::JSONB,
  10, 28, 90, 110,
  4, 4, 4, 4,
  ARRAY['slice']::VARCHAR[], '가성비와 성능의 균형이 뛰어난 드라이버.',
  ARRAY['리바운드 프레임', '카본 크라운', 'Star 프레임', '스피드 릿지'], false
),
-- 14. Cleveland Launcher XL Lite
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cleveland'),
  'Launcher XL Lite', '런처 XL 라이트', 2023, 'driver',
  ARRAY[10.5, 12.0], ARRAY['L', 'A', 'SR']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.0", "weight": "270g"}'::JSONB,
  399000, 299000, '{"S": 250000, "A": 210000, "B": 170000, "C": 130000}'::JSONB,
  25, 50, 70, 90,
  5, 4, 2, 4,
  ARRAY['slice', 'thin']::VARCHAR[], '가볍고 관용성 높은 시니어/입문자용 드라이버.',
  ARRAY['초경량 설계', '높은 MOI', '액션 매스', '드로우 바이어스'], false
),
-- 15. TaylorMade SIM2 Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'SIM2 Max', 'SIM2 맥스', 2021, 'driver',
  ARRAY[9.0, 10.5, 12.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"head_volume": "460cc", "length": "45.75"}'::JSONB,
  399000, 299000, '{"S": 250000, "A": 210000, "B": 170000, "C": 130000}'::JSONB,
  15, 36, 85, 105,
  5, 4, 3, 4,
  ARRAY['slice']::VARCHAR[], '검증된 성능의 가성비 드라이버. 여전히 많은 골퍼에게 사랑받는 모델.',
  ARRAY['포지드 링 구조', 'Speed Pocket', 'Twist Face', '카본 솔'], false
);

-- =============================================
-- 아이언 (15개)
-- =============================================

INSERT INTO golf_clubs (
  brand_id, name, name_ko, model_year, club_type,
  loft, shaft_flex, shaft_material, hand,
  specs, release_price, current_price, used_price_guide,
  recommended_handicap_min, recommended_handicap_max,
  recommended_swing_speed_min, recommended_swing_speed_max,
  forgiveness_level, distance_level, control_level, feel_level,
  miss_tendency_fix, description, features, is_featured
) VALUES
-- 16. TaylorMade Qi HL
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Qi HL Iron', 'Qi HL 아이언', 2024, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,AW", "offset": "high", "sole": "wide"}'::JSONB,
  1399000, 1199000, '{"S": 950000, "A": 830000, "B": 680000, "C": 550000}'::JSONB,
  18, 36, 75, 95,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '최대 관용성과 비거리를 제공하는 골린이 최적 아이언.',
  ARRAY['Cap Back 디자인', 'Speed Pocket', 'ECHO 댐핑', '초광폭 솔'], true
),
-- 17. TaylorMade P790
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'P790', 'P790', 2023, 'iron',
  ARRAY[18.0, 20.5, 23.5, 26.5, 30.5, 35.0, 40.0, 45.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "4-PW,AW", "construction": "hollow"}'::JSONB,
  1599000, 1399000, '{"S": 1100000, "A": 950000, "B": 780000, "C": 620000}'::JSONB,
  5, 20, 95, 115,
  3, 5, 4, 5,
  NULL, '중공 구조로 비거리와 타감을 모두 갖춘 프리미엄 아이언.',
  ARRAY['SpeedFoam Air', '단조 페이스', 'Thru-Slot Speed Pocket', '텅스텐 웨이팅'], true
),
-- 18. Callaway Paradym Ai Smoke HL
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym Ai Smoke HL', '패러다임 Ai 스모크 HL', 2024, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,AW", "launch": "high"}'::JSONB,
  1399000, 1199000, '{"S": 960000, "A": 840000, "B": 690000, "C": 560000}'::JSONB,
  18, 36, 75, 95,
  5, 5, 3, 4,
  ARRAY['thin', 'fat']::VARCHAR[], 'AI 설계 페이스로 모든 미스샷에서 일관된 결과를 제공하는 초관용 아이언.',
  ARRAY['AI Smoke 페이스', '텅스텐 Speed Cartridge', 'Speed Frame', '광폭 솔'], true
),
-- 19. Callaway Apex Pro
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Apex Pro 24', '에이펙스 프로 24', 2024, 'iron',
  ARRAY[19.0, 22.0, 25.0, 28.0, 32.0, 37.0, 42.0, 47.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"iron_set": "3-PW", "construction": "forged"}'::JSONB,
  1799000, 1599000, '{"S": 1280000, "A": 1100000, "B": 900000, "C": 720000}'::JSONB,
  0, 12, 105, 120,
  2, 4, 5, 5,
  NULL, '투어 선수급 조작성과 타감의 단조 아이언.',
  ARRAY['단조 1025 카본 스틸', 'AI Flash 페이스', '텅스텐 인퓨전', '프리미엄 타감'], false
),
-- 20. Titleist T350
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'T350', 'T350', 2024, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,W", "offset": "progressive"}'::JSONB,
  1299000, 1099000, '{"S": 880000, "A": 770000, "B": 630000, "C": 510000}'::JSONB,
  18, 36, 80, 100,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], 'Titleist의 최대 관용성 아이언으로 골린이에게 추천.',
  ARRAY['맥스 임팩트 기술', '텅스텐 웨이팅', 'D18 댐핑 시스템', '넓은 솔'], false
),
-- 21. Titleist T200
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'T200', 'T200', 2023, 'iron',
  ARRAY[18.0, 21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "4-PW,W", "construction": "hollow"}'::JSONB,
  1499000, 1299000, '{"S": 1040000, "A": 910000, "B": 750000, "C": 600000}'::JSONB,
  8, 20, 95, 115,
  4, 5, 4, 4,
  NULL, '중공 구조로 비거리와 타감의 균형을 제공하는 중급자용 아이언.',
  ARRAY['맥스 임팩트 2.0', '중공 구조', 'D18 댐핑', '텅스텐 웨이팅'], false
),
-- 22. PING G430
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'G430 Iron', 'G430 아이언', 2023, 'iron',
  ARRAY[20.5, 23.5, 26.5, 30.0, 34.5, 39.5, 44.5], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,UW", "sole": "wide"}'::JSONB,
  1199000, 999000, '{"S": 800000, "A": 700000, "B": 570000, "C": 460000}'::JSONB,
  15, 36, 80, 105,
  5, 5, 3, 4,
  ARRAY['thin', 'fat']::VARCHAR[], 'PING의 대표적인 GI 아이언으로 안정적인 비거리와 관용성.',
  ARRAY['하이퍼 17-4 스테인리스', '맞춤형 텅스텐', '대형 헤드', '광폭 솔'], true
),
-- 23. PING i530
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'i530', 'i530', 2024, 'iron',
  ARRAY[18.5, 21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"iron_set": "4-PW,UW", "construction": "hollow"}'::JSONB,
  1599000, 1399000, '{"S": 1120000, "A": 980000, "B": 800000, "C": 640000}'::JSONB,
  5, 18, 100, 120,
  3, 4, 5, 5,
  NULL, '중공 구조의 블레이드형 아이언으로 상급자 선호.',
  ARRAY['중공 바디', '마레이징 페이스', '텅스텐 무게', '컴팩트 헤드'], false
),
-- 24. Mizuno JPX 923 Hot Metal HL
(
  (SELECT id FROM golf_club_brands WHERE name = 'Mizuno'),
  'JPX 923 Hot Metal HL', 'JPX 923 핫메탈 HL', 2023, 'iron',
  ARRAY[22.0, 25.0, 28.0, 32.0, 37.0, 42.0, 47.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,GW", "launch": "high"}'::JSONB,
  1099000, 899000, '{"S": 720000, "A": 630000, "B": 520000, "C": 420000}'::JSONB,
  18, 36, 75, 95,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '높은 발사각과 관용성으로 골린이에게 최적화된 미즈노 아이언.',
  ARRAY['크로몰리 4140M', '코어텍 챔버', '니켈 크롬 몰리브덴', '고발사각'], false
),
-- 25. Mizuno Pro 225
(
  (SELECT id FROM golf_club_brands WHERE name = 'Mizuno'),
  'Pro 225', '프로 225', 2023, 'iron',
  ARRAY[18.0, 21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"iron_set": "4-PW", "construction": "forged"}'::JSONB,
  1699000, 1499000, '{"S": 1200000, "A": 1050000, "B": 860000, "C": 690000}'::JSONB,
  5, 18, 100, 120,
  3, 4, 5, 5,
  NULL, '그레인플로우 단조의 미즈노 특유의 타감과 컨트롤.',
  ARRAY['그레인플로우 단조', '크로몰리 4120', '하모닉 임팩트', '컴팩트 헤드'], false
),
-- 26. Srixon ZX5 Mk II
(
  (SELECT id FROM golf_club_brands WHERE name = 'Srixon'),
  'ZX5 Mk II Iron', 'ZX5 Mk II 아이언', 2023, 'iron',
  ARRAY[20.0, 23.0, 26.0, 30.0, 35.0, 40.0, 45.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,AW"}'::JSONB,
  999000, 799000, '{"S": 640000, "A": 560000, "B": 460000, "C": 370000}'::JSONB,
  12, 28, 90, 110,
  4, 4, 4, 4,
  ARRAY['thin']::VARCHAR[], '가성비 최고의 중급자용 아이언.',
  ARRAY['MainFrame 페이스', '텅스텐 웨이팅', 'Tour V.T. 솔', '프로그레시브 디자인'], false
),
-- 27. Cobra Darkspeed Iron
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cobra'),
  'Darkspeed Iron', '다크스피드 아이언', 2024, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,GW"}'::JSONB,
  1099000, 899000, '{"S": 720000, "A": 630000, "B": 520000, "C": 420000}'::JSONB,
  15, 36, 80, 105,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '초보자를 위한 높은 관용성과 비거리의 아이언.',
  ARRAY['PWR-BRIDGE', '카본 토피스', 'H.O.T 페이스', '초경량 설계'], false
),
-- 28. Cleveland Launcher XL Halo
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cleveland'),
  'Launcher XL Halo', '런처 XL 헤일로', 2022, 'iron',
  ARRAY[22.0, 25.0, 28.0, 32.0, 37.0, 42.0], ARRAY['SR', 'R']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW", "launch": "super_high"}'::JSONB,
  899000, 699000, '{"S": 560000, "A": 490000, "B": 400000, "C": 320000}'::JSONB,
  20, 50, 70, 90,
  5, 4, 2, 4,
  ARRAY['thin', 'fat', 'slice']::VARCHAR[], '시니어와 초보자를 위한 초관용 초경량 아이언.',
  ARRAY['풀 페이스 기술', 'V 형상 솔', 'Action Mass', '초경량 그라파이트'], false
),
-- 29. TaylorMade Stealth Iron
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Stealth Iron', '스텔스 아이언', 2022, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,AW"}'::JSONB,
  999000, 699000, '{"S": 560000, "A": 490000, "B": 400000, "C": 320000}'::JSONB,
  15, 36, 85, 105,
  5, 5, 3, 4,
  ARRAY['thin']::VARCHAR[], '검증된 성능의 가성비 GI 아이언.',
  ARRAY['Cap Back 디자인', 'ECHO 댐핑', 'Speed Pocket', '광폭 솔'], false
),
-- 30. Callaway Rogue ST Max
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Rogue ST Max', '로그 ST 맥스', 2022, 'iron',
  ARRAY[21.0, 24.0, 27.0, 31.0, 36.0, 41.0, 46.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['steel', 'graphite']::VARCHAR[], 'both',
  '{"iron_set": "5-PW,AW"}'::JSONB,
  999000, 699000, '{"S": 560000, "A": 490000, "B": 400000, "C": 320000}'::JSONB,
  15, 36, 80, 100,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '가성비 좋은 전 시즌 GI 아이언.',
  ARRAY['AI 페이스', 'Flash Face Cup', '텅스텐 웨이팅', '광폭 솔'], false
);

-- =============================================
-- 하이브리드/우드 (10개)
-- =============================================

INSERT INTO golf_clubs (
  brand_id, name, name_ko, model_year, club_type,
  loft, shaft_flex, shaft_material, hand,
  specs, release_price, current_price, used_price_guide,
  recommended_handicap_min, recommended_handicap_max,
  recommended_swing_speed_min, recommended_swing_speed_max,
  forgiveness_level, distance_level, control_level, feel_level,
  miss_tendency_fix, description, features, is_featured
) VALUES
-- 31. TaylorMade Qi10 Rescue
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Qi10 Rescue', 'Qi10 레스큐', 2024, 'hybrid',
  ARRAY[19.0, 22.0, 25.0, 28.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"construction": "multi-material"}'::JSONB,
  399000, 349000, '{"S": 280000, "A": 240000, "B": 200000, "C": 160000}'::JSONB,
  10, 36, 85, 110,
  5, 5, 3, 4,
  ARRAY['thin']::VARCHAR[], '높은 관용성과 출력을 제공하는 하이브리드.',
  ARRAY['Speed Pocket', '카본 크라운', 'V 스틸 솔', '높은 발사각'], true
),
-- 32. Callaway Paradym Ai Smoke Hybrid
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym Ai Smoke Hybrid', '패러다임 Ai 스모크 하이브리드', 2024, 'hybrid',
  ARRAY[18.0, 21.0, 24.0, 27.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  399000, 349000, '{"S": 280000, "A": 240000, "B": 200000, "C": 160000}'::JSONB,
  10, 36, 85, 110,
  5, 5, 3, 4,
  ARRAY['thin', 'fat']::VARCHAR[], 'AI 설계 페이스의 관용성 높은 하이브리드.',
  ARRAY['AI Smoke 페이스', 'Jailbreak AI', '스틸 솔', '높은 MOI'], true
),
-- 33. PING G430 Hybrid
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'G430 Hybrid', 'G430 하이브리드', 2023, 'hybrid',
  ARRAY[17.0, 19.0, 22.0, 26.0, 30.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  359000, 299000, '{"S": 240000, "A": 210000, "B": 170000, "C": 140000}'::JSONB,
  10, 36, 85, 110,
  5, 5, 3, 4,
  ARRAY['thin']::VARCHAR[], 'PING의 관용성 높은 하이브리드.',
  ARRAY['탄성 터보레이터', '페이스 랩', '텅스텐 무게', '광폭 솔'], false
),
-- 34. TaylorMade Qi10 Max Fairway
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Qi10 Max Fairway', 'Qi10 맥스 페어웨이', 2024, 'wood',
  ARRAY[15.0, 18.0, 21.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  449000, 399000, '{"S": 320000, "A": 280000, "B": 230000, "C": 180000}'::JSONB,
  12, 36, 85, 105,
  5, 5, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '최대 관용성의 페어웨이 우드.',
  ARRAY['카본 크라운', 'Speed Pocket', 'V 스틸 솔', '높은 MOI'], true
),
-- 35. Callaway Paradym Ai Smoke Max Fast Fairway
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Paradym Ai Smoke Max Fast FW', '패러다임 Ai 스모크 맥스 패스트 페어웨이', 2024, 'wood',
  ARRAY[15.0, 18.0, 21.0], ARRAY['L', 'A', 'SR']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{"weight": "lightweight"}'::JSONB,
  449000, 399000, '{"S": 320000, "A": 280000, "B": 230000, "C": 180000}'::JSONB,
  20, 50, 70, 90,
  5, 4, 3, 4,
  ARRAY['thin', 'slice']::VARCHAR[], '경량 설계의 시니어/입문자용 페어웨이 우드.',
  ARRAY['AI Smoke 페이스', 'Jailbreak AI', '초경량 설계', '높은 발사각'], false
),
-- 36. PING G430 Max Fairway
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'G430 Max Fairway', 'G430 맥스 페어웨이', 2023, 'wood',
  ARRAY[14.5, 17.5, 20.5, 23.5], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  429000, 359000, '{"S": 290000, "A": 250000, "B": 210000, "C": 170000}'::JSONB,
  12, 36, 85, 105,
  5, 5, 3, 4,
  ARRAY['thin']::VARCHAR[], 'PING의 관용성 페어웨이 우드.',
  ARRAY['카본플라이 랩', '페이스 플렉스', '텅스텐 무게', '스핀 시스턴시'], false
),
-- 37. Titleist TSR2 Fairway
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'TSR2 Fairway', 'TSR2 페어웨이', 2023, 'wood',
  ARRAY[13.5, 15.0, 16.5, 18.0, 21.0], ARRAY['R', 'S', 'X']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  449000, 379000, '{"S": 300000, "A": 260000, "B": 220000, "C": 180000}'::JSONB,
  8, 25, 95, 115,
  4, 5, 4, 5,
  NULL, 'Titleist의 다재다능한 페어웨이 우드.',
  ARRAY['ATI 425 페이스', '액티브 리코일', 'SureFit 호젤', '최적 CG'], false
),
-- 38. Mizuno ST-Max 230 Fairway
(
  (SELECT id FROM golf_club_brands WHERE name = 'Mizuno'),
  'ST-Max 230 Fairway', 'ST-맥스 230 페어웨이', 2023, 'wood',
  ARRAY[15.0, 18.0, 21.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  379000, 299000, '{"S": 240000, "A": 210000, "B": 170000, "C": 140000}'::JSONB,
  15, 36, 85, 105,
  5, 4, 3, 4,
  ARRAY['slice']::VARCHAR[], '미즈노 특유의 타감과 관용성.',
  ARRAY['베타 티타늄', 'Wave 솔', 'SAT 2041', '드로우 바이어스'], false
),
-- 39. Cobra Darkspeed Hybrid
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cobra'),
  'Darkspeed Hybrid', '다크스피드 하이브리드', 2024, 'hybrid',
  ARRAY[17.0, 19.0, 22.0, 25.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  349000, 299000, '{"S": 240000, "A": 210000, "B": 170000, "C": 140000}'::JSONB,
  12, 36, 85, 105,
  5, 5, 3, 4,
  ARRAY['thin']::VARCHAR[], '공기역학 설계의 관용성 하이브리드.',
  ARRAY['PWR-BRIDGE', 'H.O.T 페이스', '공기역학 솔', '높은 MOI'], false
),
-- 40. Srixon ZX Mk II Hybrid
(
  (SELECT id FROM golf_club_brands WHERE name = 'Srixon'),
  'ZX Mk II Hybrid', 'ZX Mk II 하이브리드', 2023, 'hybrid',
  ARRAY[18.0, 20.0, 23.0, 26.0], ARRAY['SR', 'R', 'S']::VARCHAR[], ARRAY['graphite']::VARCHAR[], 'both',
  '{}'::JSONB,
  299000, 249000, '{"S": 200000, "A": 170000, "B": 140000, "C": 110000}'::JSONB,
  10, 30, 90, 110,
  4, 4, 4, 4,
  NULL, '가성비 좋은 하이브리드.',
  ARRAY['리바운드 프레임', '카본 크라운', '텅스텐 무게', '스피드 채널'], false
);

-- =============================================
-- 웨지/퍼터 (10개)
-- =============================================

INSERT INTO golf_clubs (
  brand_id, name, name_ko, model_year, club_type,
  loft, shaft_flex, shaft_material, hand,
  specs, release_price, current_price, used_price_guide,
  recommended_handicap_min, recommended_handicap_max,
  forgiveness_level, distance_level, control_level, feel_level,
  description, features, is_featured
) VALUES
-- 41. Titleist Vokey SM10
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'Vokey SM10', '보키 SM10', 2024, 'wedge',
  ARRAY[46.0, 48.0, 50.0, 52.0, 54.0, 56.0, 58.0, 60.0], ARRAY['S']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"grinds": ["F", "M", "S", "D", "K", "L"], "finish": ["Tour Chrome", "Jet Black", "Brushed Steel"]}'::JSONB,
  239000, 219000, '{"S": 175000, "A": 150000, "B": 125000, "C": 100000}'::JSONB,
  0, 36,
  3, 3, 5, 5,
  '투어에서 가장 많이 사용되는 웨지 시리즈의 최신 버전.',
  ARRAY['Spin Milled 그루브', '정밀 CNC 밀드 페이스', '다양한 그라인드 옵션', '프로그레시브 CG'], true
),
-- 42. Cleveland RTX 6 ZipCore
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cleveland'),
  'RTX 6 ZipCore', 'RTX 6 집코어', 2024, 'wedge',
  ARRAY[46.0, 48.0, 50.0, 52.0, 54.0, 56.0, 58.0, 60.0], ARRAY['S']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"grinds": ["Full", "Mid", "Low"]}'::JSONB,
  199000, 179000, '{"S": 145000, "A": 125000, "B": 100000, "C": 80000}'::JSONB,
  0, 36,
  3, 3, 5, 5,
  '클리블랜드의 대표 웨지 시리즈.',
  ARRAY['ZipCore 기술', 'UltiZip 그루브', '가변 페이스 텍스처', 'HydraZip 마감'], true
),
-- 43. Callaway Jaws Raw
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Jaws Raw', '조스 로우', 2023, 'wedge',
  ARRAY[50.0, 52.0, 54.0, 56.0, 58.0, 60.0], ARRAY['S']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"grinds": ["W", "S", "Z", "X"]}'::JSONB,
  199000, 179000, '{"S": 145000, "A": 125000, "B": 100000, "C": 80000}'::JSONB,
  0, 30,
  3, 3, 5, 5,
  '날카로운 그루브로 최대 스핀 제공.',
  ARRAY['37V 그루브', '오프셋 그루브-인-그루브', '마이크로 포지티브 표면', '로우 피니시'], false
),
-- 44. TaylorMade Hi-Toe 3
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Hi-Toe 3', '하이토 3', 2023, 'wedge',
  ARRAY[52.0, 54.0, 56.0, 58.0, 60.0], ARRAY['S']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"toe": "high", "finish": "raw"}'::JSONB,
  199000, 179000, '{"S": 145000, "A": 125000, "B": 100000, "C": 80000}'::JSONB,
  0, 30,
  3, 3, 5, 5,
  '높은 토우 디자인의 다용도 웨지.',
  ARRAY['풀 페이스 그루브', 'ZTP RAW 그루브', '높은 토우', '다양한 라이 대응'], false
),
-- 45. PING Glide 4.0
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'Glide 4.0', '글라이드 4.0', 2023, 'wedge',
  ARRAY[50.0, 52.0, 54.0, 56.0, 58.0, 60.0], ARRAY['S']::VARCHAR[], ARRAY['steel']::VARCHAR[], 'both',
  '{"grinds": ["S", "W", "T", "E"]}'::JSONB,
  189000, 169000, '{"S": 135000, "A": 115000, "B": 95000, "C": 75000}'::JSONB,
  0, 36,
  4, 3, 5, 4,
  'PING의 대표 웨지 라인.',
  ARRAY['정밀 밀드 그루브', '에미트 도장', '다양한 솔 옵션', '일관된 스핀'], false
),
-- 46. Odyssey White Hot OG #7
(
  (SELECT id FROM golf_club_brands WHERE name = 'Callaway'),
  'Odyssey White Hot OG #7', '오디세이 화이트핫 OG #7', 2023, 'putter',
  ARRAY[34.0], NULL, ARRAY['steel']::VARCHAR[], 'both',
  '{"head_style": "mallet", "insert": "White Hot", "alignment": "triple track"}'::JSONB,
  299000, 269000, '{"S": 215000, "A": 185000, "B": 155000, "C": 125000}'::JSONB,
  0, 50,
  5, 3, 4, 5,
  '전설적인 화이트핫 인서트의 말렛 퍼터.',
  ARRAY['White Hot 인서트', '트리플 트랙 정렬', '스테인리스 스틸', '클래식 디자인'], true
),
-- 47. TaylorMade Spider GTX
(
  (SELECT id FROM golf_club_brands WHERE name = 'TaylorMade'),
  'Spider GTX', '스파이더 GTX', 2024, 'putter',
  ARRAY[34.0, 35.0], NULL, ARRAY['steel']::VARCHAR[], 'both',
  '{"head_style": "mallet", "insert": "Pure Roll"}'::JSONB,
  399000, 349000, '{"S": 280000, "A": 240000, "B": 200000, "C": 160000}'::JSONB,
  0, 50,
  5, 3, 4, 5,
  '높은 MOI의 안정적인 말렛 퍼터.',
  ARRAY['Pure Roll 인서트', '높은 MOI', '텅스텐 웨이팅', 'True Path 정렬'], true
),
-- 48. PING Anser 2
(
  (SELECT id FROM golf_club_brands WHERE name = 'PING'),
  'Anser 2', '앤서 2', 2023, 'putter',
  ARRAY[33.0, 34.0, 35.0], NULL, ARRAY['steel']::VARCHAR[], 'both',
  '{"head_style": "blade", "insert": "PEBAX"}'::JSONB,
  299000, 269000, '{"S": 215000, "A": 185000, "B": 155000, "C": 125000}'::JSONB,
  0, 50,
  4, 3, 5, 5,
  '전설적인 PING 앤서 디자인의 현대화 버전.',
  ARRAY['PEBAX 인서트', '텅스텐 토우/힐', '클래식 블레이드', '정밀 밀드 페이스'], false
),
-- 49. Scotty Cameron Phantom X 5
(
  (SELECT id FROM golf_club_brands WHERE name = 'Titleist'),
  'Scotty Cameron Phantom X 5', '스코티 카메론 팬텀 X 5', 2023, 'putter',
  ARRAY[33.0, 34.0, 35.0], NULL, ARRAY['steel']::VARCHAR[], 'both',
  '{"head_style": "mallet", "material": "aluminum/steel"}'::JSONB,
  599000, 549000, '{"S": 440000, "A": 380000, "B": 320000, "C": 260000}'::JSONB,
  0, 50,
  4, 3, 5, 5,
  '프리미엄 말렛 퍼터의 대명사.',
  ARRAY['스테인리스/알루미늄 복합', '솔리드 페이스', '정밀 밀링', '프리미엄 마감'], false
),
-- 50. Cleveland Huntington Beach Soft Premier
(
  (SELECT id FROM golf_club_brands WHERE name = 'Cleveland'),
  'Huntington Beach Soft Premier', '헌팅턴 비치 소프트 프리미어', 2023, 'putter',
  ARRAY[33.0, 34.0, 35.0], NULL, ARRAY['steel']::VARCHAR[], 'both',
  '{"head_style": "blade", "insert": "Speed Optimized Face"}'::JSONB,
  199000, 179000, '{"S": 145000, "A": 125000, "B": 100000, "C": 80000}'::JSONB,
  0, 50,
  4, 3, 4, 5,
  '가성비 최고의 블레이드 퍼터.',
  ARRAY['Speed Optimized 페이스', '다이아몬드 CNC 밀링', '부드러운 타감', '가성비'], false
);

-- 완료 메시지
SELECT 'Golf clubs seeded successfully! Total: ' || COUNT(*) || ' clubs' FROM golf_clubs;
`;

console.log('==============================================');
console.log('Golf Club Seed SQL');
console.log('==============================================');
console.log('Supabase Dashboard > SQL Editor에서 아래 SQL을 실행하세요:');
console.log('==============================================');
console.log(clubsSQL);
