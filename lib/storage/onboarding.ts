// 첫 방문 온보딩(/welcome)을 봤는지 이 기기의 localStorage에 기억한다.
// 로그인 상태와 상관없이 기기 기준이며, 로그인한 적이 있는 기기는 이미 쓰던 사용자로 보고 건너뛴다.

const KEY = "health-dogam:onboarded";

// 홈 HTML 맨 앞에서 실행하는 인라인 스크립트. 화면이 그려지기 전에 확인해서
// 홈이 잠깐 보였다가 온보딩으로 바뀌는 깜빡임이 없게 한다.
// localStorage를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 그냥 홈을 보여준다.
export const onboardingRedirectScript = `(function(){try{
var s=window.localStorage;if(s.getItem(${JSON.stringify(KEY)}))return;
for(var i=0;i<s.length;i++){var k=s.key(i)||"";if(/^sb-.*-auth-token$/.test(k)){s.setItem(${JSON.stringify(KEY)},"1");return;}}
window.location.replace("/welcome");
}catch(e){}})();`;

export function markOnboarded(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // 저장하지 못해도 다음 방문에 온보딩이 한 번 더 보일 뿐이다.
  }
}
