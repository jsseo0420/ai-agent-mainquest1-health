// 앱 시작 화면(스플래시)과 첫 방문 온보딩(/welcome)을 위한 브라우저 저장소 키와 인라인 스크립트.
// - 온보딩을 봤는지: localStorage (기기 기준, 계속 유지)
// - 스플래시를 이번 세션에 봤는지: sessionStorage (탭·브라우저를 닫으면 지워짐)

const ONBOARDED_KEY = "health-dogam:onboarded";
const SPLASHED_KEY = "health-dogam:splashed";

// 레이아웃의 스플래시 요소 바로 뒤에서, 화면이 그려지기 전에 실행한다.
// 1) 처음 온 사용자가 홈(/)을 열면 아무것도 그리기 전에 /welcome으로 보낸다.
//    로그인한 적이 있는 기기(Supabase 세션 키가 있음)는 이미 쓰던 사용자로 보고 건너뛴다.
// 2) 이번 세션에 처음 연 화면이면 스플래시를 보이게 하고 window.__mapscleSplash로 알린다.
// localStorage·sessionStorage를 쓸 수 없는 환경에서는 둘 다 건너뛰고 화면을 그대로 보여준다.
export function startupScript(splashId: string): string {
  return `(function(){try{
var l=window.localStorage,s=window.sessionStorage;
if(location.pathname==="/"&&!l.getItem(${JSON.stringify(ONBOARDED_KEY)})){
var seen=false;for(var i=0;i<l.length;i++){if(/^sb-.*-auth-token$/.test(l.key(i)||"")){seen=true;break;}}
if(seen){l.setItem(${JSON.stringify(ONBOARDED_KEY)},"1");}else{location.replace("/welcome");return;}
}
if(!s.getItem(${JSON.stringify(SPLASHED_KEY)})){
s.setItem(${JSON.stringify(SPLASHED_KEY)},"1");window.__mapscleSplash=true;
var el=document.getElementById(${JSON.stringify(splashId)});if(el)el.style.display="flex";
}
}catch(e){}})();`;
}

export function markOnboarded(): void {
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    // 저장하지 못해도 다음 방문에 온보딩이 한 번 더 보일 뿐이다.
  }
}
