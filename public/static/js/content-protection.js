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

    // 2. 우클릭(컨텍스트 메뉴) 차단
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWarning('🚫 우클릭이 차단되었습니다.');
        return false;
    }, false);

    // 3. 드래그 차단
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    }, false);

    // 4. 복사 차단
    document.addEventListener('copy', function(e) {
        // input, textarea는 제외
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        showWarning('🚫 복사가 차단되었습니다.');
        return false;
    }, false);

    // 5. 잘라내기 차단
    document.addEventListener('cut', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    }, false);

    // 6. 단축키 차단
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd 키 조합 차단
        if (e.ctrlKey || e.metaKey) {
            // Ctrl+C (복사)
            if (e.keyCode === 67) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    showWarning('🚫 복사가 차단되었습니다.');
                    return false;
                }
            }
            // Ctrl+X (잘라내기)
            if (e.keyCode === 88) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    return false;
                }
            }
            // Ctrl+A (전체 선택)
            if (e.keyCode === 65) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    return false;
                }
            }
            // Ctrl+S (저장)
            if (e.keyCode === 83) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U (소스 보기)
            if (e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I (개발자 도구)
            if (e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+J (콘솔)
            if (e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+C (요소 검사)
            if (e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
        }
        
        // F12 (개발자 도구)
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
    }, false);

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

    // 8. 경고 메시지 표시 함수
    let warningTimeout = null;
    function showWarning(message) {
        // 기존 경고 제거
        const existingWarning = document.getElementById('contentProtectionWarning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // 새 경고 생성
        const warning = document.createElement('div');
        warning.id = 'contentProtectionWarning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
        `;
        warning.textContent = message;
        document.body.appendChild(warning);
        
        // 3초 후 제거
        if (warningTimeout) clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
            warning.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => warning.remove(), 300);
        }, 3000);
    }

    // 9. 애니메이션 추가
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animationStyle);

    // 10. YouTube IFrame 보호 (동적 감지)
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

    // IFrame 보호 함수
    function protectIframe(iframe) {
        // 우클릭 차단
        iframe.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showWarning('🚫 우클릭이 차단되었습니다.');
            return false;
        });
        
        // 드래그 차단
        iframe.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // CSS 적용
        iframe.style.userSelect = 'none';
        iframe.style.webkitUserSelect = 'none';
        iframe.style.mozUserSelect = 'none';
    }

    // 11. 기존 iframe들 보호
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
