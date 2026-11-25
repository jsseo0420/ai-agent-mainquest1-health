import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import RoutineRecommender from "./RoutineRecommender";

export const metadata: Metadata = { title: "결과지로 루틴 추천" };

export default function RoutinePage() {
  return (
    <main>
      <PageHeader title="결과지로 루틴 추천" backHref="/" backLabel="홈으로" tone="dark" />
      <RoutineRecommender />
    </main>
  );
}
