"use client";

import { useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/storage/favorites";
import { StarIcon } from "./BottomNav";

export default function FavoriteButton({ equipmentId }: { equipmentId: string }) {
  const { favorites, loading } = useFavorites();
  const [error, setError] = useState<string | null>(null);
  const active = favorites.some((f) => f.equipmentId === equipmentId);

  return (
    <div className="flex flex-1 flex-col">
      <button
        type="button"
        aria-pressed={active}
        disabled={loading}
        onClick={async () => {
          setError(await toggleFavorite(equipmentId));
        }}
        className={`flex h-12 items-center justify-center gap-2 rounded-2xl border font-semibold transition-colors disabled:opacity-50 ${
          active
            ? "border-amber-300 bg-amber-50 text-amber-600"
            : "border-line bg-white text-ink hover:bg-surface"
        }`}
      >
        <StarIcon filled={active} />
        {active ? "즐겨찾기됨" : "즐겨찾기"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
