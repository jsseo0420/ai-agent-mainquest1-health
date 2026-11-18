"use client";

import { onboardingRedirectScript } from "@/lib/storage/onboarding";

// 처음 온 사용자는 화면이 그려지기 전에 온보딩(/welcome)으로 보낸다.
// 주소를 직접 열거나 새로고침할 때만 실행한다. 앱 안에서 홈으로 이동할 때는 이미 쓰고 있는 사용자이므로
// type을 text/plain으로 바꿔 실행하지 않는다. (node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md)
export default function OnboardingGate() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: onboardingRedirectScript }}
    />
  );
}
