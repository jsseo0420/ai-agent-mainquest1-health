"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// 로그인 여부에 따라 데이터가 어디에 저장되는지 알려준다.
export default function LocalOnlyNotice() {
  const auth = useAuth();
  if (auth.status === "loading") return <div className="mt-3 h-[52px]" aria-hidden />;

  if (auth.status === "signedIn") {
    return (
      <p className="mt-3 rounded-xl bg-accent-bg px-3 py-2 text-xs text-accent-strong">
        내 계정에 저장돼요. 다른 기기에서 로그인해도 볼 수 있어요.
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs text-sub">
      지금은 이 기기의 브라우저에만 저장돼요.
      {isSupabaseConfigured() ? (
        <>
          {" "}
          <Link href="/account" className="font-semibold text-accent-strong underline">
            로그인
          </Link>
          하면 다른 기기에서도 볼 수 있어요.
        </>
      ) : (
        " 기기를 바꾸거나 방문 기록을 지우면 사라질 수 있어요."
      )}
    </p>
  );
}
