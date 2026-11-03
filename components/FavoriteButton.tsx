"use client";

import { toggleFavorite, useFavorites } from "@/lib/storage/favorites";
import { StarIcon } from "./BottomNav";

export default function FavoriteButton({ equipmentId }: { equipmentId: string }) {
  const favorites = useFavorites();
  const active = favorites.some((f) => f.equipmentId === equipmentId);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => toggleFavorite(equipmentId)}
      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border font-semibold transition-colors ${
        active
          ? "border-amber-300 bg-amber-50 text-amber-600"
          : "border-line bg-white text-ink hover:bg-surface"
      }`}
    >
      <StarIcon filled={active} />
      {active ? "즐겨찾기됨" : "즐겨찾기"}
    </button>
  );
}
