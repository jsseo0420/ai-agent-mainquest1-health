-- 나만의 헬스도감: 초기 스키마
-- 사용자 계정(이메일·비밀번호)은 Supabase Auth의 auth.users가 관리한다.
-- 기구 데이터는 코드(data/equipment.ts)에 있으므로 equipment_id는 외래키 없이 형식만 검사한다.

-- ---------------------------------------------------------------
-- 테이블
-- ---------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text check (char_length(nickname) between 1 and 20),
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  equipment_id text not null check (equipment_id ~ '^[a-z0-9-]{1,64}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, equipment_id)
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  equipment_id text not null check (equipment_id ~ '^[a-z0-9-]{1,64}$'),
  date date not null default current_date,
  weight_kg numeric(6, 2) not null check (weight_kg > 0),
  reps integer not null check (reps > 0),
  sets integer not null check (sets > 0),
  memo text check (char_length(memo) <= 100),
  created_at timestamptz not null default now()
);

-- 운동 기록 화면은 내 기록을 최신 날짜순으로 조회한다.
create index workout_logs_user_date_idx
  on public.workout_logs (user_id, date desc, created_at desc);

-- ---------------------------------------------------------------
-- RLS: 로그인한 본인 데이터만 접근
-- ---------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.workout_logs enable row level security;

-- 비로그인(anon) 사용자는 테이블에 아예 접근하지 못하게 권한도 회수한다.
revoke all on table public.profiles, public.favorites, public.workout_logs from anon;

-- profiles: 조회·수정만 허용 (생성은 가입 트리거, 삭제는 계정 삭제 시 cascade)
create policy "profiles: 본인 조회"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: 본인 수정"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- favorites: 조회·추가·삭제 (수정할 항목이 없으므로 update 정책은 두지 않는다)
create policy "favorites: 본인 조회"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "favorites: 본인 추가"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "favorites: 본인 삭제"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- workout_logs: 조회·추가·수정·삭제
create policy "workout_logs: 본인 조회"
  on public.workout_logs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_logs: 본인 추가"
  on public.workout_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_logs: 본인 수정"
  on public.workout_logs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workout_logs: 본인 삭제"
  on public.workout_logs for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------
-- 가입 시 profiles 자동 생성
-- ---------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'nickname'), 20), '')
  );
  return new;
end;
$$;

-- 트리거 전용 함수이므로 API(RPC)로 직접 호출하지 못하게 한다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
