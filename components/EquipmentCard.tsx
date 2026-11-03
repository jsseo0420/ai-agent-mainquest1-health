import Link from "next/link";
import type { Equipment } from "@/data/equipment";
import { getMuscle } from "@/data/muscles";
import EquipmentImage from "./EquipmentImage";

export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Link
      href={`/equipment/${equipment.slug}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-accent-soft active:bg-surface"
    >
      <EquipmentImage
        equipment={equipment}
        className="h-16 w-16 shrink-0 rounded-xl"
        sizes="64px"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{equipment.nameKo}</p>
        <p className="truncate text-xs text-sub">{equipment.nameEn}</p>
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {equipment.primaryMuscles.map((m) => (
            <li
              key={m}
              className="rounded-full bg-accent-bg px-2 py-0.5 text-xs font-medium text-accent-strong"
            >
              {getMuscle(m).name}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
