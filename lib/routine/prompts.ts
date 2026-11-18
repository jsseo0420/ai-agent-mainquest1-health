// Gemini에 보내는 프롬프트와 JSON 스키마. PoC 노트북(notebooks/poc.ipynb, notebooks/routine.ipynb)과 같은 내용이다.
import { equipmentList, equipmentTypeName } from "@/data/equipment";
import { getMuscle, type MuscleId } from "@/data/muscles";
import { FIELDS, type Assessment, type Measurements, type Sex } from "./types";

export const EXTRACT_PROMPT = `이 이미지는 체성분 분석 결과지 사진이다. 아래 8개 항목의 '측정치'만 숫자로 추출해라.

- weight_kg: 체중 (kg)
- skeletal_muscle_kg: 골격근량 (kg)
- body_fat_kg: 체지방량 (kg)
- body_fat_pct: 체지방률 (%)
- bmi: BMI
- bmr_kcal: 기초대사량 (kcal, 정수)
- score: 체성분 점수 (100점 만점 중 점수, 정수)
- whr: 복부지방률 (소수 둘째 자리)

규칙:
- 표준범위, 그래프 눈금, 적정체중, 체중·지방·근육 조절값, 기초대사량의 (표준) 범위는 측정치가 아니므로 쓰지 않는다.
- 결과지에 찍힌 자릿수 그대로 쓰고, 단위는 빼고 숫자만 쓴다.
- 흐리거나 가려져 확실히 읽을 수 없는 항목은 추측하지 말고 null로 둔다.
- 체성분 결과지가 아닌 사진이면 모든 항목을 null로 둔다.`;

export const EXTRACT_SCHEMA = {
  type: "object",
  properties: Object.fromEntries(FIELDS.map((f) => [f.key, { type: ["number", "null"] }])),
  required: FIELDS.map((f) => f.key),
};

// PoC 저장소 prompts/routine_guidelines.md의 "루틴 작성 규칙"을 바탕으로,
// 도감에 덤벨 운동이 추가된 뒤 6번 예시와 5번 BMI 항목을 고쳤다.
const RULES = `1. 주 3회, 하루 45~60분 기준으로 Day 1~3을 만든다. 세 날의 구성은 서로 달라야 한다.
2. 하루에 4~6개 운동을 넣는다. 같은 날에 같은 운동을 두 번 넣지 않는다.
3. 일주일 전체에 가슴, 등, 하체(대퇴사두근 또는 둔근)를 주 자극으로 하는 운동이 각각 한 번 이상 들어가야 한다.
4. 세트는 2~4세트, 반복은 8~15회 사이로 쓴다. 입문자이므로 무게보다 자세를 먼저 익히라고 안내한다.
5. 목표에 따라 강조점을 바꾼다.
   - 근육량 늘리기: 큰 근육을 쓰는 복합 운동(레그 프레스, 체스트 프레스, 랫풀다운, 시티드 케이블 로우 등)을 하루의 앞쪽에 두고, 8~12회 3~4세트로 한다.
   - 체지방 줄이기: 큰 근육 위주로 12~15회, 쉬는 시간을 짧게 한다. 운동 후 유산소 20~30분을 권한다. 헬스도감에는 유산소 기구가 없으므로 유산소는 운동 목록에 넣지 않고 cardio_note에만 쓴다.
   - BMI 높음: 무릎·허리 부담이 적은 [머신] 운동을 먼저 고른다 (예: 덤벨 스쿼트보다 레그 프레스).
   - 복부지방률 높음: 복근 운동을 넣을 수 있지만, 복근 운동만으로 뱃살이 빠지지 않는다는 점(부분 감량은 안 된다)을 설명한다.
6. 헬스도감 운동 목록에 있는 ID만 쓴다. 목록에 없는 운동(러닝머신, 바벨 스쿼트, 데드리프트, 런지, 플랭크 등)은 넣지 않는다. 운동 이름 뒤 [ ]는 종류(머신·프리웨이트·맨몸)이며, 입문자이므로 하루 운동의 절반 이상은 [머신]으로 고른다.
7. 각 운동의 reason은 이 사용자의 판정 결과와 연결해 한 문장으로 쓴다.
8. 질병 진단, 약, 식단 처방, 구체적인 섭취 칼로리는 쓰지 않는다. 통증이 있거나 질환이 있으면 전문가와 상의하라고만 안내한다.`;

function muscleNames(ids: MuscleId[]): string {
  return ids.map((id) => getMuscle(id).name).join(", ") || "없음";
}

const CATALOG = equipmentList
  .map((e) => `- ${e.id}: ${e.nameKo} [${equipmentTypeName(e.type)}] (주:${muscleNames(e.primaryMuscles)} / 보조: ${muscleNames(e.secondaryMuscles)})`)
  .join("\n");

export function buildRoutinePrompt(m: Measurements, sex: Sex, a: Assessment): string {
  const values = FIELDS.map((f) => `- ${f.label}${f.unit ? ` (${f.unit})` : ""}: ${m[f.key] ?? "모름"}`).join("\n");
  return `너는 헬스 입문자에게 헬스도감 앱의 운동으로 주 3회 루틴을 짜 주는 트레이너다.

## 사용자
성별: ${sex === "M" ? "남성" : "여성"}
${values}
- 코드 판정: 체지방률 ${a.fat}, 근육량 ${a.muscle}, BMI ${a.bmi}, 복부지방률 ${a.whr}
- 목표: ${a.goal}

## 규칙
${RULES}

## 헬스도감 운동 목록 (이 ID만 쓴다)
${CATALOG}

summary에는 판정 결과와 목표를 입문자가 이해할 수 있게 2~3문장으로 쓴다. 모든 문장은 한국어 해요체로 쓴다.`;
}

export const ROUTINE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "string" },
                reason: { type: "string" },
              },
              required: ["id", "sets", "reps", "reason"],
            },
          },
        },
        required: ["title", "exercises"],
      },
    },
    cardio_note: { type: "string" },
    caution: { type: "string" },
  },
  required: ["summary", "days", "cardio_note", "caution"],
};
