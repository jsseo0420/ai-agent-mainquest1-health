import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "개인정보처리방침" };

// 실제 데이터 흐름(lib/storage, lib/routine, Supabase 테이블)과 맞춰 쓴다. 기능을 바꾸면 이 문서도 고친다.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 정보",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>회원가입·로그인 시:</b> 이메일, 비밀번호(암호화되어 로그인 서비스 Supabase Auth만 보관하며 MAPSCLE은 볼 수
          없어요), 닉네임(선택)
        </li>
        <li>
          <b>앱을 쓰는 동안:</b> 즐겨찾기한 기구, 운동 기록(기구, 날짜, 무게, 횟수, 세트, 메모)
        </li>
        <li>
          <b>결과지로 루틴 추천을 쓸 때:</b> 올린 체성분 결과지 사진과 그 수치(체중, 골격근량, 체지방 등), 성별
        </li>
      </ul>
    ),
  },
  {
    title: "2. 정보를 쓰는 목적",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>로그인과 계정 관리</li>
        <li>즐겨찾기·운동 기록을 저장하고 다른 기기에서도 보여주기</li>
        <li>결과지 수치를 읽고 도감 운동으로 루틴을 추천하기</li>
      </ul>
    ),
  },
  {
    title: "3. 저장 위치와 보관 기간",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>로그인 전:</b> 즐겨찾기·운동 기록은 이 기기의 브라우저(localStorage)에만 저장되고 서버로 보내지 않아요.
          브라우저 기록을 지우면 사라져요.
        </li>
        <li>
          <b>로그인 후:</b> 계정 정보와 즐겨찾기·운동 기록은 Supabase 데이터베이스에 저장되고, 본인만 조회할 수 있어요.
          회원 탈퇴할 때까지 보관해요.
        </li>
        <li>
          <b>결과지 사진:</b> 수치를 읽기 위해 Google Gemini API로 보내고, MAPSCLE은 사진과 수치를 저장하지 않아요.
        </li>
      </ul>
    ),
  },
  {
    title: "4. 외부 서비스에 맡기는 정보",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <b>Supabase:</b> 로그인과 데이터 저장
        </li>
        <li>
          <b>Google (Gemini API):</b> 결과지 사진의 수치 읽기와 루틴 추천. 현재 무료 등급을 쓰고 있어, Google 약관에 따라
          보낸 내용이 Google 서비스 개선에 쓰일 수 있어요. 원하지 않으면 사진 대신 &quot;수치 직접 입력하기&quot;를
          쓰세요.
        </li>
        <li>
          <b>Vercel:</b> 웹사이트 운영(접속 기록 등 일반적인 서버 로그)
        </li>
      </ul>
    ),
  },
  {
    title: "5. 내 정보 지우기",
    body: (
      <p>
        내 정보 화면 아래의 <b>회원 탈퇴</b>를 누르면 계정, 닉네임, 계정에 저장된 즐겨찾기·운동 기록이 바로 모두
        지워지고 되돌릴 수 없어요. 로그인 전 기록은 브라우저의 사이트 데이터를 지우면 사라져요.
      </p>
    ),
  },
  {
    title: "6. 건강 정보 안내",
    body: (
      <p>
        MAPSCLE의 판정과 루틴 추천은 참고용이며 의료 조언이 아니에요. 통증이 있거나 질환이 있으면 전문가와 상의하세요.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHeader title="개인정보처리방침" backHref="/account" backLabel="내 정보로" tone="dark" />
      <p className="mt-4 text-sm text-sub">
        MAPSCLE(맵슬)은 개인이 만든 비상업 프로젝트예요. 어떤 정보를 왜 쓰는지 아래에 정리했어요.
      </p>
      <div className="mt-4 space-y-6 leading-relaxed">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-black italic">{s.title}</h2>
            <div className="mt-2 text-[15px]">{s.body}</div>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-sub">시행일: 2026년 11월 25일</p>
    </main>
  );
}
