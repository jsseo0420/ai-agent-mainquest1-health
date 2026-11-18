"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Logo from "@/components/Logo";
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
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;

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

      <div
        ref={trackRef}
        onScroll={(e) => {
          const t = e.currentTarget;
          setIndex(Math.round(t.scrollLeft / t.clientWidth));
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
        aria-roledescription="carousel"
        aria-label="MAPSCLE 소개"
      >
        {slides.map((s, i) => (
          <section
            key={s.image}
            className="flex w-full shrink-0 snap-center flex-col items-center overflow-y-auto px-6"
            aria-roledescription="slide"
            aria-label={`${slides.length}장 중 ${i + 1}장`}
            aria-hidden={i !== index}
          >
            <div className="relative aspect-square w-full max-w-[min(100%,46dvh)]">
              <Image src={s.image} alt={s.alt} fill sizes="(max-width: 576px) 100vw, 480px" priority={i === 0} />
            </div>
            <div className="w-full max-w-md">
              <p className="text-sm font-bold italic text-accent">0{i + 1}</p>
              <h1 className="mt-1 whitespace-pre-line text-3xl font-black italic leading-tight tracking-tight">
                {s.title}
              </h1>
              <p className="mt-3 leading-relaxed text-night-sub">{s.body}</p>
            </div>
          </section>
        ))}
      </div>

      <footer className="mx-auto w-full max-w-xl shrink-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.image}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-1.5 bg-night-line"}`}
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
