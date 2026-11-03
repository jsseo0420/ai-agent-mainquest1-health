import Link from "next/link";

type Props = {
  title: string;
  backHref?: string;
  backLabel?: string;
};

export default function PageHeader({ title, backHref, backLabel = "뒤로" }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 flex h-14 items-center gap-1 border-b border-line bg-white/95 px-2 backdrop-blur">
      {backHref && (
        <Link
          href={backHref}
          aria-label={backLabel}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      <h1 className={`truncate text-lg font-bold ${backHref ? "" : "px-2"}`}>{title}</h1>
    </header>
  );
}
