import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-20 text-center">
      <p className="text-5xl font-extrabold text-accent">404</p>
      <h1 className="mt-3 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-1 text-sub">주소가 바뀌었거나 없는 기구일 수 있어요.</p>
      <Link
        href="/equipment"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 font-semibold text-white"
      >
        기구 목록 보기
      </Link>
    </main>
  );
}
