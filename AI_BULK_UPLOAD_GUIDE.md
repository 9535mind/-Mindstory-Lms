# AI 일괄 차시 생성 가이드

## 📝 개요

**AI 기반 일괄 차시 생성** 기능으로 강좌 콘텐츠를 빠르고 쉽게 업로드하세요!

### ✅ 지원 방식

1. **📄 PDF/문서 업로드** → AI가 내용 분석 → 차시 자동 생성
2. **🎥 영상 파일 여러 개 업로드** → 파일명 기반 차시 자동 생성
3. **📊 Excel/CSV 업로드** → 템플릿에 맞춰 일괄 등록

---

## 🚀 배포 URL

**Production**: https://mindstory-lms.pages.dev
**Latest**: https://97d4d2f4.mindstory-lms.pages.dev

---

## 🎯 사용 방법

### 방법 1️⃣: PDF/문서로 차시 자동 생성 (AI 분석)

#### **사용 시나리오**:
- 강좌 자료(PDF, Word)를 AI가 분석하여 여러 차시로 자동 분할
- 각 차시의 제목, 설명, 내용을 AI가 자동 생성

#### **사용 방법**:

1. **강좌 페이지 접속**
   - URL: https://mindstory-lms.pages.dev/admin/courses
   - 로그인: admin-test@gmail.com / admin123456

2. **강좌 선택**
   - 차시를 추가할 강좌 클릭

3. **AI 일괄 업로드 버튼 클릭**
   - "AI 일괄 차시 생성" 버튼 찾기

4. **문서 업로드 탭**
   - PDF, Word, 또는 텍스트 파일 선택
   - (선택) 생성할 차시 수 입력 (미입력 시 AI가 자동 결정)
   - "AI 분석 시작" 버튼 클릭

5. **AI 분석 대기**
   - AI가 문서를 읽고 분석 (약 10-30초)
   - 자동으로 차시 제목, 설명, 내용 생성

6. **미리보기 확인**
   - 생성된 차시 목록 확인
   - 필요 시 수정 (현재는 미리보기만)

7. **저장**
   - "모두 저장" 버튼 클릭
   - 모든 차시가 강좌에 등록됨

#### **예시**:

**입력**: `강좌_교재.pdf` (50페이지)

**AI 생성 결과**:
```
1강. 강좌 소개 및 학습 목표
2강. 기본 개념 이해하기
3강. 실습 환경 구성
4강. 첫 번째 프로젝트 시작
5강. 중급 기술 학습
...
```

---

### 방법 2️⃣: 영상 파일 여러 개 업로드

#### **사용 시나리오**:
- 이미 녹화된 영상 파일 여러 개를 한 번에 업로드
- 파일명에서 자동으로 차시 번호와 제목 추출

#### **파일명 규칙**:
```
01_강좌소개.mp4       → 1강. 강좌소개
02_기본개념.mp4       → 2강. 기본개념
1. 환경설정.mp4       → 1강. 환경설정
03-실습예제.mp4       → 3강. 실습예제
```

**지원 구분자**: `_`, `.`, `-`, 공백

#### **사용 방법**:

1. **강좌 선택 (위와 동일)**

2. **AI 일괄 업로드 버튼 클릭**

3. **영상 파일 업로드 탭**
   - "파일 선택" 버튼 클릭
   - **Ctrl(Cmd) + 클릭**으로 여러 파일 선택
   - 선택한 파일 확인

4. **업로드 시작**
   - "업로드 시작" 버튼 클릭
   - 파일명 분석 및 차시 정보 자동 생성

5. **미리보기 확인**
   - 생성될 차시 목록 확인
   - 제목, 파일명, 파일 크기 표시

6. **저장**
   - "모두 저장" 버튼 클릭

#### **옵션**:
- **api.video 업로드**: 체크 시 영상을 api.video에 자동 업로드 (추가 구현 필요)

---

### 방법 3️⃣: Excel/CSV로 일괄 등록

#### **사용 시나리오**:
- 엑셀로 차시 정보를 미리 작성
- 한 번에 여러 차시 등록

#### **사용 방법**:

1. **CSV 템플릿 다운로드**
   - "CSV 템플릿 다운로드" 버튼 클릭
   - `lessons_template.csv` 파일 저장

2. **템플릿 작성**
   - 엑셀이나 구글 시트에서 열기
   - 차시 정보 입력

**템플릿 형식**:
```csv
lesson_number,title,description,content,video_url,video_duration_minutes,order_index
1,강좌 소개,첫 번째 차시입니다,강좌의 전체 개요를 설명합니다,,30,1
2,기본 개념,두 번째 차시입니다,기본 개념을 학습합니다,,45,2
3,실습 예제,세 번째 차시입니다,실제 예제를 따라해봅니다,,60,3
```

3. **CSV 파일 업로드**
   - "CSV 파일 업로드" 탭 선택
   - 작성한 CSV 파일 선택
   - "업로드" 버튼 클릭

4. **미리보기 및 저장**
   - 불러온 차시 정보 확인
   - "모두 저장" 버튼 클릭

---

## 🔧 API 엔드포인트

### 1. PDF/문서 분석
```
POST /api/ai-bulk-lessons/analyze-document
```

**Headers**:
- `Authorization: Bearer {session_token}`
- `Content-Type: multipart/form-data`

**Body**:
```
file: File (PDF, Word, Text)
course_id: Number
lesson_count: Number (선택)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_title": "강좌명",
    "lessons": [
      {
        "lesson_number": 1,
        "title": "차시 제목",
        "description": "차시 설명",
        "content": "차시 내용 (마크다운)",
        "video_duration_minutes": 30,
        "order_index": 1
      }
    ],
    "total_lessons": 10,
    "estimated_duration": 300,
    "message": "10개의 차시가 생성되었습니다."
  }
}
```

---

### 2. 영상 파일 여러 개 업로드
```
POST /api/ai-bulk-lessons/create-from-videos
```

**Body**:
```
files[0]: File
files[1]: File
...
course_id: Number
upload_to_apivideo: Boolean
```

**Response**:
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "lessons": [
      {
        "lesson_number": 1,
        "title": "강좌소개",
        "description": "강좌소개 영상 강의",
        "file_name": "01_강좌소개.mp4",
        "file_size": 52428800,
        "file_type": "video/mp4"
      }
    ],
    "total_lessons": 5,
    "message": "5개의 차시가 준비되었습니다."
  }
}
```

---

### 3. 차시 저장
```
POST /api/ai-bulk-lessons/save-lessons
```

**Headers**:
- `Authorization: Bearer {session_token}`
- `Content-Type: application/json`

**Body**:
```json
{
  "course_id": 1,
  "lessons": [
    {
      "lesson_number": 1,
      "title": "차시 제목",
      "description": "차시 설명",
      "content": "차시 내용",
      "video_duration_minutes": 30,
      "order_index": 1
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success_count": 10,
    "error_count": 0,
    "results": [...],
    "errors": [],
    "message": "10개의 차시가 저장되었습니다."
  }
}
```

---

### 4. CSV 템플릿 다운로드
```
GET /api/ai-bulk-lessons/csv-template
```

**Response**: CSV 파일

---

### 5. CSV 업로드
```
POST /api/ai-bulk-lessons/upload-csv
```

**Body**:
```
file: File (CSV)
course_id: Number
```

**Response**:
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "lessons": [...],
    "total_lessons": 15,
    "message": "15개의 차시 데이터를 불러왔습니다."
  }
}
```

---

## 💡 JavaScript 함수 사용 (고급)

### **브라우저 콘솔에서 테스트**:

```javascript
// 1. PDF 업로드 및 AI 분석
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
handleDocumentUpload();

// 2. 영상 파일 여러 개 업로드
handleVideoFilesUpload();

// 3. CSV 템플릿 다운로드
downloadCSVTemplate();

// 4. CSV 업로드
handleCSVUpload();

// 5. 분석된 차시 저장
saveAllLessons();
```

---

## 🎯 AI 분석 예시

### **입력 문서**:
```
강좌명: 웹 개발 기초
목차:
1. HTML 기초
2. CSS 스타일링
3. JavaScript 입문
4. 반응형 웹 디자인
5. 프로젝트 실습
```

### **AI 생성 결과**:
```json
[
  {
    "lesson_number": 1,
    "title": "HTML 기초 - 웹의 구조 이해하기",
    "description": "HTML의 기본 문법과 주요 태그를 학습합니다.",
    "content": "# HTML 기초\n\n## 학습 목표\n- HTML의 역할 이해\n- 기본 태그 사용법\n...",
    "video_duration_minutes": 30,
    "order_index": 1
  },
  {
    "lesson_number": 2,
    "title": "CSS 스타일링 - 디자인 꾸미기",
    "description": "CSS를 사용하여 웹 페이지를 아름답게 꾸미는 방법을 배웁니다.",
    "content": "# CSS 스타일링\n\n## 학습 목표\n- CSS 선택자\n- 레이아웃 기법\n...",
    "video_duration_minutes": 45,
    "order_index": 2
  }
]
```

---

## ⚙️ 설정

### **환경 변수** (.dev.vars, wrangler.jsonc):
```bash
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

### **AI 모델**:
- 사용 모델: `gpt-4o-mini`
- Temperature: 0.7
- Max Tokens: 4000

---

## 📊 제한사항

### **PDF/문서 분석**:
- 최대 파일 크기: 제한 없음 (단, 분석은 처음 10,000자만)
- 지원 형식: PDF, Word, Text
- 최소 차시: 3개
- 최대 차시: 20개

### **영상 파일 업로드**:
- 최대 파일 크기: 500MB per file
- 지원 형식: MP4, WebM, MOV, AVI
- 동시 업로드: 제한 없음 (권장: 20개 이하)

### **CSV 업로드**:
- 최대 행 수: 제한 없음 (권장: 100행 이하)
- 인코딩: UTF-8

---

## 🐛 트러블슈팅

### 1. "AI 분석 실패" 에러
**원인**: OpenAI API 키 없음 또는 만료
**해결**: `.dev.vars`에 `OPENAI_API_KEY` 설정 확인

### 2. "문서 분석에 너무 오래 걸림"
**원인**: 파일이 너무 큼
**해결**: 파일 크기 줄이기 또는 PDF를 여러 개로 나누기

### 3. "CSV 파일 파싱 오류"
**원인**: CSV 형식 오류
**해결**: 템플릿 다운로드 후 형식 맞추기

### 4. "영상 파일 업로드 실패"
**원인**: 파일 크기 초과
**해결**: 500MB 이하로 압축

---

## 🎨 사용 팁

### **PDF 분석 최적화**:
1. **목차가 명확한 문서** 사용
2. **장/절 구분이 잘 된 문서**
3. **불필요한 이미지 제거**

### **영상 파일명 규칙**:
- ✅ `01_강좌소개.mp4`
- ✅ `1. 기본개념.mp4`
- ✅ `03-실습예제.mp4`
- ❌ `영상1.mp4` (번호만 있음)
- ❌ `lecture.mp4` (번호 없음)

### **CSV 작성 팁**:
- 엑셀에서 작성 후 **UTF-8 CSV**로 저장
- 콤마(,)가 포함된 텍스트는 **큰따옴표("")**로 감싸기

---

## 📞 지원

**문서 위치**: `/home/user/webapp/AI_BULK_UPLOAD_GUIDE.md`

**관련 파일**:
- Backend: `src/routes/ai-bulk-lessons.ts`
- Frontend: `public/static/js/ai-bulk-upload.js`

---

## 🚀 다음 단계

1. **UI 통합**: 관리자 페이지에 버튼 추가 (진행 중)
2. **api.video 연동**: 영상 자동 업로드
3. **진행률 표시**: 업로드 진행 상황 실시간 표시
4. **미리보기 편집**: AI 생성 결과 수정 기능
5. **배치 처리**: 대량 차시 비동기 처리

---

**작성일**: 2025-12-31  
**버전**: 1.0  
**작성자**: GenSpark AI Assistant
