"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { equipmentList, getEquipmentById } from "@/data/equipment";
import {
  addWorkoutLog,
  deleteWorkoutLog,
  useWorkoutLogs,
  type WorkoutLog,
} from "@/lib/storage/logs";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function today(): string {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
}

function byNewest(a: WorkoutLog, b: WorkoutLog) {
  return b.createdAt.localeCompare(a.createdAt);
}

export default function WorkoutLogs() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get("equipment");
  const preset = presetId ? getEquipmentById(presetId) : undefined;

  const { logs, loading } = useWorkoutLogs();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  // 기구 상세의 "+ 기록 추가"로 들어오면 그 기구가 선택된 입력 창을 바로 연다.
  const [sheet, setSheet] = useState<{ equipmentId: string } | null>(preset ? { equipmentId: preset.id } : null);

  const loggedDates = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);
  const dayLogs = logs.filter((l) => l.date === selected).sort(byNewest);

  return (
    <>
      <MonthCalendar
        year={month.y}
        month={month.m}
        selected={selected}
        loggedDates={loggedDates}
        onSelect={setSelected}
        onMonth={(delta) =>
          setMonth(({ y, m }) => {
            const d = new Date(y, m + delta, 1);
            return { y: d.getFullYear(), m: d.getMonth() };
          })
        }
      />

      <section aria-live="polite" className="pt-4">
        <h2 className="font-black italic">
          {formatDate(selected)}
          {selected === today() && <span className="ml-1 text-accent-strong">오늘</span>}
          {!loading && <span className="ml-2 text-sm font-normal not-italic text-sub">{dayLogs.length}개</span>}
        </h2>

        {loading ? (
          <p className="py-8 text-center text-sub">불러오는 중…</p>
        ) : dayLogs.length > 0 ? (
          <ul className="mt-2 grid gap-2">
            {dayLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-sub">
            {logs.length === 0 ? "아직 운동 기록이 없어요. 오늘 한 운동을 기록해 보세요." : "이 날은 기록이 없어요."}
          </p>
        )}

        <button
          type="button"
          onClick={() => setSheet({ equipmentId: "" })}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border-2 border-dashed border-line font-bold text-sub hover:border-accent hover:text-accent-strong"
        >
          + 이 날짜에 기록 추가
        </button>
      </section>

      {sheet && (
        <LogSheet
          key={sheet.equipmentId || "new"}
          initialEquipmentId={sheet.equipmentId}
          date={sheet.equipmentId && preset ? today() : selected}
          logs={logs}
          onClose={() => setSheet(null)}
          onSaved={(date) => {
            setSheet(null);
            setSelected(date);
            const [y, m] = date.split("-").map(Number);
            setMonth({ y, m: m - 1 });
          }}
        />
      )}
    </>
  );
}

// 한 달 달력. 운동한 날은 점, 고른 날은 오렌지 레드, 오늘은 테두리로 표시한다.
function MonthCalendar({
  year,
  month,
  selected,
  loggedDates,
  onSelect,
  onMonth,
}: {
  year: number;
  month: number;
  selected: string;
  loggedDates: Set<string>;
  onSelect: (date: string) => void;
  onMonth: (delta: number) => void;
}) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const todayKey = today();

  return (
    <div className="-mx-4 bg-night px-4 pb-4 pt-1 text-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonth(-1)}
          aria-label="이전 달"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-night-2"
        >
          ‹
        </button>
        <p className="font-black italic">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={() => onMonth(1)}
          aria-label="다음 달"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-night-2"
        >
          ›
        </button>
      </div>

      <div className="mt-1 grid grid-cols-7 text-center text-xs text-night-sub" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div role="grid" aria-label={`${year}년 ${month + 1}월 운동 달력`} className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const key = toKey(year, month, day);
          const isSelected = key === selected;
          const logged = loggedDates.has(key);
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${month + 1}월 ${day}일${logged ? ", 운동함" : ""}`}
              onClick={() => onSelect(key)}
              className={`mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-md text-sm transition-colors ${
                isSelected
                  ? "bg-accent font-black text-on-accent"
                  : key === todayKey
                    ? "border border-night-line font-bold"
                    : logged
                      ? "font-bold"
                      : "text-night-sub"
              } ${isSelected ? "" : "hover:bg-night-2"}`}
            >
              {day}
              <span
                aria-hidden
                className={`mt-0.5 h-1 w-1 rounded-full ${logged ? (isSelected ? "bg-on-accent" : "bg-accent") : ""}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LogItem({ log }: { log: WorkoutLog }) {
  const equipment = getEquipmentById(log.equipmentId);
  const [error, setError] = useState<string | null>(null);
  return (
    <li className="flex items-start gap-3 rounded-lg border border-line p-3">
      <div className="min-w-0 flex-1">
        {equipment ? (
          <Link href={`/equipment/${equipment.slug}`} className="font-bold hover:underline">
            {equipment.nameKo}
          </Link>
        ) : (
          <p className="font-bold text-sub">삭제된 기구</p>
        )}
        <p className="mt-0.5 font-bold italic text-accent-strong">
          {log.weightKg}kg × {log.reps}회 × {log.sets}세트
        </p>
        {log.memo && <p className="mt-1 text-sm text-sub">{log.memo}</p>}
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={async () => {
          if (window.confirm("이 기록을 삭제할까요?")) setError(await deleteWorkoutLog(log.id));
        }}
        className="h-11 shrink-0 rounded-md px-3 text-sm text-sub hover:bg-surface hover:text-red-600"
      >
        삭제
      </button>
    </li>
  );
}

type Errors = Partial<Record<"equipment" | "weight" | "reps" | "sets", string>>;

// 아래에서 올라오는 빠른 입력 창. 지난번 기록을 불러오고 −/+ 버튼으로 값을 바꾼다.
function LogSheet({
  initialEquipmentId,
  date: initialDate,
  logs,
  onClose,
  onSaved,
}: {
  initialEquipmentId: string;
  date: string;
  logs: WorkoutLog[];
  onClose: () => void;
  onSaved: (date: string) => void;
}) {
  const [equipmentId, setEquipmentId] = useState(initialEquipmentId);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("10");
  const [sets, setSets] = useState("3");
  const [date, setDate] = useState(initialDate);
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // 부모가 다시 그려져도 창을 연 순간 한 번만 포커스·스크롤 잠금을 걸도록 최신 onClose를 ref로 들고 있는다.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  const last = equipmentId ? logs.filter((l) => l.equipmentId === equipmentId).sort(byNewest)[0] : undefined;

  useEffect(() => {
    titleRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const w = Number(weight);
    const r = Number(reps);
    const s = Number(sets);

    const next: Errors = {};
    if (!getEquipmentById(equipmentId)) next.equipment = "기구를 선택해 주세요.";
    if (!weight || !Number.isFinite(w) || w <= 0) next.weight = "무게를 0보다 크게 입력해 주세요.";
    else if (w >= 10000) next.weight = "무게가 너무 커요.";
    if (!Number.isInteger(r) || r <= 0) next.reps = "횟수는 1 이상 정수로 입력해 주세요.";
    if (!Number.isInteger(s) || s <= 0) next.sets = "세트는 1 이상 정수로 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const error = await addWorkoutLog({
      equipmentId,
      date: date || today(),
      weightKg: w,
      reps: r,
      sets: s,
      memo: memo.trim() || undefined,
    });
    setSaving(false);
    setSaveError(error);
    if (!error) onSaved(date || today());
  }

  const inputClass =
    "h-12 w-full rounded-lg border border-line bg-white px-3 text-base outline-none focus:border-accent aria-[invalid=true]:border-red-400";

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-sheet-title"
        className="relative mx-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 id="log-sheet-title" ref={titleRef} tabIndex={-1} className="text-lg font-black italic outline-none">
            기록 추가
          </h2>
          <button type="button" onClick={onClose} className="h-11 px-2 text-sm text-sub">
            닫기
          </button>
        </div>

        <div className="mt-2 space-y-3">
          <Field label="기구" htmlFor="log-equipment" error={errors.equipment}>
            <select
              id="log-equipment"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              aria-invalid={Boolean(errors.equipment)}
              className={`${inputClass} font-bold`}
            >
              <option value="">기구를 선택하세요</option>
              {equipmentList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nameKo}
                </option>
              ))}
            </select>
          </Field>

          {last && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-accent-bg px-3 py-1 text-sm text-accent-strong">
              <span className="min-w-0">
                지난번 {formatDate(last.date)}: {last.weightKg}kg × {last.reps}회 × {last.sets}세트
              </span>
              <button
                type="button"
                onClick={() => {
                  setWeight(String(last.weightKg));
                  setReps(String(last.reps));
                  setSets(String(last.sets));
                }}
                className="h-11 shrink-0 font-bold underline underline-offset-2"
              >
                불러오기
              </button>
            </div>
          )}

          <Stepper label="무게 (kg)" id="log-weight" value={weight} onChange={setWeight} step={2.5} decimal error={errors.weight} />
          <div className="grid grid-cols-2 gap-2">
            <Stepper label="횟수" id="log-reps" value={reps} onChange={setReps} step={1} error={errors.reps} />
            <Stepper label="세트" id="log-sets" value={sets} onChange={setSets} step={1} error={errors.sets} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="날짜" htmlFor="log-date">
              <input id="log-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="메모 (선택)" htmlFor="log-memo">
              <input
                id="log-memo"
                type="text"
                maxLength={100}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 마지막 세트 힘듦"
                className={inputClass}
              />
            </Field>
          </div>

          {saveError && (
            <p role="alert" className="text-sm text-red-600">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-14 w-full rounded-lg bg-accent text-lg font-black italic text-on-accent hover:bg-accent-hover disabled:opacity-60"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

// −/+ 버튼이 달린 숫자 입력. 직접 입력도 된다.
function Stepper({
  label,
  id,
  value,
  onChange,
  step,
  decimal = false,
  error,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  step: number;
  decimal?: boolean;
  error?: string;
}) {
  function bump(delta: number) {
    const n = Number(value) || 0;
    const next = Math.max(0, Math.round((n + delta) * 10) / 10);
    onChange(next === 0 ? "" : String(next));
  }
  return (
    <Field label={label} htmlFor={id} error={error}>
      <div
        className={`flex h-12 items-center rounded-lg border bg-white ${error ? "border-red-400" : "border-line"} focus-within:border-accent`}
      >
        <button
          type="button"
          onClick={() => bump(-step)}
          aria-label={`${label} ${step} 줄이기`}
          className="h-full w-12 shrink-0 text-xl font-bold text-sub hover:text-ink"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          min="0"
          step={decimal ? "0.5" : "1"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          placeholder="0"
          className="h-full min-w-0 flex-1 bg-transparent text-center text-lg font-black outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => bump(step)}
          aria-label={`${label} ${step} 늘리기`}
          className="h-full w-12 shrink-0 text-xl font-bold text-sub hover:text-ink"
        >
          +
        </button>
      </div>
    </Field>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-sub">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
