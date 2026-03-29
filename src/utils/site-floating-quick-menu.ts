/**
 * 플로팅 퀵 메뉴 — PC 우측 세로(티타늄 글래스) / 모바일 하단 고정 가로 바
 * <head>: siteFloatingQuickMenuStyles() · 본문 직후(푸터 다음 권장): siteFloatingQuickMenuMarkup() · DOMContentLoaded: siteFloatingQuickMenuScript()
 */

import {
  SITE_CONTACT_EMAIL,
  SITE_KAKAO_CHANNEL_URL,
} from './site-footer-legal'

const mailtoConsult = `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent('1:1 상담 문의')}`

export function siteFloatingQuickMenuStyles(): string {
  return `<style id="site-floating-quick-menu">
.ms-float-titanium-outer {
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(145deg,
    rgba(148, 163, 184, 0.95) 0%,
    rgba(226, 232, 240, 0.92) 32%,
    rgba(100, 116, 139, 0.88) 64%,
    rgba(203, 213, 225, 0.96) 100%);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
}
.ms-float-titanium-inner {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
}
/* 데스크톱: 우측 중앙 세로 */
.ms-float-rail-desktop {
  position: fixed;
  z-index: 90;
  right: max(0.75rem, env(safe-area-inset-right, 0px));
  top: 50%;
  transform: translateY(-50%);
  display: none;
}
@media (min-width: 768px) {
  .ms-float-rail-desktop { display: block; }
}
.ms-float-rail-desktop .ms-float-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.65rem 0.55rem;
  min-width: 4.25rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  transition: background-color 0.15s ease, color 0.15s ease;
}
.ms-float-rail-desktop .ms-float-link:last-child { border-bottom: none; }
.ms-float-rail-desktop .ms-float-link:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #4f46e5;
}
.ms-float-rail-desktop .ms-float-link i {
  font-size: 1.15rem;
  opacity: 0.88;
}
.ms-float-rail-desktop button.ms-float-link {
  width: 100%;
  cursor: pointer;
  border: none;
  background: transparent;
  font: inherit;
}
/* 모바일: 하단 가로 바 */
.ms-float-rail-mobile {
  position: fixed;
  z-index: 90;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 0;
  padding: 0.45rem 0.35rem calc(0.45rem + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(148, 163, 184, 0.45);
  box-shadow: 0 -8px 32px rgba(15, 23, 42, 0.12);
}
@media (min-width: 768px) {
  .ms-float-rail-mobile { display: none !important; }
}
.ms-float-rail-mobile .ms-float-m-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-height: 3.35rem;
  padding: 0.35rem 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e293b;
  text-decoration: none;
  border-radius: 0.75rem;
  transition: background-color 0.15s ease, color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.ms-float-rail-mobile .ms-float-m-item:active {
  background: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}
.ms-float-rail-mobile .ms-float-m-item i {
  font-size: 1.35rem;
  color: #4f46e5;
}
.ms-float-rail-mobile button.ms-float-m-item {
  border: none;
  background: transparent;
  font: inherit;
  width: 100%;
  cursor: pointer;
}
.ms-float-mobile-spacer {
  height: calc(4.15rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 768px) {
  .ms-float-mobile-spacer { display: none !important; height: 0 !important; }
}
</style>`
}

export function siteFloatingQuickMenuMarkup(): string {
  return `
<div class="ms-float-mobile-spacer" aria-hidden="true"></div>
<aside class="ms-float-rail-desktop" aria-label="빠른 상담 메뉴">
  <div class="ms-float-titanium-outer">
    <div class="ms-float-titanium-inner py-1">
      <a href="${mailtoConsult}" class="ms-float-link" title="이메일로 1:1 상담">
        <i class="fas fa-envelope" aria-hidden="true"></i>
        <span>1:1 상담</span>
      </a>
      <a href="${SITE_KAKAO_CHANNEL_URL}" class="ms-float-link" target="_blank" rel="noopener noreferrer" title="카카오톡 채널">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEE500]" aria-hidden="true"><i class="fas fa-comment text-sm" style="color:#191919"></i></span>
        <span>카톡 문의</span>
      </a>
      <button type="button" class="ms-float-link" data-ms-float-top aria-label="맨 위로">
        <i class="fas fa-arrow-up" aria-hidden="true"></i>
        <span>TOP</span>
      </button>
    </div>
  </div>
</aside>
<nav class="ms-float-rail-mobile md:hidden" aria-label="빠른 상담 메뉴">
  <a href="${mailtoConsult}" class="ms-float-m-item">
    <i class="fas fa-envelope" aria-hidden="true"></i>
    <span>1:1 상담</span>
  </a>
  <a href="${SITE_KAKAO_CHANNEL_URL}" class="ms-float-m-item" target="_blank" rel="noopener noreferrer">
    <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEE500] shadow-sm" aria-hidden="true"><i class="fas fa-comment text-lg" style="color:#191919"></i></span>
    <span>카톡</span>
  </a>
  <button type="button" class="ms-float-m-item" data-ms-float-top>
    <i class="fas fa-arrow-up" aria-hidden="true"></i>
    <span>TOP</span>
  </button>
</nav>`
}

/** 인라인 스크립트 문자열 — DOMContentLoaded 안에서 호출하거나 뒤에 붙여도 됨 */
export function siteFloatingQuickMenuScript(): string {
  return `(function(){
    document.querySelectorAll('[data-ms-float-top]').forEach(function(el){
      el.addEventListener('click',function(e){ e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    });
  })();`
}
