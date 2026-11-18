import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AccountPanel from "./AccountPanel";

export const metadata: Metadata = { title: "내 정보" };

export default function AccountPage() {
  return (
    <main>
      <PageHeader title="내 정보" />
      <AccountPanel />
      <Link
        href="/welcome"
        className="mt-6 flex h-12 items-center justify-between rounded-xl border border-line px-4 text-sm font-medium hover:bg-surface"
      >
        MAPSCLE 소개 다시 보기
        <span aria-hidden className="text-sub">→</span>
      </Link>
    </main>
  );
}
