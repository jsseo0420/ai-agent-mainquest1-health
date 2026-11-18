import type { Metadata } from "next";
import Onboarding from "./Onboarding";

export const metadata: Metadata = { title: "MAPSCLE 소개" };

// 첫 방문 온보딩. 홈에서 처음 온 사용자만 이리로 보내고, 내 정보·홈의 "소개" 링크로 다시 볼 수 있다.
export default function WelcomePage() {
  return <Onboarding />;
}
