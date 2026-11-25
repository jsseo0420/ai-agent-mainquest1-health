"use client";

import { useEffect, useState } from "react";

// Gemini 응답(10~30초)을 기다리는 동안 덮는 전체 화면. 실제 진행률은 알 수 없으므로
// 처음엔 빠르게, 갈수록 천천히 차오르다 95%에서 멈추고, 끝나면(done) 100%로 채운다.
const STEPS = {
  extract: {
    title: "결과지를 읽고 있어요",
    items: ["사진을 보내고 있어요", "결과지에서 숫자를 찾고 있어요", "8개 수치를 정리하고 있어요"],
  },
  recommend: {
    title: "루틴을 만들고 있어요",
    items: ["수치로 몸 상태를 판정하고 있어요", "도감에서 맞는 운동을 고르고 있어요", "주 3회 루틴으로 정리하고 있어요"],
  },
} as const;

// 단계가 바뀌는 진행률 지점
const STEP_AT = [0, 0.22, 0.6];
// 진행률이 63%가 되는 시간(ms). 10초면 약 63%, 20초면 약 86%.
const TAU = 10_000;

export default function LoadingOverlay({
  kind,
  done,
  preview,
}: {
  kind: keyof typeof STEPS;
  done: boolean;
  preview?: string | null;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - start), 120);
    return () => window.clearInterval(id);
  }, []);

  const progress = done ? 1 : 0.95 * (1 - Math.exp(-elapsed / TAU));
  const stepIndex = done ? STEP_AT.length : STEP_AT.filter((at) => progress >= at).length - 1;
  const { title, items } = STEPS[kind];
  const percent = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-night px-8 text-white">
      {kind === "extract" && preview ? (
        <div className="relative h-40 w-32 overflow-hidden rounded-md bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- 사용자가 고른 사진의 미리보기(blob URL) */}
          <img src={preview} alt="" className="h-full w-full object-cover opacity-80" />
          <span
            aria-hidden
            className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_12px_2px_#ff4d2e] motion-safe:animate-[scan-line_1.6s_ease-in-out_infinite_alternate] motion-reduce:top-1/2"
          />
        </div>
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-night-line">
          <span className="text-3xl font-black italic text-accent">{kind === "extract" ? "8" : "3"}</span>
        </div>
      )}

      <h2 className="mt-6 text-2xl font-black italic">{title}</h2>

      <div className="mt-5 w-full max-w-xs">
        <div
          role="progressbar"
          aria-label={title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2.5 w-full overflow-hidden rounded-full bg-night-2"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-sm font-bold italic text-accent">{percent}%</p>

        <ol className="mt-3 space-y-2 text-sm" aria-live="polite">
          {items.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-2 ${
                i < stepIndex ? "text-accent" : i === stepIndex ? "font-bold text-white" : "text-night-sub"
              }`}
            >
              <span aria-hidden className="w-4 text-center">
                {i < stepIndex ? "✓" : i === stepIndex ? "●" : "○"}
              </span>
              {label}
              {i === stepIndex && "…"}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 text-center text-xs text-night-sub">
        {elapsed > 35_000
          ? "서버가 붐벼서 조금 더 걸리고 있어요. 화면을 닫지 말고 기다려 주세요."
          : "보통 10~30초 걸려요. 화면을 닫지 말고 기다려 주세요."}
      </p>
    </div>
  );
}
