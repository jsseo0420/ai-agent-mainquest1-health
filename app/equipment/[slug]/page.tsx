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
import { equipmentList, getEquipment } from "@/data/equipment";
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
          <PageHeader title="" backHref="/equipment" backLabel="기구 목록으로" />
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

  return (
    <main>
      <PageHeader title={equipment.nameKo} backHref="/equipment" backLabel="기구 목록으로" />

      <figure className="-mx-4">
        <EquipmentImage equipment={equipment} className="aspect-[4/3] w-full" priority />
        {equipment.equipmentPhoto ? (
          <div className="px-4">
            <PhotoCredit credit={equipment.equipmentPhoto.credit} />
          </div>
        ) : (
          <figcaption className="px-4 pt-1.5 text-right text-xs text-sub">
            기구 사진 준비 중 (자극 부위 그림으로 대신 보여드려요)
          </figcaption>
        )}
      </figure>

      <div className="mt-4">
        <h2 className="text-2xl font-extrabold">{equipment.nameKo}</h2>
        <p className="text-sub">{equipment.nameEn}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <FavoriteButton equipmentId={equipment.id} />
        <Link
          href={`/logs?equipment=${equipment.id}`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-white hover:bg-accent-strong"
        >
          + 기록 추가
        </Link>
      </div>

      <section className="mt-8" aria-labelledby="muscles-heading">
        <h3 id="muscles-heading" className="text-lg font-bold">
          자극 부위
        </h3>
        <div className="mt-3 flex gap-4 rounded-2xl bg-surface p-4">
          <div className="flex shrink-0 gap-1">
            <BodyMap
              view="front"
              primary={equipment.primaryMuscles}
              secondary={equipment.secondaryMuscles}
              className="h-36 w-auto"
            />
            <BodyMap
              view="back"
              primary={equipment.primaryMuscles}
              secondary={equipment.secondaryMuscles}
              className="h-36 w-auto"
            />
          </div>
          <div className="min-w-0 space-y-3">
            <MuscleTags label="주동근" muscles={equipment.primaryMuscles} strong />
            {equipment.secondaryMuscles.length > 0 && (
              <MuscleTags label="보조근" muscles={equipment.secondaryMuscles} />
            )}
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="steps-heading">
        <h3 id="steps-heading" className="text-lg font-bold">
          운동 자세
        </h3>
        {equipment.posturePhoto && <PosturePhoto photo={equipment.posturePhoto} />}
        <ol className="mt-3 space-y-3">
          {equipment.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4"
        aria-labelledby="cautions-heading"
      >
        <h3 id="cautions-heading" className="flex items-center gap-1.5 font-bold text-amber-800">
          <span aria-hidden>⚠️</span> 주의사항
        </h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-amber-900">
          {equipment.cautions.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>
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
                className={`inline-flex h-8 items-center rounded-full px-3 text-sm font-medium ${
                  strong
                    ? "bg-accent text-white"
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
