import type { ImageCredit } from "@/data/equipment";

export default function PhotoCredit({ credit }: { credit?: ImageCredit }) {
  if (!credit) return null;
  return (
    <figcaption className="pt-1.5 text-right text-xs text-sub">
      사진:{" "}
      <a href={credit.url} target="_blank" rel="noopener noreferrer" className="underline">
        {credit.author} / {credit.source}
      </a>
    </figcaption>
  );
}
