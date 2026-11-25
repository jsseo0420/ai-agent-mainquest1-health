"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteAccount, requestPasswordReset, signIn, signOut, signUp, useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/storage/favorites";
import { useWorkoutLogs } from "@/lib/storage/logs";
import { updateNickname, useNickname } from "@/lib/storage/profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function AccountPanel() {
  const auth = useAuth();
  // 탈퇴 직후 로그인 폼으로 바뀌어도 안내가 남도록 여기서 들고 있는다.
  const [farewell, setFarewell] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <p className="mt-6 rounded-lg bg-surface px-4 py-8 text-center text-sub">
        로그인 기능이 아직 준비되지 않았어요.
      </p>
    );
  }
  if (auth.status === "loading") {
    return <p className="py-12 text-center text-sub">불러오는 중…</p>;
  }
  if (auth.status === "signedIn") {
    return (
      <Profile userId={auth.user.id} email={auth.user.email ?? ""} onDeleted={() => setFarewell(true)} />
    );
  }
  return (
    <>
      {farewell && (
        <p role="status" className="mt-4 rounded-lg bg-accent-bg px-4 py-3 text-sm text-accent-strong">
          탈퇴했어요. 계정과 즐겨찾기·운동 기록을 모두 지웠어요. 그동안 MAPSCLE을 써 주셔서 고마워요.
        </p>
      )}
      <Benefits />
      <AuthForm />
    </>
  );
}

// ---------------------------------------------------------------
// 로그인 후
// ---------------------------------------------------------------

function Profile({ userId, email, onDeleted }: { userId: string; email: string; onDeleted: () => void }) {
  const { nickname, loading, setLocal } = useNickname(userId);
  const { favorites } = useFavorites();
  const { logs } = useWorkoutLogs();
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <div className="-mx-4 bg-night px-4 pb-5 pt-2 text-white">
        {editing ? (
          <NicknameForm
            userId={userId}
            initial={nickname ?? ""}
            onDone={(next) => {
              if (next !== undefined) setLocal(next);
              setEditing(false);
            }}
          />
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-black italic">
                {loading ? " " : nickname ? `${nickname}님` : "반가워요!"}
              </p>
              <p className="mt-0.5 truncate text-sm text-night-sub">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-11 shrink-0 rounded-lg border border-night-line px-3 text-sm font-bold hover:border-accent"
            >
              {nickname ? "닉네임 수정" : "닉네임 정하기"}
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/favorites" className="rounded-lg bg-night-2 p-4 hover:bg-night-line">
            <p className="text-sm text-night-sub">즐겨찾기</p>
            <p className="text-2xl font-black italic">{favorites.length}</p>
          </Link>
          <Link href="/logs" className="rounded-lg bg-night-2 p-4 hover:bg-night-line">
            <p className="text-sm text-night-sub">운동 기록</p>
            <p className="text-2xl font-black italic">{logs.length}</p>
          </Link>
        </div>
      </div>

      <MenuSection title="계정">
        <MenuLink href="/account/reset-password">비밀번호 변경</MenuLink>
        <MenuButton onClick={() => signOut()}>로그아웃</MenuButton>
      </MenuSection>

      <DeleteAccount onDeleted={onDeleted} />
    </div>
  );
}

function NicknameForm({
  userId,
  initial,
  onDone,
}: {
  userId: string;
  initial: string;
  onDone: (next?: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const err = await updateNickname(userId, value);
        setSaving(false);
        if (err) setError(err);
        else onDone(value.trim());
      }}
      noValidate
    >
      <label htmlFor="nickname-input" className="mb-1 block text-sm text-night-sub">
        닉네임 (1~20자)
      </label>
      <div className="flex gap-2">
        <input
          id="nickname-input"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          maxLength={20}
          autoComplete="nickname"
          autoFocus
          className="h-11 min-w-0 flex-1 rounded-lg border border-night-line bg-night-2 px-3 text-base text-white outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="h-11 shrink-0 rounded-lg bg-accent px-4 font-black italic text-on-accent disabled:opacity-60"
        >
          {saving ? "저장 중" : "저장"}
        </button>
        <button type="button" onClick={() => onDone()} className="h-11 shrink-0 px-2 text-sm text-night-sub">
          취소
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-accent">
          {error}
        </p>
      )}
    </form>
  );
}

function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button type="button" onClick={() => setOpen(true)} className="h-11 px-3 text-sm text-sub underline">
          회원 탈퇴
        </button>
      </div>
    );
  }

  return (
    <section aria-labelledby="delete-heading" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 id="delete-heading" className="font-bold text-red-800">
        정말 탈퇴할까요?
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-900">
        <li>계정과 닉네임, 계정에 저장된 즐겨찾기·운동 기록이 모두 지워져요.</li>
        <li>지운 뒤에는 되돌릴 수 없어요.</li>
      </ul>
      <label htmlFor="delete-confirm" className="mt-3 block text-sm font-medium text-red-900">
        계속하려면 <b>탈퇴</b>라고 입력하세요
      </label>
      <input
        id="delete-confirm"
        value={confirmText}
        onChange={(e) => {
          setConfirmText(e.target.value);
          setError(null);
        }}
        className="mt-1 h-11 w-full rounded-lg border border-red-200 bg-white px-3 text-base outline-none focus:border-red-500"
      />
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          className="h-12 flex-1 rounded-lg border border-line bg-white font-bold"
        >
          취소
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            if (confirmText.trim() !== "탈퇴") {
              setError("탈퇴라고 입력해야 진행할 수 있어요.");
              return;
            }
            setDeleting(true);
            const err = await deleteAccount();
            setDeleting(false);
            if (err) setError(err);
            else onDeleted();
          }}
          className="h-12 flex-1 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "지우는 중…" : "탈퇴하기"}
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// 로그인 전
// ---------------------------------------------------------------

function Benefits() {
  const items = [
    ["기기를 바꿔도 그대로", "폰을 바꾸거나 다른 기기에서 열어도 즐겨찾기와 운동 기록이 남아요."],
    ["앱을 지워도 안전하게", "브라우저 기록을 지우거나 앱을 다시 설치해도 계정에 저장돼 있어요."],
    ["지금 기록도 함께", "로그인하면 이 기기에 저장된 즐겨찾기와 기록이 계정으로 옮겨져요."],
  ];
  return (
    <section aria-labelledby="benefits-heading" className="-mx-4 bg-night px-4 pb-5 pt-2 text-white">
      <h2 id="benefits-heading" className="text-xl font-black italic">
        로그인하면 <span className="text-accent">기록이 사라지지 않아요</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map(([title, body], i) => (
          <li key={title} className="flex gap-3 rounded-lg bg-night-2 p-3">
            <span className="font-black italic text-accent">0{i + 1}</span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-0.5 text-sm text-night-sub">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Mode = "signIn" | "signUp" | "reset";

function AuthForm() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nickname = String(form.get("nickname") ?? "").trim();

    setNotice(null);
    if (!email || (mode !== "reset" && !password)) {
      setError(mode === "reset" ? "가입한 이메일을 입력해 주세요." : "이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    if (mode === "signUp" && password.length < 6) {
      setError("비밀번호는 6자 이상으로 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    if (mode === "signIn") {
      setError(await signIn(email, password));
    } else if (mode === "signUp") {
      const result = await signUp(email, password, nickname);
      setError(result.error);
      if (result.needsConfirmation) {
        setNotice("가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.");
        setMode("signIn");
      }
    } else {
      const err = await requestPasswordReset(email);
      setError(err);
      if (!err) setNotice("비밀번호 재설정 메일을 보냈어요. 메일의 링크를 눌러 새 비밀번호를 정해 주세요.");
    }
    setSubmitting(false);
  }

  const inputClass =
    "h-12 w-full rounded-lg border border-line bg-white px-3 text-base outline-none focus:border-accent";

  return (
    <div className="mt-5">
      {mode === "reset" ? (
        <div>
          <h2 className="text-lg font-black italic">비밀번호 찾기</h2>
          <p className="mt-1 text-sm text-sub">가입한 이메일로 비밀번호를 다시 정하는 링크를 보내 드려요.</p>
        </div>
      ) : (
        <div role="tablist" aria-label="로그인 방식" className="grid grid-cols-2 rounded-lg bg-surface p-1">
          {(["signIn", "signUp"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`h-11 rounded-md font-bold transition-colors ${
                mode === m ? "bg-night text-white" : "text-sub"
              }`}
            >
              {m === "signIn" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>
      )}

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
        {mode !== "reset" && (
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
        )}
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
          className="h-12 w-full rounded-lg bg-accent font-black italic text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting
            ? "잠시만요…"
            : mode === "signIn"
              ? "로그인"
              : mode === "signUp"
                ? "가입하기"
                : "재설정 메일 보내기"}
        </button>
      </form>

      <div className="mt-2 text-center">
        {mode === "reset" ? (
          <button type="button" onClick={() => switchMode("signIn")} className="h-11 px-3 text-sm text-sub underline">
            로그인으로 돌아가기
          </button>
        ) : (
          mode === "signIn" && (
            <button type="button" onClick={() => switchMode("reset")} className="h-11 px-3 text-sm text-sub underline">
              비밀번호를 잊으셨나요?
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 메뉴 목록 (page.tsx의 "앱" 메뉴와 같은 모양)
// ---------------------------------------------------------------

export function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6" aria-label={title}>
      <h2 className="px-1 text-xs font-bold text-sub">{title}</h2>
      <ul className="mt-1.5 divide-y divide-line overflow-hidden rounded-lg border border-line">{children}</ul>
    </section>
  );
}

const rowClass = "flex h-12 w-full items-center justify-between px-4 text-left text-[15px] hover:bg-surface";

export function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className={rowClass}>
        {children}
        <span aria-hidden className="text-sub">
          ›
        </span>
      </Link>
    </li>
  );
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button type="button" onClick={onClick} className={rowClass}>
        {children}
      </button>
    </li>
  );
}
