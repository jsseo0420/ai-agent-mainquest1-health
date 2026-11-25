import type { MetadataRoute } from "next";

// 웹 앱 설치 정보 (PWA). 폰에서 "홈 화면에 추가"하면 이 이름·아이콘으로 주소창 없이 앱처럼 열린다.
// 아이콘 원본은 app/icon.svg와 같은 모양이고, PNG는 public/icons/에 있다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAPSCLE 맵슬",
    short_name: "MAPSCLE",
    description: "헬스 입문자를 위한 기구·근육 지도. 기구 사용법, 부위별 기구, 결과지 루틴 추천까지.",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#131313",
    theme_color: "#131313",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // 안드로이드가 원·둥근 사각형 등으로 잘라 써도 핀이 잘리지 않게 여백을 넉넉히 둔 아이콘
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
