// LLM이 낸 루틴에서 헬스도감에 없는 운동을 지운다. 프롬프트로 막아도 한 번 더 코드로 검사한다.
import { getEquipmentById } from "@/data/equipment";
import type { Routine } from "./types";

export function filterRoutine(routine: Routine): { routine: Routine; removed: string[] } {
  const removed: string[] = [];
  const days = routine.days.map((day) => ({
    ...day,
    exercises: day.exercises.filter((ex) => {
      const known = Boolean(getEquipmentById(ex.id));
      if (!known) removed.push(ex.id);
      return known;
    }),
  }));
  return { routine: { ...routine, days: days.filter((d) => d.exercises.length > 0) }, removed };
}
