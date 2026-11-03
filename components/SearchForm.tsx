import Form from "next/form";

// 홈 검색창. 엔터를 누르면 검색어가 적용된 기구 목록으로 이동한다. (R1-5)
export default function SearchForm() {
  return (
    <Form action="/equipment" className="relative">
      <label htmlFor="home-search" className="sr-only">
        기구 이름 검색
      </label>
      <SearchIcon />
      <input
        id="home-search"
        name="q"
        type="search"
        enterKeyHint="search"
        placeholder="기구 이름 검색 (예: 레그 프레스)"
        className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-base outline-none focus:border-accent focus:bg-white"
      />
    </Form>
  );
}

export function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-sub"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
