import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import BodyMap from "@/components/BodyMap";

export default function Home() {
  return (
    <main className="pt-8">
      <p className="text-sm font-semibold text-accent-strong">헬스 입문자를 위한</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">나만의 헬스도감</h1>
      <p className="mt-2 text-sub">기구 사용법도, 부위별 기구도 바로 찾아보세요.</p>

      <div className="mt-6">
        <SearchForm />
      </div>

      <div className="mt-6 grid gap-3">
        <Link
          href="/equipment"
          className="group flex items-center justify-between rounded-3xl bg-accent p-6 text-white transition-colors hover:bg-accent-strong"
        >
          <div>
            <p className="text-2xl font-bold">기구로 찾기</p>
            <p className="mt-1 text-sm text-white/85">기구 앞에서 사용법을 바로 확인해요</p>
          </div>
          <DumbbellIcon />
        </Link>
        <Link
          href="/muscles"
          className="flex items-center justify-between rounded-3xl border-2 border-accent bg-accent-bg p-6 transition-colors hover:bg-accent-soft/50"
        >
          <div>
            <p className="text-2xl font-bold text-accent-strong">부위로 찾기</p>
            <p className="mt-1 text-sm text-sub">운동하고 싶은 근육에 맞는 기구를 찾아요</p>
          </div>
          <BodyMap view="front" primary={["chest", "abs"]} className="h-20 w-auto shrink-0" />
        </Link>
        <Link
          href="/routine"
          className="flex items-center justify-between rounded-3xl border border-line bg-surface p-6 transition-colors hover:bg-accent-bg"
        >
          <div>
            <p className="text-2xl font-bold">결과지로 루틴 추천</p>
            <p className="mt-1 text-sm text-sub">체성분 결과지 사진으로 도감 운동 루틴을 받아요</p>
          </div>
          <SheetIcon />
        </Link>
      </div>
    </main>
  );
}

function SheetIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14 shrink-0 text-accent-strong" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <rect x="10" y="5" width="28" height="38" rx="4" />
      <path d="M17 15h14M17 23h14M17 31h8" strokeLinecap="round" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14 shrink-0" fill="currentColor" aria-hidden>
      <rect x="4" y="18" width="6" height="12" rx="2" />
      <rect x="10" y="13" width="7" height="22" rx="2" />
      <rect x="17" y="22" width="14" height="4" />
      <rect x="31" y="13" width="7" height="22" rx="2" />
      <rect x="38" y="18" width="6" height="12" rx="2" />
    </svg>
  );
}
