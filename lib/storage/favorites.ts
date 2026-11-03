"use client";

import { createLocalStore } from "./local-store";

export type Favorite = { equipmentId: string; createdAt: string };

const EMPTY: Favorite[] = [];
const store = createLocalStore<Favorite[]>("health-dogam:favorites", EMPTY);

export function useFavorites(): Favorite[] {
  return store.useValue();
}

export function toggleFavorite(equipmentId: string) {
  const current = store.read();
  if (current.some((f) => f.equipmentId === equipmentId)) {
    store.write(current.filter((f) => f.equipmentId !== equipmentId));
  } else {
    store.write([{ equipmentId, createdAt: new Date().toISOString() }, ...current]);
  }
}
