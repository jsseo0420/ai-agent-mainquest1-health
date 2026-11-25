"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EquipmentImage from "@/components/EquipmentImage";
import LogSheet, { today } from "@/components/LogSheet";
import { equipmentTypeName } from "@/data/equipment";
import { isMuscleGroupId, muscleGroups, type MuscleGroupId } from "@/data/muscles";
import { useFavorites } from "@/lib/storage/favorites";
import { useWorkoutLogs } from "@/lib/storage/logs";
import { updateTodayPrefs, useTodayPrefs, type TodayPrefs } from "@/lib/storage/today-prefs";
import {
  generateToday,
  goals,
  minutesOptions,
  swapCandidate,
  type TodayInput,
  type TodayItem,
} from "@/lib/today/generate";

// 날짜로 만든 기본 seed: 같은 날 같은 조건이면 다시 들어와도 같은 루틴이 나온다.
function dateSeed(date: string): number {
  return Number(date.replaceAll("-", ""));
}

export default function TodayRoutine() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groups = (searchParams.get("groups") ?? "")
    .split(",")
    .filter((g): g is MuscleGroupId => isMuscleGroupId(g));
  const date = today();
  const seed = Number(searchParams.get("seed")) || dateSeed(date);

  const { logs, loading: logsLoading } = useWorkoutLogs();
  const { favorites, loading: favLoading } = useFavorites();
  // 루틴을 짤 때 쓴 기록·즐겨찾기를 고정해 둔다. 운동을 완료하고 기록을 저장해도
  // 루틴이 다시 짜여 목록이 바뀌지 않게 하고, "다시 만들기"를 누를 때만 최신 값으로 바꾼다.
  const [snapshot, setSnapshot] = useState<{ logs: typeof logs; favoriteIds: string[] } | null>(null);
  const ready = !logsLoading && !favLoading;
  if (ready && !snapshot) setSnapshot({ logs, favoriteIds: favorites.map((f) => f.equipmentId) });
  const prefs = useTodayPrefs();
  // 바꾼 운동: 자리(index) → 새 운동. 조건이 바뀌면 비운다.
  const [swaps, setSwaps] = useState<Record<number, TodayItem>>({});
  const [skipped, setSkipped] = useState<Record<number, string[]>>({});
  const [done, setDone] = useState<string[]>([]);
  const [sheetFor, setSheetFor] = useState<TodayItem | null>(null);
  const [swapNotice, setSwapNotice] = useState<string | null>(null);

  // 계산 결과의 메모는 React Compiler가 맡는다.
  const input: TodayInput = {
    groups,
    goal: prefs.goal,
    minutes: prefs.minutes,
    logs: snapshot?.logs ?? [],
    favoriteIds: snapshot?.favoriteIds ?? [],
    seed,
    today: date,
  };
  const routine = generateToday(input);
  const items = routine.items.map((item, i) => swaps[i] ?? item);

  function resetEdits() {
    setSwaps({});
    setSkipped({});
    setSwapNotice(null);
  }

  function updatePrefs(next: Partial<TodayPrefs>) {
    updateTodayPrefs(next);
    resetEdits();
  }

  function regenerate() {
    setSnapshot({ logs, favoriteIds: favorites.map((f) => f.equipmentId) });
    const params = new URLSearchParams(searchParams.toString());
    params.set("seed", String(Math.floor(Math.random() * 1_000_000_000)));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    resetEdits();
  }

  function swap(index: number) {
    const current = items[index];
    const skip = [...(skipped[index] ?? []), current.equipment.id];
    const next = swapCandidate(input, items, index, skip);
    if (!next) {
      setSwapNotice(`${current.equipment.nameKo} 대신 넣을 같은 부위 운동이 도감에 더 없어요.`);
      return;
    }
    setSwapNotice(null);
    setSkipped((s) => ({ ...s, [index]: skip }));
    setSwaps((s) => ({ ...s, [index]: next }));
  }

  if (groups.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-surface px-4 py-12 text-center">
        <p className="font-bold">운동할 부위를 먼저 골라 주세요</p>
        <p className="mt-1 text-sm text-sub">홈의 &quot;오늘의 루틴 만들기&quot;에서 부위를 고를 수 있어요.</p>
        <Link
          href="/"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-black italic text-on-accent"
        >
          부위 고르러 가기
        </Link>
      </div>
    );
  }

  const groupNames = muscleGroups.filter((g) => groups.includes(g.id)).map((g) => g.name);
  const doneCount = items.filter((i) => done.includes(i.equipment.id)).length;

  return (
    <>
      <div className="-mx-4 bg-night px-4 pb-5 pt-1 text-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black italic">
            <span className="text-accent">{groupNames.join(" · ")}</span> 하는 날
          </h2>
          <Link href="/" className="h-11 shrink-0 px-1 py-3 text-sm text-night-sub underline underline-offset-4">
            부위 바꾸기
          </Link>
        </div>

        <Segment
          label="목표"
          options={goals.map((g) => ({ value: g.id, label: g.name }))}
          value={prefs.goal}
          onChange={(goal) => updatePrefs({ goal })}
        />
        <Segment
          label="운동 시간"
          options={minutesOptions.map((m) => ({ value: m, label: `${m}분` }))}
          value={prefs.minutes}
          onChange={(minutes) => updatePrefs({ minutes })}
        />

        <p className="mt-4 text-sm text-night-sub">
          운동 {items.length}개 · 세트마다 {items[0]?.reps ?? "-"}회 · {routine.rest}
        </p>
      </div>

      {routine.short.length > 0 && (
        <p className="mt-4 rounded-lg bg-accent-bg px-3 py-2 text-sm text-accent-strong">
          도감에 {routine.short.join("·")} 운동이 아직 적어요.{" "}
          {routine.items.some((i) => i.secondary)
            ? "그 부위를 보조로 쓰는 운동도 함께 넣었어요."
            : "있는 운동으로 채웠어요."}
        </p>
      )}

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="font-black italic">
          운동 목록 <span className="text-sm font-normal not-italic text-sub">{doneCount}/{items.length} 완료</span>
        </h3>
        <button type="button" onClick={regenerate} className="h-11 px-1 text-sm font-bold text-accent-strong">
          ↻ 다시 만들기
        </button>
      </div>

      {!snapshot ? (
        <p className="py-8 text-center text-sub">기록을 불러오는 중…</p>
      ) : (
        <ol className="mt-2 space-y-2.5">
          {items.map((item, i) => {
            const isDone = done.includes(item.equipment.id);
            const groupName = muscleGroups.find((g) => g.id === item.group)!.name;
            return (
              <li
                key={`${i}-${item.equipment.id}`}
                className={`rounded-lg border p-2.5 transition-colors ${isDone ? "border-accent bg-accent-bg" : "border-line"}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-pressed={isDone}
                    aria-label={isDone ? `${item.equipment.nameKo} 완료 취소` : `${item.equipment.nameKo} 완료하고 기록하기`}
                    onClick={() =>
                      isDone ? setDone((d) => d.filter((id) => id !== item.equipment.id)) : setSheetFor(item)
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-black ${
                        isDone ? "border-accent bg-accent text-on-accent" : "border-line text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                  <Link href={`/equipment/${item.equipment.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <EquipmentImage
                      equipment={item.equipment}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line"
                      sizes="56px"
                      fit="cover"
                    />
                    <div className="min-w-0">
                      <p className={`font-bold ${isDone ? "text-sub line-through" : ""}`}>
                        <span className="mr-1 text-accent-strong">{i + 1}</span>
                        {item.equipment.nameKo}
                      </p>
                      <p className="font-black italic text-accent-strong">
                        {item.sets}세트 × {item.reps}회
                      </p>
                      <p className="text-xs text-sub">
                        {groupName}
                        {item.secondary && " (보조)"} · {equipmentTypeName(item.equipment.type)}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 pl-14">
                  <p className="min-w-0 text-sm text-sub">
                    {item.last ? `지난번 ${item.last.weightKg}kg × ${item.last.reps}회 · ` : ""}
                    {item.reason}
                  </p>
                  <button
                    type="button"
                    onClick={() => swap(i)}
                    className="h-11 shrink-0 rounded-md border border-line px-3 text-sm font-bold hover:bg-surface"
                  >
                    바꾸기
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {swapNotice && (
        <p role="status" className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-sub">
          {swapNotice}
        </p>
      )}

      {routine.cardio && (
        <div className="mt-4 rounded-lg bg-accent-bg p-4">
          <p className="text-sm font-bold text-accent-strong">유산소</p>
          <p className="mt-1 text-sm">{routine.cardio}</p>
        </div>
      )}

      {doneCount === items.length && items.length > 0 && (
        <p role="status" className="mt-4 rounded-lg bg-night p-4 text-center font-black italic text-white">
          오늘 루틴 완료! <span className="text-accent">수고했어요</span>
        </p>
      )}

      <p className="mt-4 text-xs text-sub">
        운동 참고용 추천이에요. 처음엔 가벼운 무게로 자세부터 익히고, 통증이 있으면 멈추세요.
      </p>

      {sheetFor && (
        <LogSheet
          key={sheetFor.equipment.id}
          initialEquipmentId={sheetFor.equipment.id}
          date={date}
          logs={logs}
          initial={{ weight: sheetFor.last?.weightKg, reps: sheetFor.repsLow, sets: sheetFor.sets }}
          onClose={() => setSheetFor(null)}
          onSaved={() => {
            setDone((d) => [...d, sheetFor.equipment.id]);
            setSheetFor(null);
          }}
        />
      )}
    </>
  );
}

function Segment<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-xs text-night-sub">{label}</p>
      <div role="group" aria-label={label} className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg bg-night-2 p-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`h-11 rounded-md text-sm font-bold transition-colors ${
              o.value === value ? "bg-accent text-on-accent" : "text-night-sub hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
