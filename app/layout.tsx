import type { Metadata, Viewport } from "next";
import AuthSync from "@/components/AuthSync";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MAPSCLE 맵슬 | 기구 앞에서 망설이지 마",
    template: "%s | MAPSCLE",
  },
  applicationName: "MAPSCLE",
  description: "헬스 입문자를 위한 기구·근육 지도. 기구별 운동 자세와 자극 부위, 부위별 운동 기구, 체성분 결과지 루틴 추천까지.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131313",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <div className="mx-auto min-h-full max-w-xl px-4 pb-24">{children}</div>
        <BottomNav />
        <AuthSync />
      </body>
    </html>
  );
}
