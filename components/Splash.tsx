"use client";

import { useEffect, useState } from "react";
import { startupScript } from "@/lib/storage/onboarding";
import { LogoMark } from "./Logo";

const SPLASH_ID = "app-splash";
const SHOW_MS = 1000;
const FADE_MS = 300;
export const SPLASH_DONE_EVENT = "mapscle:splash-done";

declare global {
  interface Window {
    __mapscleSplash?: boolean;
  }
}

// 앱을 켤 때(브라우저 세션마다 한 번) 검정 화면 가운데에 로고 심볼을 잠깐 보여준다.
// 서버 HTML에서는 숨겨 두고, 바로 뒤의 인라인 스크립트가 그리기 전에 보이게 한다.
// 같은 스크립트가 첫 방문자를 온보딩으로 보내므로, 스플래시 → 온보딩 순서로 한 번만 뜬다.
export default function Splash() {
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && window.__mapscleSplash === true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const fade = window.setTimeout(() => setLeaving(true), SHOW_MS);
    const hide = window.setTimeout(() => {
      window.__mapscleSplash = false;
      setVisible(false);
      // 온보딩처럼 등장 애니메이션이 있는 화면은 이 신호를 받고 시작한다.
      window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
    }, SHOW_MS + FADE_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, [visible]);

  return (
    <>
      <div
        id={SPLASH_ID}
        suppressHydrationWarning
        style={{ display: visible ? "flex" : "none" }}
        className={`fixed inset-0 z-50 items-center justify-center bg-night transition-opacity duration-300 ${
          leaving ? "opacity-0" : "opacity-100"
        }`}
        role="presentation"
      >
        <LogoMark className="h-24 w-24 motion-safe:animate-[splash-pop_600ms_ease-out]" />
        <span className="sr-only">MAPSCLE 시작 중</span>
      </div>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: startupScript(SPLASH_ID) }}
      />
    </>
  );
}
