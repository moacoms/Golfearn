-- =====================================================
-- Golfearn 전체 마이그레이션 (Supabase Dashboard에서 실행)
-- =====================================================

-- =====================================================
-- 1. 추천인 시스템 (Referral System)
-- =====================================================

-- 추천 코드 테이블
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  uses_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 추천 기록 테이블
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- 추천 통계 뷰
CREATE OR REPLACE VIEW referral_stats AS
SELECT
  r.referrer_id,
  u.email as referrer_email,
  COUNT(r.id) as total_referrals,
  SUM(CASE WHEN r.reward_given THEN 1 ELSE 0 END) as rewarded_referrals,
  rc.code as referral_code
FROM referrals r
JOIN auth.users u ON r.referrer_id = u.id
JOIN referral_codes rc ON r.referrer_id = rc.user_id
GROUP BY r.referrer_id, u.email, rc.code;

-- =====================================================
-- 2. 포인트/리워드 시스템 (Points & Rewards)
-- =====================================================

-- 포인트 지갑 테이블
CREATE TABLE IF NOT EXISTS point_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 포인트 거래 내역 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- 경험치(XP) 테이블
CREATE TABLE IF NOT EXISTS user_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 경험치 거래 내역 테이블
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 뱃지 마스터 테이블
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50),
  requirement_type VARCHAR(50),
  requirement_value INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 뱃지 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- 3. 이벤트/프로모션 시스템
-- =====================================================

-- 이벤트 테이블
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  banner_image TEXT,
  terms TEXT,
  reward_type VARCHAR(50),
  reward_value JSONB,
  max_participants INT,
  current_participants INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이벤트 참가자 테이블
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  submission_data JSONB,
  reward_claimed BOOLEAN DEFAULT FALSE,
  participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 프로모션 코드 테이블
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,
  discount_value INT NOT NULL,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로모션 코드 사용 내역
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_amount INT NOT NULL,
  order_type VARCHAR(50),
  order_id UUID,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id, order_id)
);

-- =====================================================
-- 4. 프리미엄 멤버십 시스템
-- =====================================================

-- 프리미엄 구독 테이블
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  plan VARCHAR(20) DEFAULT 'monthly',
  price INT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프리미엄 구독 히스토리
CREATE TABLE IF NOT EXISTS premium_subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES premium_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. 출석 체크 시스템
-- =====================================================

-- 출석 체크 테이블
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consecutive_days INT DEFAULT 1,
  reward_points INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_in_date)
);

-- =====================================================
-- 6. 트리거 및 함수
-- =====================================================

-- 추천 코드 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'GOLF-' || UPPER(substring(md5(random()::text || user_id::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 신규 사용자 가입 시 추천 코드 자동 생성 트리거
CREATE OR REPLACE FUNCTION create_referral_code_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.id, generate_referral_code(NEW.id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_referral_code ON auth.users;
CREATE TRIGGER trigger_create_referral_code
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_referral_code_for_new_user();

-- 신규 사용자 포인트 지갑 생성 트리거
CREATE OR REPLACE FUNCTION create_point_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO point_wallets (user_id, balance, total_earned)
  VALUES (NEW.id, 3000, 3000);
  INSERT INTO point_transactions (user_id, type, amount, category, description)
  VALUES (NEW.id, 'earn', 3000, 'signup', '회원가입 보너스');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_point_wallet ON auth.users;
CREATE TRIGGER trigger_create_point_wallet
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_point_wallet_for_new_user();

-- 신규 사용자 경험치 생성 트리거
CREATE OR REPLACE FUNCTION create_user_experience_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_experience (user_id, level, xp, total_xp)
  VALUES (NEW.id, 1, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_user_experience ON auth.users;
CREATE TRIGGER trigger_create_user_experience
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_experience_for_new_user();

-- 포인트 적립/사용 시 지갑 업데이트 트리거
CREATE OR REPLACE FUNCTION update_point_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'earn' THEN
    UPDATE point_wallets
    SET balance = balance + NEW.amount, total_earned = total_earned + NEW.amount, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.type = 'spend' THEN
    UPDATE point_wallets
    SET balance = balance - NEW.amount, total_spent = total_spent + NEW.amount, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_point_wallet ON point_transactions;
CREATE TRIGGER trigger_update_point_wallet
AFTER INSERT ON point_transactions
FOR EACH ROW
EXECUTE FUNCTION update_point_wallet();

-- 경험치 획득 시 레벨업 체크 트리거
CREATE OR REPLACE FUNCTION check_level_up()
RETURNS TRIGGER AS $$
DECLARE
  new_level INT;
BEGIN
  CASE
    WHEN NEW.total_xp >= 10000 THEN new_level := 6;
    WHEN NEW.total_xp >= 5000 THEN new_level := 5;
    WHEN NEW.total_xp >= 1500 THEN new_level := 4;
    WHEN NEW.total_xp >= 500 THEN new_level := 3;
    WHEN NEW.total_xp >= 100 THEN new_level := 2;
    ELSE new_level := 1;
  END CASE;

  IF new_level > OLD.level THEN
    UPDATE user_experience SET level = new_level, updated_at = NOW() WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_level_up ON user_experience;
CREATE TRIGGER trigger_check_level_up
AFTER INSERT OR UPDATE ON user_experience
FOR EACH ROW
EXECUTE FUNCTION check_level_up();

-- =====================================================
-- 7. RLS (Row Level Security) 정책
-- =====================================================

-- referral_codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own referral code" ON referral_codes;
CREATE POLICY "Users can view their own referral code" ON referral_codes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view all referral codes" ON referral_codes;
CREATE POLICY "Users can view all referral codes" ON referral_codes FOR SELECT TO authenticated USING (true);

-- referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their referral history" ON referrals;
CREATE POLICY "Users can view their referral history" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- point_wallets
ALTER TABLE point_wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own wallet" ON point_wallets;
CREATE POLICY "Users can view their own wallet" ON point_wallets FOR SELECT USING (auth.uid() = user_id);

-- point_transactions
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON point_transactions;
CREATE POLICY "Users can view their own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);

-- user_experience
ALTER TABLE user_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own experience" ON user_experience;
CREATE POLICY "Users can view their own experience" ON user_experience FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can view others experience" ON user_experience;
CREATE POLICY "Anyone can view others experience" ON user_experience FOR SELECT TO authenticated USING (true);

-- xp_transactions
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON xp_transactions;
CREATE POLICY "Users can view their own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT TO authenticated USING (true);

-- user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all badges" ON user_badges;
CREATE POLICY "Users can view all badges" ON user_badges FOR SELECT TO authenticated USING (true);

-- events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
CREATE POLICY "Anyone can view active events" ON events FOR SELECT TO authenticated USING (status = 'active' OR auth.uid() = created_by);

-- event_participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own participation" ON event_participants;
CREATE POLICY "Users can view their own participation" ON event_participants FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can participate in events" ON event_participants;
CREATE POLICY "Users can participate in events" ON event_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Anyone can view active promo codes" ON promo_codes FOR SELECT TO authenticated USING (is_active = true);

-- promo_code_usage
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own promo code usage" ON promo_code_usage;
CREATE POLICY "Users can view their own promo code usage" ON promo_code_usage FOR SELECT USING (auth.uid() = user_id);

-- premium_subscriptions
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own subscription" ON premium_subscriptions;
CREATE POLICY "Users can view their own subscription" ON premium_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- daily_check_ins
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own check-ins" ON daily_check_ins;
CREATE POLICY "Users can view their own check-ins" ON daily_check_ins FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own check-ins" ON daily_check_ins;
CREATE POLICY "Users can create their own check-ins" ON daily_check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. 초기 데이터 (뱃지)
-- =====================================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('첫 라운딩 완주', '첫 조인 참가 후 라운딩 완료', '🏆', 'achievement', 'join_count', 1),
('7일 연속 출석', '7일 연속 출석 체크', '🔥', 'activity', 'consecutive_days', 7),
('댓글왕', '댓글 100개 이상 작성', '💬', 'social', 'comment_count', 100),
('조인 달인', '조인 10회 이상 참가', '🤝', 'achievement', 'join_count', 10),
('5점 리뷰어', '5점 만점 리뷰 10개 작성', '⭐', 'social', 'five_star_reviews', 10),
('사진 마스터', '사진 50장 이상 업로드', '📸', 'activity', 'photo_count', 50),
('거래왕', '중고거래 20건 이상 완료', '💰', 'trading', 'trade_count', 20),
('추천 마스터', '친구 10명 이상 추천', '👥', 'social', 'referral_count', 10),
('초대왕', '친구 20명 이상 추천', '👑', 'social', 'referral_count', 20),
('골린이 멘토', '답변 채택 50회', '🎓', 'social', 'accepted_answers', 50)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. 유용한 뷰 (Views)
-- =====================================================

-- 사용자 통계 뷰
CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id as user_id,
  u.email,
  COALESCE(pw.balance, 0) as points,
  COALESCE(ux.level, 1) as level,
  COALESCE(ux.total_xp, 0) as total_xp,
  COALESCE(ref_count.count, 0) as referral_count,
  COALESCE(badge_count.count, 0) as badge_count,
  COALESCE(ps.status, 'free') as premium_status
FROM auth.users u
LEFT JOIN point_wallets pw ON u.id = pw.user_id
LEFT JOIN user_experience ux ON u.id = ux.user_id
LEFT JOIN (SELECT referrer_id, COUNT(*) as count FROM referrals GROUP BY referrer_id) ref_count ON u.id = ref_count.referrer_id
LEFT JOIN (SELECT user_id, COUNT(*) as count FROM user_badges GROUP BY user_id) badge_count ON u.id = badge_count.user_id
LEFT JOIN premium_subscriptions ps ON u.id = ps.user_id AND ps.status = 'active';

-- 리더보드 뷰 (경험치 순위)
CREATE OR REPLACE VIEW xp_leaderboard AS
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

-- 추천인 리더보드
CREATE OR REPLACE VIEW referral_leaderboard AS
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

-- =====================================================
-- 완료!
-- =====================================================
