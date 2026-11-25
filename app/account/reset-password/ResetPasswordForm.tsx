"use client";

import Link from "next/link";
import { useState } from "react";
import { updatePassword, useAuth } from "@/lib/auth";

// 재설정 메일 링크로 들어오면 Supabase가 주소의 인증 코드로 잠시 로그인시킨다(useAuth가 signedIn).
// 로그인되지 않은 채로 열렸으면 링크가 만료됐거나 다른 브라우저에서 연 경우다.
export default function ResetPasswordForm() {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  if (auth.status === "loading") {
    return <p className="py-12 text-center text-sub">확인하는 중…</p>;
  }

  if (done) {
    return (
      <div className="mt-6 rounded-lg bg-accent-bg p-5 text-center">
        <p className="font-bold text-accent-strong">비밀번호를 바꿨어요</p>
        <p className="mt-1 text-sm text-sub">다음 로그인부터 새 비밀번호를 쓰세요.</p>
        <Link
          href="/account"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-black italic text-on-accent"
        >
          내 정보로
        </Link>
      </div>
    );
  }

  if (auth.status === "signedOut") {
    return (
      <div className="mt-6 rounded-lg bg-surface p-5 text-center">
        <p className="font-bold">링크가 만료됐거나 올바르지 않아요</p>
        <p className="mt-1 text-sm text-sub">
          재설정 메일을 요청한 브라우저에서 링크를 열어 주세요. 그래도 안 되면 메일을 다시 받아 주세요.
        </p>
        <Link
          href="/account"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-black italic text-on-accent"
        >
          비밀번호 찾기로
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="mt-6 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const password = String(form.get("password") ?? "");
        const confirm = String(form.get("confirm") ?? "");
        if (password.length < 6) {
          setError("비밀번호는 6자 이상으로 입력해 주세요.");
          return;
        }
        if (password !== confirm) {
          setError("두 비밀번호가 달라요. 같은 비밀번호를 한 번 더 입력해 주세요.");
          return;
        }
        setSaving(true);
        const err = await updatePassword(password);
        setSaving(false);
        setError(err);
        if (!err) setDone(true);
      }}
    >
      <p className="text-sm text-sub">{auth.user.email} 계정의 새 비밀번호를 정해 주세요.</p>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium">
          새 비밀번호 <span className="font-normal text-sub">(6자 이상)</span>
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          className="h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
          새 비밀번호 확인
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={6}
          className="h-12 w-full rounded-lg border border-line px-3 text-base outline-none focus:border-accent"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-lg bg-accent font-black italic text-on-accent hover:bg-accent-hover disabled:opacity-60"
      >
        {saving ? "바꾸는 중…" : "비밀번호 바꾸기"}
      </button>
    </form>
  );
}
