import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import AccountPanel from "./AccountPanel";

export const metadata: Metadata = { title: "내 정보" };

export default function AccountPage() {
  return (
    <main>
      <PageHeader title="내 정보" />
      <AccountPanel />
    </main>
  );
}
