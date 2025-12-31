# API 토큰 권한 업그레이드 가이드

## 🎯 목표
D1 Database 권한을 포함한 새 API 토큰 생성

---

## 📍 1단계: API Tokens 페이지로 이동

### 직접 링크:
```
https://dash.cloudflare.com/profile/api-tokens
```

---

## 📍 2단계: 새 토큰 생성

### 방법 1: Custom Token (권장)

1. **"+ Create Token"** 클릭
2. **"Create Custom Token"** 아래의 **"Get started"** 클릭
3. 토큰 이름 입력: `MindStory Full Access`

### 권한 설정:

**필수 권한 (아래 권한들을 모두 추가):**

#### Account 권한:
- **Cloudflare Pages** → **Edit**
- **Workers R2 Storage** → **Edit**
- **D1** → **Edit** ⭐ (새로 추가!)
- **Workers Scripts** → **Edit**
- **Workers KV Storage** → **Edit**
- **Account Settings** → **Read**

#### Zone 권한:
- **Workers Routes** → **Edit**

### 리소스 설정:
- **Account Resources**: `Include` → `9535mind@gmail.com's Account` 선택
- **Zone Resources**: `Include` → `All zones` 선택

---

## 📍 3단계: 토큰 생성 및 복사

1. 화면 하단의 **"Continue to summary"** 클릭
2. 모든 권한 확인
3. **"Create Token"** 클릭
4. **토큰 복사** (⚠️ 한 번만 표시됩니다!)

---

## 🎉 완료 후 알려주세요!

토큰을 복사한 후 다음과 같이 알려주세요:
- "새 토큰은 [토큰값]이야"
- 또는 토큰을 직접 붙여넣기

---

## 💡 참고: 권한별 용도

- **Cloudflare Pages**: 웹사이트 배포
- **R2 Storage**: 영상 파일 저장
- **D1**: 데이터베이스 (사용자, 강좌 정보)
- **Workers Scripts**: API 실행
- **KV Storage**: 세션 관리

