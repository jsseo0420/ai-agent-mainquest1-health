"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EquipmentTile from "@/components/EquipmentTile";
import { SearchIcon } from "@/components/SearchForm";
import {
  equipmentList,
  equipmentTypes,
  filterEquipment,
  isEquipmentType,
  type EquipmentType,
} from "@/data/equipment";
import { isMuscleGroupId, muscleGroups, type MuscleGroupId } from "@/data/muscles";

export default function EquipmentBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const groupParam = searchParams.get("group") ?? "";
  const group: MuscleGroupId | null = isMuscleGroupId(groupParam) ? groupParam : null;
  const typeParam = searchParams.get("type") ?? "";
  const type: EquipmentType | null = isEquipmentType(typeParam) ? typeParam : null;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = filterEquipment(equipmentList, query, group, type);

  // 검색어와 필터를 주소에 남겨 뒤로 가기·공유 시에도 유지한다.
  function syncUrl(
    nextQuery: string,
    nextGroup: MuscleGroupId | null,
    nextType: EquipmentType | null = type,
  ) {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextGroup) params.set("group", nextGroup);
    if (nextType) params.set("type", nextType);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="sticky top-14 z-10 -mx-4 bg-night px-4 pb-3 pt-1">
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
            className="h-12 w-full rounded-lg border border-night-line bg-night-2 pl-11 pr-4 text-base text-white outline-none placeholder:text-night-sub focus:border-accent"
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
            <FilterChip key={g.id} active={group === g.id} onClick={() => syncUrl(query, g.id)}>
              {g.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="-mx-4 flex items-center border-b border-line px-4">
        <div role="group" aria-label="종류 필터" className="flex gap-4 overflow-x-auto [scrollbar-width:none]">
          <TypeTab active={type === null} onClick={() => syncUrl(query, group, null)}>
            전체
          </TypeTab>
          {equipmentTypes.map((t) => (
            <TypeTab key={t.id} active={type === t.id} onClick={() => syncUrl(query, group, t.id)}>
              {t.name}
            </TypeTab>
          ))}
        </div>
        <p className="ml-auto shrink-0 pl-3 text-sm text-sub" aria-live="polite">
          {results.length}개
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-2.5">
          {results.map((e) => (
            <li key={e.id}>
              <EquipmentTile equipment={e} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-lg bg-surface px-4 py-12 text-center">
          <p className="font-semibold">검색 결과가 없어요</p>
          <p className="mt-1 text-sm text-sub">다른 이름으로 검색하거나 필터를 바꿔 보세요.</p>
        </div>
      )}
    </>
  );
}

// 검정 영역의 부위 칩
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
      className={`h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${
        active ? "bg-accent text-on-accent" : "border border-night-line text-white hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

// 흰 영역의 종류 탭 (밑줄로 선택 표시)
function TypeTab({
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
      className={`-mb-px h-11 shrink-0 border-b-2 text-sm transition-colors ${
        active ? "border-ink font-bold text-ink" : "border-transparent text-sub hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
