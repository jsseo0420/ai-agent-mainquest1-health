import Link from "next/link";

type Props = {
  title: string;
  backHref?: string;
  backLabel?: string;
  // dark: 홈처럼 검정 배경. 기구로 찾기처럼 브랜드 느낌을 이어 가는 화면에서 쓴다.
  tone?: "light" | "dark";
};

export default function PageHeader({ title, backHref, backLabel = "뒤로", tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <header
      className={`sticky top-0 z-10 -mx-4 flex h-14 items-center gap-1 border-b px-2 backdrop-blur ${
        dark ? "border-night bg-night text-white" : "border-line bg-white/95"
      }`}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label={backLabel}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            dark ? "text-white hover:bg-night-2" : "text-ink hover:bg-surface"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      <h1 className={`truncate text-lg font-black italic tracking-tight ${backHref ? "" : "px-2"}`}>{title}</h1>
    </header>
  );
}
