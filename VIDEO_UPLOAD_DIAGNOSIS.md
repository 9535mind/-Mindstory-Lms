# 🔴 영상 업로드 시스템 전체 진단 보고서

**작성일**: 2026-01-01  
**작성자**: GenSpark AI Assistant  
**대상**: 마인드스토리 LMS 영상 업로드 시스템

---

## 📋 목차
1. [현재 상황 요약](#1-현재-상황-요약)
2. [시스템 아키텍처 분석](#2-시스템-아키텍처-분석)
3. [근본 문제점 분석](#3-근본-문제점-분석)
4. [영상 업로드 3가지 방식 상세 분석](#4-영상-업로드-3가지-방식-상세-분석)
5. [저장 실패 원인 분석](#5-저장-실패-원인-분석)
6. [근본적인 해결 방안](#6-근본적인-해결-방안)
7. [구현 계획](#7-구현-계획)
8. [예상 소요 시간](#8-예상-소요-시간)

---

## 1. 현재 상황 요약

### ❌ 문제 상황
```
사용자: URL 업로드 → 저장 버튼 클릭
결과: HTTP 500 Internal Server Error
원인: 불완전한 데이터 전송 / API 오류
```

### 🕐 소요 시간
- **오전**: 5시간 (다른 사이트 작업 실패)
- **오후**: 5시간 (현재 사이트 영상 업로드 작업)
- **총**: 10시간 소요, 영상 1개도 업로드 못함

### 🎯 목표
**영상 업로드 → 저장 → 정상 작동**을 **단순하고 확실하게** 구현

---

## 2. 시스템 아키텍처 분석

### 2.1 전체 구조

```
┌──────────────────────────────────────────────────┐
│                   사용자 UI                      │
│  (차시 추가 모달 - 3개 탭)                       │
└──────────────┬───────────────────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
┌────▼────┐ ┌─▼──────┐ ┌▼────────┐
│YouTube  │ │파일     │ │URL      │
│탭       │ │업로드   │ │업로드   │
│         │ │탭      │ │탭       │
└────┬────┘ └─┬──────┘ └┬────────┘
     │         │         │
     ▼         ▼         ▼
┌────────────────────────────────┐
│   getVideoData() 함수          │
│   (영상 데이터 수집)            │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│   handleSubmit() 함수          │
│   (폼 제출 처리)                │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│   POST /api/courses/:id/lessons│
│   (백엔드 API)                  │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│   Cloudflare D1 Database       │
│   (데이터 저장)                 │
└────────────────────────────────┘
```

### 2.2 파일 구조

```
webapp/
├── src/
│   ├── index.tsx                    # 메인 엔트리
│   ├── routes/
│   │   ├── pages-admin.ts           # 관리자 페이지 (HTML + JS)
│   │   ├── admin.ts                 # 차시 CRUD API
│   │   └── video-apivideo.ts        # api.video 연동 API
│   └── middleware/
│       └── auth.ts                  # 인증 미들웨어
├── public/
│   └── static/
│       └── js/
│           └── admin-lessons.js     # 차시 관리 프론트엔드 로직
└── migrations/
    └── 0001_initial.sql             # DB 스키마
```

---

## 3. 근본 문제점 분석

### 🔴 문제 1: **복잡한 데이터 흐름**

#### 현재 구조 (3단계)
```javascript
// 1단계: URL 업로드 시
uploadedVideoKey = result.video_id;  // video_id만 저장
window.uploadedVideoData = { ... };  // 별도 객체에 전체 데이터 저장

// 2단계: getVideoData() 호출 시
if (currentVideoTab === 'urlupload') {
  return window.uploadedVideoData;  // 별도 객체 참조
}

// 3단계: handleSubmit() 호출 시
const videoData = getVideoData();
// videoData를 API로 전송
```

**문제점**:
- 데이터가 **3곳에 분산** 저장 (uploadedVideoKey, window.uploadedVideoData, DOM input)
- 탭 전환 시 **데이터 동기화 실패** 가능성
- **디버깅 어려움** (어디서 데이터가 사라졌는지 추적 곤란)

---

### 🔴 문제 2: **모달 구조 문제**

#### 현재 모달 HTML 구조
```html
<div id="lessonModal" class="fixed ...">
  <div class="bg-white ... flex flex-col">
    <div>헤더</div>
    <form id="lessonForm" class="flex-1 overflow-y-auto">
      <div class="p-6">
        <!-- 폼 내용 -->
      </div>
    </form>
    <!-- 저장 버튼이 form 밖에 있음! -->
    <div class="border-t flex ...">
      <button onclick="submitLessonForm()">저장</button>
    </div>
  </div>
</div>
```

**문제점**:
- 저장 버튼이 **form 밖**에 있음
- `submitLessonForm()` 함수가 **이벤트를 수동으로 발생**시킴
- 브라우저 기본 폼 검증 **작동하지 않음**
- `type="submit"` 버튼이 아니므로 **엔터키 제출 안 됨**

---

### 🔴 문제 3: **API 응답 구조 불일치**

#### api.video 실제 응답
```json
{
  "videoId": "vi...",
  "title": "...",
  "assets": {
    "player": "https://...",
    "mp4": [
      {
        "quality": "720p",
        "uri": "https://..."
        // duration이 여기 있을 수도, 없을 수도 있음
      }
    ]
  },
  // duration이 최상위에 있을 수도 있음
  "duration": 123  
}
```

**문제점**:
- `duration` 위치가 **일정하지 않음**
- `assets.mp4[0].duration`? `duration`? `assets.hls.duration`?
- **여러 경로를 시도**하다 놓치는 경우 발생

---

### 🔴 문제 4: **getVideoData() 함수의 복잡성**

```javascript
function getVideoData() {
  if (currentVideoTab === 'youtube') {
    // YouTube URL 파싱
    // ...40줄 코드
  } else if (currentVideoTab === 'fileupload') {
    // 파일 업로드 데이터
    // ...10줄 코드
  } else if (currentVideoTab === 'urlupload') {
    // URL 업로드 데이터
    // ...15줄 코드
  }
}
```

**문제점**:
- 하나의 함수에서 **3가지 다른 로직** 처리
- **단일 책임 원칙 위반**
- 각 탭의 로직이 **서로 영향**을 줄 수 있음
- 유지보수 어려움

---

### 🔴 문제 5: **에러 처리 부족**

```javascript
try {
  const response = await apiRequest('POST', '/api/courses/...', formData);
} catch (error) {
  console.error('Save lesson error:', error);
  showError('저장에 실패했습니다.');  // 너무 일반적인 메시지
}
```

**문제점**:
- HTTP 500 에러의 **정확한 원인**을 알 수 없음
- 사용자에게 **구체적인 안내 불가능**
- 디버깅 시 **서버 로그 확인 필요** (Cloudflare Pages는 로그 확인 어려움)

---

## 4. 영상 업로드 3가지 방식 상세 분석

### 4.1 YouTube 탭 ✅ (정상 작동)

```javascript
// 입력
video_url = "https://youtube.com/watch?v=abc123"

// 처리
videoId = extractYouTubeId(video_url)  // "abc123"
embedUrl = `https://youtube.com/embed/${videoId}`

// 출력
{
  video_provider: "youtube",
  video_url: "https://youtube.com/embed/abc123",
  video_id: "abc123"
}

// 저장
DB.lessons.insert({
  video_provider: "youtube",
  video_url: "https://youtube.com/embed/abc123",
  video_id: "abc123"
})
```

**작동 여부**: ✅ **정상 작동**  
**이유**: 간단한 URL 파싱만 필요, API 호출 없음

---

### 4.2 파일 업로드 탭 ⚠️ (부분 작동)

```javascript
// 입력
file = File { name: "video.mp4", size: 50MB }

// 처리 (2단계)
// 1. 브라우저 → 백엔드
FormData → POST /api/video-apivideo/upload
  → api.video.videos.create()
  → api.video.videos.upload(file)

// 2. 백엔드 응답
{
  video_id: "viXXXXX",
  player_url: "https://embed.api.video/vod/viXXXXX",
  duration: 123  // ⚠️ 인코딩 전이라 없을 수 있음
}

// 3. 프론트엔드 저장
uploadedVideoKey = "viXXXXX"
window.uploadedVideoData = { ... }

// 출력
{
  video_provider: "r2",  // ⚠️ 잘못됨! apivideo여야 함
  video_url: "viXXXXX",
  video_id: null
}
```

**작동 여부**: ⚠️ **부분 작동** (영상은 업로드되지만 저장 시 데이터 불일치)  
**문제**: `video_provider`가 `r2`로 잘못 설정됨

---

### 4.3 URL 업로드 탭 ❌ (실패)

```javascript
// 입력
video_url = "https://embed.api.video/vod/viXXXXX"

// 처리 (3단계)
// 1. 프론트엔드 → 백엔드
POST /api/video-apivideo/upload-url
{
  url: "https://embed.api.video/vod/viXXXXX",
  title: "테스트 영상"
}

// 2. 백엔드 → api.video
api.video.videos.create({
  title: "테스트 영상",
  source: {
    type: "url",
    url: "https://embed.api.video/vod/viXXXXX"
  }
})

// 3. 백엔드 응답
{
  success: true,
  data: {
    video_id: "viYYYYY",  // 새로운 video_id
    player_url: "https://...",
    duration: null  // ⚠️ 인코딩 전
  }
}

// 4. 프론트엔드 저장
uploadedVideoKey = "viYYYYY"
window.uploadedVideoData = {
  video_id: "viYYYYY",
  video_provider: "apivideo",
  video_url: "https://..."
}

// 5. 저장 버튼 클릭 → getVideoData() 호출
{
  video_provider: "apivideo",
  video_url: "https://...",
  video_id: "viYYYYY"
}

// 6. 백엔드 API 호출
POST /api/courses/10/lessons
{
  video_provider: "apivideo",
  video_url: "https://...",
  video_id: "viYYYYY",
  // ... 기타 필드
}

// 7. 백엔드 처리
DB.lessons.insert({
  video_provider: "apivideo",
  video_url: "https://...",  // ⚠️ player URL
  video_id: "viYYYYY"
})
```

**작동 여부**: ❌ **실패 (HTTP 500)**  

**추정 원인**:
1. **DB 제약 조건 위반** (video_url이 너무 긺 / NULL 불가 등)
2. **video_provider 값 검증 실패** ("apivideo" 허용 안 됨?)
3. **video_metadata JSON 파싱 오류**
4. **권한 오류** (requireAdmin 미들웨어)

---

## 5. 저장 실패 원인 분석 (HTTP 500)

### 5.1 백엔드 API 분석

```typescript
// src/routes/admin.ts
admin.post('/courses/:courseId/lessons', requireAdmin, async (c) => {
  const { env } = c;
  const courseId = c.req.param('courseId');
  const body = await c.req.json();
  
  // 필드 추출
  const {
    title,
    lesson_number,
    video_duration_minutes,
    video_provider,   // ⚠️ 검증 필요
    video_url,        // ⚠️ 검증 필요
    video_id,
    description,
    is_free_preview,
    status
  } = body;
  
  // DB 삽입
  await env.DB.prepare(`
    INSERT INTO lessons (
      course_id, title, lesson_number, 
      video_duration_minutes, video_provider, video_url, video_id,
      description, is_free_preview, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    courseId, title, lesson_number,
    video_duration_minutes, video_provider, video_url, video_id,
    description, is_free_preview, status
  ).run();
});
```

### 5.2 DB 스키마 확인

```sql
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  video_duration_minutes INTEGER DEFAULT 0,
  video_provider TEXT DEFAULT 'youtube',  -- ⚠️ 기본값
  video_url TEXT NOT NULL,                -- ⚠️ NOT NULL
  video_id TEXT,
  description TEXT,
  is_free_preview INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### 5.3 가능한 오류 원인

#### 원인 1: video_provider 값 불일치
```javascript
// 프론트엔드에서 전송
video_provider: "apivideo"  // ⚠️ DB에서 허용하지 않을 수 있음

// DB에서 허용하는 값 (추정)
// - "youtube"
// - "r2"
// - "apivideo" 없음?
```

#### 원인 2: video_url이 NULL
```javascript
// 프론트엔드에서
video_url: window.uploadedVideoData.video_url  // undefined일 수 있음

// DB 제약 조건
video_url TEXT NOT NULL  // ❌ 에러 발생
```

#### 원인 3: video_id 타입 불일치
```javascript
// 프론트엔드
video_id: "viXXXXXXXXXXX"  // 문자열

// DB
video_id TEXT  // 문제 없어야 하지만...
```

#### 원인 4: JSON 파싱 오류
```typescript
// 백엔드
const body = await c.req.json();  // ⚠️ Content-Type이 application/json이 아니면?
```

---

## 6. 근본적인 해결 방안

### 6.1 설계 원칙

1. **단순화 (KISS - Keep It Simple, Stupid)**
   - 각 탭은 **독립적으로 작동**
   - 공통 데이터 구조 사용
   - 최소한의 전역 변수

2. **명확한 책임 분리**
   - 각 탭마다 별도 함수
   - 데이터 수집 → 검증 → 전송을 명확히 구분

3. **방어적 프로그래밍**
   - 모든 입력 검증
   - 명확한 에러 메시지
   - Fallback 값 제공

4. **디버깅 가능성**
   - 각 단계마다 로깅
   - 사용자에게 진행 상황 표시

---

### 6.2 새로운 데이터 구조

```javascript
// 통합 데이터 구조 (모든 탭 공통)
const VideoData = {
  // 필수 필드
  provider: 'youtube' | 'apivideo' | 'r2',
  url: string,           // 플레이어 URL 또는 스트리밍 URL
  
  // 선택 필드
  video_id: string | null,
  duration: number | null,  // 초 단위
  thumbnail: string | null,
  
  // 메타데이터
  source: 'youtube' | 'file' | 'url',  // 어떤 탭에서 왔는지
  raw_input: string | File,            // 원본 입력
};
```

---

### 6.3 리팩토링 계획

#### Phase 1: 데이터 수집 단순화
```javascript
// 현재 (복잡함)
function getVideoData() {
  if (currentVideoTab === 'youtube') { ... }
  else if (currentVideoTab === 'fileupload') { ... }
  else if (currentVideoTab === 'urlupload') { ... }
}

// 개선 (각 탭마다 별도 함수)
function getYouTubeVideoData() { ... }
function getFileUploadVideoData() { ... }
function getUrlUploadVideoData() { ... }

function getVideoData() {
  const handlers = {
    'youtube': getYouTubeVideoData,
    'fileupload': getFileUploadVideoData,
    'urlupload': getUrlUploadVideoData
  };
  
  const handler = handlers[currentVideoTab];
  if (!handler) {
    throw new Error(`Unknown video tab: ${currentVideoTab}`);
  }
  
  return handler();
}
```

#### Phase 2: 데이터 저장 통합
```javascript
// 현재 (분산됨)
uploadedVideoKey = result.video_id;
window.uploadedVideoData = { ... };
hiddenInput.value = result.video_id;

// 개선 (하나의 객체로 통합)
window.currentLessonVideo = {
  provider: 'apivideo',
  url: result.player_url,
  video_id: result.video_id,
  duration: result.duration,
  thumbnail: result.thumbnail_url,
  source: 'url',
  uploaded_at: new Date().toISOString()
};

// Hidden input도 이 객체를 JSON으로 저장
document.getElementById('videoData').value = JSON.stringify(window.currentLessonVideo);
```

#### Phase 3: 모달 구조 수정
```html
<!-- 현재 -->
<form>...</form>
<div>
  <button onclick="submitLessonForm()">저장</button>
</div>

<!-- 개선 -->
<form id="lessonForm">
  ...
  <div class="sticky bottom-0 bg-white border-t p-6">
    <button type="submit">저장</button>
  </div>
</form>
```

#### Phase 4: 에러 처리 개선
```javascript
// 현재
catch (error) {
  console.error('Save lesson error:', error);
  showError('저장에 실패했습니다.');
}

// 개선
catch (error) {
  console.error('Save lesson error:', error);
  
  let message = '저장에 실패했습니다.';
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400) {
      message = `입력 오류: ${data.error || '필수 항목을 확인하세요'}`;
    } else if (status === 401) {
      message = '로그인이 필요합니다.';
    } else if (status === 403) {
      message = '권한이 없습니다.';
    } else if (status === 500) {
      message = `서버 오류: ${data.error || '관리자에게 문의하세요'}`;
    }
  }
  
  showError(message);
  
  // 디버깅 정보 표시
  console.log('📋 디버깅 정보:', {
    currentVideoTab,
    videoData: window.currentLessonVideo,
    formData: {
      title: document.getElementById('lessonTitle').value,
      lesson_number: document.getElementById('lessonOrder').value,
      // ...
    }
  });
}
```

---

## 7. 구현 계획

### 7.1 즉시 수정 (긴급)

#### ✅ Task 1: DB 스키마 확인 및 수정
```sql
-- video_provider 허용 값 확인
-- 'apivideo' 추가 또는 'api.video'로 통일

-- lessons 테이블 수정
ALTER TABLE lessons 
ALTER COLUMN video_url DROP NOT NULL;  -- NULL 허용 (임시)

-- 또는
ALTER TABLE lessons 
ADD CONSTRAINT check_video_provider 
CHECK (video_provider IN ('youtube', 'apivideo', 'r2'));
```

**예상 시간**: 30분

---

#### ✅ Task 2: getVideoData() 함수 완전 재작성
```javascript
// admin-lessons.js

// 각 탭별 독립 함수
function getYouTubeVideoData() {
  const input = document.getElementById('lessonVideoUrl');
  const url = input?.value?.trim();
  
  if (!url) {
    alert('YouTube URL을 입력해주세요.');
    return null;
  }
  
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    alert('올바른 YouTube URL을 입력해주세요.');
    return null;
  }
  
  return {
    provider: 'youtube',
    url: `https://www.youtube.com/embed/${videoId}`,
    video_id: videoId,
    duration: null,
    thumbnail: null,
    source: 'youtube'
  };
}

function getFileUploadVideoData() {
  if (!window.currentLessonVideo) {
    alert('영상 파일을 업로드해주세요.');
    return null;
  }
  
  return window.currentLessonVideo;
}

function getUrlUploadVideoData() {
  if (!window.currentLessonVideo) {
    alert('영상 URL을 입력해주세요.');
    return null;
  }
  
  return window.currentLessonVideo;
}

// 통합 함수
function getVideoData() {
  console.log('📹 getVideoData 호출, 현재 탭:', currentVideoTab);
  
  const handlers = {
    'youtube': getYouTubeVideoData,
    'fileupload': getFileUploadVideoData,
    'urlupload': getUrlUploadVideoData
  };
  
  const handler = handlers[currentVideoTab];
  if (!handler) {
    console.error('❌ 알 수 없는 탭:', currentVideoTab);
    alert('영상 탭을 선택해주세요.');
    return null;
  }
  
  const data = handler();
  console.log('✅ 영상 데이터:', data);
  return data;
}
```

**예상 시간**: 1시간

---

#### ✅ Task 3: URL 업로드 데이터 저장 수정
```javascript
// handleVideoUrlUpload() 함수 수정

// 업로드 완료 후
window.currentLessonVideo = {
  provider: result.video_type || 'apivideo',
  url: result.player_url || result.video_url,
  video_id: result.video_id,
  duration: result.duration || null,
  thumbnail: result.thumbnail_url || null,
  source: 'url',
  uploaded_at: new Date().toISOString()
};

console.log('✅ currentLessonVideo 저장:', window.currentLessonVideo);

// Hidden input에도 저장 (백업)
const hiddenInput = document.getElementById('videoData');
if (hiddenInput) {
  hiddenInput.value = JSON.stringify(window.currentLessonVideo);
}
```

**예상 시간**: 30분

---

#### ✅ Task 4: 백엔드 API 방어 코드 추가
```typescript
// src/routes/admin.ts

admin.post('/courses/:courseId/lessons', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 필드 검증
    if (!body.title || !body.lesson_number) {
      return c.json({ 
        success: false, 
        error: '제목과 차시 순서는 필수입니다.' 
      }, 400);
    }
    
    // video_provider 정규화
    let video_provider = body.video_provider || 'youtube';
    if (video_provider === 'api.video' || video_provider === 'apivideo') {
      video_provider = 'apivideo';
    }
    
    // video_url 검증
    const video_url = body.video_url || '';
    if (!video_url) {
      return c.json({ 
        success: false, 
        error: '영상 URL이 필요합니다.' 
      }, 400);
    }
    
    // DB 삽입
    await env.DB.prepare(`...`).bind(...).run();
    
    return c.json({ success: true, id: result.meta.last_row_id });
    
  } catch (error) {
    console.error('❌ Lesson creation error:', error);
    return c.json({ 
      success: false, 
      error: error.message || '서버 오류가 발생했습니다.' 
    }, 500);
  }
});
```

**예상 시간**: 45분

---

### 7.2 중기 개선 (권장)

#### Task 5: 모달 구조 완전 재설계
- 저장 버튼을 form 안으로 이동
- Sticky footer로 항상 보이도록
- 브라우저 기본 검증 활용

**예상 시간**: 2시간

#### Task 6: 진도 추적 시스템 개선
- 영상 길이 자동 감지 강화
- 재생 시간 실시간 업데이트

**예상 시간**: 3시간

#### Task 7: 테스트 코드 작성
- 각 탭별 단위 테스트
- E2E 테스트 (Playwright)

**예상 시간**: 4시간

---

### 7.3 장기 개선 (선택)

#### Task 8: TypeScript 전환
- 타입 안정성 확보
- 런타임 에러 사전 방지

**예상 시간**: 8시간

#### Task 9: 상태 관리 라이브러리 도입
- Zustand 또는 Jotai
- 전역 상태 명확하게 관리

**예상 시간**: 6시간

---

## 8. 예상 소요 시간

### 긴급 수정 (Task 1~4)
| Task | 내용 | 시간 |
|------|------|------|
| Task 1 | DB 스키마 확인 및 수정 | 30분 |
| Task 2 | getVideoData() 재작성 | 1시간 |
| Task 3 | URL 업로드 데이터 저장 수정 | 30분 |
| Task 4 | 백엔드 API 방어 코드 | 45분 |
| **테스트** | 3가지 탭 모두 테스트 | 45분 |
| **문서화** | 수정 내용 정리 | 30분 |
| **총계** | | **4시간** |

### 중기 개선 (Task 5~7)
- 모달 구조 재설계: 2시간
- 진도 추적 개선: 3시간
- 테스트 코드: 4시간
- **총계**: **9시간**

### 장기 개선 (Task 8~9)
- TypeScript 전환: 8시간
- 상태 관리: 6시간
- **총계**: **14시간**

---

## 9. 권장 실행 계획

### 🚨 우선순위 1: 긴급 수정 (내일 완료)
```
09:00 - 09:30  Task 1: DB 스키마 확인
09:30 - 10:30  Task 2: getVideoData() 재작성
10:30 - 11:00  Task 3: 데이터 저장 수정
11:00 - 11:45  Task 4: 백엔드 방어 코드
11:45 - 12:30  테스트 (3가지 탭)
12:30 - 13:00  문서화 및 배포
```

### ⚠️ 우선순위 2: 중기 개선 (1주일 내)
- 모달 구조 재설계
- 진도 추적 시스템 개선
- 테스트 코드 작성

### 💡 우선순위 3: 장기 개선 (필요 시)
- TypeScript 전환
- 상태 관리 라이브러리

---

## 10. 결론 및 제안

### 현재 문제의 본질
1. **복잡한 데이터 흐름** → 데이터 손실/불일치
2. **불완전한 구조 설계** → 저장 버튼 위치, form 검증
3. **방어 코드 부족** → HTTP 500 에러 원인 불명

### 근본 해결책
1. **데이터 구조 통일**: 모든 탭이 같은 구조 사용
2. **함수 분리**: 각 탭마다 독립 함수
3. **방어적 프로그래밍**: 입력 검증, 에러 처리
4. **명확한 로깅**: 디버깅 가능하도록

### 즉시 실행 항목
- ✅ Task 1~4 완료 (4시간)
- ✅ 3가지 탭 모두 테스트
- ✅ 배포 및 검증

### 다음 미팅 안건
1. 긴급 수정 결과 확인
2. 중기 개선 일정 협의
3. 장기 개선 필요성 논의

---

**보고서 끝**

작성: 2026-01-01  
작성자: GenSpark AI Assistant
