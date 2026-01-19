-- =============================================
-- 관리자 권한 시스템 추가
-- 2026-01-19
-- =============================================

-- 1. profiles 테이블에 is_admin 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. 관리자 권한 체크 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 특정 사용자를 관리자로 설정하는 함수 (슈퍼유저만 실행 가능)
CREATE OR REPLACE FUNCTION public.set_admin(user_id UUID, admin_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_admin = admin_status
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 관리자 전용 RLS 정책 (예시: 연습장 등록)
-- practice_ranges 테이블에 관리자만 INSERT/UPDATE/DELETE 가능하도록 설정
DO $$
BEGIN
  -- 기존 정책 삭제 (있으면)
  DROP POLICY IF EXISTS "Admin can insert practice_ranges" ON public.practice_ranges;
  DROP POLICY IF EXISTS "Admin can update practice_ranges" ON public.practice_ranges;
  DROP POLICY IF EXISTS "Admin can delete practice_ranges" ON public.practice_ranges;

  -- 새 정책 생성
  CREATE POLICY "Admin can insert practice_ranges"
    ON public.practice_ranges
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

  CREATE POLICY "Admin can update practice_ranges"
    ON public.practice_ranges
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

  CREATE POLICY "Admin can delete practice_ranges"
    ON public.practice_ranges
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
EXCEPTION
  WHEN undefined_table THEN
    -- practice_ranges 테이블이 없으면 무시
    NULL;
END $$;

-- 5. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- =============================================
-- 관리자 설정 방법 (수동 실행)
-- =============================================
-- 특정 사용자를 관리자로 설정하려면:
-- UPDATE public.profiles SET is_admin = true WHERE id = '사용자-uuid';
-- 또는
-- SELECT public.set_admin('사용자-uuid', true);
