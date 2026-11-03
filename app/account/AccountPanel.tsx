"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut, signUp, useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/storage/favorites";
import { useWorkoutLogs } from "@/lib/storage/logs";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AccountPanel() {
  const auth = useAuth();

  if (!isSupabaseConfigured()) {
    return (
      <p className="mt-6 rounded-2xl bg-surface px-4 py-8 text-center text-sub">
        로그인 기능이 아직 준비되지 않았어요.
      </p>
    );
  }
  if (auth.status === "loading") {
    return <p className="py-12 text-center text-sub">불러오는 중…</p>;
  }
  if (auth.status === "signedIn") {
    return <Profile userId={auth.user.id} email={auth.user.email ?? ""} />;
  }
  return <AuthForm />;
}

function Profile({ userId, email }: { userId: string; email: string }) {
  const [nickname, setNickname] = useState<string | null>(null);
  const { favorites } = useFavorites();
  const { logs } = useWorkoutLogs();

  useEffect(() => {
    getSupabase()
      ?.from("profiles")
      .select("nickname")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setNickname(data?.nickname ?? null));
  }, [userId]);

  return (
    <div className="mt-6">
      <div className="rounded-2xl bg-accent-bg p-5">
        <p className="text-sm text-accent-strong">로그인됨</p>
        <p className="mt-1 text-2xl font-bold">{nickname ? `${nickname}님` : "반가워요!"}</p>
        <p className="mt-0.5 truncate text-sm text-sub">{email}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/favorites" className="rounded-2xl border border-line p-4 hover:bg-surface">
          <p className="text-sm text-sub">즐겨찾기</p>
          <p className="text-xl font-bold">{favorites.length}개</p>
        </Link>
        <Link href="/logs" className="rounded-2xl border border-line p-4 hover:bg-surface">
          <p className="text-sm text-sub">운동 기록</p>
          <p className="text-xl font-bold">{logs.length}개</p>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-6 h-12 w-full rounded-2xl border border-line font-semibold hover:bg-surface"
      >
        로그아웃
      </button>
    </div>
  );
}

type Mode = "signIn" | "signUp";

function AuthForm() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nickname = String(form.get("nickname") ?? "").trim();

    setNotice(null);
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    if (mode === "signUp" && password.length < 6) {
      setError("비밀번호는 6자 이상으로 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    if (mode === "signIn") {
      setError(await signIn(email, password));
    } else {
      const result = await signUp(email, password, nickname);
      setError(result.error);
      if (result.needsConfirmation) {
        setNotice("가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.");
        setMode("signIn");
      }
    }
    setSubmitting(false);
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-accent";

  return (
    <div className="mt-6">
      <div role="tablist" aria-label="로그인 방식" className="grid grid-cols-2 rounded-2xl bg-surface p-1">
        {(["signIn", "signUp"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={`h-11 rounded-xl font-semibold transition-colors ${
              mode === m ? "bg-white text-ink shadow-sm" : "text-sub"
            }`}
          >
            {m === "signIn" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="auth-email" className="mb-1 block text-sm font-medium">
            이메일
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1 block text-sm font-medium">
            비밀번호{mode === "signUp" && <span className="font-normal text-sub"> (6자 이상)</span>}
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            minLength={6}
            required
            className={inputClass}
          />
        </div>
        {mode === "signUp" && (
          <div>
            <label htmlFor="auth-nickname" className="mb-1 block text-sm font-medium">
              닉네임 <span className="font-normal text-sub">(선택, 20자 이하)</span>
            </label>
            <input
              id="auth-nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              maxLength={20}
              className={inputClass}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-accent-strong">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-2xl bg-accent font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {submitting ? "잠시만요…" : mode === "signIn" ? "로그인" : "가입하기"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-sub">
        로그인하면 이 기기에 저장된 즐겨찾기와 운동 기록이 계정으로 옮겨져요.
      </p>
    </div>
  );
}
