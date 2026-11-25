// 오늘의 루틴: 고른 부위, 목표, 운동 시간, 내 운동 기록·즐겨찾기로 도감 운동을 골라 순서와 세트를 정한다.
// LLM 없이 코드 규칙만 쓰므로 무료이고 바로 나온다. 같은 조건과 seed면 항상 같은 루틴이 나온다.
import { equipmentList, type Equipment } from "@/data/equipment";
import { getMuscle, muscleGroups, type MuscleGroupId } from "@/data/muscles";

export type Goal = "muscle" | "fatloss" | "maintain";
export type Minutes = 30 | 45 | 60;

export const goals: { id: Goal; name: string }[] = [
  { id: "muscle", name: "근육 키우기" },
  { id: "fatloss", name: "체지방 감량" },
  { id: "maintain", name: "체력 유지" },
];
export const minutesOptions: Minutes[] = [30, 45, 60];

// 결과지 루틴 규칙(lib/routine/prompts.ts 5번)과 같은 기준
const PLAN: Record<Goal, { sets: number; reps: string; repsLow: number; rest: string }> = {
  muscle: { sets: 3, reps: "8~12", repsLow: 8, rest: "세트 사이 1~2분 쉬어요" },
  fatloss: { sets: 3, reps: "12~15", repsLow: 12, rest: "세트 사이 30~60초로 짧게 쉬어요" },
  maintain: { sets: 3, reps: "10~12", repsLow: 10, rest: "세트 사이 1분쯤 쉬어요" },
};
const COUNT: Record<Minutes, number> = { 30: 3, 45: 4, 60: 5 };

export type LogLike = { equipmentId: string; date: string; weightKg: number; reps: number; sets: number; createdAt: string };

export type TodayItem = {
  equipment: Equipment;
  group: MuscleGroupId;
  sets: number;
  reps: string;
  repsLow: number;
  // 고른 이유 (화면에 한 줄로 보여준다)
  reason: string;
  last?: LogLike;
  // 보조근으로만 그 부위를 쓰는 운동이면 true
  secondary: boolean;
};

export type TodayRoutine = {
  items: TodayItem[];
  rest: string;
  cardio?: string;
  // 도감에 그 부위 운동이 모자라 목표 개수를 못 채웠을 때 부위 이름들
  short: string[];
};

export type TodayInput = {
  groups: MuscleGroupId[];
  goal: Goal;
  minutes: Minutes;
  logs: LogLike[];
  favoriteIds: string[];
  seed: number;
  today: string; // YYYY-MM-DD
};

// 작고 빠른 seed 난수 (mulberry32). 같은 seed면 같은 순서가 나와 새로고침해도 루틴이 바뀌지 않는다.
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

const primaryGroups = (e: Equipment) => new Set(e.primaryMuscles.map((m) => getMuscle(m).group));
const secondaryGroups = (e: Equipment) => new Set(e.secondaryMuscles.map((m) => getMuscle(m).group));

type Candidate = { equipment: Equipment; group: MuscleGroupId; secondary: boolean; score: number; last?: LogLike };

// 한 부위의 후보를 점수순으로 돌려준다. 주동근 운동이 먼저, 모자라면 보조근 운동까지.
function candidatesFor(group: MuscleGroupId, input: TodayInput, rand: () => number): Candidate[] {
  const lastById = new Map<string, LogLike>();
  for (const l of [...input.logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) lastById.set(l.equipmentId, l);
  const fav = new Set(input.favoriteIds);

  const score = (e: Equipment, secondary: boolean) => {
    const last = lastById.get(e.id);
    let s = rand() * 0.9; // 같은 점수끼리 섞이도록
    if (fav.has(e.id)) s += 3;
    if (!last) s += 1;
    else {
      const ago = daysBetween(last.date, input.today);
      if (ago <= 1) s -= 3; // 어제·오늘 한 운동은 쉬게 한다
      else if (ago >= 7) s += 1.5; // 오래 안 한 운동을 다시 넣는다
    }
    if (secondary) s -= 5;
    // 근육 키우기는 여러 근육을 함께 쓰는 운동(큰 운동)을 조금 더 앞에 둔다
    if (input.goal === "muscle") s += (e.primaryMuscles.length + e.secondaryMuscles.length) * 0.2;
    return { s, last };
  };

  const list: Candidate[] = [];
  for (const e of equipmentList) {
    const primary = primaryGroups(e).has(group);
    const secondary = !primary && secondaryGroups(e).has(group);
    if (!primary && !secondary) continue;
    const { s, last } = score(e, secondary);
    list.push({ equipment: e, group, secondary, score: s, last });
  }
  return list.sort((a, b) => b.score - a.score);
}

// 받침이 있으면 "을", 없으면 "를" (예: 가슴을, 어깨를)
function eulReul(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? "을" : "를";
}

function reasonOf(c: Candidate, input: TodayInput): string {
  const groupName = muscleGroups.find((g) => g.id === c.group)!.name;
  if (input.favoriteIds.includes(c.equipment.id)) return "즐겨찾기한 기구예요";
  if (c.secondary) return `${groupName}${eulReul(groupName)} 보조로 함께 쓰는 운동이에요`;
  if (!c.last) return `${groupName} 운동 중 아직 기록이 없는 기구예요`;
  const ago = daysBetween(c.last.date, input.today);
  if (ago >= 7) return `${ago}일 동안 안 한 운동이에요`;
  return `${groupName}${eulReul(groupName)} 주로 쓰는 운동이에요`;
}

function toItem(c: Candidate, input: TodayInput): TodayItem {
  const plan = PLAN[input.goal];
  return {
    equipment: c.equipment,
    group: c.group,
    sets: plan.sets,
    reps: plan.reps,
    repsLow: plan.repsLow,
    reason: reasonOf(c, input),
    last: c.last,
    secondary: c.secondary,
  };
}

export function generateToday(input: TodayInput): TodayRoutine {
  const rand = random(input.seed);
  const groups = muscleGroups.map((g) => g.id).filter((g) => input.groups.includes(g));
  const target = COUNT[input.minutes];
  const pools = new Map(groups.map((g) => [g, candidatesFor(g, input, rand)]));
  const chosen: Candidate[] = [];
  const used = new Set<string>();

  // 부위를 돌아가며 하나씩 뽑아 고르게 나눈다. 한 기구가 여러 부위 후보에 있어도 한 번만 넣는다.
  let progressed = true;
  while (chosen.length < target && progressed) {
    progressed = false;
    for (const g of groups) {
      if (chosen.length >= target) break;
      const next = pools.get(g)!.find((c) => !used.has(c.equipment.id));
      if (!next) continue;
      chosen.push(next);
      used.add(next.equipment.id);
      progressed = true;
    }
  }

  // 큰 운동(쓰는 근육이 많은 운동)을 먼저, 보조근 운동은 뒤로
  chosen.sort(
    (a, b) =>
      Number(a.secondary) - Number(b.secondary) ||
      b.equipment.primaryMuscles.length + b.equipment.secondaryMuscles.length -
        (a.equipment.primaryMuscles.length + a.equipment.secondaryMuscles.length),
  );

  const short = groups
    .filter((g) => (pools.get(g) ?? []).filter((c) => !c.secondary).length < 2)
    .map((g) => muscleGroups.find((m) => m.id === g)!.name);

  return {
    items: chosen.map((c) => toItem(c, input)),
    rest: PLAN[input.goal].rest,
    cardio: input.goal === "fatloss" ? "근력 운동이 끝나면 빠르게 걷기나 자전거 같은 유산소를 20~30분 해 보세요." : undefined,
    short,
  };
}

// 운동 하나 바꾸기: 같은 부위의 후보 중 지금 루틴에 없는 다음 운동. 없으면 null.
export function swapCandidate(input: TodayInput, current: TodayItem[], index: number, skip: string[]): TodayItem | null {
  const target = current[index];
  const inUse = new Set([...current.map((i) => i.equipment.id), ...skip]);
  const next = candidatesFor(target.group, input, random(input.seed + 7919)).find((c) => !inUse.has(c.equipment.id));
  return next ? toItem(next, input) : null;
}
