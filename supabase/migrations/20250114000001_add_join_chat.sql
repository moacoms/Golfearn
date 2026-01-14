-- 조인 채팅 테이블 생성 (그룹 채팅)
CREATE TABLE IF NOT EXISTS public.join_messages (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  join_post_id bigint REFERENCES public.join_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_join_messages_post_id ON public.join_messages(join_post_id);
CREATE INDEX IF NOT EXISTS idx_join_messages_created_at ON public.join_messages(join_post_id, created_at);

-- RLS 활성화
ALTER TABLE public.join_messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 호스트와 승인된 참가자만 메시지 조회 가능
CREATE POLICY "Join members can view messages"
  ON public.join_messages FOR SELECT
  USING (
    -- 호스트인 경우
    EXISTS (
      SELECT 1 FROM public.join_posts
      WHERE id = join_post_id AND user_id = auth.uid()
    )
    OR
    -- 승인된 참가자인 경우
    EXISTS (
      SELECT 1 FROM public.join_participants
      WHERE join_post_id = join_messages.join_post_id
      AND user_id = auth.uid()
      AND status = 'approved'
    )
  );

-- RLS 정책: 호스트와 승인된 참가자만 메시지 작성 가능
CREATE POLICY "Join members can insert messages"
  ON public.join_messages FOR INSERT
  WITH CHECK (
    -- 본인 메시지만 작성 가능
    auth.uid() = user_id
    AND
    (
      -- 호스트인 경우
      EXISTS (
        SELECT 1 FROM public.join_posts
        WHERE id = join_post_id AND user_id = auth.uid()
      )
      OR
      -- 승인된 참가자인 경우
      EXISTS (
        SELECT 1 FROM public.join_participants
        WHERE join_post_id = join_messages.join_post_id
        AND user_id = auth.uid()
        AND status = 'approved'
      )
    )
  );

-- 조인 채팅 읽음 추적 테이블
CREATE TABLE IF NOT EXISTS public.join_chat_reads (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  join_post_id bigint REFERENCES public.join_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(join_post_id, user_id)
);

-- RLS 활성화
ALTER TABLE public.join_chat_reads ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 읽음 정보만 조회/수정 가능
CREATE POLICY "Users can manage own read status"
  ON public.join_chat_reads FOR ALL
  USING (auth.uid() = user_id);
