"use client";

import { useSyncExternalStore } from "react";

// 로그인한 사용자의 서버 데이터를 화면에 나눠 주기 위한 메모리 저장소.
export function createMemoryStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();

  function read(): T {
    return value;
  }

  function write(next: T) {
    value = next;
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => initial);
  }

  return { read, write, useValue };
}

export type RemoteState<T> = {
  status: "idle" | "loading" | "ready" | "error";
  items: T[];
};
