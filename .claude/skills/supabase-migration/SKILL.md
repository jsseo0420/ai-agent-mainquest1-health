---
name: supabase-migration
description: Supabase 테이블·컬럼·RLS 정책·트리거를 추가하거나 바꿀 때 사용한다. 마이그레이션 파일 작성, RLS 정책 템플릿, 사용자에게 실행을 맡기는 절차, 적용 후 보안 검증 방법을 담고 있다.
---

# Supabase 스키마 변경

Supabase MCP는 읽기 전용이다. 스키마는 직접 바꾸지 않고, SQL 파일을 만들어 사용자가 SQL Editor에서 실행한다.

## 1. 현재 상태 확인

- `supabase/migrations/`의 기존 파일과 PRD.md 10장(백엔드 설계)을 먼저 읽는다
- Supabase MCP가 연결되어 있으면 테이블·정책 목록을 조회해 파일과 실제 DB가 같은지 확인한다
- 이미 실행된 마이그레이션 파일은 고치지 않는다. 변경은 항상 새 파일로 만든다

## 2. 마이그레이션 파일 작성

- 파일 이름: `supabase/migrations/YYYYMMDDHHMMSS_설명.sql` (예: `20261104090000_add_routines.sql`)
- 맨 위에 무엇을 왜 바꾸는지 한국어 주석을 단다
- 사용자 데이터 테이블은 이 형태를 따른다

```sql
create table public.<name> (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 화면의 입력 검사와 같은 조건을 check 제약으로도 건다
  created_at timestamptz not null default now()
);

alter table public.<name> enable row level security;
revoke all on table public.<name> from anon;

create policy "<name>: 본인 조회" on public.<name> for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "<name>: 본인 추가" on public.<name> for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "<name>: 본인 수정" on public.<name> for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "<name>: 본인 삭제" on public.<name> for delete to authenticated
  using ((select auth.uid()) = user_id);
```

- 필요 없는 동작(예: 수정할 일이 없는 테이블의 update)은 정책을 만들지 않는다
- `auth.uid()`는 `(select auth.uid())`로 감싼다 (행마다 다시 계산하지 않도록)
- `security definer` 함수는 `set search_path = ''`를 넣고, 트리거 전용이면 `anon`, `authenticated`의 실행 권한을 회수한다
- 기구를 참조하는 컬럼은 외래키 대신 `check (col ~ '^[a-z0-9-]{1,64}$')`로 형식만 검사한다 (기구 데이터는 코드에 있음)

## 3. 사용자에게 실행 안내

1. Supabase 대시보드 → SQL Editor → **+ New query**로 빈 에디터를 연다 (기존 쿼리가 남아 있으면 함께 실행되어 오류가 난다)
2. 새 마이그레이션 파일 내용만 붙여넣고 Run을 한 번 누른다
3. 오류가 나면 메시지를 그대로 받아 원인을 찾는다. `already exists`는 이미 실행되었다는 뜻이다

## 4. 앱 코드 반영

- 데이터 접근은 `lib/storage/`에 함수와 훅으로 만든다 (`favorites.ts`, `logs.ts` 패턴: 로그인 전 `localStorage`, 로그인 후 Supabase, 실패 시 되돌리고 한국어 오류 반환)
- 컬럼 이름은 DB는 snake_case, 앱 타입은 camelCase로 하고 `fromRow`/`toRow`로 바꾼다

## 5. 적용 후 검증

비밀번호를 입력하는 작업(가입·로그인)은 사용자가 직접 한다. 검증은 이미 로그인된 브라우저 세션이나 공개 키로 한다.

- **B-1 비로그인 차단**: 공개 키만으로 조회·추가 → `42501`로 거부되어야 한다
- **B-2 남의 데이터**: 로그인한 세션으로 `user_id=neq.<내 id>` 조건 조회·수정·삭제 → 0건이어야 한다
- **B-3 남의 이름으로 추가**: 다른 `user_id`로 추가 → `42501` (row-level security)로 거부되어야 한다
- **B-4 제약조건**: 잘못된 값 추가 → `23514`로 거부되어야 한다. 테스트로 들어간 행은 지운다
- 결과를 표로 정리해 사용자에게 알리고, PRD.md 10장(테이블, RLS 표, 확인할 조건)을 고친다
