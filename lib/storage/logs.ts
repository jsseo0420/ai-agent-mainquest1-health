"use client";

import { getEquipmentById } from "@/data/equipment";
import { getAuthState, useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { createLocalStore } from "./local-store";
import { createMemoryStore, type RemoteState } from "./memory-store";

export type WorkoutLog = {
  id: string;
  equipmentId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  reps: number;
  sets: number;
  memo?: string;
  createdAt: string;
};

export type NewWorkoutLog = Omit<WorkoutLog, "id" | "createdAt">;

type WorkoutLogRow = {
  id: string;
  equipment_id: string;
  date: string;
  weight_kg: number | string; // numeric 컬럼은 문자열로 올 수 있다
  reps: number;
  sets: number;
  memo: string | null;
  created_at: string;
};

const COLUMNS = "id, equipment_id, date, weight_kg, reps, sets, memo, created_at";
const EMPTY: WorkoutLog[] = [];
const IDLE: RemoteState<WorkoutLog> = { status: "idle", items: [] };

// 로그인 전: 이 기기의 localStorage / 로그인 후: Supabase workout_logs 테이블
const local = createLocalStore<WorkoutLog[]>("health-dogam:logs", EMPTY);
const remote = createMemoryStore<RemoteState<WorkoutLog>>(IDLE);

function fromRow(row: WorkoutLogRow): WorkoutLog {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    date: row.date,
    weightKg: Number(row.weight_kg),
    reps: row.reps,
    sets: row.sets,
    memo: row.memo ?? undefined,
    createdAt: row.created_at,
  };
}

function toRow(log: NewWorkoutLog) {
  return {
    equipment_id: log.equipmentId,
    date: log.date,
    weight_kg: log.weightKg,
    reps: log.reps,
    sets: log.sets,
    memo: log.memo ?? null,
  };
}

export function useWorkoutLogs(): { logs: WorkoutLog[]; loading: boolean } {
  const auth = useAuth();
  const localItems = local.useValue();
  const remoteState = remote.useValue();

  if (auth.status === "loading") return { logs: EMPTY, loading: true };
  if (auth.status === "signedOut") return { logs: localItems, loading: false };
  return {
    logs: remoteState.items,
    loading: remoteState.status === "idle" || remoteState.status === "loading",
  };
}

export async function addWorkoutLog(log: NewWorkoutLog): Promise<string | null> {
  const supabase = getSupabase();
  if (getAuthState().status !== "signedIn" || !supabase) {
    const entry: WorkoutLog = {
      ...log,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    local.write([entry, ...local.read()]);
    return null;
  }

  const { data, error } = await supabase
    .from("workout_logs")
    .insert(toRow(log))
    .select(COLUMNS)
    .single();
  if (error) return "기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
  const current = remote.read();
  remote.write({ ...current, items: [fromRow(data), ...current.items] });
  return null;
}

export async function deleteWorkoutLog(id: string): Promise<string | null> {
  const supabase = getSupabase();
  if (getAuthState().status !== "signedIn" || !supabase) {
    local.write(local.read().filter((l) => l.id !== id));
    return null;
  }

  const before = remote.read();
  remote.write({ ...before, items: before.items.filter((l) => l.id !== id) });
  const { error } = await supabase.from("workout_logs").delete().eq("id", id);
  if (error) {
    remote.write(before);
    return "기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  return null;
}

// 로그인 직후 이 기기에 있던 기록을 계정으로 옮긴다.
export async function migrateLocalLogs(): Promise<void> {
  const supabase = getSupabase();
  const items = local.read().filter((l) => getEquipmentById(l.equipmentId));
  if (!supabase || items.length === 0) return;
  const { error } = await supabase
    .from("workout_logs")
    .insert(items.map((l) => ({ ...toRow(l), created_at: l.createdAt })));
  // 실패하면 이 기기의 데이터를 남겨 두고 다음 로그인 때 다시 시도한다.
  if (!error) local.write(EMPTY);
}

export async function loadRemoteLogs(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  remote.write({ status: "loading", items: [] });
  const { data, error } = await supabase
    .from("workout_logs")
    .select(COLUMNS)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  remote.write(
    error ? { status: "error", items: [] } : { status: "ready", items: data.map(fromRow) },
  );
}

export function resetRemoteLogs() {
  remote.write(IDLE);
}
