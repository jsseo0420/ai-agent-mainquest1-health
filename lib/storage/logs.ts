"use client";

import { createLocalStore } from "./local-store";

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

const EMPTY: WorkoutLog[] = [];
const store = createLocalStore<WorkoutLog[]>("health-dogam:logs", EMPTY);

export function useWorkoutLogs(): WorkoutLog[] {
  return store.useValue();
}

export function addWorkoutLog(log: NewWorkoutLog) {
  const entry: WorkoutLog = {
    ...log,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  store.write([entry, ...store.read()]);
}

export function deleteWorkoutLog(id: string) {
  store.write(store.read().filter((l) => l.id !== id));
}
