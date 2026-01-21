-- =====================================================
-- 보안 이슈 수정 마이그레이션
-- 2026-01-21
-- =====================================================
-- 수정 사항:
-- 1. referral_stats - auth.users 대신 profiles 사용
-- 2. user_stats - auth.users 대신 profiles 사용
-- 3. 모든 뷰 SECURITY INVOKER로 재정의
-- 4. premium_subscription_history RLS 활성화
-- =====================================================

-- 1. referral_stats 뷰 재정의 (auth.users 제거, email 제외)
DROP VIEW IF EXISTS referral_stats;
CREATE VIEW referral_stats
WITH (security_invoker = true)
AS
SELECT
  r.referrer_id,
  p.full_name as referrer_name,
  COUNT(r.id) as total_referrals,
  SUM(CASE WHEN r.reward_given THEN 1 ELSE 0 END) as rewarded_referrals,
  rc.code as referral_code
FROM referrals r
JOIN profiles p ON r.referrer_id = p.id
JOIN referral_codes rc ON r.referrer_id = rc.user_id
GROUP BY r.referrer_id, p.full_name, rc.code;

-- 2. user_stats 뷰 재정의 (auth.users 제거, email 제외)
DROP VIEW IF EXISTS user_stats;
CREATE VIEW user_stats
WITH (security_invoker = true)
AS
SELECT
  p.id as user_id,
  p.full_name,
  COALESCE(pw.balance, 0) as points,
  COALESCE(ux.level, 1) as level,
  COALESCE(ux.total_xp, 0) as total_xp,
  COALESCE(ref_count.count, 0) as referral_count,
  COALESCE(badge_count.count, 0) as badge_count,
  COALESCE(ps.status, 'free') as premium_status
FROM profiles p
LEFT JOIN point_wallets pw ON p.id = pw.user_id
LEFT JOIN user_experience ux ON p.id = ux.user_id
LEFT JOIN (SELECT referrer_id, COUNT(*) as count FROM referrals GROUP BY referrer_id) ref_count ON p.id = ref_count.referrer_id
LEFT JOIN (SELECT user_id, COUNT(*) as count FROM user_badges GROUP BY user_id) badge_count ON p.id = badge_count.user_id
LEFT JOIN premium_subscriptions ps ON p.id = ps.user_id AND ps.status = 'active';

-- 3. xp_leaderboard 뷰 재정의 (SECURITY INVOKER)
DROP VIEW IF EXISTS xp_leaderboard;
CREATE VIEW xp_leaderboard
WITH (security_invoker = true)
AS
SELECT
  ux.user_id,
  p.full_name,
  p.avatar_url,
  ux.level,
  ux.total_xp,
  ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) as rank
FROM user_experience ux
JOIN profiles p ON ux.user_id = p.id
ORDER BY ux.total_xp DESC;

-- 4. referral_leaderboard 뷰 재정의 (SECURITY INVOKER)
DROP VIEW IF EXISTS referral_leaderboard;
CREATE VIEW referral_leaderboard
WITH (security_invoker = true)
AS
SELECT
  r.referrer_id,
  p.full_name,
  p.avatar_url,
  COUNT(r.id) as referral_count,
  ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank
FROM referrals r
JOIN profiles p ON r.referrer_id = p.id
GROUP BY r.referrer_id, p.full_name, p.avatar_url
ORDER BY referral_count DESC;

-- 5. premium_subscription_history 테이블 RLS 활성화
ALTER TABLE premium_subscription_history ENABLE ROW LEVEL SECURITY;

-- premium_subscription_history RLS 정책
-- 사용자는 자신의 구독 기록만 조회 가능
CREATE POLICY "Users can view own subscription history"
  ON premium_subscription_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 서비스 역할은 모든 작업 가능 (시스템 용도)
CREATE POLICY "Service role can manage subscription history"
  ON premium_subscription_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 완료
-- =====================================================
