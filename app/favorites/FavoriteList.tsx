"use client";

import Link from "next/link";
import EquipmentCard from "@/components/EquipmentCard";
import { getEquipmentById } from "@/data/equipment";
import { useFavorites } from "@/lib/storage/favorites";

export default function FavoriteList() {
  const { favorites, loading } = useFavorites();
  const items = favorites
    .map((f) => getEquipmentById(f.equipmentId))
    .filter((e) => e !== undefined);

  if (loading) {
    return <p className="py-12 text-center text-sub">불러오는 중…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-surface px-4 py-12 text-center">
        <p className="font-semibold">아직 즐겨찾기한 기구가 없어요</p>
        <p className="mt-1 text-sm text-sub">기구 상세 화면에서 ☆ 즐겨찾기를 눌러 보세요.</p>
        <Link
          href="/equipment"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-5 font-semibold text-white"
        >
          기구 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-4 grid gap-2">
      {items.map((e) => (
        <li key={e.id}>
          <EquipmentCard equipment={e} />
        </li>
      ))}
    </ul>
  );
}
