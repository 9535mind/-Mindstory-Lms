# 📹 외부 영상 스토리지 설정 가이드

**R2 Storage 없이 외부 서비스로 영상 호스팅하기**

---

## 🎯 지원 서비스

### 1. **api.video** (가장 추천) ⭐⭐⭐⭐⭐

**장점:**
- ✅ 무료 인코딩 (무제한)
- ✅ 자동 트랜스코딩 (모든 해상도)
- ✅ CDN 글로벌 배포
- ✅ 간단한 API
- ✅ HLS/DASH 스트리밍

**가격:**
- 인코딩: **무료**
- 저장: $0.00285/분
- 전송: $0.0017/GB
- 예: 1시간 영상 = 저장 $0.17/월 + 전송 $0.17/100회

**설정 방법:**

1. **가입 & API 키 발급:**
   ```
   https://dashboard.api.video/ 접속
   → Sign Up (무료)
   → API Keys 메뉴
   → API Key 복사
   ```

2. **환경 변수 설정:**
   ```bash
   # .dev.vars 파일에 추가
   APIVIDEO_API_KEY=your_api_key_here
   ```

3. **wrangler.jsonc 설정:**
   ```jsonc
   {
     "vars": {
       "APIVIDEO_API_KEY": "your_api_key_here"
     }
   }
   ```

---

### 2. **Vimeo** ⭐⭐⭐⭐

**장점:**
- ✅ 고품질 플레이어
- ✅ 무료 계정 가능 (5GB/주)
- ✅ 커스터마이징 가능
- ✅ 비공개 영상 지원

**가격:**
- Free: 5GB/주, 25 영상/년
- Plus: $12/월, 250GB/년

**설정 방법:**

1. **가입 & Access Token 발급:**
   ```
   https://vimeo.com/ 가입
   → https://developer.vimeo.com/ 접속
   → "Create App" 클릭
   → App Name 입력, 약관 동의
   → "Personal Access Token" 생성
   → Scopes: "upload", "video_files" 체크
   → Token 복사
   ```

2. **API 업로드 권한 요청 (무료 계정):**
   ```
   https://vimeo.com/help/contact 접속
   → "API upload access" 요청
   → 앱 이름과 사용 목적 설명
   → 1-2일 내 승인
   ```

3. **환경 변수 설정:**
   ```bash
   # .dev.vars 파일에 추가
   VIMEO_ACCESS_TOKEN=your_access_token_here
   ```

---

### 3. **YouTube Data API** ⭐⭐⭐

**장점:**
- ✅ 완전 무료
- ✅ 무제한 저장
- ✅ 글로벌 CDN
- ✅ 자동 자막

**단점:**
- ⚠️ 공개/unlisted만 가능
- ⚠️ 10,000 쿼터/일
- ⚠️ API 업로드 복잡

**설정 방법:**

1. **Google Cloud Console 설정:**
   ```
   https://console.cloud.google.com/ 접속
   → 새 프로젝트 생성
   → "YouTube Data API v3" 활성화
   → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
   ```

2. **수동 업로드 권장:**
   ```
   API 업로드는 복잡하므로
   YouTube Studio에서 수동 업로드 후
   영상 ID만 LMS에 입력하는 것을 권장
   ```

---

## 🚀 사용 방법

### **관리자 페이지에서 업로드:**

1. **로그인:**
   - https://mindstory-lms.pages.dev/login
   - 관리자 계정으로 로그인

2. **강좌 관리 → 차시 관리:**
   - 원하는 강좌의 "차시 관리" 클릭
   - "신규 차시 추가" 클릭

3. **영상 업로드 방법 선택:**

   **Option A: api.video 업로드** (추천)
   - "외부 스토리지" 탭 클릭
   - Provider: "api.video" 선택
   - 파일 선택 (최대 5GB)
   - "업로드" 버튼
   - → 자동으로 인코딩 후 video_url 저장

   **Option B: Vimeo 업로드**
   - "외부 스토리지" 탭 클릭
   - Provider: "Vimeo" 선택
   - 파일 선택
   - "업로드" 버튼
   - → Unlisted로 업로드 후 video_url 저장

   **Option C: YouTube (수동)**
   - YouTube Studio에서 영상 업로드
   - 영상 URL 복사 (예: `https://youtu.be/dQw4w9WgXcQ`)
   - "YouTube URL" 탭에서 URL 또는 ID 입력
   - → video_url에 YouTube ID 저장

---

## 📊 비용 비교

| 서비스 | 인코딩 | 저장 (1시간) | 전송 (100회) | 월 예상 비용 |
|--------|--------|--------------|--------------|--------------|
| **api.video** | 무료 | $0.17 | $0.17 | **$0.34** |
| **Vimeo Plus** | 무료 | 포함 | 포함 | **$12** |
| **YouTube** | 무료 | 무료 | 무료 | **$0** |
| **Cloudflare R2** | 별도 | $0.015 | $0.01 | **$0.025** |

**권장:**
- 소규모(10개 이하): **YouTube** (무료)
- 중소규모(10-100개): **api.video** (저렴)
- 대규모(100개+): **Cloudflare R2** (가장 저렴)

---

## 🔧 API 엔드포인트

### **POST /api/video-external/upload**

영상을 외부 스토리지에 업로드

**Request:**
```bash
curl -X POST https://mindstory-lms.pages.dev/api/video-external/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "provider=apivideo" \
  -F "lesson_id=123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "apivideo",
    "videoUrl": "vi4k0jvEUuaTdRAEjQ4Prklgc",
    "videoId": "vi4k0jvEUuaTdRAEjQ4Prklgc",
    "embedUrl": "https://embed.api.video/vod/vi4k0jvEUuaTdRAEjQ4Prklgc",
    "playerUrl": "https://embed.api.video/vod/vi4k0jvEUuaTdRAEjQ4Prklgc",
    "duration": 120,
    "originalName": "video.mp4",
    "size": 52428800,
    "lessonId": 123
  },
  "message": "apivideo에 영상이 업로드되었습니다."
}
```

---

### **GET /api/video-external/status/:provider/:videoId**

영상 처리 상태 확인

**Request:**
```bash
curl https://mindstory-lms.pages.dev/api/video-external/status/apivideo/vi4k0jvEUuaTdRAEjQ4Prklgc \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "videoId": "vi4k0jvEUuaTdRAEjQ4Prklgc",
    "embedUrl": "https://embed.api.video/vod/vi4k0jvEUuaTdRAEjQ4Prklgc",
    "duration": 120
  }
}
```

---

## 🎬 영상 재생

### **프론트엔드에서 재생:**

```javascript
// lessons.video_type과 video_url로 구분
if (lesson.video_type === 'youtube') {
  // YouTube 재생
  embedUrl = `https://www.youtube.com/embed/${lesson.video_url}`
} else if (lesson.video_type === 'apivideo') {
  // api.video 재생
  embedUrl = `https://embed.api.video/vod/${lesson.video_url}`
} else if (lesson.video_type === 'vimeo') {
  // Vimeo 재생
  embedUrl = `https://player.vimeo.com/video/${lesson.video_url}`
}

// iframe으로 재생
<iframe src={embedUrl} width="100%" height="500px" frameborder="0" allowfullscreen></iframe>
```

---

## ⚙️ 배포 설정

### **1. 환경 변수 (.dev.vars):**
```bash
# api.video (선택)
APIVIDEO_API_KEY=your_api_key_here

# Vimeo (선택)
VIMEO_ACCESS_TOKEN=your_access_token_here
```

### **2. Cloudflare Pages 설정:**
```bash
# 환경 변수 설정
npx wrangler pages secret put APIVIDEO_API_KEY --project-name mindstory-lms
npx wrangler pages secret put VIMEO_ACCESS_TOKEN --project-name mindstory-lms
```

### **3. wrangler.jsonc:**
```jsonc
{
  "vars": {
    "APIVIDEO_API_KEY": "your_api_key",
    "VIMEO_ACCESS_TOKEN": "your_token"
  }
}
```

---

## 🎯 권장 워크플로우

### **초기 설정 (한번만):**
1. api.video 가입 → API 키 발급
2. `.dev.vars`에 `APIVIDEO_API_KEY` 추가
3. `wrangler.jsonc`에도 추가
4. 재배포

### **영상 업로드 (매번):**
1. 관리자 로그인
2. 강좌 관리 → 차시 관리
3. 신규 차시 추가
4. "외부 스토리지" 탭 → "api.video" 선택
5. 파일 선택 → 업로드
6. 자동으로 인코딩 완료 → 재생 가능

### **비용 절감 팁:**
- 10개 미만: YouTube 수동 업로드 (무료)
- 10-100개: api.video ($0.34/시간)
- 100개 이상: Cloudflare R2 활성화 ($0.025/시간)

---

## 📞 도움말

**문제 해결:**

1. **api.video 업로드 실패:**
   - API 키가 올바른지 확인
   - 파일 크기 5GB 이하 확인
   - Dashboard에서 quota 확인

2. **Vimeo 업로드 실패:**
   - Access Token의 "upload" 권한 확인
   - 무료 계정은 API 승인 필요
   - 주간 5GB 제한 확인

3. **YouTube 재생 안됨:**
   - 영상이 공개/unlisted인지 확인
   - 임베드 허용 설정 확인

---

**추천:** 초기에는 **YouTube + api.video 조합**을 사용하세요.
- 대부분 영상: YouTube (무료)
- 비공개 필요한 영상: api.video (저렴)
- 나중에 규모 커지면: Cloudflare R2 전환

---

*작성일: 2025-12-31*  
*문서 위치: /home/user/webapp/EXTERNAL_VIDEO_STORAGE_GUIDE.md*
