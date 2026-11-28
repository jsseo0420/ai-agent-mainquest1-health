# MAPSCLE 기구 사진 생성 프롬프트

- 도구: Gemini (이미지 생성). 네거티브 칸 없음 → 비움
- 비율: **4:3 가로** (화면의 사진 칸 비율)
- 대상: 머신·벤치·케이블 기구 23개 (덤벨만 쓰는 운동 9개는 이번에 제외)
- 쓰는 법: 아래 **공통 틀**의 `{EQUIPMENT}` 자리에 기구별 한 줄을 그대로 넣는다
- 저장: 받은 이미지를 대화창에 올리고 어느 기구인지 알려 주면 `public/images/equipment/<ID>.jpg`로 넣는다

---

## 공통 틀 (영문, 약 85단어 + 기구 한 줄)

```
Studio product photograph of {EQUIPMENT}. The equipment is unbranded, with a matte black steel frame and dark gray upholstery, and it is empty with no one using it. Three-quarter front view from slightly above eye level, the whole machine centered in a landscape 4:3 frame with generous white space on every side. Soft, even softbox lighting from above and the front, with a faint soft shadow under the base. Seamless pure white background. Clean, sharp, realistic catalog style with plain surfaces.
```

### 한국어 대응
{기구}를 찍은 스튜디오 제품 사진. 로고 없는 무광 검정 철제 프레임과 짙은 회색 쿠션, 사용하는 사람 없이 빈 상태. 눈높이보다 살짝 위에서 본 3/4 정면 구도, 4:3 가로 화면 가운데에 기구 전체가 들어가고 사방에 흰 여백. 위·앞쪽 소프트박스의 고르고 부드러운 빛, 바닥에 옅은 그림자. 이음매 없는 흰 배경. 깔끔하고 선명한 실사 카탈로그 스타일.

| 칸 | 내용 | 출처 |
|---|---|---|
| 피사체 | 기구 1대 (기구별 한 줄), 로고 없음, 검정 프레임·회색 쿠션, 빈 상태 | 사용자(무채색) + 기구별 |
| 동작 | 없음 (빈 기구) | (기본값) |
| 카메라 | 3/4 정면 · 눈높이 살짝 위 · 4:3 가운데 배치 | (기본값) |
| 조명 | 위·앞 소프트박스, 바닥 옅은 그림자 | (기본값) |
| 환경 | 이음매 없는 흰 배경 | 사용자 |
| 스타일 | 실사 제품 카탈로그 사진 | 사용자 |
| 재질 | 무광 검정 철제, 짙은 회색 쿠션 | 사용자(무채색) |

네거티브: 비움 (Gemini에 네거티브 칸이 없음)

---

## 기구별 한 줄 (`{EQUIPMENT}` 자리에 넣기)

### 가슴
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `incline-bench-press` | 인클라인 벤치프레스 | an incline bench press station: a padded bench fixed at about a 35-degree incline with an empty straight barbell resting on the upright rack hooks above it |
| `cable-crossover` | 케이블 크로스오버 | a cable crossover station: two tall weight-stack towers joined by an overhead frame, each with an adjustable pulley and a single D-handle |

### 등
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `lat-pulldown` | 랫풀다운 머신 | a lat pulldown machine: a seat with padded thigh rollers, a tall frame with a weight stack, and a long wide bar hanging from a cable above the seat |
| `seated-cable-row` | 시티드 케이블 로우 | a seated cable row machine: a long low bench with angled foot plates at the front and a V-shaped handle attached to a low cable from a weight stack |
| `assisted-pullup-dip` | 어시스트 풀업/딥스 머신 | an assisted pull-up and dip machine: a tall frame with pull-up handles at the top, parallel dip handles in the middle, a padded knee platform and a weight stack |
| `back-extension` | 백 익스텐션 벤치 | a 45-degree back extension bench: an angled frame with a padded hip support and padded ankle rollers above a foot platform |

### 어깨
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `shoulder-press` | 숄더 프레스 머신 | a seated shoulder press machine: an upright padded seat and backrest with two handles at shoulder height that press upward, and a weight stack |
| `lateral-raise` | 레터럴 레이즈 머신 | a seated lateral raise machine: a padded seat with two arm pads on pivoting arms at the sides, and a weight stack |
| `reverse-pec-deck-fly` | 리버스 펙덱 플라이 머신 | a pec deck machine set up for reverse flyes: a seat facing a tall chest pad, with two handles on swing arms at shoulder height in front of the pad |
| `face-pull` | 페이스 풀 | a single cable tower with the pulley set at face height and a rope attachment with two knotted ends hanging from it |

### 하체
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `smith-machine` | 스미스 머신 | a Smith machine: an empty barbell fixed inside two vertical steel guide rails with safety stops, within a tall rectangular frame |
| `leg-press` | 레그 프레스 | a 45-degree plate-loaded leg press machine: a reclined padded seat, a large angled foot platform on a sliding sled, and safety handles at the sides |
| `leg-extension` | 레그 익스텐션 | a seated leg extension machine: a padded seat and backrest with a padded ankle roller in front of the shins on a lever arm, and a weight stack |
| `leg-curl` | 레그 컬 | a lying leg curl machine: a padded bench to lie face down on, with a padded ankle roller at the far end on a lever arm |
| `hack-squat` | 핵 스쿼트 머신 | a hack squat machine: an angled back pad with shoulder pads on a sled that slides along a 45-degree rail, above a large foot platform |
| `hip-abduction-adduction` | 힙 어브덕션/어덕션 머신 | a hip abduction and adduction machine: a reclined seat with two padded thigh pads on swinging arms, and a weight stack |
| `calf-raise` | 카프 레이즈 머신 | a standing calf raise machine: two padded shoulder pads above a small raised foot block, with a weight stack |

### 팔
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `preacher-curl` | 프리처 컬 머신 | a seated preacher curl machine: an angled padded arm rest in front of a seat, with a curl handle on a lever arm |
| `cable-curl` | 케이블 컬 | a single cable tower with the pulley set at the lowest position and a short straight bar attachment resting near the floor |
| `cable-pushdown` | 케이블 푸시다운 | a single cable tower with the pulley set at the highest position and a short straight bar attachment hanging at chest height |

### 복근
| ID | 기구 | 넣을 문장 |
|---|---|---|
| `ab-crunch` | 앱도미널 크런치 머신 | a seated abdominal crunch machine: a padded seat with two overhead handles on a pivoting arm, padded foot rollers, and a weight stack |
| `captains-chair-leg-raise` | 캡틴스 체어 레그 레이즈 | a captain's chair (vertical knee raise station): a tall upright frame with a padded backrest, two padded forearm rests with handles, and foot steps at the bottom |
| `cable-crunch` | 케이블 크런치 | a single cable tower with the pulley at the highest position and a rope attachment hanging down, with a small black exercise mat on the floor in front of it |

---

## 고쳐 가는 법
- **한 번에 한 칸만 바꾼다.** 예: 기구가 너무 작게 나오면 카메라 칸의 "generous white space"를 "some white space"로만 바꾼다.
- **기구 모양이 틀리면** 기구별 한 줄만 고친다. 실제 헬스장 기구 사진을 한 장 같이 첨부하고 "same machine type as the attached photo"를 덧붙이면 더 정확해진다.
- **글자나 로고가 생기면** 그 부분만 "remove the text and logo"로 고친다.
- **사람이 들어가면** "empty machine, nobody in the frame"를 기구 한 줄 뒤에 덧붙인다.
- **화풍 맞추기:** 마음에 드는 한 장이 나오면 다음 기구를 만들 때 그 이미지를 첨부하고 "same photo style, lighting and background as the attached image"를 앞에 붙인다.
