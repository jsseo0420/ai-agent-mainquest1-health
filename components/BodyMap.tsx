import type { ReactNode } from "react";
import { getMuscle, type BodyView, type MuscleId } from "@/data/muscles";

// 몸의 왼쪽 절반만 그리고 오른쪽은 좌우 반전해서 그린다. (viewBox 200 x 410)
const MIRROR = "matrix(-1 0 0 1 200 0)";

type Shape = { muscle: MuscleId; node: ReactNode };

const frontShapes: Shape[] = [
  {
    muscle: "chest",
    node: <path d="M99 78 L99 116 Q84 122 69 112 Q64 92 72 80 Q86 74 99 78 Z" />,
  },
  { muscle: "side-delt", node: <ellipse cx="55" cy="90" rx="7" ry="13" /> },
  { muscle: "front-delt", node: <ellipse cx="65" cy="86" rx="6" ry="12" /> },
  {
    muscle: "biceps",
    node: <ellipse cx="51" cy="124" rx="6.5" ry="18" transform="rotate(8 51 124)" />,
  },
  {
    muscle: "abs",
    node: (
      <g>
        <rect x="87" y="124" width="12" height="20" rx="4" />
        <rect x="87" y="147" width="12" height="20" rx="4" />
        <rect x="87" y="170" width="12" height="22" rx="4" />
      </g>
    ),
  },
  {
    muscle: "quads",
    node: <path d="M71 216 Q84 211 94 220 L93 292 Q84 298 77 292 Q66 256 71 216 Z" />,
  },
  {
    muscle: "adductors",
    node: <path d="M95 222 L99 218 L99 262 Q97 270 94 266 Z" />,
  },
];

const backShapes: Shape[] = [
  {
    muscle: "traps",
    node: <path d="M99 56 L99 112 Q88 98 70 76 Q86 68 99 56 Z" />,
  },
  { muscle: "rear-delt", node: <ellipse cx="57" cy="88" rx="8" ry="12" /> },
  {
    muscle: "lats",
    node: <path d="M70 98 Q86 106 98 122 L98 150 Q86 160 75 150 Q66 124 70 98 Z" />,
  },
  { muscle: "erectors", node: <rect x="91" y="120" width="8" height="72" rx="4" /> },
  {
    muscle: "triceps",
    node: <ellipse cx="50" cy="124" rx="6.5" ry="18" transform="rotate(8 50 124)" />,
  },
  {
    muscle: "glutes",
    node: <path d="M99 198 L99 238 Q84 246 71 234 Q66 212 74 200 Z" />,
  },
  {
    muscle: "hamstrings",
    node: <path d="M72 244 Q86 250 96 246 L94 294 Q84 299 77 294 Q68 268 72 244 Z" />,
  },
  { muscle: "calves", node: <ellipse cx="86" cy="328" rx="9" ry="22" /> },
];

function Silhouette() {
  return (
    <g className="fill-body">
      <path d="M64 70 Q100 62 136 70 L140 120 Q134 160 133 205 L67 205 Q66 160 60 120 Z" />
      <path d="M60 72 Q46 76 44 96 L40 150 L54 152 L63 110 Z" />
      <path d="M40 150 L35 210 L47 212 L54 152 Z" />
      <circle cx="40" cy="220" r="7" />
      <path d="M67 200 L99 200 L99 300 L74 300 Q62 256 67 200 Z" />
      <path d="M74 298 L97 298 L96 382 L80 382 Q71 340 74 298 Z" />
      <ellipse cx="87" cy="390" rx="11" ry="6" />
    </g>
  );
}

type Props = {
  view: BodyView;
  // 강하게 강조할 부위 (선택한 부위, 주동근)
  primary?: MuscleId[];
  // 약하게 강조할 부위 (보조근)
  secondary?: MuscleId[];
  onSelect?: (muscle: MuscleId) => void;
  className?: string;
};

export default function BodyMap({
  view,
  primary = [],
  secondary = [],
  onSelect,
  className,
}: Props) {
  const shapes = view === "front" ? frontShapes : backShapes;

  function fillClass(muscle: MuscleId) {
    if (primary.includes(muscle)) return "fill-accent";
    if (secondary.includes(muscle)) return "fill-accent-soft";
    return "fill-muscle";
  }

  function renderShapes(mirrored: boolean) {
    return shapes.map(({ muscle, node }) => {
      const name = getMuscle(muscle).name;
      const interactive = Boolean(onSelect);
      return (
        <g
          key={`${muscle}-${mirrored ? "r" : "l"}`}
          className={`${fillClass(muscle)} transition-colors ${
            interactive ? "cursor-pointer outline-none hover:opacity-80 focus-visible:opacity-70" : ""
          }`}
          onClick={interactive ? () => onSelect!(muscle) : undefined}
          // 좌우 중 한쪽만 키보드 포커스를 받게 한다.
          role={interactive && !mirrored ? "button" : undefined}
          tabIndex={interactive && !mirrored ? 0 : undefined}
          aria-label={interactive && !mirrored ? name : undefined}
          aria-hidden={mirrored || undefined}
          onKeyDown={
            interactive && !mirrored
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect!(muscle);
                  }
                }
              : undefined
          }
        >
          <title>{name}</title>
          {node}
        </g>
      );
    });
  }

  return (
    <svg
      viewBox="0 0 200 410"
      className={className}
      role={onSelect ? "group" : "img"}
      aria-label={view === "front" ? "인체 앞모습" : "인체 뒷모습"}
    >
      <circle cx="100" cy="32" r="20" className="fill-body" />
      <rect x="92" y="48" width="16" height="20" className="fill-body" />
      <Silhouette />
      <g transform={MIRROR}>
        <Silhouette />
      </g>
      {renderShapes(false)}
      <g transform={MIRROR}>{renderShapes(true)}</g>
    </svg>
  );
}
