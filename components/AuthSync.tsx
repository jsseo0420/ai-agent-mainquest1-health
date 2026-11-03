"use client";

import { useEffect } from "react";
import { onAuthChange } from "@/lib/auth";
import {
  loadRemoteFavorites,
  migrateLocalFavorites,
  resetRemoteFavorites,
} from "@/lib/storage/favorites";
import { loadRemoteLogs, migrateLocalLogs, resetRemoteLogs } from "@/lib/storage/logs";

// 로그인하면 이 기기 데이터를 계정으로 옮긴 뒤 서버 데이터를 불러오고,
// 로그아웃하면 화면에 남은 서버 데이터를 비운다.
export default function AuthSync() {
  useEffect(() => {
    let currentUserId: string | null = null;
    return onAuthChange(async (auth) => {
      if (auth.status === "signedIn") {
        if (auth.user.id === currentUserId) return;
        currentUserId = auth.user.id;
        await Promise.all([migrateLocalFavorites(), migrateLocalLogs()]);
        await Promise.all([loadRemoteFavorites(), loadRemoteLogs()]);
      } else if (auth.status === "signedOut") {
        currentUserId = null;
        resetRemoteFavorites();
        resetRemoteLogs();
      }
    });
  }, []);

  return null;
}
