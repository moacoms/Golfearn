-- =============================================
-- 일일 분석 제한 시스템
-- Version: 1.0
-- Date: 2026-02-10
--
-- 변경사항:
-- - 무료 사용자: 월 3회 -> 하루 1회로 변경
-- - daily_analysis_count, last_analysis_date 컬럼 추가
-- =============================================

-- 1. subscriptions 테이블에 일일 분석 관련 컬럼 추가
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS daily_analysis_count INTEGER DEFAULT 0;

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS last_analysis_date DATE;

-- 2. 함수: 일일 분석 제한 체크 (무료 사용자용)
CREATE OR REPLACE FUNCTION check_daily_analysis_limit(p_user_id UUID)
RETURNS TABLE (
  can_analyze BOOLEAN,
  remaining_today INTEGER,
  plan_type VARCHAR(20),
  is_unlimited BOOLEAN
) AS $$
DECLARE
  v_subscription RECORD;
  v_today DATE := CURRENT_DATE;
  v_daily_count INTEGER;
BEGIN
  -- 구독 정보 조회
  SELECT s.plan_type, s.status, s.daily_analysis_count, s.last_analysis_date,
         s.monthly_analysis_count, s.monthly_analysis_limit
  INTO v_subscription
  FROM subscriptions s
  WHERE s.user_id = p_user_id;

  -- 구독 없으면 무료 플랜으로 생성
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan_type, status, monthly_analysis_limit, monthly_ocr_limit, daily_analysis_count, last_analysis_date)
    VALUES (p_user_id, 'free', 'active', 1, 5, 0, NULL);

    can_analyze := TRUE;
    remaining_today := 1;
    plan_type := 'free';
    is_unlimited := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- 유료 플랜은 무제한 (monthly_analysis_limit = -1)
  IF v_subscription.monthly_analysis_limit = -1 THEN
    can_analyze := TRUE;
    remaining_today := -1; -- 무제한
    plan_type := v_subscription.plan_type;
    is_unlimited := TRUE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- 무료 플랜: 날짜 변경 시 카운트 리셋
  IF v_subscription.last_analysis_date IS NULL OR v_subscription.last_analysis_date < v_today THEN
    v_daily_count := 0;
  ELSE
    v_daily_count := COALESCE(v_subscription.daily_analysis_count, 0);
  END IF;

  -- 무료 플랜: 하루 1회 제한
  can_analyze := v_daily_count < 1;
  remaining_today := GREATEST(0, 1 - v_daily_count);
  plan_type := v_subscription.plan_type;
  is_unlimited := FALSE;
  RETURN NEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- 3. 함수: 일일 분석 사용량 증가
CREATE OR REPLACE FUNCTION increment_daily_analysis_usage(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
BEGIN
  -- 마지막 분석 날짜 조회
  SELECT last_analysis_date INTO v_last_date
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- 날짜가 변경되었으면 카운트 리셋 후 1로 설정
  IF v_last_date IS NULL OR v_last_date < v_today THEN
    UPDATE subscriptions
    SET daily_analysis_count = 1,
        last_analysis_date = v_today,
        monthly_analysis_count = monthly_analysis_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- 같은 날이면 카운트 증가
    UPDATE subscriptions
    SET daily_analysis_count = daily_analysis_count + 1,
        monthly_analysis_count = monthly_analysis_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 기존 데이터 업데이트: monthly_analysis_limit 수정 (free: 월 3회 -> 하루 1회 = 월 ~30회, 하지만 일일 제한이 우선)
-- 무료 사용자는 일일 제한으로 관리하므로 월간 제한을 30으로 설정 (백업용)
UPDATE subscriptions
SET monthly_analysis_limit = 30
WHERE plan_type = 'free' AND monthly_analysis_limit = 3;
