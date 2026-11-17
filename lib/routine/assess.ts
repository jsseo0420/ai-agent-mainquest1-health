// 수치 판정과 값 사이의 관계 검사. LLM이 아니라 코드가 정해진 기준으로 판정한다.
// 기준은 PoC 저장소의 prompts/routine_guidelines.md와 같다 (의료적 판단에 쓰지 않는 단순 기준).
import type { Assessment, Level, Measurements, Sex } from "./types";

export function assess(m: Measurements, sex: Sex): Assessment {
  const male = sex === "M";
  const [lo, hi] = male ? [10, 20] : [18, 28];
  const pbf = m.body_fat_pct;
  const fat: Level = pbf == null ? "알 수 없음" : pbf < lo ? "낮음" : pbf > hi ? "높음" : "표준";
  const bmi: Level = m.bmi == null ? "알 수 없음" : m.bmi < 18.5 ? "낮음" : m.bmi >= 25 ? "높음" : "표준";
  const whr: Level = m.whr == null ? "알 수 없음" : m.whr > (male ? 0.9 : 0.85) ? "높음" : "표준";
  const muscle: Level =
    !m.weight_kg || !m.skeletal_muscle_kg
      ? "알 수 없음"
      : m.skeletal_muscle_kg / m.weight_kg < (male ? 0.4 : 0.34)
        ? "낮음"
        : "표준";

  let goal = "지금 몸 유지하며 고르게 강화";
  if (fat === "높음" && muscle === "낮음") goal = "근육량 늘리기 + 체지방 줄이기";
  else if (fat === "높음") goal = "체지방 줄이기";
  else if (muscle === "낮음") goal = "근육량 늘리기";

  return { fat, muscle, bmi, whr, goal };
}

// 값끼리 맞지 않으면 잘못 읽었을 가능성이 크다 (검증에서 다른 칸의 숫자를 가져오는 실패가 있었다).
export function consistencyWarnings(m: Measurements): string[] {
  const warnings: string[] = [];
  const { weight_kg: w, skeletal_muscle_kg: smm, body_fat_kg: fat, body_fat_pct: pbf } = m;
  if (w && fat != null && pbf != null && Math.abs((fat / w) * 100 - pbf) > 1.5) {
    warnings.push("체지방률이 체지방량 ÷ 체중과 맞지 않아요. 세 값을 결과지와 다시 비교해 주세요.");
  }
  if (w && smm != null && smm >= w * 0.7) {
    warnings.push("골격근량이 체중에 비해 너무 커요. 골격근량 값을 확인해 주세요.");
  }
  if (w && fat != null && fat >= w) {
    warnings.push("체지방량이 체중보다 커요. 체지방량 값을 확인해 주세요.");
  }
  return warnings;
}
