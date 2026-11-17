// 결과지 사진 → 핵심 8개 수치. 사진은 Gemini로 보내 분석만 하고 저장하지 않는다.
import { generateJson, RoutineError } from "@/lib/routine/gemini";
import { EXTRACT_PROMPT, EXTRACT_SCHEMA } from "@/lib/routine/prompts";
import { FIELDS, type Measurements } from "@/lib/routine/types";

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const form = await request.formData().catch(() => null);
    const image = form?.get("image");
    if (!(image instanceof File)) {
      return Response.json({ message: "결과지 사진을 골라 주세요." }, { status: 400 });
    }
    if (!IMAGE_TYPES.includes(image.type)) {
      return Response.json({ message: "JPG, PNG, WEBP 사진만 올릴 수 있어요." }, { status: 400 });
    }
    if (image.size > MAX_BYTES) {
      return Response.json({ message: "사진이 너무 커요. 4MB 이하로 다시 올려 주세요." }, { status: 413 });
    }

    const data = Buffer.from(await image.arrayBuffer()).toString("base64");
    const { data: raw, model } = await generateJson<Record<string, unknown>>(
      [{ inlineData: { mimeType: image.type, data } }, { text: EXTRACT_PROMPT }],
      EXTRACT_SCHEMA,
    );

    const values = Object.fromEntries(
      FIELDS.map((f) => {
        const v = raw[f.key];
        return [f.key, typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null];
      }),
    ) as Measurements;

    if (FIELDS.every((f) => values[f.key] == null)) {
      return Response.json(
        { message: "결과지에서 수치를 찾지 못했어요. 결과지 전체가 나오게 다시 찍거나 직접 입력해 주세요." },
        { status: 422 },
      );
    }
    return Response.json({ values, model });
  } catch (e) {
    if (e instanceof RoutineError) return Response.json({ message: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ message: "사진을 분석하지 못했어요. 잠시 뒤 다시 시도해 주세요." }, { status: 500 });
  }
}
