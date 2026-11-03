"use client";

import { getEquipmentById } from "@/data/equipment";
import { getAuthState, useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase/client";
import { createLocalStore } from "./local-store";
import { createMemoryStore, type RemoteState } from "./memory-store";

export type Favorite = { equipmentId: string; createdAt: string };

type FavoriteRow = { equipment_id: string; created_at: string };

const EMPTY: Favorite[] = [];
const IDLE: RemoteState<Favorite> = { status: "idle", items: [] };

// 로그인 전: 이 기기의 localStorage / 로그인 후: Supabase favorites 테이블
const local = createLocalStore<Favorite[]>("health-dogam:favorites", EMPTY);
const remote = createMemoryStore<RemoteState<Favorite>>(IDLE);

function fromRow(row: FavoriteRow): Favorite {
  return { equipmentId: row.equipment_id, createdAt: row.created_at };
}

export function useFavorites(): { favorites: Favorite[]; loading: boolean } {
  const auth = useAuth();
  const localItems = local.useValue();
  const remoteState = remote.useValue();

  if (auth.status === "loading") return { favorites: EMPTY, loading: true };
  if (auth.status === "signedOut") return { favorites: localItems, loading: false };
  return {
    favorites: remoteState.items,
    loading: remoteState.status === "idle" || remoteState.status === "loading",
  };
}

export async function toggleFavorite(equipmentId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (getAuthState().status !== "signedIn" || !supabase) {
    const current = local.read();
    local.write(
      current.some((f) => f.equipmentId === equipmentId)
        ? current.filter((f) => f.equipmentId !== equipmentId)
        : [{ equipmentId, createdAt: new Date().toISOString() }, ...current],
    );
    return null;
  }

  // 화면을 먼저 바꾸고, 서버 저장에 실패하면 되돌린다.
  const before = remote.read();
  const exists = before.items.some((f) => f.equipmentId === equipmentId);
  remote.write({
    ...before,
    items: exists
      ? before.items.filter((f) => f.equipmentId !== equipmentId)
      : [{ equipmentId, createdAt: new Date().toISOString() }, ...before.items],
  });

  const { error } = exists
    ? await supabase.from("favorites").delete().eq("equipment_id", equipmentId)
    : await supabase.from("favorites").insert({ equipment_id: equipmentId });
  if (error) {
    remote.write(before);
    return "즐겨찾기를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
  return null;
}

// 로그인 직후 이 기기에 있던 즐겨찾기를 계정으로 옮긴다.
export async function migrateLocalFavorites(): Promise<void> {
  const supabase = getSupabase();
  const items = local.read().filter((f) => getEquipmentById(f.equipmentId));
  if (!supabase || items.length === 0) return;
  const { error } = await supabase.from("favorites").upsert(
    items.map((f) => ({ equipment_id: f.equipmentId, created_at: f.createdAt })),
    { onConflict: "user_id,equipment_id", ignoreDuplicates: true },
  );
  // 실패하면 이 기기의 데이터를 남겨 두고 다음 로그인 때 다시 시도한다.
  if (!error) local.write(EMPTY);
}

export async function loadRemoteFavorites(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  remote.write({ status: "loading", items: [] });
  const { data, error } = await supabase
    .from("favorites")
    .select("equipment_id, created_at")
    .order("created_at", { ascending: false });
  remote.write(
    error ? { status: "error", items: [] } : { status: "ready", items: data.map(fromRow) },
  );
}

export function resetRemoteFavorites() {
  remote.write(IDLE);
}
