import Image from "next/image";
import type { Equipment } from "@/data/equipment";
import BodyMap from "./BodyMap";
import { getMuscle } from "@/data/muscles";

type Props = {
  equipment: Equipment;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fit?: "contain" | "cover";
};

// 기구 사진이 없으면 주동근을 강조한 인체 그림으로 대신한다.
export default function EquipmentImage({
  equipment,
  className = "",
  priority,
  sizes,
  fit = "contain",
}: Props) {
  if (equipment.equipmentPhoto) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image
          src={equipment.equipmentPhoto.src}
          alt={equipment.equipmentPhoto.alt}
          fill
          sizes={sizes ?? "(max-width: 640px) 100vw, 640px"}
          priority={priority}
          // 큰 화면에서는 가로 사진 전체를 보여주고, 작은 썸네일은 기구가 있는 가운데를 채운다.
          className={fit === "cover" ? "object-cover" : "object-contain"}
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
