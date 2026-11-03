import Image from "next/image";
import type { Equipment } from "@/data/equipment";
import BodyMap from "./BodyMap";
import { getMuscle } from "@/data/muscles";

type Props = {
  equipment: Equipment;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

// 기구 사진이 없으면 주동근을 강조한 인체 그림으로 대신한다.
export default function EquipmentImage({ equipment, className = "", priority, sizes }: Props) {
  if (equipment.imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image
          src={equipment.imageUrl}
          alt={equipment.nameKo}
          fill
          sizes={sizes ?? "(max-width: 640px) 100vw, 640px"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const view = getMuscle(equipment.primaryMuscles[0]).view;
  return (
    <div
      className={`flex items-center justify-center bg-accent-bg ${className}`}
      role="img"
      aria-label={`${equipment.nameKo} 대체 그림`}
    >
      <BodyMap
        view={view}
        primary={equipment.primaryMuscles}
        secondary={equipment.secondaryMuscles}
        className="h-[85%] w-auto"
      />
    </div>
  );
}
