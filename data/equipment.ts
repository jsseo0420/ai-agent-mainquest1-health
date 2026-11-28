import { getMuscle, type MuscleGroupId, type MuscleId } from "./muscles";

export type ImageCredit = {
  author: string;
  source: string;
  url: string;
};

export type Photo = {
  // public/ 아래 경로. 예: "/images/equipment/chest-press.jpg"
  src: string;
  alt: string;
  // 직접 찍은 사진은 비워 두고, 외부 무료 이미지일 때만 출처를 적는다.
  credit?: ImageCredit;
};

// 운동 종류. 케이블·스미스 머신처럼 궤도나 도르래가 정해진 기구는 머신으로 본다.
export type EquipmentType = "machine" | "free-weight" | "bodyweight";

export const equipmentTypes: { id: EquipmentType; name: string }[] = [
  { id: "machine", name: "머신" },
  { id: "free-weight", name: "프리웨이트" },
  { id: "bodyweight", name: "맨몸" },
];

export function isEquipmentType(value: string): value is EquipmentType {
  return equipmentTypes.some((t) => t.id === value);
}

export function equipmentTypeName(type: EquipmentType): string {
  return equipmentTypes.find((t) => t.id === type)!.name;
}

export type Equipment = {
  id: string;
  slug: string;
  nameKo: string;
  nameEn: string;
  type: EquipmentType;
  // 기구 사진. 없으면 화면에서 주동근을 강조한 인체 그림으로 대신 보여준다.
  equipmentPhoto?: Photo;
  // 운동하는 모습 사진. 운동 자세 설명 위에 보여준다.
  posturePhoto?: Photo;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  steps: string[];
  cautions: string[];
  videoUrl?: string;
};

export const equipmentList: Equipment[] = [
  {
    id: "chest-press",
    slug: "chest-press",
    nameKo: "체스트 프레스 머신",
    nameEn: "Chest Press Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/chest-press.jpg",
      alt: "등받이와 앞으로 미는 손잡이가 달린 체스트 프레스 머신",
    },
    posturePhoto: {
      src: "/images/posture/chest-press.jpg",
      alt: "체스트 프레스 4단계: 시트 높이 맞추기, 등 붙이기, 손잡이 밀기, 천천히 되돌아오기",
    },
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt", "triceps"],
    steps: [
      "손잡이가 가슴 중간 높이에 오도록 시트 높이를 맞춘다.",
      "등과 머리를 등받이에 붙이고 가슴을 살짝 편다.",
      "숨을 내쉬며 팔꿈치가 거의 펴질 때까지 손잡이를 앞으로 민다.",
      "숨을 들이마시며 가슴이 늘어나는 느낌이 들 때까지 천천히 되돌아온다.",
    ],
    cautions: [
      "팔꿈치를 끝까지 잠그지 않는다.",
      "어깨가 앞으로 말리거나 들리지 않게 한다.",
    ],
  },
  {
    id: "pec-deck",
    slug: "pec-deck",
    nameKo: "펙덱 플라이 머신",
    nameEn: "Pec Deck Fly Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/pec-deck.jpg",
      alt: "양옆에 팔을 모으는 손잡이가 달린 펙덱 플라이 머신",
    },
    posturePhoto: {
      src: "/images/posture/pec-deck.jpg",
      alt: "펙덱 플라이 4단계: 시트 맞추기, 손잡이 잡기, 양팔을 몸 앞으로 모으기, 천천히 벌리기",
    },
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt"],
    steps: [
      "손잡이가 어깨 높이에 오도록 시트를 맞추고 앉는다.",
      "팔꿈치를 살짝 굽힌 채 손잡이를 잡는다.",
      "가슴을 모으는 느낌으로 양팔을 몸 앞에서 모은다.",
      "가슴이 늘어나는 느낌이 들 때까지 천천히 팔을 벌린다.",
    ],
    cautions: [
      "팔을 너무 뒤로 벌려 어깨에 무리를 주지 않는다.",
      "반동 없이 일정한 속도로 움직인다.",
    ],
  },
  {
    id: "flat-bench-press",
    slug: "flat-bench-press",
    nameKo: "플랫 벤치프레스",
    nameEn: "Flat Bench Press",
    type: "free-weight",
    equipmentPhoto: {
      src: "/images/equipment/flat-bench-press.jpg",
      alt: "바벨이 거치대에 걸린 플랫 벤치프레스 벤치",
    },
    posturePhoto: {
      src: "/images/posture/flat-bench-press.jpg",
      alt: "벤치프레스 5단계: 바 아래 눕기, 바 잡기, 랙에서 들기, 명치까지 내리기, 밀어 올리기",
    },
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt", "triceps"],
    steps: [
      "벤치에 누워 눈이 바벨 바로 아래에 오게 한다.",
      "어깨너비보다 조금 넓게 바를 잡고 견갑골을 모아 가슴을 편다.",
      "바를 랙에서 들어 올려 가슴 위에 위치시킨다.",
      "숨을 들이마시며 바를 명치 근처까지 천천히 내린다.",
      "숨을 내쉬며 바를 처음 위치로 밀어 올린다.",
    ],
    cautions: [
      "처음이라면 빈 바나 가벼운 무게로 시작하고 보조자를 둔다.",
      "엉덩이가 벤치에서 뜨지 않게 한다.",
      "바를 가슴에 튕기지 않는다.",
    ],
  },
  {
    id: "incline-bench-press",
    slug: "incline-bench-press",
    nameKo: "인클라인 벤치프레스",
    nameEn: "Incline Bench Press",
    type: "free-weight",
    equipmentPhoto: {
      src: "/images/equipment/incline-bench-press.jpg",
      alt: "비스듬히 세운 등받이 벤치와 위쪽 거치대에 바벨이 걸린 인클라인 벤치프레스",
    },
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt", "triceps"],
    steps: [
      "벤치 각도를 30~45도로 맞추고 눕는다.",
      "어깨너비보다 조금 넓게 바를 잡고 견갑골을 모은다.",
      "바를 쇄골 아래 윗가슴 쪽으로 천천히 내린다.",
      "숨을 내쉬며 바를 위로 밀어 올린다.",
    ],
    cautions: [
      "각도가 너무 높으면 어깨 운동이 되므로 45도를 넘기지 않는다.",
      "처음에는 가벼운 무게로 보조자와 함께 한다.",
    ],
  },
  {
    id: "incline-dumbbell-press",
    slug: "incline-dumbbell-press",
    nameKo: "인클라인 덤벨 프레스",
    nameEn: "Incline Dumbbell Press",
    type: "free-weight",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt", "triceps"],
    steps: [
      "벤치 각도를 30~45도로 맞추고 덤벨을 허벅지 위에 세운 채 앉는다.",
      "등을 기대며 무릎으로 덤벨을 밀어 올려 가슴 옆에 둔다.",
      "견갑골을 모으고 숨을 내쉬며 덤벨을 윗가슴 위로 밀어 올린다.",
      "숨을 들이마시며 팔꿈치가 어깨보다 조금 낮아질 때까지 천천히 내린다.",
      "끝나면 덤벨을 가슴 쪽으로 가져와 허벅지 위로 내린 뒤 일어난다.",
    ],
    cautions: [
      "덤벨을 몸 옆으로 던지듯 내려놓지 않는다.",
      "팔꿈치를 몸통과 90도로 벌리지 말고 45~60도 정도로 둔다.",
      "바벨보다 균형 잡기가 어려우니 가벼운 무게로 시작한다.",
    ],
  },
  {
    id: "cable-crossover",
    slug: "cable-crossover",
    nameKo: "케이블 크로스오버",
    nameEn: "Cable Crossover",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/cable-crossover.jpg",
      alt: "양쪽 무게 추 기둥이 위쪽 프레임으로 이어지고 도르래마다 손잡이가 달린 케이블 크로스오버",
    },
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front-delt", "triceps"],
    steps: [
      "양쪽 도르래를 어깨보다 높게 맞추고 손잡이를 잡는다.",
      "한 발을 앞으로 내딛고 상체를 살짝 숙인다.",
      "팔꿈치를 살짝 굽힌 채 양손을 몸 앞 아래쪽으로 모은다.",
      "가슴이 늘어나는 느낌이 들 때까지 천천히 되돌아간다.",
    ],
    cautions: [
      "허리를 과하게 젖히지 않는다.",
      "팔 힘이 아니라 가슴을 모으는 느낌에 집중한다.",
    ],
  },
  {
    id: "lat-pulldown",
    slug: "lat-pulldown",
    nameKo: "랫풀다운 머신",
    nameEn: "Lat Pulldown Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/lat-pulldown.jpg",
      alt: "허벅지 고정 패드가 달린 의자와 위쪽 케이블에 긴 바가 매달린 랫풀다운 머신",
    },
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "rear-delt"],
    steps: [
      "허벅지 패드를 맞추고 앉아 바를 어깨너비보다 넓게 잡는다.",
      "가슴을 펴고 상체를 살짝 뒤로 기울인다.",
      "팔꿈치를 옆구리로 끌어내리듯 바를 윗가슴까지 당긴다.",
      "등이 늘어나는 느낌이 들 때까지 천천히 바를 올린다.",
    ],
    cautions: [
      "바를 목 뒤로 당기지 않는다.",
      "상체를 크게 흔들어 반동을 쓰지 않는다.",
    ],
  },
  {
    id: "seated-cable-row",
    slug: "seated-cable-row",
    nameKo: "시티드 케이블 로우",
    nameEn: "Seated Cable Row",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/seated-cable-row.jpg",
      alt: "긴 의자 앞에 비스듬한 발판과 V자 손잡이가 달린 케이블이 있는 시티드 케이블 로우",
    },
    primaryMuscles: ["lats"],
    secondaryMuscles: ["traps", "rear-delt", "biceps"],
    steps: [
      "발판에 발을 올리고 무릎을 살짝 굽힌 채 손잡이를 잡는다.",
      "허리를 곧게 세우고 가슴을 편다.",
      "팔꿈치를 뒤로 보내며 손잡이를 배꼽 쪽으로 당긴다.",
      "견갑골을 모았다가 천천히 팔을 앞으로 뻗는다.",
    ],
    cautions: [
      "당길 때 허리를 뒤로 크게 젖히지 않는다.",
      "등을 둥글게 말지 않는다.",
    ],
  },
  {
    id: "dumbbell-row",
    slug: "dumbbell-row",
    nameKo: "원암 덤벨 로우",
    nameEn: "One-Arm Dumbbell Row",
    type: "free-weight",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["traps", "rear-delt", "biceps"],
    steps: [
      "벤치에 한쪽 무릎과 같은 쪽 손을 올리고, 반대쪽 발은 바닥에 둔다.",
      "등을 바닥과 거의 평행하게 곧게 펴고 반대 손으로 덤벨을 든다.",
      "숨을 내쉬며 팔꿈치를 엉덩이 쪽으로 끌어올리듯 덤벨을 당긴다.",
      "등이 늘어나는 느낌이 들 때까지 천천히 내린 뒤, 반대쪽도 같은 횟수를 한다.",
    ],
    cautions: [
      "등을 둥글게 말거나 상체를 비틀며 당기지 않는다.",
      "팔 힘이 아니라 등으로 당기는 느낌에 집중한다.",
    ],
  },
  {
    id: "assisted-pullup-dip",
    slug: "assisted-pullup-dip",
    nameKo: "어시스트 풀업/딥스 머신",
    nameEn: "Assisted Pull-up / Dip Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/assisted-pullup-dip.jpg",
      alt: "맨 위 풀업 손잡이, 가운데 딥스 손잡이, 무릎 패드와 발판이 달린 어시스트 풀업/딥스 머신",
    },
    primaryMuscles: ["lats", "triceps"],
    secondaryMuscles: ["biceps", "chest"],
    steps: [
      "보조 무게를 정한다. 보조 무게가 클수록 쉬워진다.",
      "풀업: 무릎을 패드에 올리고 위쪽 손잡이를 잡은 뒤 턱이 손잡이 위로 갈 때까지 몸을 당긴다.",
      "딥스: 아래쪽 손잡이를 잡고 팔꿈치가 90도가 될 때까지 몸을 내렸다가 밀어 올린다.",
      "내려갈 때는 천천히 버티며 내려간다.",
    ],
    cautions: [
      "패드에서 내릴 때 발판을 먼저 밟고 내려온다.",
      "딥스에서 너무 깊이 내려가 어깨에 무리를 주지 않는다.",
    ],
  },
  {
    id: "back-extension",
    slug: "back-extension",
    nameKo: "백 익스텐션 벤치",
    nameEn: "Back Extension Bench",
    type: "bodyweight",
    equipmentPhoto: {
      src: "/images/equipment/back-extension.jpg",
      alt: "비스듬한 프레임 위쪽에 골반 받침 패드, 아래쪽에 발판과 발목 고정 롤러가 달린 45도 백 익스텐션 벤치",
    },
    primaryMuscles: ["erectors"],
    secondaryMuscles: ["glutes", "hamstrings"],
    steps: [
      "패드가 골반 바로 아래에 오도록 높이를 맞추고 발목을 고정한다.",
      "팔을 가슴 앞에 교차하고 몸을 일직선으로 만든다.",
      "허리를 곧게 유지한 채 상체를 천천히 숙인다.",
      "엉덩이와 허리 힘으로 몸이 일직선이 될 때까지 올라온다.",
    ],
    cautions: [
      "올라올 때 허리를 과하게 젖히지 않는다.",
      "허리 통증이 있다면 운동을 멈춘다.",
    ],
  },
  {
    id: "shoulder-press",
    slug: "shoulder-press",
    nameKo: "숄더 프레스 머신",
    nameEn: "Shoulder Press Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/shoulder-press.jpg",
      alt: "세운 등받이 의자 양옆 어깨 높이에 위로 미는 손잡이가 있고 옆에 무게 추가 달린 숄더 프레스 머신",
    },
    primaryMuscles: ["front-delt", "side-delt"],
    secondaryMuscles: ["triceps", "traps"],
    steps: [
      "손잡이가 어깨 높이에 오도록 시트를 맞춘다.",
      "등을 등받이에 붙이고 손잡이를 잡는다.",
      "숨을 내쉬며 손잡이를 머리 위로 밀어 올린다.",
      "손잡이가 어깨 높이에 올 때까지 천천히 내린다.",
    ],
    cautions: [
      "허리를 등받이에서 떼고 젖히지 않는다.",
      "팔꿈치를 끝까지 잠그지 않는다.",
    ],
  },
  {
    id: "lateral-raise",
    slug: "lateral-raise",
    nameKo: "레터럴 레이즈 머신",
    nameEn: "Lateral Raise Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/lateral-raise.jpg",
      alt: "등받이 의자 양옆에 팔을 대고 옆으로 들어 올리는 둥근 패드가 달린 레터럴 레이즈 머신",
    },
    primaryMuscles: ["side-delt"],
    secondaryMuscles: ["traps"],
    steps: [
      "어깨가 머신의 회전축과 일직선이 되도록 시트를 맞춘다.",
      "팔 바깥쪽을 패드에 대고 손잡이를 가볍게 잡는다.",
      "팔꿈치로 밀어 올리듯 어깨 높이까지 팔을 든다.",
      "천천히 팔을 내린다.",
    ],
    cautions: [
      "어깨를 으쓱하며 승모근으로 들어 올리지 않는다.",
      "가벼운 무게로 반복 횟수를 늘리는 것이 좋다.",
    ],
  },
  {
    id: "reverse-pec-deck-fly",
    slug: "reverse-pec-deck-fly",
    nameKo: "리버스 펙덱 플라이 머신",
    nameEn: "Reverse Pec Deck Fly Machine",
    type: "machine",
    equipmentPhoto: {
      src: "/images/equipment/reverse-pec-deck-fly.jpg",
      alt: "높은 등받이 패드가 있는 의자 양옆으로 회전하는 팔과 손잡이가 달린 리버스 펙덱 플라이 머신",
    },
    primaryMuscles: ["rear-delt"],
    secondaryMuscles: ["traps"],
    steps: [
      "펙덱 머신의 손잡이를 뒤쪽 끝으로 돌려 두고, 가슴을 등받이 쪽 패드에 대고 앉는다.",
      "손잡이가 어깨 높이에 오도록 시트를 맞추고 팔을 앞으로 뻗어 잡는다.",
      "팔꿈치를 살짝 굽힌 채 양팔을 옆으로 벌려 몸과 일직선이 될 때까지 당긴다.",
      "천천히 팔을 앞으로 모은다.",
    ],
    cautions: [
      "어깨를 으쓱하거나 견갑골을 세게 모으면 승모근 운동이 되므로 팔을 벌리는 데 집중한다.",
      "상체를 뒤로 젖혀 반동을 쓰지 않는다.",
    ],
  },
  {
    id: "dumbbell-shoulder-press",
    slug: "dumbbell-shoulder-press",
    nameKo: "덤벨 숄더 프레스",
    nameEn: "Dumbbell Shoulder Press",
    type: "free-weight",
    primaryMuscles: ["front-delt", "side-delt"],
    secondaryMuscles: ["triceps", "traps"],
    steps: [
      "등받이를 세운 벤치에 앉아 덤벨을 허벅지 위에 세운다.",
      "무릎으로 덤벨을 밀어 올려 어깨 옆, 귀 높이에 둔다. 손바닥은 앞을 본다.",
      "등을 등받이에 붙인 채 숨을 내쉬며 덤벨을 머리 위로 밀어 올린다.",
      "숨을 들이마시며 덤벨이 귀 높이에 올 때까지 천천히 내린다.",
    ],
    cautions: [
      "허리를 등받이에서 떼고 젖히지 않는다.",
      "위에서 덤벨끼리 부딪치거나 팔꿈치를 끝까지 잠그지 않는다.",
      "처음에는 가벼운 무게로 양팔 균형부터 맞춘다.",
    ],
  },
  {
    id: "dumbbell-side-lateral-raise",
    slug: "dumbbell-side-lateral-raise",
    nameKo: "덤벨 사이드 레터럴 레이즈",
    nameEn: "Dumbbell Side Lateral Raise",
    type: "free-weight",
    primaryMuscles: ["side-delt"],
    secondaryMuscles: ["traps"],
    steps: [
      "덤벨을 양손에 들고 발을 골반 너비로 벌려 선다. 상체를 아주 살짝 숙인다.",
      "팔꿈치를 살짝 굽힌 채 고정한다.",
      "숨을 내쉬며 팔꿈치로 밀어 올리듯 양팔을 옆으로 어깨 높이까지 든다.",
      "숨을 들이마시며 천천히 내린다.",
    ],
    cautions: [
      "어깨를 으쓱하며 승모근으로 들어 올리지 않는다.",
      "몸을 흔들어 반동을 쓰지 않도록 가벼운 무게로 한다.",
      "팔을 어깨보다 높이 들지 않는다.",
    ],
  },
  {
    id: "dumbbell-front-raise",
    slug: "dumbbell-front-raise",
    nameKo: "덤벨 프론트 레이즈",
    nameEn: "Dumbbell Front Raise",
    type: "free-weight",
    primaryMuscles: ["front-delt"],
    secondaryMuscles: ["side-delt"],
    steps: [
      "덤벨을 양손에 들고 허벅지 앞에 둔다. 손등이 앞을 본다.",
      "팔꿈치를 살짝 굽힌 채 고정한다.",
      "숨을 내쉬며 팔을 앞으로 어깨 높이까지 들어 올린다.",
      "숨을 들이마시며 천천히 내린다.",
    ],
    cautions: [
      "허리를 뒤로 젖혀 반동으로 들지 않는다.",
      "어깨 높이보다 높이 들지 않는다.",
    ],
  },
  {
    id: "face-pull",
    slug: "face-pull",
    nameKo: "페이스 풀",
    nameEn: "Cable Face Pull",
    type: "machine",
    primaryMuscles: ["rear-delt"],
    secondaryMuscles: ["traps"],
    steps: [
      "케이블 도르래를 얼굴 높이에 맞추고 로프 손잡이를 단다.",
      "로프 양 끝을 잡고 한두 걸음 물러나 팔을 앞으로 편다.",
      "숨을 내쉬며 팔꿈치를 어깨 높이로 벌리면서 로프를 얼굴 쪽으로 당긴다. 로프 양 끝이 귀 옆으로 벌어진다.",
      "숨을 들이마시며 팔을 천천히 앞으로 편다.",
    ],
    cautions: [
      "상체를 뒤로 젖혀 몸무게로 당기지 않는다.",
      "팔꿈치가 아래로 처지지 않게 어깨 높이를 유지한다.",
    ],
  },
  {
    id: "smith-machine",
    slug: "smith-machine",
    nameKo: "스미스 머신",
    nameEn: "Smith Machine",
    type: "machine",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["chest", "front-delt", "hamstrings"],
    steps: [
      "스쿼트 기준: 바를 어깨 높이로 맞추고 승모근 위에 올린다.",
      "바를 돌려 걸쇠를 풀고, 발을 몸보다 살짝 앞에 어깨너비로 둔다.",
      "허리를 곧게 유지하며 허벅지가 바닥과 평행할 때까지 앉는다.",
      "발바닥 전체로 밀며 일어선다.",
      "운동이 끝나면 바를 돌려 걸쇠에 건다.",
    ],
    cautions: [
      "어느 높이에서든 바를 걸 수 있는 위치를 먼저 확인한다.",
      "벤치를 두면 벤치프레스, 숄더 프레스 등 다른 운동에도 쓸 수 있다.",
      "무릎이 안쪽으로 모이지 않게 한다.",
    ],
  },
  {
    id: "leg-press",
    slug: "leg-press",
    nameKo: "레그 프레스",
    nameEn: "Leg Press",
    type: "machine",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "adductors"],
    steps: [
      "등과 엉덩이를 시트에 붙이고 앉는다.",
      "발판 가운데에 어깨너비로 발을 올린다.",
      "안전 레버를 풀고 무릎이 약 90도가 될 때까지 천천히 내린다.",
      "발바닥 전체로 밀어 올린다.",
      "운동이 끝나면 안전 레버를 다시 건다.",
    ],
    cautions: [
      "무릎을 끝까지 잠그지 않는다.",
      "너무 깊이 내려 엉덩이가 시트에서 들리지 않게 한다.",
      "무릎이 안쪽으로 모이지 않게 한다.",
    ],
  },
  {
    id: "leg-extension",
    slug: "leg-extension",
    nameKo: "레그 익스텐션",
    nameEn: "Leg Extension",
    type: "machine",
    primaryMuscles: ["quads"],
    secondaryMuscles: [],
    steps: [
      "무릎이 머신의 회전축과 일직선이 되도록 등받이를 맞춘다.",
      "발목 패드가 발목 바로 위에 오게 한다.",
      "손잡이를 잡고 다리를 앞으로 쭉 편다.",
      "천천히 다리를 내린다.",
    ],
    cautions: [
      "반동으로 차올리지 않는다.",
      "무릎에 통증이 있다면 무게를 줄이거나 멈춘다.",
    ],
  },
  {
    id: "leg-curl",
    slug: "leg-curl",
    nameKo: "레그 컬",
    nameEn: "Leg Curl",
    type: "machine",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["calves"],
    steps: [
      "무릎이 머신의 회전축과 일직선이 되도록 자리를 잡는다. (누워서 하는 방식과 앉아서 하는 방식이 있다.)",
      "발목 패드가 아킬레스건 위쪽에 오게 한다.",
      "뒤꿈치를 엉덩이 쪽으로 당기듯 무릎을 굽힌다.",
      "천천히 다리를 편다.",
    ],
    cautions: [
      "엉덩이가 들리지 않게 한다.",
      "다리를 펼 때 무게를 떨어뜨리지 말고 버틴다.",
    ],
  },
  {
    id: "hack-squat",
    slug: "hack-squat",
    nameKo: "핵 스쿼트 머신",
    nameEn: "Hack Squat Machine",
    type: "machine",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes", "hamstrings"],
    steps: [
      "등과 어깨를 패드에 붙이고 발판에 어깨너비로 선다.",
      "안전 레버를 푼다.",
      "허벅지가 발판과 평행할 때까지 천천히 앉는다.",
      "발바닥 전체로 밀며 일어선다.",
      "운동이 끝나면 안전 레버를 다시 건다.",
    ],
    cautions: [
      "무릎이 안쪽으로 모이지 않게 한다.",
      "등이 패드에서 떨어지지 않게 한다.",
    ],
  },
  {
    id: "dumbbell-squat",
    slug: "dumbbell-squat",
    nameKo: "덤벨 스쿼트 (고블릿)",
    nameEn: "Dumbbell Goblet Squat",
    type: "free-weight",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "adductors"],
    steps: [
      "덤벨 하나를 세워 양손으로 위쪽 끝을 감싸 쥐고 가슴 앞에 붙인다.",
      "발을 어깨너비보다 조금 넓게 벌리고 발끝을 살짝 바깥으로 둔다.",
      "숨을 들이마시며 가슴을 편 채 허벅지가 바닥과 평행할 때까지 앉는다.",
      "숨을 내쉬며 발바닥 전체로 밀어 일어선다.",
    ],
    cautions: [
      "무릎이 안쪽으로 모이지 않게, 발끝 방향으로 밀어낸다.",
      "허리가 둥글게 말리기 전까지만 앉는다.",
      "뒤꿈치가 바닥에서 뜨지 않게 한다.",
    ],
  },
  {
    id: "hip-abduction-adduction",
    slug: "hip-abduction-adduction",
    nameKo: "힙 어브덕션/어덕션 머신",
    nameEn: "Hip Abduction / Adduction Machine",
    type: "machine",
    primaryMuscles: ["glutes", "adductors"],
    secondaryMuscles: [],
    steps: [
      "어브덕션(바깥쪽): 패드를 다리 바깥에 두고 앉아 다리를 바깥으로 벌린다.",
      "어덕션(안쪽): 패드를 다리 안쪽에 두고 앉아 다리를 안으로 모은다.",
      "끝 지점에서 잠깐 멈춘다.",
      "천천히 처음 위치로 돌아간다.",
    ],
    cautions: [
      "시작 각도를 너무 크게 잡아 무리하지 않는다.",
      "상체를 등받이에 붙이고 반동을 쓰지 않는다.",
    ],
  },
  {
    id: "preacher-curl",
    slug: "preacher-curl",
    nameKo: "프리처 컬 머신",
    nameEn: "Preacher Curl Machine",
    type: "machine",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    steps: [
      "겨드랑이가 패드 위 끝에 닿도록 시트 높이를 맞춘다.",
      "팔 뒤쪽을 패드에 붙이고 손잡이를 잡는다.",
      "팔꿈치를 고정한 채 손잡이를 얼굴 쪽으로 당겨 올린다.",
      "팔이 거의 펴질 때까지 천천히 내린다.",
    ],
    cautions: [
      "팔을 끝까지 펴며 팔꿈치를 꺾지 않는다.",
      "어깨를 들어 반동을 쓰지 않는다.",
    ],
  },
  {
    id: "dumbbell-curl",
    slug: "dumbbell-curl",
    nameKo: "덤벨 컬",
    nameEn: "Dumbbell Curl",
    type: "free-weight",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    steps: [
      "덤벨을 양손에 들고 서서 손바닥이 앞을 보게 한다.",
      "팔꿈치를 옆구리에 붙여 고정한다.",
      "숨을 내쉬며 팔꿈치만 굽혀 덤벨을 어깨 쪽으로 들어 올린다.",
      "숨을 들이마시며 팔이 거의 펴질 때까지 천천히 내린다.",
    ],
    cautions: [
      "상체를 흔들거나 허리를 젖혀 반동으로 들지 않는다.",
      "팔꿈치가 앞으로 나오지 않게 옆구리에 고정한다.",
    ],
  },
  {
    id: "hammer-curl",
    slug: "hammer-curl",
    nameKo: "해머 컬",
    nameEn: "Hammer Curl",
    type: "free-weight",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    steps: [
      "덤벨을 양손에 들고 서서 손바닥이 몸 쪽을 보게(덤벨을 세워서) 잡는다.",
      "팔꿈치를 옆구리에 붙여 고정한다.",
      "숨을 내쉬며 덤벨을 세운 채 어깨 쪽으로 들어 올린다.",
      "숨을 들이마시며 천천히 내린다.",
    ],
    cautions: [
      "손목을 꺾지 말고 덤벨을 세운 방향을 유지한다.",
      "몸을 흔들어 반동을 쓰지 않는다.",
    ],
  },
  {
    id: "cable-curl",
    slug: "cable-curl",
    nameKo: "케이블 컬",
    nameEn: "Cable Curl",
    type: "machine",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
    steps: [
      "도르래를 가장 낮은 곳에 맞추고 짧은 바 손잡이를 단다.",
      "손바닥이 위를 보게 바를 잡고 한 걸음 물러나 선다.",
      "팔꿈치를 옆구리에 고정한 채 숨을 내쉬며 바를 가슴 쪽으로 당겨 올린다.",
      "숨을 들이마시며 팔이 거의 펴질 때까지 천천히 내린다.",
    ],
    cautions: [
      "상체를 뒤로 젖혀 몸무게로 당기지 않는다.",
      "내릴 때 무게를 툭 떨어뜨리지 말고 버틴다.",
    ],
  },
  {
    id: "cable-pushdown",
    slug: "cable-pushdown",
    nameKo: "케이블 푸시다운",
    nameEn: "Cable Triceps Pushdown",
    type: "machine",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    steps: [
      "도르래를 가장 높은 곳에 맞추고 짧은 바나 로프 손잡이를 단다.",
      "손잡이를 잡고 팔꿈치를 옆구리에 붙인 채 상체를 살짝 숙인다.",
      "숨을 내쉬며 팔꿈치를 고정하고 팔이 거의 펴질 때까지 손잡이를 아래로 민다.",
      "팔뚝이 바닥과 평행해질 때까지 천천히 되돌린다.",
    ],
    cautions: [
      "팔꿈치가 앞뒤로 움직이면 어깨와 등이 대신 일하므로 옆구리에 고정한다.",
      "상체를 크게 숙여 몸무게로 누르지 않는다.",
    ],
  },
  {
    id: "dumbbell-overhead-extension",
    slug: "dumbbell-overhead-extension",
    nameKo: "덤벨 오버헤드 익스텐션",
    nameEn: "Dumbbell Overhead Triceps Extension",
    type: "free-weight",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    steps: [
      "등받이를 세운 벤치에 앉아 덤벨 하나를 양손으로 감싸 쥐고 머리 위로 든다.",
      "팔꿈치가 앞을 보게 귀 옆에 붙인다.",
      "숨을 들이마시며 팔꿈치만 굽혀 덤벨을 머리 뒤로 천천히 내린다.",
      "숨을 내쉬며 팔이 거의 펴질 때까지 다시 들어 올린다.",
    ],
    cautions: [
      "팔꿈치가 옆으로 벌어지지 않게 한다.",
      "허리를 젖히지 말고, 덤벨이 머리에 닿지 않도록 가벼운 무게로 시작한다.",
    ],
  },
  {
    id: "calf-raise",
    slug: "calf-raise",
    nameKo: "카프 레이즈 머신",
    nameEn: "Calf Raise Machine",
    type: "machine",
    primaryMuscles: ["calves"],
    secondaryMuscles: [],
    steps: [
      "어깨 패드 아래에 서서 발 앞부분만 발판에 올린다.",
      "뒤꿈치를 발판 아래로 천천히 내려 종아리를 늘린다.",
      "발끝으로 서듯 뒤꿈치를 최대한 들어 올린다.",
      "위에서 잠깐 멈췄다가 천천히 내린다.",
    ],
    cautions: [
      "무릎을 굽혔다 펴며 반동을 쓰지 않는다.",
      "발이 발판에서 미끄러지지 않게 한다.",
    ],
  },
  {
    id: "ab-crunch",
    slug: "ab-crunch",
    nameKo: "앱도미널 크런치 머신",
    nameEn: "Abdominal Crunch Machine",
    type: "machine",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    steps: [
      "시트 높이를 맞추고 앉아 손잡이를 잡는다. 발이 있다면 발을 패드 아래에 건다.",
      "숨을 내쉬며 배를 말듯이 상체를 숙인다.",
      "배에 힘을 준 상태로 잠깐 멈춘다.",
      "천천히 처음 위치로 돌아간다.",
    ],
    cautions: [
      "팔 힘으로 당기지 말고 배의 힘으로 움직인다.",
      "목을 과하게 숙이지 않는다.",
    ],
  },
  {
    id: "captains-chair-leg-raise",
    slug: "captains-chair-leg-raise",
    nameKo: "캡틴스 체어 레그 레이즈",
    nameEn: "Captain's Chair Leg Raise",
    type: "machine",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    steps: [
      "발판을 밟고 올라가 등을 등받이에 붙이고, 팔꿈치와 팔뚝을 양쪽 패드에 올려 손잡이를 잡는다.",
      "발판에서 발을 떼고 다리를 아래로 늘어뜨린다.",
      "숨을 내쉬며 배에 힘을 주고 무릎을 굽혀 가슴 쪽으로 끌어올린다.",
      "숨을 들이마시며 다리를 천천히 내린다.",
    ],
    cautions: [
      "다리를 흔들어 반동으로 올리지 않는다.",
      "등이 등받이에서 떨어지지 않게 한다.",
      "내려올 때는 발판을 먼저 밟고 내려온다.",
    ],
  },
  {
    id: "cable-crunch",
    slug: "cable-crunch",
    nameKo: "케이블 크런치",
    nameEn: "Cable Crunch",
    type: "machine",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
    steps: [
      "도르래를 가장 높은 곳에 맞추고 로프 손잡이를 단다.",
      "로프를 잡고 머신을 보며 무릎을 꿇은 뒤, 로프 양 끝을 얼굴 옆에 둔다.",
      "숨을 내쉬며 엉덩이는 고정하고 배를 말듯이 상체를 숙여 팔꿈치를 무릎 쪽으로 가져간다.",
      "숨을 들이마시며 천천히 처음 위치로 돌아간다.",
    ],
    cautions: [
      "엉덩이를 뒤로 빼며 몸무게로 당기지 않는다.",
      "팔로 당기지 말고 배를 마는 힘으로 움직인다.",
    ],
  },
];

const equipmentBySlug = new Map(equipmentList.map((e) => [e.slug, e]));

export function getEquipment(slug: string): Equipment | undefined {
  return equipmentBySlug.get(slug);
}

export function getEquipmentById(id: string): Equipment | undefined {
  return equipmentList.find((e) => e.id === id);
}

export function equipmentMuscles(e: Equipment): MuscleId[] {
  return [...e.primaryMuscles, ...e.secondaryMuscles];
}

export function equipmentForMuscle(muscle: MuscleId): Equipment[] {
  // 주동근으로 쓰는 기구를 먼저 보여준다.
  const primary = equipmentList.filter((e) => e.primaryMuscles.includes(muscle));
  const secondary = equipmentList.filter(
    (e) => !e.primaryMuscles.includes(muscle) && e.secondaryMuscles.includes(muscle),
  );
  return [...primary, ...secondary];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

export function filterEquipment(
  list: Equipment[],
  query: string,
  group: MuscleGroupId | null,
  type: EquipmentType | null = null,
): Equipment[] {
  const q = normalize(query);
  return list.filter((e) => {
    if (type && e.type !== type) return false;
    if (q && !normalize(e.nameKo).includes(q) && !normalize(e.nameEn).includes(q)) {
      return false;
    }
    if (group && !equipmentMuscles(e).some((m) => getMuscle(m).group === group)) {
      return false;
    }
    return true;
  });
}
