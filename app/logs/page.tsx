import type { Metadata } from "next";
import { Suspense } from "react";
import LocalOnlyNotice from "@/components/LocalOnlyNotice";
import PageHeader from "@/components/PageHeader";
import WorkoutLogs from "./WorkoutLogs";

export const metadata: Metadata = { title: "운동 기록" };

export default function LogsPage() {
  return (
    <main>
      <PageHeader title="운동 기록" />
      <LocalOnlyNotice />
      <Suspense fallback={<p className="py-8 text-center text-sub">불러오는 중…</p>}>
        <WorkoutLogs />
      </Suspense>
    </main>
  );
}
