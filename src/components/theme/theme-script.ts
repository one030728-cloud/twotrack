export const THEME_STORAGE_KEY = "posmos-theme";

// document.documentElement에 hydration 이전에 동기적으로 실행되어야
// 테마 전환 시 이전 테마 화면이 잠깐 보이는 FOUC를 막을 수 있다.
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var stored=localStorage.getItem(k);var theme=(stored==="light"||stored==="dark"||stored==="pink")?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",theme);document.documentElement.style.colorScheme=theme==="dark"?"dark":"light";}catch(e){}})();`;
