import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import MuscleFinder from "./MuscleFinder";

export const metadata: Metadata = { title: "부위로 찾기" };

export default function MusclesPage() {
  return (
    <main>
      <PageHeader title="부위로 찾기" backHref="/" backLabel="홈으로" />
      <MuscleFinder />
    </main>
  );
}
