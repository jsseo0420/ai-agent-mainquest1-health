import Link from "next/link";
import { equipmentTypeName, type Equipment } from "@/data/equipment";
import { getMuscle } from "@/data/muscles";
import EquipmentImage from "./EquipmentImage";
import FavoriteStar from "./FavoriteStar";

// 기구로 찾기의 2열 격자 카드. 사진을 크게 보여주고, 오른쪽 위에서 바로 즐겨찾기할 수 있다.
// 즐겨찾기 버튼은 링크 안에 넣을 수 없어서(버튼 중첩 금지) 카드 위에 겹쳐 둔다.
export default function EquipmentTile({ equipment }: { equipment: Equipment }) {
  return (
    <div className="relative h-full">
      <Link
        href={`/equipment/${equipment.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-accent active:bg-surface"
      >
        <EquipmentImage
          equipment={equipment}
          className="aspect-[4/3] min-h-0 w-full overflow-hidden border-b border-line"
          sizes="(max-width: 576px) 50vw, 280px"
        />
        <div className="flex flex-1 flex-col p-2.5">
          <p className="line-clamp-2 text-sm font-bold leading-snug">{equipment.nameKo}</p>
          <ul className="mt-auto flex flex-wrap gap-1 pt-1.5">
            <li className="rounded-full border border-line px-1.5 py-0.5 text-[11px] text-sub">
              {equipmentTypeName(equipment.type)}
            </li>
            {equipment.primaryMuscles.map((m) => (
              <li
                key={m}
                className="rounded-full bg-accent-bg px-1.5 py-0.5 text-[11px] font-medium text-accent-strong"
              >
                {getMuscle(m).name}
              </li>
            ))}
          </ul>
        </div>
      </Link>
      <FavoriteStar equipmentId={equipment.id} name={equipment.nameKo} className="absolute right-0 top-0" />
    </div>
  );
}
