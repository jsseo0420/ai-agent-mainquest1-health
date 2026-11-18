"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getEquipmentById } from "@/data/equipment";
import { consistencyWarnings } from "@/lib/routine/assess";
import { extractFromImage, requestRoutine } from "@/lib/routine/client";
import {
  emptyMeasurements,
  FIELDS,
  type FieldKey,
  type Level,
  type Measurements,
  type RecommendResponse,
  type Sex,
} from "@/lib/routine/types";

type Step = "upload" | "confirm" | "result";
type Inputs = Record<FieldKey, string>;

const SAMPLE_SRC = "/images/routine/sample-sheet.jpg";

function toInputs(m: Measurements): Inputs {
  return Object.fromEntries(
    FIELDS.map((f) => [f.key, m[f.key] == null ? "" : String(m[f.key])]),
  ) as Inputs;
}

function toMeasurements(inputs: Inputs): Measurements {
  const m = emptyMeasurements();
  for (const f of FIELDS) {
    const n = Number(inputs[f.key]);
    m[f.key] = inputs[f.key].trim() !== "" && Number.isFinite(n) && n > 0 ? n : null;
  }
  return m;
}

export default function RoutineRecommender() {
  const [step, setStep] = useState<Step>("upload");
  const [sex, setSex] = useState<Sex | null>(null);
  const [inputs, setInputs] = useState<Inputs>(toInputs(emptyMeasurements()));
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [busy, setBusy] = useState<"extract" | "recommend" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function analyze(file: File) {
    setError(null);
    setBusy("extract");
    setPreview((old) => {
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    try {
      setInputs(toInputs(await extractFromImage(file)));
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진을 분석하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function trySample() {
    setSex("F");
    const blob = await fetch(SAMPLE_SRC).then((r) => r.blob());
    await analyze(new File([blob], "sample-sheet.jpg", { type: "image/jpeg" }));
  }

  async function recommend() {
    if (!sex) {
      setError("성별을 골라 주세요. 체지방률 기준이 성별마다 달라요.");
      return;
    }
    const values = toMeasurements(inputs);
    if (values.weight_kg == null) {
      setError("체중은 꼭 입력해 주세요.");
      return;
    }
    setError(null);
    setBusy("recommend");
    try {
      setResult(await requestRoutine(sex, values));
      setStep("result");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "루틴을 만들지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(null);
    }
  }

  function restart() {
    setStep("upload");
    setResult(null);
    setError(null);
    setInputs(toInputs(emptyMeasurements()));
    setPreview(null);
  }

  return (
    <div className="pt-4">
      <Steps step={step} />

      {step === "upload" && (
        <section className="mt-5">
          <h2 className="text-xl font-bold">체성분 결과지를 올려 주세요</h2>
          <p className="mt-1 text-sm text-sub">
            핵심 수치 8개를 읽어서, 헬스도감에 있는 운동만으로 주 3회 루틴을 짜 드려요.
          </p>

          <SexPicker sex={sex} onChange={setSex} />

          <input
            ref={fileRef}
            id="sheet-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void analyze(file);
            }}
          />
          <label
            htmlFor="sheet-photo"
            aria-disabled={busy !== null}
            className={`mt-5 flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent hover:bg-accent-hover ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {busy === "extract" ? "결과지를 읽는 중이에요… (10~30초)" : "결과지 사진 고르기"}
          </label>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void trySample()}
              className="h-11 rounded-xl border border-line text-sm font-medium hover:bg-surface disabled:opacity-60"
            >
              예시 결과지로 해 보기
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                setError(null);
                setStep("confirm");
              }}
              className="h-11 rounded-xl border border-line text-sm font-medium hover:bg-surface disabled:opacity-60"
            >
              수치 직접 입력하기
            </button>
          </div>

          {preview && busy === "extract" && (
            // eslint-disable-next-line @next/next/no-img-element -- 사용자가 고른 사진의 미리보기(blob URL)
            <img src={preview} alt="올린 결과지 사진" className="mt-4 max-h-64 w-full rounded-2xl object-contain bg-surface" />
          )}

          <ul className="mt-5 space-y-1 rounded-2xl bg-surface p-4 text-xs text-sub">
            <li>· 사진은 수치를 읽기 위해 Google Gemini로 보내고, 헬스도감에는 저장하지 않아요.</li>
            <li>· 결과지 전체가 보이게, 반사 없이 정면에서 찍으면 더 정확해요.</li>
            <li>· 추천 루틴은 운동 참고용이며 의료 조언이 아니에요.</li>
          </ul>
        </section>
      )}

      {step === "confirm" && (
        <section className="mt-5">
          <h2 className="text-xl font-bold">수치를 확인해 주세요</h2>
          <p className="mt-1 text-sm text-sub">
            결과지와 다른 값이 있으면 고쳐 주세요. 읽지 못한 칸은 비어 있어요.
          </p>

          <SexPicker sex={sex} onChange={setSex} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label htmlFor={`field-${f.key}`} className="mb-1 block text-sm font-medium">
                  {f.label}
                  {f.unit && <span className="ml-1 text-xs text-sub">({f.unit})</span>}
                </label>
                <input
                  id={`field-${f.key}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={f.decimals === 0 ? "1" : 1 / 10 ** f.decimals}
                  value={inputs[f.key]}
                  placeholder="모름"
                  onChange={(e) => setInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className={`h-12 w-full rounded-xl border bg-white px-3 text-base outline-none focus:border-accent ${
                    inputs[f.key] === "" ? "border-amber-300 bg-amber-50" : "border-line"
                  }`}
                />
              </div>
            ))}
          </div>

          {consistencyWarnings(toMeasurements(inputs)).map((w) => (
            <p key={w} className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              {w}
            </p>
          ))}

          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void recommend()}
            className="mt-5 h-14 w-full rounded-2xl bg-accent font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
          >
            {busy === "recommend" ? "루틴을 짜는 중이에요… (10~30초)" : "이 수치로 루틴 추천받기"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={restart}
            className="mt-2 h-11 w-full rounded-xl text-sm text-sub hover:bg-surface"
          >
            사진 다시 올리기
          </button>
        </section>
      )}

      {step === "result" && result && (
        <RoutineResult result={result} onEdit={() => setStep("confirm")} onRestart={restart} />
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const items: { id: Step; label: string }[] = [
    { id: "upload", label: "사진" },
    { id: "confirm", label: "수치 확인" },
    { id: "result", label: "루틴" },
  ];
  const current = items.findIndex((i) => i.id === step);
  return (
    <ol className="flex gap-2 text-xs">
      {items.map((item, i) => (
        <li
          key={item.id}
          aria-current={i === current ? "step" : undefined}
          className={`flex-1 rounded-full py-1.5 text-center ${
            i === current ? "bg-accent font-semibold text-on-accent" : i < current ? "bg-accent-bg text-accent-strong" : "bg-surface text-sub"
          }`}
        >
          {i + 1}. {item.label}
        </li>
      ))}
    </ol>
  );
}

function SexPicker({ sex, onChange }: { sex: Sex | null; onChange: (s: Sex) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="mb-1 text-sm font-medium">
        성별 <span className="text-xs text-sub">(체지방률 표준 범위가 달라요)</span>
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["M", "남성"],
            ["F", "여성"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={sex === value}
            onClick={() => onChange(value)}
            className={`h-11 rounded-xl border text-sm font-medium ${
              sex === value ? "border-accent bg-accent-bg text-accent-strong" : "border-line hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// 모델이 "12~15"나 "12~15회"를 섞어 보내므로, 단위를 한 번만 붙인다.
function formatReps(reps: string): string {
  return `${reps.trim().replace(/\s*회$/, "")}회`;
}

const LEVEL_STYLE: Record<Level, string> = {
  높음: "bg-orange-50 text-orange-700",
  낮음: "bg-sky-50 text-sky-700",
  표준: "bg-accent-bg text-accent-strong",
  "알 수 없음": "bg-surface text-sub",
};

function RoutineResult({
  result,
  onEdit,
  onRestart,
}: {
  result: RecommendResponse;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const { assessment: a, routine } = result;
  const chips: [string, Level][] = [
    ["체지방률", a.fat],
    ["근육량", a.muscle],
    ["BMI", a.bmi],
    ["복부지방률", a.whr],
  ];
  return (
    <section className="mt-5">
      <p className="text-sm font-semibold text-accent-strong">목표</p>
      <h2 className="text-2xl font-extrabold">{a.goal}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {chips.map(([label, level]) => (
          <li key={label} className={`rounded-full px-3 py-1 text-xs font-medium ${LEVEL_STYLE[level]}`}>
            {label} {level}
          </li>
        ))}
      </ul>
      <p className="mt-4 leading-relaxed">{routine.summary}</p>

      <div className="mt-6 space-y-4">
        {routine.days.map((day) => (
          <div key={day.title} className="rounded-2xl border border-line p-4">
            <h3 className="font-bold">{day.title}</h3>
            <ul className="mt-3 space-y-3">
              {day.exercises.map((ex, i) => {
                const equipment = getEquipmentById(ex.id)!;
                return (
                  <li key={`${ex.id}-${i}`}>
                    <Link
                      href={`/equipment/${equipment.slug}`}
                      className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2 hover:bg-accent-bg"
                    >
                      <span className="font-semibold">{equipment.nameKo}</span>
                      <span className="shrink-0 text-sm text-accent-strong">
                        {ex.sets}세트 × {formatReps(ex.reps)}
                      </span>
                    </Link>
                    <p className="mt-1 px-1 text-sm text-sub">{ex.reason}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {routine.cardio_note && (
        <div className="mt-4 rounded-2xl bg-accent-bg p-4">
          <p className="text-sm font-bold text-accent-strong">유산소</p>
          <p className="mt-1 text-sm">{routine.cardio_note}</p>
        </div>
      )}
      {routine.caution && (
        <div className="mt-3 rounded-2xl bg-surface p-4">
          <p className="text-sm font-bold">주의할 점</p>
          <p className="mt-1 text-sm">{routine.caution}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-sub">
        이 루틴은 운동 참고용이며 의료 조언이 아니에요. 통증이나 질환이 있으면 전문가와 상의해 주세요.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onEdit} className="h-11 rounded-xl border border-line text-sm font-medium hover:bg-surface">
          수치 고치기
        </button>
        <button type="button" onClick={onRestart} className="h-11 rounded-xl border border-line text-sm font-medium hover:bg-surface">
          처음부터 하기
        </button>
      </div>
    </section>
  );
}
