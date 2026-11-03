"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { equipmentList, getEquipmentById } from "@/data/equipment";
import {
  addWorkoutLog,
  deleteWorkoutLog,
  useWorkoutLogs,
  type WorkoutLog,
} from "@/lib/storage/logs";

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일 (${weekday})`;
}

function groupByDate(logs: WorkoutLog[]): [string, WorkoutLog[]][] {
  const groups = new Map<string, WorkoutLog[]>();
  for (const log of logs) {
    groups.set(log.date, [...(groups.get(log.date) ?? []), log]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => [date, items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))]);
}

export default function WorkoutLogs() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get("equipment");
  const preset = presetId ? getEquipmentById(presetId) : undefined;

  const { logs, loading } = useWorkoutLogs();
  const [formOpen, setFormOpen] = useState(Boolean(preset));

  return (
    <>
      {formOpen ? (
        <LogForm
          key={preset?.id ?? "new"}
          initialEquipmentId={preset?.id ?? ""}
          onDone={() => setFormOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-4 h-12 w-full rounded-2xl bg-accent font-semibold text-white hover:bg-accent-strong"
        >
          + 운동 기록 추가
        </button>
      )}

      {loading ? (
        <p className="py-12 text-center text-sub">불러오는 중…</p>
      ) : logs.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-surface px-4 py-12 text-center">
          <p className="font-semibold">아직 운동 기록이 없어요</p>
          <p className="mt-1 text-sm text-sub">오늘 한 운동을 기록해 보세요.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groupByDate(logs).map(([date, items]) => (
            <section key={date} aria-label={formatDate(date)}>
              <h2 className="text-sm font-bold text-sub">{formatDate(date)}</h2>
              <ul className="mt-2 grid gap-2">
                {items.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function LogItem({ log }: { log: WorkoutLog }) {
  const equipment = getEquipmentById(log.equipmentId);
  const [error, setError] = useState<string | null>(null);
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-line p-3">
      <div className="min-w-0 flex-1">
        {equipment ? (
          <Link href={`/equipment/${equipment.slug}`} className="font-semibold hover:underline">
            {equipment.nameKo}
          </Link>
        ) : (
          <p className="font-semibold text-sub">삭제된 기구</p>
        )}
        <p className="mt-0.5 text-accent-strong">
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
        className="h-11 shrink-0 rounded-xl px-3 text-sm text-sub hover:bg-surface hover:text-red-600"
      >
        삭제
      </button>
    </li>
  );
}

type Errors = Partial<Record<"equipment" | "weight" | "reps" | "sets", string>>;

function LogForm({
  initialEquipmentId,
  onDone,
}: {
  initialEquipmentId: string;
  onDone: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const equipmentId = String(form.get("equipment") ?? "");
    const weight = Number(form.get("weight"));
    const reps = Number(form.get("reps"));
    const sets = Number(form.get("sets"));
    const date = String(form.get("date") || today());
    const memo = String(form.get("memo") ?? "").trim();

    const next: Errors = {};
    if (!getEquipmentById(equipmentId)) next.equipment = "기구를 선택해 주세요.";
    if (!Number.isFinite(weight) || weight <= 0) next.weight = "0보다 커야 해요";
    else if (weight >= 10000) next.weight = "너무 커요";
    if (!Number.isInteger(reps) || reps <= 0) next.reps = "1 이상 정수";
    if (!Number.isInteger(sets) || sets <= 0) next.sets = "1 이상 정수";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const error = await addWorkoutLog({
      equipmentId,
      date,
      weightKg: weight,
      reps,
      sets,
      memo: memo || undefined,
    });
    setSaving(false);
    setSaveError(error);
    if (!error) onDone();
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-accent aria-[invalid=true]:border-red-400";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-4 space-y-3 rounded-2xl border border-line bg-surface p-4"
      aria-label="운동 기록 추가"
    >
      <Field label="기구" htmlFor="log-equipment" error={errors.equipment}>
        <select
          id="log-equipment"
          name="equipment"
          defaultValue={initialEquipmentId}
          aria-invalid={Boolean(errors.equipment)}
          className={inputClass}
        >
          <option value="">기구를 선택하세요</option>
          {equipmentList.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nameKo}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-3 gap-2">
        <Field label="무게 (kg)" htmlFor="log-weight" error={errors.weight}>
          <input id="log-weight" name="weight" type="number" inputMode="decimal" min="0" step="0.5" aria-invalid={Boolean(errors.weight)} className={inputClass} />
        </Field>
        <Field label="횟수" htmlFor="log-reps" error={errors.reps}>
          <input id="log-reps" name="reps" type="number" inputMode="numeric" min="1" step="1" aria-invalid={Boolean(errors.reps)} className={inputClass} />
        </Field>
        <Field label="세트" htmlFor="log-sets" error={errors.sets}>
          <input id="log-sets" name="sets" type="number" inputMode="numeric" min="1" step="1" aria-invalid={Boolean(errors.sets)} className={inputClass} />
        </Field>
      </div>

      <Field label="날짜" htmlFor="log-date">
        <input id="log-date" name="date" type="date" defaultValue={today()} className={inputClass} />
      </Field>

      <Field label="메모 (선택)" htmlFor="log-memo">
        <input id="log-memo" name="memo" type="text" maxLength={100} placeholder="예: 마지막 세트 힘들었음" className={inputClass} />
      </Field>

      {saveError && (
        <p role="alert" className="text-sm text-red-600">
          {saveError}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="h-12 flex-1 rounded-xl border border-line bg-white font-semibold hover:bg-surface"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-12 flex-[2] rounded-xl bg-accent font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
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
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
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
