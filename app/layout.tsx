import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "나만의 헬스도감",
    template: "%s | 나만의 헬스도감",
  },
  description: "헬스 기구별 운동 자세와 자극 부위, 부위별 운동 기구를 쉽게 찾아보는 헬스 입문자용 도감",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <div className="mx-auto min-h-full max-w-xl px-4 pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
