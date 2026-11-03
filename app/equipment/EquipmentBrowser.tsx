"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EquipmentCard from "@/components/EquipmentCard";
import { SearchIcon } from "@/components/SearchForm";
import { equipmentList, filterEquipment } from "@/data/equipment";
import { isMuscleGroupId, muscleGroups, type MuscleGroupId } from "@/data/muscles";

export default function EquipmentBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const groupParam = searchParams.get("group") ?? "";
  const group: MuscleGroupId | null = isMuscleGroupId(groupParam) ? groupParam : null;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = filterEquipment(equipmentList, query, group);

  // 검색어와 필터를 주소에 남겨 뒤로 가기·공유 시에도 유지한다.
  function syncUrl(nextQuery: string, nextGroup: MuscleGroupId | null) {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextGroup) params.set("group", nextGroup);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="sticky top-14 z-10 -mx-4 bg-white/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="relative">
          <label htmlFor="equipment-search" className="sr-only">
            기구 이름 검색
          </label>
          <SearchIcon />
          <input
            id="equipment-search"
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl(e.target.value, group);
            }}
            placeholder="기구 이름 검색"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-base outline-none focus:border-accent focus:bg-white"
          />
        </div>
        <div
          role="group"
          aria-label="부위 필터"
          className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          <FilterChip active={group === null} onClick={() => syncUrl(query, null)}>
            전체
          </FilterChip>
          {muscleGroups.map((g) => (
            <FilterChip
              key={g.id}
              active={group === g.id}
              onClick={() => syncUrl(query, g.id)}
            >
              {g.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mb-2 mt-1 text-sm text-sub" aria-live="polite">
        {results.length}개 기구
      </p>
      {results.length > 0 ? (
        <ul className="grid gap-2">
          {results.map((e) => (
            <li key={e.id}>
              <EquipmentCard equipment={e} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-surface px-4 py-12 text-center">
          <p className="font-semibold">검색 결과가 없어요</p>
          <p className="mt-1 text-sm text-sub">다른 이름으로 검색하거나 필터를 바꿔 보세요.</p>
        </div>
      )}
    </>
  );
}

function FilterChip({
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
      className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
        active ? "bg-accent text-white" : "border border-line bg-white text-ink hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
