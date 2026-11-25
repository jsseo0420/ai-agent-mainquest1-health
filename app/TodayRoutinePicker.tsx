"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { muscleGroups, type MuscleGroupId } from "@/data/muscles";

// 홈의 "오늘의 루틴 만들기". 운동하고 싶은 부위를 고르면 /today에서 루틴을 짜 준다.
export default function TodayRoutinePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<MuscleGroupId[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: MuscleGroupId) {
    setMessage(null);
    setSelected((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function submit() {
    if (selected.length === 0) {
      setMessage("운동하고 싶은 부위를 하나 이상 골라 주세요.");
      return;
    }
    const ordered = muscleGroups.filter((g) => selected.includes(g.id)).map((g) => g.id);
    router.push(`/today?groups=${ordered.join(",")}`);
  }

  return (
    <section aria-labelledby="today-routine-heading" className="rounded-lg border border-night-line bg-night-2 p-5">
      <h2 id="today-routine-heading" className="text-xl font-black italic">
        오늘의 루틴 만들기
      </h2>
      <p className="mt-1 text-sm text-night-sub">오늘 운동하고 싶은 부위를 골라요. 여러 개 골라도 돼요.</p>

      <div role="group" aria-label="운동할 부위" className="mt-4 grid grid-cols-3 gap-2">
        {muscleGroups.map((g) => {
          const on = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(g.id)}
              className={`h-11 rounded-md text-sm font-bold transition-colors ${
                on
                  ? "bg-accent text-on-accent"
                  : "border border-night-line bg-night text-white hover:border-accent"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white font-black italic text-night transition-colors hover:bg-accent-bg"
      >
        오늘의 루틴 만들기
        {selected.length > 0 && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs not-italic text-on-accent">
            {selected.length}개 부위
          </span>
        )}
      </button>

      <p
        aria-live="polite"
        className={`text-sm text-accent ${message ? "mt-3" : ""}`}
      >
        {message}
      </p>
    </section>
  );
}
