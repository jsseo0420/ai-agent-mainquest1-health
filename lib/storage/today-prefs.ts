"use client";

import type { Goal, Minutes } from "@/lib/today/generate";
import { createLocalStore } from "./local-store";

// 오늘의 루틴에서 마지막으로 고른 목표와 운동 시간을 이 기기에 기억한다.
// 서버가 그릴 때는 기본값을 쓰고, 브라우저에서 저장된 값으로 바뀐다 (useSyncExternalStore).
export type TodayPrefs = { goal: Goal; minutes: Minutes };

const DEFAULT: TodayPrefs = { goal: "muscle", minutes: 45 };
const store = createLocalStore<TodayPrefs>("health-dogam:today-prefs", DEFAULT);

function sanitize(v: Partial<TodayPrefs>): TodayPrefs {
  return {
    goal: v.goal === "muscle" || v.goal === "fatloss" || v.goal === "maintain" ? v.goal : DEFAULT.goal,
    minutes: v.minutes === 30 || v.minutes === 45 || v.minutes === 60 ? v.minutes : DEFAULT.minutes,
  };
}

export function useTodayPrefs(): TodayPrefs {
  return sanitize(store.useValue());
}

// 빠르게 연달아 바꿔도 앞의 선택이 사라지지 않게 저장된 최신 값에 합친다.
export function updateTodayPrefs(next: Partial<TodayPrefs>): void {
  store.write(sanitize({ ...store.read(), ...next }));
}
