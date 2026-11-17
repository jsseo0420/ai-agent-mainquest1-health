"use client";

// 화면에서 쓰는 루틴 추천 API 호출. 사진은 보내기 전에 브라우저에서 줄인다.
import type { Measurements, RecommendResponse, Sex } from "./types";

const MAX_SIDE = 1600;

// 폰 사진은 수 MB라 서버 업로드 한도(4MB)를 넘기 쉽다. 긴 변을 1600px로 줄여 JPEG로 바꾼다.
export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.85),
  );
}

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message ?? "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
}

export async function extractFromImage(file: File): Promise<Measurements> {
  const form = new FormData();
  form.append("image", await resizeImage(file), "sheet.jpg");
  const res = await fetch("/api/routine/extract", { method: "POST", body: form });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()).values;
}

export async function requestRoutine(sex: Sex, values: Measurements): Promise<RecommendResponse> {
  const res = await fetch("/api/routine/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sex, values }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
