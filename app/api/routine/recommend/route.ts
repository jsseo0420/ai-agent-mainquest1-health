// 확인한 수치 + 성별 → 코드 판정 → Gemini 루틴 구성 → 도감 밖 운동 제거
import { assess } from "@/lib/routine/assess";
import { filterRoutine } from "@/lib/routine/filter";
import { generateJson, RoutineError } from "@/lib/routine/gemini";
import { buildRoutinePrompt, ROUTINE_SCHEMA } from "@/lib/routine/prompts";
import { FIELDS, type Measurements, type RecommendResponse, type Routine, type Sex } from "@/lib/routine/types";

export const maxDuration = 60;

function parseBody(body: unknown): { sex: Sex; values: Measurements } | null {
  if (!body || typeof body !== "object") return null;
  const { sex, values } = body as { sex?: unknown; values?: Record<string, unknown> };
  if (sex !== "M" && sex !== "F") return null;
  if (!values || typeof values !== "object") return null;
  const parsed = {} as Measurements;
  for (const f of FIELDS) {
    const v = values[f.key];
    if (v == null) parsed[f.key] = null;
    else if (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 10000) parsed[f.key] = v;
    else return null;
  }
  return { sex, values: parsed };
}

export async function POST(request: Request) {
  try {
    const input = parseBody(await request.json().catch(() => null));
    if (!input) {
      return Response.json({ message: "성별과 수치를 다시 확인해 주세요." }, { status: 400 });
    }
    if (input.values.weight_kg == null) {
      return Response.json({ message: "체중은 꼭 입력해 주세요." }, { status: 400 });
    }

    const assessment = assess(input.values, input.sex);
    const { data: raw, model } = await generateJson<Routine>(
      [{ text: buildRoutinePrompt(input.values, input.sex, assessment) }],
      ROUTINE_SCHEMA,
    );
    if (!Array.isArray(raw?.days)) {
      throw new RoutineError("루틴을 만들지 못했어요. 다시 시도해 주세요.", 502);
    }
    const { routine, removed } = filterRoutine(raw);
    if (removed.length > 0) console.warn("도감에 없는 운동을 지움:", removed);

    return Response.json({ assessment, routine, removed, model } satisfies RecommendResponse);
  } catch (e) {
    if (e instanceof RoutineError) return Response.json({ message: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ message: "루틴을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요." }, { status: 500 });
  }
}
