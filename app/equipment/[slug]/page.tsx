import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BodyMap from "@/components/BodyMap";
import EquipmentImage from "@/components/EquipmentImage";
import FavoriteButton from "@/components/FavoriteButton";
import PageHeader from "@/components/PageHeader";
import PhotoCredit from "@/components/PhotoCredit";
import PosturePhoto from "@/components/PosturePhoto";
import DetailTabs from "./DetailTabs";
import { equipmentList, equipmentTypeName, getEquipment } from "@/data/equipment";
import { getMuscle, type MuscleId } from "@/data/muscles";

export function generateStaticParams() {
  return equipmentList.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/equipment/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const equipment = getEquipment(slug);
  return { title: equipment?.nameKo ?? "기구를 찾을 수 없어요" };
}

export default function EquipmentDetailPage({ params }: PageProps<"/equipment/[slug]">) {
  // 주소 값(params)을 읽는 부분은 Suspense 안에 두어 화면 이동이 즉시 시작되게 한다.
  return (
    <Suspense
      fallback={
        <main>
          <PageHeader title="" backHref="/equipment" backLabel="기구 목록으로" tone="dark" />
          <p className="py-8 text-center text-sub">불러오는 중…</p>
        </main>
      }
    >
      <EquipmentDetail params={params} />
    </Suspense>
  );
}

async function EquipmentDetail({
  params,
}: {
  params: PageProps<"/equipment/[slug]">["params"];
}) {
  const { slug } = await params;
  const equipment = getEquipment(slug);
  if (!equipment) notFound();

  const steps = (
    <section aria-label="운동 자세">
      {equipment.posturePhoto && <PosturePhoto photo={equipment.posturePhoto} />}
      <ol className="mt-3 space-y-3">
        {equipment.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-black italic text-on-accent">
              {i + 1}
            </span>
            <p className="pt-0.5 leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
      {/* 탭에 가려 주의사항을 놓치지 않게 자세 탭 끝에서 한 번 더 알려 준다 */}
      <button
        type="button"
        data-go-tab="cautions"
        className="mt-6 flex h-12 w-full items-center justify-between rounded-lg bg-night px-4 text-left text-sm text-white"
      >
        <span>
          <span className="font-bold text-accent">주의사항 {equipment.cautions.length}개</span>를 꼭 확인하세요
        </span>
        <span aria-hidden>→</span>
      </button>
    </section>
  );

  const musclesPanel = (
    <section aria-label="자극 부위">
      <div className="flex justify-center gap-2 rounded-lg bg-surface p-4">
        <BodyMap
          view="front"
          primary={equipment.primaryMuscles}
          secondary={equipment.secondaryMuscles}
          className="h-48 w-auto"
        />
        <BodyMap
          view="back"
          primary={equipment.primaryMuscles}
          secondary={equipment.secondaryMuscles}
          className="h-48 w-auto"
        />
      </div>
      <div className="mt-4 space-y-4">
        <MuscleTags label="주동근" muscles={equipment.primaryMuscles} strong />
        {equipment.secondaryMuscles.length > 0 && (
          <MuscleTags label="보조근" muscles={equipment.secondaryMuscles} />
        )}
        <p className="text-xs text-sub">부위를 누르면 같은 부위의 다른 기구를 볼 수 있어요.</p>
      </div>
    </section>
  );

  const cautionsPanel = (
    <section aria-label="주의사항">
      <ul className="space-y-2">
        {equipment.cautions.map((c, i) => (
          <li key={i} className="flex gap-3 rounded-lg bg-night p-4 text-white">
            <span aria-hidden className="font-black text-accent">
              !
            </span>
            <p className="leading-relaxed">{c}</p>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <main className="pb-20">
      <PageHeader title={equipment.nameKo} backHref="/equipment" backLabel="기구 목록으로" tone="dark" />

      <figure className="-mx-4 bg-night px-4 pb-4 pt-1 text-white">
        <EquipmentImage equipment={equipment} className="aspect-[4/3] w-full rounded-lg" priority />
        <figcaption className="mt-3 flex items-baseline justify-between gap-3">
          <span className="text-sm text-night-sub">
            {equipment.nameEn} · {equipmentTypeName(equipment.type)}
          </span>
          {!equipment.equipmentPhoto && <span className="shrink-0 text-xs text-night-sub">사진 준비 중</span>}
        </figcaption>
        {equipment.equipmentPhoto?.credit && (
          <div className="[&_a]:text-night-sub [&_figcaption]:text-night-sub">
            <PhotoCredit credit={equipment.equipmentPhoto.credit} />
          </div>
        )}
      </figure>

      <DetailTabs
        tabs={[
          { id: "steps", label: "자세", content: steps },
          { id: "muscles", label: "자극 부위", content: musclesPanel },
          { id: "cautions", label: "주의사항", badge: equipment.cautions.length, content: cautionsPanel },
        ]}
      />

      {/* 자세를 보다가 바로 기록할 수 있게 하단 메뉴 위에 고정한다 */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-2 px-4 py-2">
          <FavoriteButton equipmentId={equipment.id} compact />
          <Link
            href={`/logs?equipment=${equipment.id}`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent font-black italic text-on-accent hover:bg-accent-hover"
          >
            + 기록 추가
          </Link>
        </div>
      </div>
    </main>
  );
}

function MuscleTags({
  label,
  muscles,
  strong = false,
}: {
  label: string;
  muscles: MuscleId[];
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-sub">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {muscles.map((m) => {
          const muscle = getMuscle(m);
          return (
            <li key={m}>
              {/* 같은 부위의 다른 기구 목록으로 이동 (R3-4) */}
              <Link
                href={`/equipment?group=${muscle.group}`}
                className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-bold ${
                  strong
                    ? "bg-accent text-on-accent"
                    : "bg-accent-soft/60 text-accent-strong"
                }`}
              >
                {muscle.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
