/**
 * 공통 헤더: "과정 안내" → Classic / Next (서버 렌더 HTML)
 * - 데스크톱: 드롭다운 (hover + focus-within)
 * - 모바일: 햄버거 패널 내 <details> 아코디언
 *
 * export:
 * - siteHeaderNavCoursesGlassStyles() : <style> 티타늄 글래스 + steelTremor
 * - siteNavCoursesDropdownDesktop()
 * - siteNavCoursesAccordionMobile()
 * - siteNavMobileToggleScript()
 */

/** 페이지 <head>에 한 번 삽입 (landing / pages 공통 스타일 블록 뒤에 두어도 됨) */
export function siteHeaderNavCoursesGlassStyles(): string {
  return `<style id="site-header-nav-courses-glass">
@keyframes steelTremor {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(0.6px, -0.5px); }
  50% { transform: translate(-0.5px, 0.65px); }
  75% { transform: translate(0.55px, 0.45px); }
}
.site-nav-dd-root:hover .site-nav-dd-tremor,
.site-nav-dd-root:focus-within .site-nav-dd-tremor {
  animation: steelTremor 0.1s linear infinite;
}
.site-nav-titanium-outer {
  border-radius: 14px;
  padding: 1.5px;
  background: linear-gradient(145deg,
    rgba(148, 163, 184, 0.95) 0%,
    rgba(226, 232, 240, 0.92) 32%,
    rgba(100, 116, 139, 0.88) 64%,
    rgba(203, 213, 225, 0.96) 100%);
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.14);
}
.site-nav-titanium-inner {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
}
.site-nav-dd-panel {
  min-width: 15.5rem;
}
.site-nav-dd-link {
  display: block;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.28);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.site-nav-dd-link:last-of-type {
  border-bottom: none;
}
.site-nav-dd-link:hover {
  background: rgba(255, 255, 255, 0.55);
}
.site-nav-dd-desc {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(71, 85, 105, 0.88);
  margin-top: 0.2rem;
  line-height: 1.35;
}
.site-nav-m-acc[open] .site-nav-m-acc-icon {
  transform: rotate(180deg);
}
.site-nav-m-acc-titanium .site-nav-titanium-outer {
  margin-top: 0.25rem;
}
.site-nav-m-acc-titanium .site-nav-dd-link:last-child {
  border-bottom: none;
}
</style>`
}

export function siteNavCoursesDropdownDesktop(): string {
  return `<div class="relative group/nav-dd site-nav-dd-root">
  <button type="button" class="flex items-center gap-1.5 text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium rounded-lg px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 site-nav-dd-trigger" aria-haspopup="true" aria-expanded="false" aria-controls="site-nav-dd-panel">
    과정 안내
    <i class="fas fa-chevron-down text-[0.65rem] opacity-55 transition-transform duration-200 group-hover/nav-dd:rotate-180 group-focus-within/nav-dd:rotate-180" aria-hidden="true"></i>
  </button>
  <div id="site-nav-dd-panel" role="menu" aria-label="과정 안내 하위 메뉴" class="site-nav-dd-panel absolute left-0 top-full z-[60] mt-2 opacity-0 invisible pointer-events-none translate-y-0.5 transition-all duration-200 ease-out group-hover/nav-dd:opacity-100 group-hover/nav-dd:visible group-hover/nav-dd:pointer-events-auto group-hover/nav-dd:translate-y-0 group-focus-within/nav-dd:opacity-100 group-focus-within/nav-dd:visible group-focus-within/nav-dd:pointer-events-auto group-focus-within/nav-dd:translate-y-0">
    <div class="site-nav-titanium-outer site-nav-dd-tremor">
      <div class="site-nav-titanium-inner py-1">
        <a href="/courses/classic" role="menuitem" class="site-nav-dd-link text-classic-sage font-semibold">
          Classic
          <span class="site-nav-dd-desc">마인드스토리 전통 입문 과정</span>
        </a>
        <a href="/courses/next" role="menuitem" class="site-nav-dd-link text-next-accent font-semibold">
          Next
          <span class="site-nav-dd-desc">심화 마스터 과정</span>
        </a>
        <a href="/#courses" role="menuitem" class="site-nav-dd-link text-sm text-gray-700 font-medium border-t border-slate-200/40">
          전체 과정 보기
          <span class="site-nav-dd-desc">랜딩 페이지 과정 섹션으로 이동</span>
        </a>
      </div>
    </div>
  </div>
</div>`
}

export function siteNavCoursesAccordionMobile(): string {
  return `<details class="site-nav-m-acc site-nav-m-acc-titanium rounded-xl overflow-hidden border border-slate-200/50 bg-white/40 backdrop-blur-sm">
  <summary class="px-4 py-3.5 cursor-pointer list-none font-medium text-gray-800 flex items-center justify-between select-none [&::-webkit-details-marker]:hidden">
    <span>과정 안내</span>
    <i class="fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 site-nav-m-acc-icon" aria-hidden="true"></i>
  </summary>
  <div class="px-2 pb-2">
    <div class="site-nav-titanium-outer">
      <div class="site-nav-titanium-inner flex flex-col py-1">
        <a href="/courses/classic" class="site-nav-dd-link text-classic-sage font-semibold">
          Classic
          <span class="site-nav-dd-desc">마인드스토리 전통 입문 과정</span>
        </a>
        <a href="/courses/next" class="site-nav-dd-link text-next-accent font-semibold">
          Next
          <span class="site-nav-dd-desc">심화 마스터 과정</span>
        </a>
        <a href="/#courses" class="site-nav-dd-link text-sm text-gray-700 font-medium">전체 과정 보기</a>
      </div>
    </div>
  </div>
</details>`
}

export function siteNavMobileToggleScript(toggleId: string, panelId: string): string {
  return `(function(){
    var t=document.getElementById('${toggleId}');
    var p=document.getElementById('${panelId}');
    if(!t||!p)return;
    t.addEventListener('click',function(){
      var o=!p.classList.contains('hidden');
      p.classList.toggle('hidden');
      t.setAttribute('aria-expanded',o?'false':'true');
    });
  })();`
}
