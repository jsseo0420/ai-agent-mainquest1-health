export type MuscleGroupId = "chest" | "shoulders" | "back" | "arms" | "abs" | "legs";

export type MuscleId =
  | "chest"
  | "front-delt"
  | "side-delt"
  | "rear-delt"
  | "traps"
  | "lats"
  | "erectors"
  | "biceps"
  | "triceps"
  | "abs"
  | "quads"
  | "adductors"
  | "glutes"
  | "hamstrings"
  | "calves";

export type BodyView = "front" | "back";

export type Muscle = {
  id: MuscleId;
  name: string;
  group: MuscleGroupId;
  view: BodyView;
};

export const muscleGroups: { id: MuscleGroupId; name: string }[] = [
  { id: "chest", name: "가슴" },
  { id: "back", name: "등" },
  { id: "shoulders", name: "어깨" },
  { id: "arms", name: "팔" },
  { id: "abs", name: "복근" },
  { id: "legs", name: "하체" },
];

export const muscles: Muscle[] = [
  { id: "chest", name: "대흉근", group: "chest", view: "front" },
  { id: "front-delt", name: "전면 삼각근", group: "shoulders", view: "front" },
  { id: "side-delt", name: "측면 삼각근", group: "shoulders", view: "front" },
  { id: "biceps", name: "이두근", group: "arms", view: "front" },
  { id: "abs", name: "복직근", group: "abs", view: "front" },
  { id: "quads", name: "대퇴사두근", group: "legs", view: "front" },
  { id: "adductors", name: "내전근", group: "legs", view: "front" },
  { id: "traps", name: "승모근", group: "back", view: "back" },
  { id: "rear-delt", name: "후면 삼각근", group: "shoulders", view: "back" },
  { id: "lats", name: "광배근", group: "back", view: "back" },
  { id: "erectors", name: "척추기립근", group: "back", view: "back" },
  { id: "triceps", name: "삼두근", group: "arms", view: "back" },
  { id: "glutes", name: "둔근", group: "legs", view: "back" },
  { id: "hamstrings", name: "햄스트링", group: "legs", view: "back" },
  { id: "calves", name: "종아리", group: "legs", view: "back" },
];

const muscleById = new Map(muscles.map((m) => [m.id, m]));

export function getMuscle(id: MuscleId): Muscle {
  return muscleById.get(id)!;
}

export function isMuscleId(value: string): value is MuscleId {
  return muscleById.has(value as MuscleId);
}

export function isMuscleGroupId(value: string): value is MuscleGroupId {
  return muscleGroups.some((g) => g.id === value);
}
