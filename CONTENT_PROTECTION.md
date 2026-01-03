# 콘텐츠 보호 시스템

## 개요
마인드스토리 LMS는 유료 강좌 콘텐츠를 불법 복사 및 공유로부터 보호하기 위한 다층 보안 시스템을 적용하고 있습니다.

---

## 🛡️ 적용된 보호 기능

### 1. 텍스트 선택 방지
- **기능**: 마우스 드래그로 텍스트를 선택할 수 없음
- **구현**: `user-select: none` CSS 속성
- **적용 대상**: 강의 제목, 설명, 차시 내용

### 2. 우클릭 방지
- **기능**: 마우스 우클릭 컨텍스트 메뉴 차단
- **효과**: 이미지 저장, 페이지 소스 보기 등 차단
- **알림**: "⚠️ 우클릭이 비활성화되어 있습니다."

### 3. 드래그 방지
- **기능**: 이미지 및 텍스트 드래그 차단
- **효과**: 드래그 앤 드롭으로 콘텐츠 복사 방지

### 4. 단축키 차단
차단된 키보드 단축키:
- `Ctrl + C` / `Cmd + C`: 복사 차단
- `Ctrl + X` / `Cmd + X`: 잘라내기 차단
- `Ctrl + A` / `Cmd + A`: 전체 선택 차단
- `Ctrl + S` / `Cmd + S`: 페이지 저장 차단
- `Ctrl + U` / `Cmd + U`: 소스 보기 차단
- `F12`: 개발자 도구 차단
- `Ctrl + Shift + I/J/C`: 개발자 도구 단축키 차단

### 5. 개발자 도구 방지
- **기능**: 개발자 도구 접근 차단
- **방법**: F12 및 단축키 차단
- **효과**: HTML/CSS/JS 코드 직접 열람 방지

### 6. YouTube 영상 특별 보호 ⭐ NEW!
- **기능**: YouTube IFrame 영상 복사/다운로드/공유 완전 차단
- **구현 방식**:
  - YouTube 플레이어 설정 최적화
  - IFrame 오버레이 보호 레이어
  - 동적 콘텐츠 감지 (MutationObserver)
  - Fetch API 가로채기
- **차단 항목**:
  - 키보드 컨트롤 비활성화 (`disablekb: 1`)
  - 전체화면 버튼 숨김 (`fs: 0`)
  - 공유 버튼 숨김 (CSS)
  - 주석/자막 표시 안함
  - 영상 URL 추출 차단
  - IFrame 우클릭 차단
  - 영상 드래그 방지
- **알림**: "⚠️ 영상 복사 및 다운로드가 금지되어 있습니다."

---

## 📂 파일 구조

```
/home/user/webapp/
├── public/
│   └── static/
│       └── js/
│           └── content-protection.js  # 콘텐츠 보호 스크립트
└── src/
    └── routes/
        ├── pages-admin.ts           # 관리자 페이지 (보호 적용)
        ├── pages-learn.ts           # 학습 플레이어 (보호 적용)
        ├── landing.ts               # 랜딩 페이지 (보호 적용)
        ├── pages-course-detail.ts   # 강좌 상세 (보호 적용)
        └── pages-my.ts              # 마이 페이지 (보호 적용)
```

---

## 🔧 기술 구현

### content-protection.js
```javascript
// 1. 텍스트 선택 방지
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

// 2. 우클릭 방지
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('⚠️ 우클릭이 비활성화되어 있습니다.');
});

// 3. 드래그 방지
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

// 4. 복사/잘라내기 방지
document.addEventListener('copy', function(e) {
    e.preventDefault();
    alert('⚠️ 복사가 금지된 콘텐츠입니다.');
});

// 5. 단축키 차단
document.addEventListener('keydown', function(e) {
    // F12, Ctrl+Shift+I/J/C, Ctrl+U/S/C/X/A 차단
    // ... (생략)
});

// 6. YouTube IFrame 보호 ⭐ NEW!
function protectVideoPlayer() {
    const youtubeIframe = document.querySelector('iframe[src*="youtube.com"]');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (youtubeIframe || videoPlayer) {
        // 영상 컨테이너 우클릭 차단
        videoPlayer.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            alert('⚠️ 영상 복사 및 다운로드가 금지되어 있습니다.');
            return false;
        }, true);
        
        // IFrame 보호
        if (youtubeIframe) {
            youtubeIframe.style.cssText = `
                pointer-events: auto !important;
                -webkit-user-select: none !important;
                user-select: none !important;
            `;
        }
    }
}

// 7. 동적 콘텐츠 감지 (MutationObserver)
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
            protectVideoPlayer();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 8. Fetch API 가로채기 (영상 URL 추출 차단)
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('youtube.com')) {
        console.warn('⚠️ 영상 URL 접근이 차단되었습니다.');
    }
    return originalFetch.apply(this, args);
};
```

### pages-learn.ts (YouTube 플레이어 설정)
```typescript
player = new YT.Player('youtubePlayer', {
    videoId: videoId,
    playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        disablekb: 1,           // 키보드 컨트롤 비활성화
        fs: 0,                  // 전체화면 버튼 숨김
        iv_load_policy: 3,      // 주석 숨김
        cc_load_policy: 0,      // 자막 표시 안함
        showinfo: 0             // 제목 표시 안함
    }
});

// IFrame 보호 오버레이
container.innerHTML = `
    <div style="position: relative;">
        <div id="youtubePlayer"></div>
        <div id="youtubeProtection" style="position: absolute; pointer-events: none; z-index: 10;"></div>
    </div>
`;
```

### CSS 보호
```css
/* YouTube 공유 버튼 숨김 */
.ytp-chrome-top,
.ytp-share-button,
.ytp-watch-later-button {
    display: none !important;
}

/* IFrame 선택 방지 */
iframe {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    user-select: none !important;
}
```

---

## 🎯 적용 페이지

### ✅ 보호 적용 완료
1. **랜딩 페이지** (`/`)
2. **강좌 상세 페이지** (`/courses/:id`)
3. **학습 플레이어** (`/learn/:enrollmentId`)
4. **마이 페이지** (`/my`)
5. **관리자 대시보드** (`/admin/*`)

### 📝 적용 방법
각 페이지의 `</head>` 태그 직전에 다음 스크립트 추가:
```html
<script src="/static/js/content-protection.js"></script>
</head>
```

---

## ⚠️ 제한 사항

### 우회 가능한 방법들
1. **스크린샷/녹화**: 물리적 화면 캡처는 막을 수 없음
2. **모바일 카메라**: 화면을 카메라로 촬영하는 것은 방지 불가
3. **브라우저 확장 프로그램**: 일부 확장 프로그램으로 우회 가능
4. **JavaScript 비활성화**: JS를 끄면 보호 기능도 비활성화됨

### 추가 보호 방안 (향후 고려)
1. **워터마크**: 사용자 이메일/ID를 영상에 오버레이
2. **DRM**: Cloudflare Stream의 DRM 기능 활용
3. **IP 제한**: 동일 계정 다중 접속 제한
4. **스트리밍 보안**: HLS 암호화 적용

---

## 📊 보안 효과

### Before (보호 없음)
❌ 텍스트 선택 가능  
❌ 우클릭으로 이미지 저장 가능  
❌ Ctrl+C로 복사 가능  
❌ 개발자 도구로 HTML 열람 가능  
❌ 소스 코드 다운로드 가능  
❌ **YouTube 영상 복사/다운로드 가능** 🚨  
❌ **YouTube 공유 버튼으로 확산 가능** 🚨  
❌ **영상 URL 직접 추출 가능** 🚨

### After (보호 적용)
✅ 텍스트 선택 불가  
✅ 우클릭 차단 (알림 표시)  
✅ 복사/잘라내기 차단 (알림 표시)  
✅ 개발자 도구 접근 어려움  
✅ 소스 보기 차단  
✅ **YouTube 영상 복사/다운로드 완전 차단** 🛡️  
✅ **YouTube 공유 버튼 완전 숨김** 🛡️  
✅ **영상 URL 추출 차단** 🛡️  
✅ **키보드 컨트롤 비활성화** 🛡️  
✅ **전체화면 버튼 숨김** 🛡️  
✅ **IFrame 우클릭 완전 차단** 🛡️  

---

## 🚀 배포 정보

- **최초 적용**: 2026-01-03
- **YouTube 보호 추가**: 2026-01-03
- **최신 배포 URL**: https://bb1fa41a.mindstory-lms.pages.dev
- **Git 커밋**: 
  - `ede0768` - Add R2 direct link and content protection system
  - `6697910` - Apply content protection to all pages
  - `90345f1` - Add comprehensive YouTube video protection system ⭐ NEW!

---

## 📞 문의

콘텐츠 보호 기능 관련 문의:
- 관리자: admin@lms.kr
- 기술 지원: 젠스 AI 어시스턴트

---

## 📚 참고 문서

- [Cloudflare Stream DRM](https://developers.cloudflare.com/stream/drm/)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Protection Strategies](https://www.cloudflare.com/learning/access-management/what-is-drm/)

---

**마지막 업데이트**: 2026-01-03  
**버전**: 1.0.0
