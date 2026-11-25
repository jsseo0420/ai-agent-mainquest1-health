import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import TodayRoutine from "./TodayRoutine";

export const metadata: Metadata = { title: "오늘의 루틴" };

export default function TodayPage() {
  return (
    <main>
      <PageHeader title="오늘의 루틴" backHref="/" backLabel="홈으로" tone="dark" />
      <Suspense fallback={<p className="py-8 text-center text-sub">루틴을 짜는 중…</p>}>
        <TodayRoutine />
      </Suspense>
    </main>
  );
}
