// 체성분 수치·판정·루틴의 타입과 필드 정의. 브라우저와 서버가 함께 쓴다.

export type Sex = "M" | "F";

export const FIELDS = [
  { key: "weight_kg", label: "체중", unit: "kg", decimals: 1 },
  { key: "skeletal_muscle_kg", label: "골격근량", unit: "kg", decimals: 1 },
  { key: "body_fat_kg", label: "체지방량", unit: "kg", decimals: 1 },
  { key: "body_fat_pct", label: "체지방률", unit: "%", decimals: 1 },
  { key: "bmi", label: "BMI", unit: "kg/m²", decimals: 1 },
  { key: "bmr_kcal", label: "기초대사량", unit: "kcal", decimals: 0 },
  { key: "score", label: "체성분 점수", unit: "점", decimals: 0 },
  { key: "whr", label: "복부지방률", unit: "", decimals: 2 },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];
export type Measurements = Record<FieldKey, number | null>;

export type Level = "낮음" | "표준" | "높음" | "알 수 없음";

export type Assessment = {
  fat: Level;
  muscle: Level;
  bmi: Level;
  whr: Level;
  goal: string;
};

export type RoutineExercise = {
  id: string;
  sets: number;
  reps: string;
  reason: string;
};

export type RoutineDay = {
  title: string;
  exercises: RoutineExercise[];
};

export type Routine = {
  summary: string;
  days: RoutineDay[];
  cardio_note: string;
  caution: string;
};

export type RecommendResponse = {
  assessment: Assessment;
  routine: Routine;
  // 도감에 없어 지운 운동 ID
  removed: string[];
  // 실제로 답한 Gemini 모델 (기본 모델이 바쁘면 대체 모델)
  model: string;
};

export function emptyMeasurements(): Measurements {
  return Object.fromEntries(FIELDS.map((f) => [f.key, null])) as Measurements;
}
