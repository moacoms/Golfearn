-- Golfearn Database Schema
-- Supabase Dashboard > SQL Editor에서 실행

-- ============================================
-- 1. 사전예약 테이블 (MVP 최우선)
-- ============================================
create table if not exists public.pre_registrations (
  id bigint primary key generated always as identity,
  email text not null unique,
  name text,
  source text default 'landing',  -- 유입 경로
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.pre_registrations enable row level security;

-- 누구나 등록 가능 (insert만)
create policy "Anyone can insert pre_registrations"
  on public.pre_registrations for insert
  with check (true);

-- ============================================
-- 2. 사용자 프로필 테이블
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  height integer,              -- 키 (cm)
  golf_started_at date,        -- 골프 시작일
  average_score integer,       -- 평균 스코어
  location text,               -- 지역
  bio text,                    -- 자기소개
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;

-- 프로필 조회는 누구나 가능
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- 본인 프로필만 수정 가능
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성 함수
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 트리거 (이미 존재하면 삭제 후 재생성)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 3. 게시판 테이블
-- ============================================
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles on delete cascade not null,
  category text not null check (category in ('qna', 'free', 'review')),
  title text not null,
  content text not null,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table public.posts enable row level security;

-- 게시글 조회는 누구나 가능
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- 로그인한 사용자만 작성 가능
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- 본인 게시글만 수정 가능
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- 본인 게시글만 삭제 가능
create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- 인덱스
create index if not exists posts_category_idx on public.posts(category);
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);

-- ============================================
-- 4. 댓글 테이블
-- ============================================
create table if not exists public.comments (
  id bigint primary key generated always as identity,
  post_id bigint references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table public.comments enable row level security;

-- 댓글 조회는 누구나 가능
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

-- 로그인한 사용자만 작성 가능
create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- 본인 댓글만 수정 가능
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

-- 본인 댓글만 삭제 가능
create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- 인덱스
create index if not exists comments_post_id_idx on public.comments(post_id);

-- ============================================
-- 5. 중고거래 상품 테이블
-- ============================================
create table if not exists public.products (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles on delete cascade not null,
  category text not null check (category in ('driver', 'wood', 'iron', 'putter', 'wedge', 'set', 'bag', 'wear', 'etc')),
  title text not null,
  description text,
  price integer not null,
  condition text check (condition in ('S', 'A', 'B', 'C')),  -- S:새것, A:상, B:중, C:하
  images text[] default '{}',
  status text default 'selling' check (status in ('selling', 'reserved', 'sold')),
  location text,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table public.products enable row level security;

-- 상품 조회는 누구나 가능
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

-- 로그인한 사용자만 등록 가능
create policy "Authenticated users can create products"
  on public.products for insert
  with check (auth.uid() = user_id);

-- 본인 상품만 수정 가능
create policy "Users can update own products"
  on public.products for update
  using (auth.uid() = user_id);

-- 본인 상품만 삭제 가능
create policy "Users can delete own products"
  on public.products for delete
  using (auth.uid() = user_id);

-- 인덱스
create index if not exists products_category_idx on public.products(category);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_created_at_idx on public.products(created_at desc);

-- ============================================
-- 6. 찜 목록 테이블
-- ============================================
create table if not exists public.favorites (
  id bigint primary key generated always as identity,
  user_id uuid references public.profiles on delete cascade not null,
  product_id bigint references public.products on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- RLS 활성화
alter table public.favorites enable row level security;

-- 본인 찜 목록만 조회 가능
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

-- 로그인한 사용자만 찜 추가 가능
create policy "Authenticated users can add favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

-- 본인 찜만 삭제 가능
create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ============================================
-- 7. 채팅 메시지 테이블
-- ============================================
create table if not exists public.messages (
  id bigint primary key generated always as identity,
  product_id bigint references public.products on delete cascade not null,
  sender_id uuid references public.profiles on delete cascade not null,
  receiver_id uuid references public.profiles on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.messages enable row level security;

-- 본인이 보내거나 받은 메시지만 조회 가능
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- 로그인한 사용자만 메시지 전송 가능
create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- 받은 메시지의 읽음 상태만 수정 가능
create policy "Users can update received messages"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- 인덱스
create index if not exists messages_product_id_idx on public.messages(product_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);

-- ============================================
-- 8. 유틸리티 함수들
-- ============================================

-- 조회수 증가 함수 (posts)
create or replace function increment_post_view(post_id bigint)
returns void as $$
begin
  update public.posts set view_count = view_count + 1 where id = post_id;
end;
$$ language plpgsql security definer;

-- 조회수 증가 함수 (products)
create or replace function increment_product_view(product_id bigint)
returns void as $$
begin
  update public.products set view_count = view_count + 1 where id = product_id;
end;
$$ language plpgsql security definer;

-- updated_at 자동 갱신 함수
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- updated_at 트리거들
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at_column();

drop trigger if exists update_posts_updated_at on public.posts;
create trigger update_posts_updated_at
  before update on public.posts
  for each row execute procedure update_updated_at_column();

drop trigger if exists update_comments_updated_at on public.comments;
create trigger update_comments_updated_at
  before update on public.comments
  for each row execute procedure update_updated_at_column();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
  before update on public.products
  for each row execute procedure update_updated_at_column();

-- ============================================
-- 9. Storage 버킷 (이미지 업로드)
-- ============================================
-- 참고: Storage 버킷은 SQL로 생성할 수 없습니다.
-- Supabase Dashboard > Storage에서 수동으로 생성해야 합니다.
--
-- 1. Supabase Dashboard에 로그인
-- 2. Storage 메뉴 클릭
-- 3. "New bucket" 클릭
-- 4. Name: "products" 입력
-- 5. Public bucket 체크
-- 6. Create 클릭
--
-- 또는 아래 명령을 SQL Editor에서 실행 (storage 권한 필요):
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- Storage 정책 (버킷 생성 후 실행)
-- 누구나 이미지 조회 가능
create policy "Public read access for products bucket"
  on storage.objects for select
  using (bucket_id = 'products');

-- 로그인한 사용자만 업로드 가능
create policy "Authenticated users can upload to products bucket"
  on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');

-- 본인이 업로드한 파일만 삭제 가능
create policy "Users can delete own files in products bucket"
  on storage.objects for delete
  using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 완료!
-- ============================================
