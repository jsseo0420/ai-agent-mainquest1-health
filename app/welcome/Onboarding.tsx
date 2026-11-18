"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { SPLASH_DONE_EVENT } from "@/components/Splash";
import { markOnboarded } from "@/lib/storage/onboarding";

const slides = [
  {
    image: "/images/onboarding/1.webp",
    alt: "레그 프레스 머신 앞에서 기구를 올려다보는 사람과 큰 물음표",
    title: "이 기구,\n어떻게 쓰지?",
    body: "기구 25종의 자세와 주의사항을 기구 앞에서 바로 확인해요.",
  },
  {
    image: "/images/onboarding/2.webp",
    alt: "가슴·복근·허벅지 근육이 지도처럼 나뉜 인체와 가슴에 꽂힌 지도 핀",
    title: "근육 지도를 누르면\n기구가 나와요",
    body: "키우고 싶은 부위를 누르면 거기에 맞는 기구를 찾아 드려요.",
  },
  {
    image: "/images/onboarding/3.webp",
    alt: "체성분 결과지가 화살표를 지나 덤벨이 그려진 루틴 카드 3장으로 바뀌는 그림",
    title: "결과지 한 장으로\n내 루틴까지",
    body: "체성분 결과지 사진을 올리면 도감 운동으로 주 3회 루틴을 짜 드려요.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  // 스크롤 위치를 장 단위로 나타낸 값 (0 ~ 2, 넘기는 중에는 소수). 넘길 때 그림 크기·투명도에 쓴다.
  const [pos, setPos] = useState(0);
  // 등장 애니메이션 시작 여부. 시작 화면(스플래시)이 떠 있으면 사라진 뒤에 시작한다.
  const [ready, setReady] = useState(false);
  const index = Math.round(pos);
  const last = index === slides.length - 1;

  useEffect(() => {
    if (!window.__mapscleSplash) {
      // 첫 프레임은 숨긴 상태로 그린 뒤 다음 프레임에 등장시켜야 전환 효과가 보인다.
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
    const start = () => setReady(true);
    window.addEventListener(SPLASH_DONE_EVENT, start, { once: true });
    return () => window.removeEventListener(SPLASH_DONE_EVENT, start);
  }, []);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  function finish() {
    markOnboarded();
    router.replace("/");
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-night text-white">
      <header className="mx-auto flex h-14 w-full max-w-xl shrink-0 items-center justify-between px-4">
        <Logo tone="dark" />
        <button
          type="button"
          onClick={finish}
          className="h-11 rounded-full px-3 text-sm font-medium text-night-sub hover:text-white"
        >
          건너뛰기
        </button>
      </header>

      {/* 손가락으로 옆으로 밀면 한 장씩 넘어간다 (CSS scroll-snap). 키보드는 ←/→ */}
      <div
        ref={trackRef}
        tabIndex={0}
        onScroll={(e) => {
          const t = e.currentTarget;
          setPos(t.scrollLeft / t.clientWidth);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && index < slides.length - 1) goTo(index + 1);
          if (e.key === "ArrowLeft" && index > 0) goTo(index - 1);
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden outline-none [scrollbar-width:none]"
        aria-roledescription="carousel"
        aria-label="MAPSCLE 소개"
      >
        {slides.map((s, i) => {
          const active = ready && i === index;
          // 넘기는 중: 가운데서 멀어질수록 그림이 작아지고 흐려지며, 문구는 반대로 조금 더 밀려난다.
          const d = Math.min(Math.abs(pos - i), 1);
          const dir = Math.sign(i - pos);
          return (
            <section
              key={s.image}
              className="flex w-full shrink-0 snap-center snap-always flex-col items-center overflow-y-auto px-6"
              aria-roledescription="slide"
              aria-label={`${slides.length}장 중 ${i + 1}장`}
              aria-hidden={i !== index}
            >
              <div
                className="-mx-4 w-[calc(100%+2rem)] max-w-[min(calc(100%+2rem),58dvh)] will-change-transform motion-reduce:!transform-none"
                style={{ transform: `scale(${1 - d * 0.15}) rotate(${dir * d * 4}deg)`, opacity: 1 - d * 0.6 }}
              >
                <div
                  className={`relative aspect-square w-full transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                    active ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                >
                  <Image src={s.image} alt={s.alt} fill sizes="(max-width: 576px) 100vw, 560px" priority={i === 0} />
                </div>
              </div>
              <div
                className="w-full max-w-md will-change-transform motion-reduce:!transform-none"
                style={{ transform: `translateX(${dir * d * 40}px)` }}
              >
                <div
                  className={`transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                    active ? "translate-y-0 opacity-100 delay-500" : "translate-y-8 opacity-0"
                  }`}
                >
                  <p className="text-sm font-bold italic text-accent">0{i + 1}</p>
                  <h1 className="mt-1 whitespace-pre-line text-3xl font-black italic leading-tight tracking-tight">
                    {s.title}
                  </h1>
                  <p className="mt-3 leading-relaxed text-night-sub">{s.body}</p>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mx-auto w-full max-w-xl shrink-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.image}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-accent" : "w-1.5 bg-night-line"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (last ? finish() : goTo(index + 1))}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-accent text-lg font-black italic text-on-accent hover:bg-accent-hover"
        >
          {last ? "시작하기" : "다음"}
          <ArrowIcon />
        </button>
      </footer>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
