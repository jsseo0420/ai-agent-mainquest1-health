"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import EquipmentImage from "@/components/EquipmentImage";
import { getEquipmentById } from "@/data/equipment";
import { consistencyWarnings, fatRange, muscleRatioMin } from "@/lib/routine/assess";
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
import { loadLastRoutine, saveLastRoutine, type SavedRoutine } from "@/lib/storage/routine";
import LoadingOverlay from "./LoadingOverlay";

type Step = "upload" | "confirm" | "result";
type Inputs = Record<FieldKey, string>;
type Busy = { kind: "extract" | "recommend"; done: boolean } | null;

const SAMPLE_SRC = "/images/routine/sample-sheet.jpg";
// 응답이 오면 게이지를 100%로 채운 모습을 잠깐 보여준 뒤 다음 단계로 넘어간다.
const FINISH_MS = 450;

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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function RoutineRecommender() {
  const [step, setStep] = useState<Step>("upload");
  const [sex, setSex] = useState<Sex | null>(null);
  const [inputs, setInputs] = useState<Inputs>(toInputs(emptyMeasurements()));
  const [result, setResult] = useState<SavedRoutine | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 루틴의 기구 상세나 "+ 기록"에서 돌아오면 같은 탭에 보관한 마지막 루틴을 다시 보여준다.
  useEffect(() => {
    const saved = loadLastRoutine();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장소는 화면을 그린 뒤에만 읽을 수 있다
    setResult(saved);
    setSex(saved.sex);
    setInputs(toInputs(saved.values));
    setStep("result");
  }, []);

  async function analyze(file: File) {
    setError(null);
    setBusy({ kind: "extract", done: false });
    setPreview((old) => {
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    try {
      const values = await extractFromImage(file);
      setBusy({ kind: "extract", done: true });
      await wait(FINISH_MS);
      setInputs(toInputs(values));
      setStep("confirm");
      window.scrollTo({ top: 0 });
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
    setBusy({ kind: "recommend", done: false });
    try {
      const data = await requestRoutine(sex, values);
      setBusy({ kind: "recommend", done: true });
      await wait(FINISH_MS);
      const next = { data, sex, values };
      saveLastRoutine(next);
      setResult(next);
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
    saveLastRoutine(null);
    setError(null);
    setInputs(toInputs(emptyMeasurements()));
    setPreview(null);
    window.scrollTo({ top: 0 });
  }

  const errorBox = error && (
    <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {error}
    </p>
  );

  return (
    <div>
      {busy && <LoadingOverlay key={busy.kind} kind={busy.kind} done={busy.done} preview={preview} />}

      {step === "upload" && (
        <section className="-mx-4 bg-night px-4 pb-8 pt-1 text-white">
          <Steps step={step} />
          <div className="relative mx-auto mt-3 aspect-square w-full max-w-[16rem]">
            <Image
              src="/images/onboarding/3.webp"
              alt="체성분 결과지가 화살표를 지나 루틴 카드 3장으로 바뀌는 그림"
              fill
              sizes="256px"
              priority
            />
          </div>
          <h2 className="text-2xl font-black italic leading-tight">
            결과지 한 장으로
            <br />
            <span className="text-accent">내 루틴까지</span>
          </h2>
          <p className="mt-2 text-sm text-night-sub">
            핵심 수치 8개를 읽어서, MAPSCLE 도감에 있는 운동만으로 주 3회 루틴을 짜 드려요.
          </p>

          <SexPicker sex={sex} onChange={setSex} dark />

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
            className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent text-lg font-black italic text-on-accent hover:bg-accent-hover"
          >
            <CameraIcon />
            결과지 사진 올리기
          </label>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void trySample()}
              className="h-11 rounded-lg border border-night-line text-sm font-bold hover:border-accent"
            >
              예시 결과지로 해 보기
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("confirm");
              }}
              className="h-11 rounded-lg border border-night-line text-sm font-bold hover:border-accent"
            >
              수치 직접 입력하기
            </button>
          </div>

          {errorBox}

          <ul className="mt-5 space-y-1 text-xs text-night-sub">
            <li>· 사진은 수치를 읽기 위해 Google Gemini로 보내고, MAPSCLE에는 저장하지 않아요.</li>
            <li>· 결과지 전체가 보이게, 반사 없이 정면에서 찍으면 더 정확해요.</li>
            <li>· 추천 루틴은 운동 참고용이며 의료 조언이 아니에요.</li>
          </ul>
        </section>
      )}

      {step === "confirm" && (
        <section>
          <div className="-mx-4 bg-night px-4 pb-5 pt-1 text-white">
            <Steps step={step} />
            <h2 className="mt-4 text-2xl font-black italic">수치를 확인해 주세요</h2>
            <p className="mt-1 text-sm text-night-sub">
              결과지와 다른 값이 있으면 고쳐 주세요. 읽지 못한 칸은 비어 있어요.
            </p>
            <SexPicker sex={sex} onChange={setSex} dark />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {FIELDS.map((f) => {
              const empty = inputs[f.key] === "";
              return (
                <div key={f.key}>
                  <label htmlFor={`field-${f.key}`} className="mb-1 block text-sm font-medium">
                    {f.label}
                    {f.unit && <span className="ml-1 text-xs text-sub">({f.unit})</span>}
                    {empty && <span className="ml-1 text-xs font-bold text-accent-strong">못 읽음</span>}
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
                    className={`h-12 w-full rounded-lg border px-3 text-base font-bold outline-none focus:border-accent ${
                      empty ? "border-dashed border-accent bg-accent-bg" : "border-line bg-white"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {consistencyWarnings(toMeasurements(inputs)).map((w) => (
            <p key={w} className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {w}
            </p>
          ))}

          {errorBox}

          <button
            type="button"
            onClick={() => void recommend()}
            className="mt-5 h-14 w-full rounded-lg bg-accent text-lg font-black italic text-on-accent hover:bg-accent-hover"
          >
            이 수치로 루틴 받기
          </button>
          <button type="button" onClick={restart} className="mt-2 h-11 w-full rounded-lg text-sm text-sub hover:bg-surface">
            사진 다시 올리기
          </button>
        </section>
      )}

      {step === "result" && result && (
        <RoutineResult
          result={result.data}
          sex={result.sex}
          values={result.values}
          onEdit={() => {
            setStep("confirm");
            window.scrollTo({ top: 0 });
          }}
          onRestart={restart}
        />
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
    <ol className="grid grid-cols-3 gap-1.5 text-xs" aria-label="진행 단계">
      {items.map((item, i) => (
        <li key={item.id} aria-current={i === current ? "step" : undefined}>
          <span className={`block h-1 rounded-full ${i <= current ? "bg-accent" : "bg-night-line"}`} />
          <span className={`mt-1 block ${i === current ? "font-bold text-white" : "text-night-sub"}`}>
            {i + 1}. {item.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function SexPicker({ sex, onChange, dark = false }: { sex: Sex | null; onChange: (s: Sex) => void; dark?: boolean }) {
  return (
    <fieldset className="mt-5">
      <legend className="mb-1 text-sm font-medium">
        성별 <span className={`text-xs ${dark ? "text-night-sub" : "text-sub"}`}>(체지방률 표준 범위가 달라요)</span>
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
            className={`h-11 rounded-lg border text-sm font-bold transition-colors ${
              sex === value
                ? "border-accent bg-accent text-on-accent"
                : dark
                  ? "border-night-line text-white hover:border-accent"
                  : "border-line hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

// 모델이 "12~15"나 "12~15회"를 섞어 보내므로, 단위를 한 번만 붙인다.
function formatReps(reps: string): string {
  return `${reps.trim().replace(/\s*회$/, "")}회`;
}

const LEVEL_TEXT: Record<Level, string> = {
  높음: "text-accent",
  낮음: "text-sky-300",
  표준: "text-white",
  "알 수 없음": "text-night-sub",
};

// 내 수치가 표준 범위(가운데 밝은 칸)의 어디쯤인지 보여주는 막대
function Gauge({
  label,
  level,
  value,
  unit,
  min,
  max,
  bandFrom,
  bandTo,
  note,
}: {
  label: string;
  level: Level;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  bandFrom: number;
  bandTo: number;
  note: string;
}) {
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-sm">
          {value != null && (
            <span className="mr-1.5 font-black italic">
              {value}
              {unit}
            </span>
          )}
          <b className={LEVEL_TEXT[level]}>{level}</b>
        </p>
      </div>
      <div className="relative mt-1.5 h-2.5 rounded-full bg-night-2" role="img" aria-label={`${label} ${level}. ${note}`}>
        <div
          className="absolute inset-y-0 rounded-full bg-night-line"
          style={{ left: `${pct(bandFrom)}%`, width: `${pct(bandTo) - pct(bandFrom)}%` }}
        />
        {value != null && (
          <div
            className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-night ${
              level === "표준" ? "bg-white" : "bg-accent"
            }`}
            style={{ left: `${pct(value)}%` }}
          />
        )}
      </div>
      <p className="mt-1 text-xs text-night-sub">{note}</p>
    </div>
  );
}

function RoutineResult({
  result,
  sex,
  values,
  onEdit,
  onRestart,
}: {
  result: RecommendResponse;
  sex: Sex;
  values: Measurements;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const { assessment: a, routine } = result;
  const [day, setDay] = useState(0);
  const [lo, hi] = fatRange(sex);
  const ratioMin = muscleRatioMin(sex);
  const ratio =
    values.weight_kg && values.skeletal_muscle_kg
      ? Math.round((values.skeletal_muscle_kg / values.weight_kg) * 1000) / 10
      : null;
  const current = routine.days[Math.min(day, routine.days.length - 1)];

  return (
    <section>
      <div className="-mx-4 bg-night px-4 pb-5 pt-1 text-white">
        <Steps step="result" />
        <p className="mt-4 text-sm font-bold italic text-accent">이번 목표</p>
        <h2 className="text-2xl font-black italic">{a.goal}</h2>

        <div className="mt-4 space-y-4">
          <Gauge
            label="체지방률"
            level={a.fat}
            value={values.body_fat_pct}
            unit="%"
            min={0}
            max={hi + 20}
            bandFrom={lo}
            bandTo={hi}
            note={`${sex === "M" ? "남성" : "여성"} 표준 ${lo}~${hi}%`}
          />
          <Gauge
            label="근육량"
            level={a.muscle}
            value={ratio}
            unit="%"
            min={ratioMin - 15}
            max={ratioMin + 15}
            bandFrom={ratioMin}
            bandTo={ratioMin + 15}
            note={`골격근량 ÷ 체중. ${ratioMin}% 이상이면 표준`}
          />
        </div>

        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {(
            [
              ["BMI", a.bmi],
              ["복부지방률", a.whr],
            ] as const
          ).map(([label, level]) => (
            <li key={label} className="rounded-full border border-night-line px-3 py-1">
              {label} <b className={LEVEL_TEXT[level]}>{level}</b>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-night-sub">{routine.summary}</p>
      </div>

      <div role="tablist" aria-label="요일" className="sticky top-14 z-10 -mx-4 flex border-b border-line bg-white px-4">
        {routine.days.map((d, i) => (
          <button
            key={d.title}
            type="button"
            role="tab"
            aria-selected={i === day}
            onClick={() => setDay(i)}
            className={`-mb-px h-12 flex-1 border-b-2 text-[15px] transition-colors ${
              i === day ? "border-ink font-black italic text-ink" : "border-transparent text-sub"
            }`}
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      {current && (
        <div role="tabpanel" className="pt-4">
          <h3 className="font-black italic">{current.title}</h3>
          <ul className="mt-3 space-y-2.5">
            {current.exercises.map((ex, i) => {
              const equipment = getEquipmentById(ex.id)!;
              return (
                <li key={`${ex.id}-${i}`} className="rounded-lg border border-line p-2.5">
                  <Link href={`/equipment/${equipment.slug}`} className="flex items-center gap-3">
                    <EquipmentImage
                      equipment={equipment}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line"
                      sizes="56px"
                      fit="cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{equipment.nameKo}</p>
                      <p className="font-black italic text-accent-strong">
                        {ex.sets}세트 × {formatReps(ex.reps)}
                      </p>
                    </div>
                    <span aria-hidden className="text-sub">
                      ›
                    </span>
                  </Link>
                  <p className="mt-2 text-sm text-sub">{ex.reason}</p>
                  <Link
                    href={`/logs?equipment=${equipment.id}`}
                    className="mt-2 flex h-11 items-center justify-center rounded-md bg-night text-sm font-black italic text-white hover:bg-night-2"
                  >
                    + 기록
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {routine.cardio_note && (
        <div className="mt-4 rounded-lg bg-accent-bg p-4">
          <p className="text-sm font-bold text-accent-strong">유산소</p>
          <p className="mt-1 text-sm">{routine.cardio_note}</p>
        </div>
      )}
      {routine.caution && (
        <div className="mt-3 flex gap-3 rounded-lg bg-night p-4 text-white">
          <span aria-hidden className="font-black text-accent">
            !
          </span>
          <div>
            <p className="text-sm font-bold">주의할 점</p>
            <p className="mt-1 text-sm text-night-sub">{routine.caution}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-sub">
        이 루틴은 운동 참고용이며 의료 조언이 아니에요. 통증이나 질환이 있으면 전문가와 상의해 주세요.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onEdit} className="h-11 rounded-lg border border-line text-sm font-bold hover:bg-surface">
          수치 고치기
        </button>
        <button type="button" onClick={onRestart} className="h-11 rounded-lg border border-line text-sm font-bold hover:bg-surface">
          처음부터 하기
        </button>
      </div>
    </section>
  );
}
