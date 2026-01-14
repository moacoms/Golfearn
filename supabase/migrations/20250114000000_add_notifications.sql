-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'join_apply', 'join_approved', 'join_rejected', 'join_cancelled'
  title text NOT NULL,
  message text,
  link text, -- 클릭 시 이동할 URL
  related_id bigint, -- 관련 조인 게시글 ID
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- RLS 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 본인 알림만 수정 가능 (읽음 처리)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 시스템(인증된 사용자)이 알림 생성 가능
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 알림 타입 설명:
-- join_apply: 조인 신청 알림 (호스트에게)
-- join_approved: 조인 승인 알림 (신청자에게)
-- join_rejected: 조인 거절 알림 (신청자에게)
-- join_cancelled: 조인 취소 알림 (참가자들에게)
