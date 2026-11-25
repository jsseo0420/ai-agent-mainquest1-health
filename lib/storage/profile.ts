"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

// 로그인한 사용자의 닉네임 (profiles 테이블). 로그인 전에는 쓰지 않는다.
export function useNickname(userId: string): {
  nickname: string | null;
  loading: boolean;
  setLocal: (nickname: string | null) => void;
} {
  const [state, setState] = useState<{ id: string; nickname: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSupabase()
      ?.from("profiles")
      .select("nickname")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ id: userId, nickname: data?.nickname ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loaded = state?.id === userId;
  return {
    nickname: loaded ? state.nickname : null,
    loading: !loaded,
    setLocal: (nickname) => setState({ id: userId, nickname }),
  };
}

export async function updateNickname(userId: string, nickname: string): Promise<string | null> {
  const value = nickname.trim();
  if (value.length < 1 || value.length > 20) return "닉네임은 1~20자로 입력해 주세요.";
  const supabase = getSupabase();
  if (!supabase) return "로그인 서버가 설정되지 않았어요.";
  const { error } = await supabase.from("profiles").update({ nickname: value }).eq("id", userId);
  return error ? "닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." : null;
}
