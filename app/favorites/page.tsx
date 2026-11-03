import type { Metadata } from "next";
import LocalOnlyNotice from "@/components/LocalOnlyNotice";
import PageHeader from "@/components/PageHeader";
import FavoriteList from "./FavoriteList";

export const metadata: Metadata = { title: "즐겨찾기" };

export default function FavoritesPage() {
  return (
    <main>
      <PageHeader title="즐겨찾기" />
      <LocalOnlyNotice />
      <FavoriteList />
    </main>
  );
}
