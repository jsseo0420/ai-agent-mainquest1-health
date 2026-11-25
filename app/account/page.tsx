import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import pkg from "@/package.json";
import AccountPanel, { MenuLink, MenuSection } from "./AccountPanel";

export const metadata: Metadata = { title: "내 정보" };

export default function AccountPage() {
  return (
    <main>
      <PageHeader title="내 정보" tone="dark" />
      <AccountPanel />
      <MenuSection title="앱">
        <MenuLink href="/welcome">MAPSCLE 소개 다시 보기</MenuLink>
        <MenuLink href="/privacy">개인정보처리방침</MenuLink>
        <li className="flex h-12 items-center justify-between px-4 text-[15px]">
          앱 버전
          <span className="text-sm text-sub">{pkg.version}</span>
        </li>
      </MenuSection>
    </main>
  );
}
