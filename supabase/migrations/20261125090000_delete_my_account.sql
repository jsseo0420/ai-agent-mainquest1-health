-- 회원 탈퇴: 로그인한 사용자가 앱 안에서 자기 계정을 지울 수 있게 한다.
-- 앱스토어(Apple)는 가입 기능이 있는 앱에 앱 안 계정 삭제를 요구한다.
--
-- 왜 함수로 만드나: 계정(auth.users)은 브라우저의 공개 키로 지울 수 없고,
-- Secret key(service_role)는 이 프로젝트에서 쓰지 않는다.
-- 그래서 "호출한 본인(auth.uid())의 행만" 지우는 security definer 함수를 둔다.
-- profiles·favorites·workout_logs는 auth.users를 on delete cascade로 참조하므로 함께 지워진다.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception '로그인이 필요해요' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

-- 로그인한 사용자만 RPC로 호출할 수 있다. 비로그인(anon)과 public은 막는다.
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
