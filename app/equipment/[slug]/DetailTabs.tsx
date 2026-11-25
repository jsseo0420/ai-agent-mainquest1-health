"use client";

import { useId, useState, type ReactNode } from "react";

export type DetailTab = {
  id: string;
  label: string;
  // 탭 이름 옆 작은 숫자 (예: 주의사항 개수)
  badge?: number;
  content: ReactNode;
};

// 기구 상세의 자세·자극 부위·주의사항 탭. 탭 줄은 헤더 아래에 붙어 따라온다.
// 내용은 서버에서 만든 그대로 받아서 보여주기만 한다.
// 다른 탭으로 보내는 링크는 data-go-tab="탭 id" 속성을 달면 된다.
export default function DetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const baseId = useId();

  function open(id: string) {
    setActive(id);
    document.getElementById(`${baseId}-bar`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      onClick={(e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>("[data-go-tab]");
        if (target?.dataset.goTab) open(target.dataset.goTab);
      }}
    >
      <div
        id={`${baseId}-bar`}
        role="tablist"
        aria-label="기구 정보"
        className="sticky top-14 z-10 -mx-4 flex scroll-mt-14 gap-5 border-b border-line bg-white px-4"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.id}`}
              onClick={() => open(t.id)}
              className={`-mb-px flex h-12 items-center gap-1 border-b-2 text-[15px] transition-colors ${
                selected ? "border-ink font-bold text-ink" : "border-transparent text-sub hover:text-ink"
              }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-xs font-bold ${
                    selected ? "bg-accent text-on-accent" : "bg-surface text-sub"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${baseId}-panel-${t.id}`}
          aria-labelledby={`${baseId}-tab-${t.id}`}
          hidden={t.id !== active}
          className="pt-4"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
