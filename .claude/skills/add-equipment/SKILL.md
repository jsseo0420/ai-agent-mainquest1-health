---
name: add-equipment
description: 헬스도감에 운동 기구를 추가하거나 기존 기구의 자세·자극 부위·주의사항·사진을 고칠 때 사용한다. data/equipment.ts 형식, 작성 기준, 확인 절차를 담고 있다.
---

# 기구 추가·수정

기구 데이터는 DB가 아니라 `data/equipment.ts`의 `equipmentList`에 있다. 상세 페이지는 이 목록으로 빌드할 때 정적 생성되므로, 항목을 추가하면 페이지도 자동으로 생긴다.

## 1. 항목 작성

```ts
{
  id: "leg-press",            // slug와 같게. 소문자·숫자·하이픈만 (DB 제약: ^[a-z0-9-]{1,64}$)
  slug: "leg-press",          // URL: /equipment/leg-press
  nameKo: "레그 프레스",       // 헬스장에서 흔히 부르는 이름
  nameEn: "Leg Press",
  primaryMuscles: ["quads", "glutes"],          // 주동근 1~2개
  secondaryMuscles: ["hamstrings", "adductors"], // 보조근 0~3개
  steps: [ /* 3~5단계 */ ],
  cautions: [ /* 2~3개 */ ],
  // imageUrl, imageCredit: 사진이 있을 때만 (3번 참고)
}
```

- 부위 ID는 `data/muscles.ts`의 `MuscleId`만 쓴다. 새 부위가 필요하면 `muscles`와 `BodyMap.tsx`의 도형도 함께 추가해야 하므로 먼저 사용자에게 확인한다
- 이미 저장된 즐겨찾기·기록이 `id`를 참조하므로, 기존 기구의 `id`는 바꾸지 않는다
- 비슷한 기구끼리 목록에서 붙어 있도록 부위 순서(가슴 → 등 → 어깨 → 하체 → 팔 → 복근)에 맞춰 넣는다

## 2. 문장 작성 기준

- 대상은 헬스 입문자다. 전문 용어는 쉬운 말로 풀어 쓴다
- `steps`: 시트·패드 조절 → 시작 자세 → 동작(호흡 포함) → 돌아오기 순서. 한 단계에 한 동작, "~한다"로 끝낸다
- `cautions`: 부상 위험이 큰 실수를 먼저 쓴다 (관절 잠금, 반동, 허리 젖힘 등). 안전 레버·걸쇠가 있는 기구는 반드시 언급한다
- 일반적으로 알려진 자세만 쓰고, 확실하지 않은 내용은 넣지 말고 사용자에게 묻는다

## 3. 사진 (선택)

- Unsplash, Pixabay 등 무료 라이선스 이미지만 쓴다. 라이선스 조건(상업적 이용, 출처 표기)을 확인한다
- `imageCredit`에 작가, 사이트, 원본 페이지 URL을 모두 적는다. 상세 화면에 그대로 표시된다
- 외부 이미지 도메인을 처음 쓰면 `next.config.ts`의 `images.remotePatterns`에 추가해야 한다
- 사진이 없으면 비워 둔다. 화면에서 주동근을 강조한 인체 그림으로 대신 보여준다

## 4. 확인

1. `npm run build`가 통과하고, 출력의 `/equipment/[slug]` 경로 수가 늘었는지 본다
2. 개발 서버에서 375px 너비로 확인한다
   - `/equipment/<slug>` 상세: 사진(또는 대체 그림), 자극 부위 강조, 단계, 주의사항
   - `/equipment`에서 한글·영문 이름 검색과 부위 필터에 걸리는지
   - `/muscles`에서 주동근 부위를 눌렀을 때 목록에 나오는지
3. 기구 수가 바뀌면 PRD.md 4.6의 표와 README의 기구 수를 고친다
