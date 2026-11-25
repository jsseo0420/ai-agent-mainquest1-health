import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "비밀번호 변경" };

// 비밀번호 재설정 메일의 링크가 돌아오는 곳이자, 로그인한 사용자의 비밀번호 변경 화면.
export default function ResetPasswordPage() {
  return (
    <main>
      <PageHeader title="비밀번호 변경" backHref="/account" backLabel="내 정보로" tone="dark" />
      <ResetPasswordForm />
    </main>
  );
}
