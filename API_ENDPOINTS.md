# 마인드스토리 LMS API 엔드포인트 문서

## 📡 기본 정보

- **Base URL (개발)**: `http://localhost:3000`
- **Base URL (공개)**: `https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai`
- **인증 방식**: Bearer Token (Authorization: Bearer {token})

---

## 🔐 인증 API (`/api/auth`)

### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "01012345678",
  "birth_date": "1990-01-01",
  "terms_agreed": true,
  "privacy_agreed": true,
  "marketing_agreed": false
}
```

### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "student"
    }
  }
}
```

### 현재 사용자 정보
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "student"
  }
}
```

### 로그아웃
```
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 📚 강좌 API (`/api/courses`)

### 전체 강좌 목록
```
GET /api/courses

Response:
{
  "success": true,
  "data": [
    {
      "id": 7,
      "title": "학습상담사",
      "description": "마인드스토리 학습상담사 2급 과정...",
      "thumbnail_url": "https://...",
      "course_type": "general",
      "duration_days": 30,
      "price": 300000,
      "discount_price": 250000,
      "is_free": 0,
      "is_featured": 1,
      "status": "active",
      "total_lessons": 2
    }
  ]
}
```

### 추천 강좌 목록
```
GET /api/courses/featured
```

### 강좌 상세 정보
```
GET /api/courses/:courseId

Response:
{
  "success": true,
  "data": {
    "course": { ... },
    "lessons": [ ... ],
    "enrollment": { ... } // 수강 중인 경우만
  }
}
```

### 강좌의 차시 목록
```
GET /api/courses/:courseId/lessons

Response:
{
  "success": true,
  "data": [
    {
      "id": 67,
      "course_id": 7,
      "lesson_number": 1,
      "title": "메타인지란 무엇인가?",
      "description": "메타인지 소개",
      "content_type": "video",
      "video_provider": "r2",
      "video_url": "/uploads/videos/test_video.mp4",
      "is_free_preview": 1,
      "status": "active"
    }
  ]
}
```

### 특정 차시 정보
```
GET /api/courses/:courseId/lessons/:lessonId

Response:
{
  "success": true,
  "data": {
    "id": 67,
    "course_id": 7,
    "lesson_number": 1,
    "title": "메타인지란 무엇인가?",
    "video_url": "/uploads/videos/test_video.mp4",
    ...
  }
}
```

---

## 📝 수강 관리 API (`/api/enrollments`)

### 수강 신청
```
POST /api/enrollments
Authorization: Bearer {token}
Content-Type: application/json

{
  "course_id": 7
}
```

### 내 수강 목록
```
GET /api/enrollments
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "course_id": 7,
      "user_id": 1,
      "status": "active",
      "progress_percent": 50,
      "course_title": "학습상담사",
      "started_at": "2025-12-30T00:00:00.000Z",
      "expires_at": "2026-01-29T00:00:00.000Z"
    }
  ]
}
```

---

## 📊 학습 진도 API (`/api/progress`)

### 진도 기록
```
POST /api/progress
Authorization: Bearer {token}
Content-Type: application/json

{
  "enrollment_id": 1,
  "lesson_id": 67,
  "progress_seconds": 120,
  "completed": false
}
```

### 차시 진도 조회
```
GET /api/progress?enrollment_id=1&lesson_id=67
Authorization: Bearer {token}
```

---

## 👨‍💼 관리자 API (`/api/admin`)

### 통계 조회
```
GET /api/admin/stats
Authorization: Bearer {token} (admin only)

Response:
{
  "success": true,
  "data": {
    "totalEnrollments": 100,
    "totalRevenue": 25000000,
    "activeEnrollments": 80,
    "completedEnrollments": 20
  }
}
```

### 회원 목록
```
GET /api/admin/users?page=1&limit=20
Authorization: Bearer {token} (admin only)

Query Parameters:
- page: 페이지 번호 (default: 1)
- limit: 페이지당 개수 (default: 20)
- search: 검색어 (이메일, 이름)
- role: 역할 필터 (admin, student)
- status: 상태 필터 (active, inactive)
```

### 회원 상세 정보
```
GET /api/admin/users/:userId
Authorization: Bearer {token} (admin only)

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "enrollments": {
      "total_enrollments": 5,
      "active_enrollments": 3,
      "completed_enrollments": 2
    },
    "payments": {
      "total_payments": 10,
      "total_paid": 2500000,
      "last_payment_date": "2025-12-30"
    }
  }
}
```

### 비밀번호 초기화
```
POST /api/admin/users/:userId/reset-password
Authorization: Bearer {token} (admin only)
Content-Type: application/json

{
  "mode": "auto" // or "manual"
}

Response:
{
  "success": true,
  "data": {
    "new_password": "abc123def456"
  }
}
```

### 수강 목록 조회
```
GET /api/admin/enrollments?page=1&limit=20
Authorization: Bearer {token} (admin only)
```

---

## 📤 파일 업로드 API (`/api/upload`)

### 이미지 업로드
```
POST /api/upload/image
Authorization: Bearer {token} (admin only)
Content-Type: multipart/form-data

FormData:
- file: 이미지 파일 (JPG, PNG, GIF, WebP)
- 최대 5MB

Response:
{
  "success": true,
  "data": {
    "url": "/uploads/images/1234567890-abc.jpg",
    "filename": "images/1234567890-abc.jpg",
    "size": 123456,
    "type": "image/jpeg"
  }
}
```

### 영상 업로드
```
POST /api/upload/video
Authorization: Bearer {token} (admin only)
Content-Type: multipart/form-data

FormData:
- file: 영상 파일 (MP4, WebM, MOV, AVI)
- 최대 500MB

Response:
{
  "success": true,
  "data": {
    "url": "videos/1234567890-abc.mp4",
    "filename": "videos/1234567890-abc.mp4",
    "size": 10485760,
    "type": "video/mp4",
    "duration": 10
  }
}
```

### 정적 파일 접근
```
GET /uploads/videos/test_video.mp4
GET /uploads/images/thumbnail.jpg
GET /static/js/auth.js
GET /static/style.css
```

---

## 🎯 페이지 라우트

### 학생 페이지
- `/` - 홈페이지
- `/login` - 로그인
- `/register` - 회원가입
- `/courses/:id` - 강좌 상세
- `/courses/:courseId/lessons/:lessonId` - 차시 학습
- `/my-courses` - 내 강의실

### 관리자 페이지
- `/admin/dashboard` - 관리자 대시보드
- `/admin/users` - 회원 관리
- `/admin/users/:userId` - 회원 상세
- `/admin/users/:userId/classroom` - 학생 내강의실 보기
- `/admin/courses` - 강좌 관리
- `/admin/courses/:courseId/lessons` - 차시 관리
- `/admin/enrollments` - 수강 관리
- `/admin/payments` - 결제 관리

---

## 🔑 테스트 계정

### 관리자
- 이메일: `admin@mindstory.co.kr`
- 비밀번호: `admin123`

### 학생
- 이메일: `student1@example.com`
- 비밀번호: `password123`
- 이메일: `student2@example.com`
- 비밀번호: `password123`
- 이메일: `student3@example.com`
- 비밀번호: `password123`

---

## 📹 영상 파일 처리

### 로컬 개발 환경
- 영상 저장 위치: `public/uploads/videos/`
- 빌드 시 복사: `dist/uploads/videos/`
- 접근 URL: `/uploads/videos/filename.mp4`

### 프로덕션 환경
- 영상 저장: Cloudflare R2
- 접근 URL: `/api/storage/videos/filename.mp4`

---

## ⚠️ 에러 코드

- `400` - 잘못된 요청 (필수 파라미터 누락, 유효성 검사 실패)
- `401` - 인증 필요 (로그인 필요, 토큰 만료)
- `403` - 권한 없음 (관리자 권한 필요)
- `404` - 리소스 없음
- `500` - 서버 내부 오류

---

## 📌 주요 URL 요약

### 개발 환경
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`
- 정적 파일: `http://localhost:3000/uploads/*`

### 공개 환경
- Frontend: `https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai`
- API: `https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/api`
- 정적 파일: `https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/uploads/*`

---

## 🛠️ 데이터베이스 관리

### 로컬 D1 마이그레이션
```bash
npx wrangler d1 migrations apply mindstory-production --local
```

### 로컬 D1 데이터 입력
```bash
npx wrangler d1 execute mindstory-production --local --file=./seed.sql
```

### 로컬 D1 쿼리
```bash
npx wrangler d1 execute mindstory-production --local --command="SELECT * FROM courses"
```

---

생성일: 2025-12-30
최종 업데이트: 2025-12-30
