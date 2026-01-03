/**
 * 콘텐츠 보호 시스템
 * - 텍스트 선택 차단
 * - 우클릭 차단
 * - 드래그 차단
 * - 복사/잘라내기 차단
 * - 개발자 도구 차단
 * - 단축키 차단
 */

(function() {
    'use strict';
    
    console.log('🔒 콘텐츠 보호 시스템 시작');

    // 1. 텍스트 선택 차단
    document.addEventListener('selectstart', function(e) {
        // input, textarea는 제외
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    }, false);

    // 2. 우클릭(컨텍스트 메뉴) 완전 차단 (팝업 없음)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }, true); // true로 변경하여 캡처 단계에서 차단
    
    // 추가: 마우스 우클릭 버튼 자체를 차단
    document.addEventListener('mousedown', function(e) {
        if (e.button === 2) { // 우클릭
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);
    
    // 추가: 마우스 업 이벤트도 차단
    document.addEventListener('mouseup', function(e) {
        if (e.button === 2) { // 우클릭
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // 3. 드래그 차단
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, false);

    // 4. 복사 차단 (팝업 없음)
    document.addEventListener('copy', function(e) {
        // input, textarea는 제외
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }, true);

    // 5. 잘라내기 차단
    document.addEventListener('cut', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    }, false);

    // 6. 단축키 차단 (팝업 없음)
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd 키 조합 차단
        if (e.ctrlKey || e.metaKey) {
            // Ctrl+C (복사)
            if (e.keyCode === 67) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
            // Ctrl+X (잘라내기)
            if (e.keyCode === 88) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
            // Ctrl+A (전체 선택)
            if (e.keyCode === 65) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
            // Ctrl+S (저장)
            if (e.keyCode === 83) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
            // Ctrl+U (소스 보기)
            if (e.keyCode === 85) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
            // Ctrl+Shift+I (개발자 도구)
            if (e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
            // Ctrl+Shift+J (콘솔)
            if (e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
            // Ctrl+Shift+C (요소 검사)
            if (e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }
        
        // F12 (개발자 도구)
        if (e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // 7. CSS로 선택 비활성화
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-user-drag: none !important;
            -moz-user-drag: none !important;
            user-drag: none !important;
        }
        
        /* input, textarea는 예외 */
        input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
        
        /* 이미지 드래그 방지 */
        img {
            pointer-events: none !important;
            -webkit-user-drag: none !important;
            -moz-user-drag: none !important;
            user-drag: none !important;
        }
        
        /* 영상 플레이어 보호 */
        #videoPlayer, #videoPlayer * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            user-select: none !important;
        }
        
        /* iframe 보호 */
        iframe {
            pointer-events: auto !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            user-select: none !important;
        }
    `;
    document.head.appendChild(style);

    // 8. IFrame 보호 함수
    function protectIframe(iframe) {
        // 우클릭 완전 차단 (팝업 없음)
        iframe.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }, true);
        
        // 드래그 차단
        iframe.addEventListener('dragstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }, true);
        
        // 마우스 우클릭 버튼 차단
        iframe.addEventListener('mousedown', function(e) {
            if (e.button === 2) { // 우클릭
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);
        
        // CSS 적용
        iframe.style.userSelect = 'none';
        iframe.style.webkitUserSelect = 'none';
        iframe.style.mozUserSelect = 'none';
    }

    // 9. YouTube IFrame 보호 (동적 감지)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // YouTube iframe 찾기
                    const iframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
                    if (node.tagName === 'IFRAME') {
                        protectIframe(node);
                    }
                    iframes.forEach(protectIframe);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 10. 기존 iframe들 보호
    document.addEventListener('DOMContentLoaded', function() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(protectIframe);
    });

    // 페이지 로드 시에도 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(protectIframe);
        });
    } else {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(protectIframe);
    }

    console.log('✅ 콘텐츠 보호 시스템 활성화 완료');
    console.log('📋 보호 기능:');
    console.log('  - 텍스트 선택 차단');
    console.log('  - 우클릭 차단');
    console.log('  - 드래그 차단');
    console.log('  - 복사/잘라내기 차단');
    console.log('  - 개발자 도구 단축키 차단');
    console.log('  - IFrame 보호');
    console.log('');
    console.log('© 2026 Mindstory LMS. All rights reserved.');

})();
