"use client";

import { useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/storage/favorites";
import { StarIcon } from "./BottomNav";

// 목록 카드 위에 얹는 작은 즐겨찾기 버튼. 상세 화면의 큰 버튼은 FavoriteButton.
export default function FavoriteStar({
  equipmentId,
  name,
  className = "",
}: {
  equipmentId: string;
  name: string;
  className?: string;
}) {
  const { favorites, loading } = useFavorites();
  const [error, setError] = useState<string | null>(null);
  const active = favorites.some((f) => f.equipmentId === equipmentId);

  return (
    <div className={className}>
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? `${name} 즐겨찾기 해제` : `${name} 즐겨찾기에 추가`}
        disabled={loading}
        onClick={async () => setError(await toggleFavorite(equipmentId))}
        className="flex h-11 w-11 items-center justify-center disabled:opacity-50"
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            active ? "bg-accent text-on-accent" : "bg-white/90 text-ink shadow-sm"
          }`}
        >
          <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
            <StarIcon filled={active} />
          </span>
        </span>
      </button>
      {error && (
        <p role="alert" className="absolute right-1 top-11 w-40 rounded-md bg-night px-2 py-1 text-xs text-white">
          {error}
        </p>
      )}
    </div>
  );
}
