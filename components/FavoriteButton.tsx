"use client";

import { useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/storage/favorites";
import { StarIcon } from "./BottomNav";

// compact: 하단 고정 버튼 줄에서 쓰는 아이콘만 있는 정사각형 버튼
export default function FavoriteButton({
  equipmentId,
  compact = false,
}: {
  equipmentId: string;
  compact?: boolean;
}) {
  const { favorites, loading } = useFavorites();
  const [error, setError] = useState<string | null>(null);
  const active = favorites.some((f) => f.equipmentId === equipmentId);

  return (
    <div className={`relative flex flex-col ${compact ? "shrink-0" : "flex-1"}`}>
      <button
        type="button"
        aria-pressed={active}
        aria-label={compact ? (active ? "즐겨찾기 해제" : "즐겨찾기에 추가") : undefined}
        disabled={loading}
        onClick={async () => {
          setError(await toggleFavorite(equipmentId));
        }}
        className={`flex h-12 items-center justify-center gap-2 rounded-lg border font-semibold transition-colors disabled:opacity-50 ${
          compact ? "w-12" : ""
        } ${active ? "border-accent bg-accent text-on-accent" : "border-line bg-white text-ink hover:bg-surface"}`}
      >
        <StarIcon filled={active} />
        {!compact && (active ? "즐겨찾기됨" : "즐겨찾기")}
      </button>
      {error && (
        <p
          role="alert"
          className={compact ? "absolute bottom-14 left-0 w-56 rounded-md bg-night px-2 py-1 text-xs text-white" : "mt-1 text-xs text-red-600"}
        >
          {error}
        </p>
      )}
    </div>
  );
}
