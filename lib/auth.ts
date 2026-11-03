"use client";

import type { User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase/client";

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "signedOut"; user: null }
  | { status: "signedIn"; user: User };

const LOADING: AuthState = { status: "loading", user: null };
const SIGNED_OUT: AuthState = { status: "signedOut", user: null };

let state: AuthState = LOADING;
let started = false;
const listeners = new Set<(s: AuthState) => void>();

function setState(next: AuthState) {
  // 토큰 갱신 등으로 같은 사용자가 다시 들어오면 상태를 바꾸지 않는다.
  if (next.status === state.status && next.user?.id === state.user?.id) return;
  state = next;
  listeners.forEach((l) => l(state));
}

function start() {
  if (started) return;
  started = true;
  const supabase = getSupabase();
  if (!supabase) {
    setState(SIGNED_OUT);
    return;
  }
  // INITIAL_SESSION 이벤트로 저장된 세션을 복원한다.
  supabase.auth.onAuthStateChange((_event, session) => {
    // 콜백 안에서 Supabase를 다시 호출하면 교착될 수 있어 다음 틱으로 미룬다.
    setTimeout(() => {
      setState(session?.user ? { status: "signedIn", user: session.user } : SIGNED_OUT);
    }, 0);
  });
}

export function getAuthState(): AuthState {
  return state;
}

// 로그인 상태가 바뀔 때마다 호출된다. 구독 즉시 현재 상태로 한 번 호출한다.
export function onAuthChange(listener: (s: AuthState) => void): () => void {
  start();
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

function subscribe(onChange: () => void) {
  start();
  const listener = () => onChange();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getAuthState, () => LOADING);
}

// Supabase 영어 오류 메시지를 화면에 보여줄 한국어로 바꾼다.
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않아요.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "비밀번호가 너무 약해요. 6자 이상으로 입력해 주세요.";
  if (m.includes("email not confirmed")) return "이메일 인증이 필요해요. 받은 메일을 확인해 주세요.";
  if (m.includes("invalid") && m.includes("email")) return "이메일 형식이 올바르지 않아요.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (m.includes("fetch")) return "서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.";
  return "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return "로그인 서버가 설정되지 않았어요.";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? authErrorMessage(error.message) : null;
}

export async function signUp(
  email: string,
  password: string,
  nickname: string,
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "로그인 서버가 설정되지 않았어요.", needsConfirmation: false };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // 가입 트리거(handle_new_user)가 이 값으로 profiles.nickname을 채운다.
    options: { data: nickname ? { nickname } : {} },
  });
  if (error) return { error: authErrorMessage(error.message), needsConfirmation: false };
  // 이메일 인증이 켜져 있으면 세션 없이 사용자만 생성된다.
  return { error: null, needsConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  await getSupabase()?.auth.signOut();
}
