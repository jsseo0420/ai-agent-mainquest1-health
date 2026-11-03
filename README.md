# 메인퀘스트1

나만의 헬스도감 만들고 배포하기

헬스 입문자가 헬스장에서 폰으로 기구별 운동 자세·자극 부위를 바로 확인하고, 운동하고 싶은 부위에 맞는 기구를 찾아볼 수 있는 모바일 웹 도감입니다. 자세한 기획은 [PRD.md](PRD.md)를 참고하세요.

## 주요 기능

- **기구로 찾기:** 기구 20개 목록, 이름 검색, 부위 필터
- **부위로 찾기:** 앞·뒤 인체 그림에서 근육을 눌러 맞는 기구 찾기
- **기구 상세:** 운동 자세(단계별), 자극 부위(주동근·보조근), 주의사항
- **로그인 / 회원가입:** 이메일 + 비밀번호 (Supabase Auth)
- **즐겨찾기 / 운동 기록:** 로그인 전에는 이 기기의 `localStorage`, 로그인 후에는 Supabase에 저장 (RLS로 본인 데이터만 접근)

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel

## 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

로그인 기능을 쓰려면 `.env.example`을 `.env.local`로 복사해 Supabase 값을 채우고, `supabase/migrations/`의 SQL을 Supabase SQL Editor에서 실행합니다. 환경변수가 없으면 로그인 없이 이 기기 저장 모드로 동작합니다.

## 폴더 구조

```
app/                 화면 (홈, 기구 목록·상세, 부위로 찾기, 즐겨찾기, 운동 기록)
components/          공통 컴포넌트 (인체 그림 BodyMap, 기구 카드 등)
data/                목업 데이터 (기구 20개, 부위 분류)
lib/storage/         즐겨찾기·운동 기록 저장소 (로그인 전 localStorage, 로그인 후 Supabase)
lib/supabase/        Supabase 클라이언트
supabase/migrations/ DB 스키마와 RLS 정책 SQL
```
