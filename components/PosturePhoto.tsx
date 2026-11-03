import Image from "next/image";
import type { Photo } from "@/data/equipment";
import PhotoCredit from "./PhotoCredit";

// 단계별 그림이 가로로 길어 폰에서는 글자가 작으므로, 누르면 원본 크기로 볼 수 있게 한다.
export default function PosturePhoto({ photo }: { photo: Photo }) {
  return (
    <figure className="mt-3">
      <a
        href={photo.src}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[1024/572] w-full overflow-hidden rounded-2xl border border-line bg-white"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 100vw, 576px"
          className="object-contain"
        />
      </a>
      <p className="pt-1.5 text-xs text-sub">그림을 누르면 크게 볼 수 있어요.</p>
      <PhotoCredit credit={photo.credit} />
    </figure>
  );
}
