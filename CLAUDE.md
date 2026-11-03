# 나만의 헬스도감

헬스 입문자가 기구별 운동 자세·자극 부위를 찾고, 부위별로 맞는 기구를 찾는 모바일 웹 도감.
기획과 요구사항은 [PRD.md](PRD.md)가 기준이다. 기능을 바꾸면 PRD도 함께 고친다.

@AGENTS.md

## 명령

- `npm run dev`: 개발 서버
- `npm run lint`: ESLint
- `npm run build`: 프로덕션 빌드 (타입 검사 포함)

## 구조

- `app/`: 화면. 서버 컴포넌트가 기본이고, 상태·브라우저 API가 필요한 부분만 `"use client"` 파일로 분리한다 (예: `EquipmentBrowser.tsx`, `MuscleFinder.tsx`)
- `components/`: 공통 컴포넌트. 인체 그림은 `BodyMap.tsx`
- `data/equipment.ts`, `data/muscles.ts`: 기구·부위 데이터. 기구는 DB가 아니라 이 파일에 있다
- `lib/auth.ts`: 로그인 상태(`useAuth`)와 로그인·가입·로그아웃
- `lib/storage/`: 즐겨찾기·운동 기록 저장소. 로그인 전은 `localStorage`, 로그인 후는 Supabase
- `lib/supabase/client.ts`: 브라우저용 Supabase 클라이언트. 환경변수가 없으면 `null`
- `supabase/migrations/`: DB 스키마와 RLS 정책 SQL

## 코드 규칙

- 화면 문구는 한국어 해요체로 쓴다 (예: "검색 결과가 없어요"). 오류 문구도 사용자가 할 일을 알려준다
- 화면 컴포넌트는 Supabase나 `localStorage`를 직접 호출하지 않고 `lib/storage/`의 함수와 훅만 쓴다
- 로그인과 데이터 조회는 브라우저에서 한다. 서버에서 세션(`cookies()`)을 읽으면 Cache Components 때문에 정적 페이지가 깨지므로, 꼭 필요하면 먼저 `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`를 읽는다
- `params`, `searchParams`, `useSearchParams`를 쓰는 부분은 `<Suspense>` 안에 둔다
- 색상은 `app/globals.css`의 테마 토큰(`accent`, `sub`, `line`, `surface` 등)을 쓴다
- 모바일 우선: 375px 너비에서 가로 스크롤이 없어야 하고, 터치 영역은 최소 44px (`h-11` 이상)

## 보안 규칙

- 새 테이블은 반드시 RLS를 켜고 정책을 만든다. 조건은 `(select auth.uid()) = user_id` 형태로 쓴다
- `anon` 권한은 회수하고, 정책은 `to authenticated`로 제한한다
- Supabase Secret key(`sb_secret_`, `service_role`)는 코드·환경변수·채팅 어디에도 쓰지 않는다
- `.env.local`은 커밋하지 않는다. 새 환경변수는 `.env.example`에 이름과 설명만 추가한다
- 사용자 비밀번호는 Supabase Auth만 다룬다. 앱 코드나 DB에 저장하지 않는다
- Supabase MCP는 읽기 전용이다. 스키마 변경은 `supabase/migrations/`에 SQL 파일로 만들고 사용자가 SQL Editor에서 실행한다

## 완료 기준

- `npm run lint`와 `npm run build`가 통과한다
- 바꾼 화면을 모바일 크기(375px)에서 직접 확인한다
- 요구사항이 바뀌었으면 PRD.md에 반영한다
