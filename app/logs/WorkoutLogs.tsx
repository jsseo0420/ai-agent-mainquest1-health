"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import LogSheet, { byNewest, formatDate, today, toKey, WEEKDAYS } from "@/components/LogSheet";
import { getEquipmentById } from "@/data/equipment";
import {
  deleteWorkoutLog,
  useWorkoutLogs,
  type WorkoutLog,
} from "@/lib/storage/logs";

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
