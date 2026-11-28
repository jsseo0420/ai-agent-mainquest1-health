# MAPSCLE 온보딩 일러스트 프롬프트

- 도구: Gemini (이미지 생성). 네거티브 칸 없음 → 비움
- 비율: 1:1 정사각형, 1080px 이상
- 공통 스타일: 볼드 플랫 벡터, #111111 검정 단색 배경, 흰색·짙은 회색·오렌지 레드(#FF4D2E) 4색
- 순서: 1장을 먼저 만들고, 마음에 들면 2·3장을 만들 때 1장 이미지를 첨부해 "same style as the attached image"로 화풍을 맞춘다
- 저장: `public/images/onboarding/1.png`, `2.png`, `3.png`

---

## 1장: 기구로 찾기 ("이 기구, 어떻게 쓰지?")

### 프롬프트 (영문, 약 105단어)
Bold flat vector illustration on a solid #111111 black background, square 1:1. A single faceless figure in solid white silhouette stands beside a leg press machine, head tilted up toward it, arms relaxed at the sides. One large orange-red (#FF4D2E) question mark floats above the machine. The machine is built from simple angular shapes in dark gray, with orange-red accents on the seat and footplate. Full-body side view at eye level, centered with generous empty space around the subjects. Flat shading with no gradients and a thin orange-red rim along the figure's back edge. Limited palette of black, white, dark gray and orange-red; clean sharp edges, sporty poster feel.

### 한국어 대응
검정 배경의 볼드 플랫 벡터 일러스트. 얼굴 없는 흰 실루엣 한 명이 레그 프레스 옆에 서서 기구를 올려다보고, 팔은 편하게 내렸다. 기구 위에 큰 오렌지 레드 물음표 하나. 기구는 각진 짙은 회색 도형, 시트와 발판만 오렌지 레드. 눈높이 측면 전신, 가운데 배치에 여백 넉넉히. 그라데이션 없음, 인물 등쪽에 얇은 오렌지 레드 테두리.

| 칸 | 내용 | 출처 |
|---|---|---|
| 피사체 | 얼굴 없는 흰 실루엣 1명 + 레그 프레스 1대 + 물음표 1개 | 사용자 |
| 동작 | 기구를 올려다봄, 팔은 내림 (손이 크게 안 보이게) | 사용자 + 손 회피 |
| 카메라 | 전신 · 눈높이 측면 · 가운데 배치 | (기본값) |
| 조명 | 플랫, 인물 뒤쪽 얇은 오렌지 레드 림 | (기본값) |
| 환경 | #111111 검정 단색 | 사용자 |
| 스타일 | 볼드 플랫 벡터, 4색, 스포츠 포스터 | 사용자 |
| 재질 | 생략 | |

---

## 2장: 부위로 찾기 ("근육 지도를 누르면 기구가 나와요")

### 프롬프트 (영문, 약 100단어)
Bold flat vector illustration on a solid #111111 black background, square 1:1, in the same style as the attached image. A single faceless human figure stands facing forward, arms held slightly away from the body, drawn in dark gray. The chest, shoulders, abdomen and thigh muscles are divided into angular panels filled with orange-red (#FF4D2E), like regions on a map. One white map pin is stuck into the center of the chest. Full-body front view at eye level, centered with generous empty space. Flat shading with no gradients. Limited palette of black, white, dark gray and orange-red; clean sharp edges, sporty poster feel.

### 한국어 대응
첨부한 1장과 같은 화풍. 정면으로 선 얼굴 없는 짙은 회색 인체 한 명, 팔은 몸에서 살짝 뗐다. 가슴·어깨·복근·허벅지가 지도의 구역처럼 각진 오렌지 레드 조각으로 나뉘고, 가슴 한가운데 흰 지도 핀 하나가 꽂혀 있다. 눈높이 정면 전신, 가운데 배치.

| 칸 | 내용 | 출처 |
|---|---|---|
| 피사체 | 짙은 회색 인체 1명 + 오렌지 레드 근육 구역 + 흰 지도 핀 1개 | 사용자 |
| 동작 | 정면으로 섬, 팔을 살짝 벌림 | (기본값) |
| 카메라 | 전신 · 눈높이 정면 · 가운데 배치 | (기본값) |
| 조명 | 플랫 | (기본값) |
| 환경 | #111111 검정 단색 | 사용자 |
| 스타일 | 1장과 동일 (첨부 참조) | 사용자 |

---

## 3장: 결과지로 루틴 ("결과지 한 장으로 내 루틴까지")

### 프롬프트 (영문, 약 100단어)
Bold flat vector illustration on a solid #111111 black background, square 1:1, in the same style as the attached image. On the left, one white sheet of paper tilted slightly, showing only abstract horizontal bars and a small bar chart, with no letters or numbers. A thick orange-red (#FF4D2E) arrow sweeps from the paper toward the right. On the right, three rounded dark gray cards fan out in a stack, each marked with a small orange-red dumbbell icon. Straight-on front view, objects arranged left to right with generous empty space. Flat shading with no gradients. Limited palette of black, white, dark gray and orange-red; clean sharp edges, sporty poster feel.

### 한국어 대응
첨부한 1장과 같은 화풍. 왼쪽에 살짝 기운 흰 결과지 한 장, 글자·숫자 없이 가로 막대와 작은 막대그래프만. 굵은 오렌지 레드 화살표가 오른쪽으로 휘어 가고, 오른쪽에는 오렌지 레드 덤벨 아이콘이 붙은 짙은 회색 카드 3장이 부채꼴로 겹쳐 있다. 정면, 왼쪽→오른쪽 배치.

| 칸 | 내용 | 출처 |
|---|---|---|
| 피사체 | 결과지 1장 + 화살표 1개 + 루틴 카드 3장 | 사용자 |
| 동작 | 결과지 → 화살표 → 카드로 이어지는 흐름 | 사용자 |
| 카메라 | 정면 · 왼쪽에서 오른쪽 배치 | (기본값) |
| 조명 | 플랫 | (기본값) |
| 환경 | #111111 검정 단색 | 사용자 |
| 스타일 | 1장과 동일 (첨부 참조) | 사용자 |

네거티브: 비움 (Gemini에 네거티브 칸이 없음)

---

## 고쳐 가는 법
- 한 번에 한 칸만 바꾼다. 예: 물음표가 너무 작으면 1장 피사체 칸의 "One large"를 "One oversized"로만 바꾼다
- 결과지에 이상한 글자가 생기면 프롬프트를 늘리지 말고 Gemini에서 그 부분만 "remove the text on the paper, keep the bars"로 고친다
- 손·발이 이상하게 나오면 그 부분만 다시 그리게 요청한다
- 마음에 드는 1장이 나오면 같은 프롬프트로 여러 장 뽑아 그중 고른다
