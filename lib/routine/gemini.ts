// 서버(Route Handler)에서만 쓴다. GEMINI_API_KEY는 서버 환경변수로만 읽고 브라우저로 보내지 않는다.
import { ApiError, GoogleGenAI } from "@google/genai";

// 기본 모델은 PoC에서 정확도를 검증한 모델이다. 무료 등급은 혼잡할 때가 많아서,
// 바쁘거나(429·503) 응답이 늦으면 가벼운 모델로 한 번 넘어간다.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";
const TIMEOUT_MS = 25_000;

export class RoutineError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new RoutineError("추천 기능이 아직 설정되지 않았어요. 관리자에게 알려 주세요.", 503);
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

// 혼잡(429·503), 시간 초과(504, 또는 우리 쪽 timeout으로 끊긴 요청)면 다른 모델로 다시 해 볼 만하다.
function isBusy(e: unknown): boolean {
  if (e instanceof ApiError) return [429, 500, 503, 504].includes(e.status);
  const name = (e as { name?: unknown } | null)?.name;
  return name === "AbortError" || name === "TimeoutError";
}

export async function generateJson<T>(parts: Part[], schema: object): Promise<{ data: T; model: string }> {
  const ai = getClient();
  const models = PRIMARY_MODEL === FALLBACK_MODEL ? [PRIMARY_MODEL] : [PRIMARY_MODEL, FALLBACK_MODEL];
  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          httpOptions: { timeout: TIMEOUT_MS },
        },
      });
      if (!res.text) throw new RoutineError("AI가 답을 주지 못했어요. 잠시 뒤 다시 시도해 주세요.", 502);
      return { data: JSON.parse(res.text) as T, model };
    } catch (e) {
      if (e instanceof RoutineError) throw e;
      if (isBusy(e)) {
        console.warn(`${model}이 바쁘거나 늦어서 다음 모델로 넘어감`);
        continue;
      }
      console.error("Gemini 호출 실패", e);
      throw new RoutineError("AI 분석 중 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.", 502);
    }
  }
  throw new RoutineError("AI 서버가 바빠요. 1분쯤 뒤에 다시 시도해 주세요.", 503);
}
