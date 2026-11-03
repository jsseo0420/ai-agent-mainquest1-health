import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import EquipmentBrowser from "./EquipmentBrowser";

export const metadata: Metadata = { title: "기구로 찾기" };

export default function EquipmentPage() {
  return (
    <main>
      <PageHeader title="기구로 찾기" backHref="/" backLabel="홈으로" />
      <Suspense fallback={<p className="py-8 text-center text-sub">불러오는 중…</p>}>
        <EquipmentBrowser />
      </Suspense>
    </main>
  );
}
