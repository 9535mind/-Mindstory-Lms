/**
 * 콘텐츠 보호 시스템
 * - 복사 금지
 * - 우클릭 방지
 * - 드래그 방지
 * - 개발자 도구 방지
 * - 단축키 차단
 */

(function() {
  'use strict';

  // 관리자 페이지는 제외
  if (window.location.pathname.startsWith('/admin')) {
    console.log('ℹ️ 관리자 페이지는 콘텐츠 보호가 적용되지 않습니다.');
    return;
  }

  // 1. 텍스트 선택 방지
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });

  // 2. 우클릭 방지
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('⚠️ 우클릭이 비활성화되어 있습니다.\n\n이 콘텐츠는 저작권으로 보호되고 있습니다.');
    return false;
  });

  // 3. 드래그 방지
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // 4. 복사 방지
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    alert('⚠️ 복사가 금지된 콘텐츠입니다.\n\n저작권 보호를 위해 복사 기능이 비활성화되어 있습니다.');
    return false;
  });

  // 5. 잘라내기 방지
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  });

  // 6. 키보드 단축키 차단
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + C (복사)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      alert('⚠️ 복사 기능이 비활성화되어 있습니다.');
      return false;
    }

    // Ctrl/Cmd + X (잘라내기)
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      e.preventDefault();
      return false;
    }

    // Ctrl/Cmd + A (전체 선택)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const target = e.target;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl/Cmd + U (소스 보기)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      alert('⚠️ 소스 보기가 비활성화되어 있습니다.');
      return false;
    }

    // Ctrl/Cmd + S (페이지 저장)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      alert('⚠️ 페이지 저장이 비활성화되어 있습니다.');
      return false;
    }

    // F12 (개발자 도구)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Ctrl + Shift + I (개발자 도구)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }

    // Ctrl + Shift + J (콘솔)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }

    // Ctrl + Shift + C (요소 검사)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
  });

  // 7. CSS로 텍스트 선택 방지
  const style = document.createElement('style');
  style.textContent = `
    body {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }

    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }

    img {
      -webkit-user-drag: none;
      pointer-events: none;
    }

    a, button, input, textarea, select {
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);

  // 8. 콘솔 메시지
  console.clear();
  console.log('%c🛡️ 콘텐츠 보호 활성화', 'color: green; font-size: 20px; font-weight: bold;');
  console.log('%c저작권 보호를 위해 복사, 우클릭이 제한됩니다.', 'font-size: 14px;');
  console.log('%c© 2026 Mindstory LMS. All rights reserved.', 'font-size: 12px; color: gray;');

})();
