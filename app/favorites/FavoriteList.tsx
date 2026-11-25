"use client";

import Link from "next/link";
import { useState } from "react";
import EquipmentTile from "@/components/EquipmentTile";
import { getEquipmentById, type Equipment } from "@/data/equipment";
import { getMuscle, muscleGroups, type MuscleGroupId } from "@/data/muscles";
import { useFavorites, type Favorite } from "@/lib/storage/favorites";

// 즐겨찾기를 기구의 대표 부위(첫 번째 주동근)로 묶는다. 부위 순서는 가슴 → 등 → 어깨 → 팔 → 복근 → 하체.
function groupOf(e: Equipment): MuscleGroupId {
  return getMuscle(e.primaryMuscles[0]).group;
}

export default function FavoriteList() {
  const { favorites, loading } = useFavorites();
  const [filter, setFilter] = useState<MuscleGroupId | null>(null);
  // 이 화면에서 해제해도 카드가 바로 사라지지 않게, 화면을 연 동안 본 즐겨찾기를 모두 기억해 둔다.
  // 해제한 카드는 흐리게 남고 별을 다시 누르면 되돌릴 수 있다. 화면을 다시 열면 빠진다.
  const [seen, setSeen] = useState<Favorite[]>([]);
  const added = favorites.filter((f) => !seen.some((s) => s.equipmentId === f.equipmentId));
  if (added.length > 0) setSeen([...seen, ...added]);
  const activeIds = new Set(favorites.map((f) => f.equipmentId));

  const items = [...seen, ...added]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((f) => getEquipmentById(f.equipmentId))
    .filter((e) => e !== undefined);
  const groups = muscleGroups
    .map((g) => ({ ...g, items: items.filter((e) => groupOf(e) === g.id) }))
    .filter((g) => g.items.length > 0);
  const activeFilter = groups.some((g) => g.id === filter) ? filter : null;
  const shown = activeFilter ? groups.filter((g) => g.id === activeFilter) : groups;

  return (
    <>
      <div className="sticky top-14 z-10 -mx-4 bg-night px-4 pb-3 pt-1">
        {loading || items.length === 0 ? (
          <p className="h-11 py-3 text-sm text-night-sub">
            {loading ? "불러오는 중…" : "자주 쓰는 기구를 모아 두는 곳이에요"}
          </p>
        ) : (
          <div role="group" aria-label="부위 필터" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            <Chip active={activeFilter === null} onClick={() => setFilter(null)}>
              전체 {items.filter((e) => activeIds.has(e.id)).length}
            </Chip>
            {groups.map((g) => (
              <Chip key={g.id} active={activeFilter === g.id} onClick={() => setFilter(g.id)}>
                {g.name} {g.items.filter((e) => activeIds.has(e.id)).length}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {loading ? null : items.length === 0 ? (
        <div className="mt-4 rounded-lg bg-surface px-4 py-12 text-center">
          <p className="font-bold">아직 즐겨찾기한 기구가 없어요</p>
          <p className="mt-1 text-sm text-sub">기구 카드나 상세 화면의 ☆을 눌러 보세요.</p>
          <Link
            href="/equipment"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-black italic text-on-accent hover:bg-accent-hover"
          >
            기구 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {shown.map((g) => (
            <section key={g.id} aria-labelledby={`fav-${g.id}`}>
              <h2 id={`fav-${g.id}`} className="font-black italic">
                {g.name}{" "}
                <span className="text-sm font-normal not-italic text-sub">
                  {g.items.filter((e) => activeIds.has(e.id)).length}
                </span>
              </h2>
              <ul className="mt-2 grid grid-cols-2 gap-2.5">
                {g.items.map((e) => (
                  <li key={e.id} className="flex flex-col gap-1.5">
                    <div className={`flex-1 transition-opacity ${activeIds.has(e.id) ? "" : "opacity-50"}`}>
                      <EquipmentTile equipment={e} />
                    </div>
                    {/* 운동 기록 화면에서 이 기구가 선택된 빠른 입력 창이 바로 열린다 */}
                    <Link
                      href={`/logs?equipment=${e.id}`}
                      className="flex h-11 items-center justify-center rounded-lg bg-night text-sm font-black italic text-white hover:bg-night-2"
                    >
                      + 기록
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${
        active ? "bg-accent text-on-accent" : "border border-night-line text-white hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}
