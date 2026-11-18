import Link from "next/link";
import BodyMap from "@/components/BodyMap";
import Logo from "@/components/Logo";
import SearchForm from "@/components/SearchForm";
import TodayRoutinePicker from "./TodayRoutinePicker";

export default function Home() {
  return (
    <main className="-mx-4 -mb-24 min-h-dvh bg-night px-4 pb-28 text-white">
      <header className="flex h-14 items-center">
        <Logo tone="dark" />
      </header>

      <section className="pt-4">
        <p className="text-xs font-bold italic text-accent">헬스 입문자를 위한 기구·근육 지도</p>
        <h1 className="mt-1 text-2xl font-black italic leading-tight tracking-tight">
          기구 앞에서 <span className="text-accent">망설이지 마.</span>
        </h1>
      </section>

      <div className="mt-5">
        <SearchForm tone="dark" />
      </div>

      <div className="mt-4">
        <TodayRoutinePicker />
      </div>

      <h2 className="mt-8 text-sm font-bold text-night-sub">찾아보기</h2>
      <nav aria-label="찾기 방식" className="mt-2 grid gap-2.5">
        <Link
          href="/equipment"
          className="flex items-center justify-between gap-3 rounded-lg bg-accent p-5 text-on-accent transition-colors hover:bg-accent-hover"
        >
          <div>
            <p className="text-2xl font-black italic">기구로 찾기</p>
            <p className="mt-0.5 text-sm font-medium text-on-accent/75">기구 앞에서 사용법을 바로 확인해요</p>
          </div>
          <ArrowIcon />
        </Link>
        <Link
          href="/muscles"
          className="flex items-center justify-between gap-3 rounded-lg border border-night-line bg-night-2 p-5 transition-colors hover:border-accent"
        >
          <div className="min-w-0">
            <p className="text-xl font-black italic">부위로 찾기</p>
            <p className="mt-0.5 text-sm text-night-sub">근육 지도를 누르면 맞는 기구가 나와요</p>
          </div>
          <BodyMap view="front" primary={["chest", "abs"]} className="h-16 w-auto shrink-0" />
        </Link>
        <Link
          href="/routine"
          className="flex items-center justify-between gap-3 rounded-lg border border-night-line bg-night-2 p-5 transition-colors hover:border-accent"
        >
          <div className="min-w-0">
            <p className="text-xl font-black italic">결과지로 루틴 추천</p>
            <p className="mt-0.5 text-sm text-night-sub">체성분 결과지 사진으로 주 3회 루틴을 받아요</p>
          </div>
          <SheetIcon />
        </Link>
      </nav>

      <p className="mt-8 text-center">
        <Link
          href="/welcome"
          className="inline-flex h-11 items-center px-3 text-sm text-night-sub underline-offset-4 hover:text-white hover:underline"
        >
          MAPSCLE 소개 다시 보기
        </Link>
      </p>
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SheetIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <rect x="10" y="5" width="28" height="38" rx="3" />
      <path d="M17 15h14M17 23h14M17 31h8" strokeLinecap="round" />
    </svg>
  );
}
