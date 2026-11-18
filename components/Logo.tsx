// MAPSCLE 로고. 심볼은 지도 핀 안에 덤벨을 넣은 모양이고, 글자는 기울인 굵은 영문이다.
// tone="dark"는 검정 배경(온보딩·홈), "light"는 흰 배경용이다.

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 2C9.4 2 4 7.2 4 13.7 4 22.4 16 30 16 30s12-7.6 12-16.3C28 7.2 22.6 2 16 2z"
        className="fill-accent"
      />
      <g className="fill-night">
        <rect x="9" y="10.5" width="3" height="7" rx="1" />
        <rect x="20" y="10.5" width="3" height="7" rx="1" />
        <rect x="12" y="12.75" width="8" height="2.5" />
      </g>
    </svg>
  );
}

export default function Logo({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <LogoMark />
      <span
        className={`text-xl font-black italic tracking-tight ${tone === "dark" ? "text-white" : "text-ink"}`}
      >
        MAP<span className={tone === "dark" ? "text-accent" : "text-accent-strong"}>SCLE</span>
      </span>
      <span className="sr-only">맵슬</span>
    </span>
  );
}
