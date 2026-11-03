"use client";

import { useState } from "react";
import BodyMap from "@/components/BodyMap";
import EquipmentCard from "@/components/EquipmentCard";
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
      <div
        role="group"
        aria-label="인체 방향"
        className="mt-4 grid grid-cols-2 rounded-2xl bg-surface p-1"
      >
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => changeView(v)}
            className={`h-11 rounded-xl font-semibold transition-colors ${
              view === v ? "bg-white text-ink shadow-sm" : "text-sub"
            }`}
          >
            {v === "front" ? "앞모습" : "뒷모습"}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-sm text-sub">운동하고 싶은 부위를 눌러 보세요</p>
      <div className="mt-2 flex justify-center">
        <BodyMap
          view={view}
          primary={selected ? [selected] : []}
          onSelect={select}
          className="h-[360px] w-auto max-w-full"
        />
      </div>

      <div role="group" aria-label="부위 선택" className="mt-4 flex flex-wrap justify-center gap-2">
        {visibleMuscles.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={selected === m.id}
            onClick={() => select(m.id)}
            className={`h-11 rounded-full px-4 text-sm font-medium transition-colors ${
              selected === m.id
                ? "bg-accent text-white"
                : "border border-line bg-white hover:bg-surface"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <section id="muscle-results" className="mt-8 scroll-mt-16" aria-live="polite">
        {selected ? (
          <>
            <h2 className="text-lg font-bold">
              <span className="text-accent-strong">{getMuscle(selected).name}</span> 운동 기구{" "}
              <span className="text-sub">{results.length}개</span>
            </h2>
            <ul className="mt-3 grid gap-2">
              {results.map((e) => (
                <li key={e.id}>
                  <EquipmentCard equipment={e} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sub">
            부위를 고르면 맞는 기구가 여기에 나와요
          </p>
        )}
      </section>
    </>
  );
}
