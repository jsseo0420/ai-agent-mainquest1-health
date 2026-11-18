"use client";

import { useState } from "react";
import BodyMap from "@/components/BodyMap";
import EquipmentTile from "@/components/EquipmentTile";
import { equipmentForMuscle } from "@/data/equipment";
import { getMuscle, muscles, type BodyView, type MuscleId } from "@/data/muscles";

export default function MuscleFinder() {
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<MuscleId | null>(null);

  const visibleMuscles = muscles.filter((m) => m.view === view);
  const results = selected ? equipmentForMuscle(selected) : [];

  function changeView(next: BodyView) {
    setView(next);
    if (selected && getMuscle(selected).view !== next) setSelected(null);
  }

  function select(muscle: MuscleId) {
    setSelected(muscle);
    // 모바일에서는 그림 아래 목록이 화면 밖에 있으므로 목록으로 내려준다.
    requestAnimationFrame(() => {
      document.getElementById("muscle-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <div className="-mx-4 bg-night px-4 pb-2 pt-2 text-white">
        <div role="group" aria-label="인체 방향" className="grid grid-cols-2 rounded-lg bg-night-2 p-1">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => changeView(v)}
              className={`h-11 rounded-md font-bold transition-colors ${
                view === v ? "bg-accent text-on-accent" : "text-night-sub hover:text-white"
              }`}
            >
              {v === "front" ? "앞모습" : "뒷모습"}
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-sm text-night-sub">운동하고 싶은 부위를 눌러 보세요</p>
        <div className="mt-2 flex justify-center">
          <BodyMap
            view={view}
            tone="dark"
            primary={selected ? [selected] : []}
            onSelect={select}
            className="h-[340px] w-auto max-w-full"
          />
        </div>
      </div>

      {/* 근육 칩: 이 줄까지 스크롤해 내려가면 헤더 아래에 붙어 따라온다 */}
      <div className="sticky top-14 z-10 -mx-4 border-b border-night bg-night px-4 pb-3 pt-1">
        <div
          role="group"
          aria-label="부위 선택"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          {visibleMuscles.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={selected === m.id}
              onClick={() => select(m.id)}
              className={`h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${
                selected === m.id
                  ? "bg-accent text-on-accent"
                  : "border border-night-line text-white hover:border-accent"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <section id="muscle-results" className="scroll-mt-32 pt-4" aria-live="polite">
        {selected ? (
          <>
            <h2 className="text-lg font-black italic">
              <span className="text-accent-strong">{getMuscle(selected).name}</span> 운동{" "}
              <span className="text-sm font-normal not-italic text-sub">{results.length}개</span>
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2.5">
              {results.map((e) => (
                <li key={e.id}>
                  <EquipmentTile equipment={e} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="rounded-lg bg-surface px-4 py-8 text-center text-sub">
            부위를 고르면 맞는 기구가 여기에 나와요
          </p>
        )}
      </section>
    </>
  );
}
