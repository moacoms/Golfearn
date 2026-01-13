-- =============================================
-- 골린이 조인 매칭 테이블 생성
-- =============================================

-- join_posts: 조인 모집글
create table public.join_posts (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles not null,

  -- 기본 정보
  title text not null,
  description text,

  -- 라운딩 정보
  round_date date not null,
  round_time time not null,
  golf_course_name text not null,
  golf_course_address text,

  -- 모집 정보
  total_slots int not null default 4,
  current_slots int not null default 1,

  -- 실력 조건
  min_score int,
  max_score int,

  -- 비용 정보
  green_fee int,
  cart_fee int,
  caddie_fee int,

  -- 위치 정보
  location_dong text,
  location_gu text,
  location_city text,
  location_lat double precision,
  location_lng double precision,

  -- 상태: recruiting(모집중), full(마감), confirmed(확정), completed(완료), cancelled(취소)
  status text not null default 'recruiting',

  -- 메타데이터
  view_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- join_participants: 참가 신청
create table public.join_participants (
  id bigint primary key generated always as identity,
  join_post_id bigint references public.join_posts on delete cascade not null,
  user_id uuid references public.profiles not null,

  -- 신청 정보
  message text,
  -- 상태: pending(대기), approved(승인), rejected(거절), cancelled(취소)
  status text not null default 'pending',

  -- 메타데이터
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 유니크 제약: 한 사용자가 같은 모집글에 중복 신청 불가
  unique(join_post_id, user_id)
);

-- 인덱스 생성
create index idx_join_posts_round_date on public.join_posts(round_date);
create index idx_join_posts_status on public.join_posts(status);
create index idx_join_posts_location on public.join_posts(location_dong, location_gu);
create index idx_join_posts_user_id on public.join_posts(user_id);

create index idx_join_participants_post on public.join_participants(join_post_id);
create index idx_join_participants_user on public.join_participants(user_id);
create index idx_join_participants_status on public.join_participants(status);

-- RLS 정책
alter table public.join_posts enable row level security;
alter table public.join_participants enable row level security;

-- join_posts RLS
create policy "Anyone can view non-cancelled join posts" on public.join_posts
  for select using (status != 'cancelled');

create policy "Authenticated users can create join posts" on public.join_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own join posts" on public.join_posts
  for update using (auth.uid() = user_id);

create policy "Users can delete own join posts" on public.join_posts
  for delete using (auth.uid() = user_id);

-- join_participants RLS
create policy "Post owners and participants can view" on public.join_participants
  for select using (
    exists (
      select 1 from public.join_posts
      where id = join_post_id and user_id = auth.uid()
    ) or user_id = auth.uid()
  );

create policy "Authenticated users can apply" on public.join_participants
  for insert with check (auth.uid() = user_id);

create policy "Users can update participation" on public.join_participants
  for update using (
    user_id = auth.uid() or
    exists (
      select 1 from public.join_posts
      where id = join_post_id and user_id = auth.uid()
    )
  );

create policy "Users can delete own participation" on public.join_participants
  for delete using (user_id = auth.uid());

-- 조회수 증가 함수
create or replace function increment_join_post_view(post_id bigint)
returns void as $$
begin
  update public.join_posts
  set view_count = view_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- 참가 인원 자동 업데이트 함수
create or replace function update_join_slots()
returns trigger as $$
declare
  approved_count int;
  post_total_slots int;
begin
  -- 승인된 참가자 수 계산
  select count(*) into approved_count
  from public.join_participants
  where join_post_id = coalesce(new.join_post_id, old.join_post_id)
  and status = 'approved';

  -- 총 인원 확인
  select total_slots into post_total_slots
  from public.join_posts
  where id = coalesce(new.join_post_id, old.join_post_id);

  -- 현재 인원 업데이트 (호스트 1명 + 승인된 참가자)
  update public.join_posts
  set
    current_slots = 1 + approved_count,
    status = case
      when 1 + approved_count >= post_total_slots then 'full'
      else 'recruiting'
    end,
    updated_at = now()
  where id = coalesce(new.join_post_id, old.join_post_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- 트리거 생성
create trigger trg_update_join_slots
after insert or update or delete on public.join_participants
for each row execute function update_join_slots();
