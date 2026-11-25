"use client";

import type { Measurements, RecommendResponse, Sex } from "@/lib/routine/types";

// 마지막으로 받은 루틴을 이 탭(sessionStorage)에 잠시 보관한다.
// 루틴의 기구 상세나 "+ 기록"으로 갔다가 돌아와도 Gemini를 다시 부르지 않고 같은 결과를 보여주기 위해서다.
// 탭을 닫으면 지워지고, 서버나 계정에는 저장하지 않는다 (체성분 수치는 건강 정보).
export type SavedRoutine = { data: RecommendResponse; sex: Sex; values: Measurements };

const KEY = "health-dogam:last-routine";

export function loadLastRoutine(): SavedRoutine | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedRoutine) : null;
  } catch {
    return null;
  }
}

export function saveLastRoutine(routine: SavedRoutine | null): void {
  try {
    if (routine) window.sessionStorage.setItem(KEY, JSON.stringify(routine));
    else window.sessionStorage.removeItem(KEY);
  } catch {
    // 저장하지 못하면 돌아왔을 때 처음 화면부터 보일 뿐이다.
  }
}
