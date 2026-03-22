# 마인드스토리 LMS 백업 정보

## 백업 일시
**2026-03-21 08:01 UTC+0**

## 백업 다운로드
**다운로드 링크**: https://www.genspark.ai/api/files/s/uZ8PdHmX  
**파일명**: mindstory-lms-complete-backup.tar.gz  
**파일 크기**: 35.1 MB  
**포맷**: tar.gz (압축된 아카이브)

---

## 백업 내용

### ✅ 포함된 내용
- 전체 소스 코드 (TypeScript, JavaScript, HTML, CSS)
- Git 저장소 전체 히스토리 (.git 폴더)
- 데이터베이스 마이그레이션 파일 (migrations/)
- 로컬 D1 데이터베이스 (.wrangler/state/v3/d1/)
- 설정 파일 (wrangler.jsonc, package.json, tsconfig.json 등)
- 정적 파일 (public/static/)
- PM2 설정 (ecosystem.config.cjs)
- 문서 (README.md, ENV_SETUP.md)

### 📂 프로젝트 구조
\`\`\`
webapp/
├── src/                      # 소스 코드
│   ├── index.tsx            # 메인 엔트리포인트
│   ├── routes/              # API 라우트
│   │   ├── auth.ts          # 이메일 인증
│   │   ├── auth-kakao.ts    # 카카오 OAuth
│   │   ├── auth-google.ts   # 구글 OAuth
│   │   ├── courses.ts       # 강좌 관리
│   │   ├── enrollments.ts   # 수강신청
│   │   ├── pages.ts         # 페이지 라우트
│   │   ├── pages-learn.ts   # 학습 페이지
│   │   ├── pages-enrollment.ts # 수강신청 페이지
│   │   ├── admin.ts         # 관리자 기능
│   │   └── ... (기타 라우트)
│   └── types/               # TypeScript 타입
├── public/                   # 정적 파일
│   └── static/
│       ├── js/              # JavaScript 파일
│       │   ├── auth.js      # 인증 관리
│       │   ├── learn-player.js # 학습 플레이어
│       │   └── ...
│       └── css/             # CSS 파일
├── migrations/              # DB 마이그레이션
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_admin_user.sql
│   └── 0003_add_course_details.sql
├── .wrangler/               # Cloudflare 로컬 개발
│   └── state/v3/d1/        # 로컬 D1 데이터베이스
├── .git/                    # Git 저장소
├── node_modules/            # 의존성 패키지
├── dist/                    # 빌드 출력
├── wrangler.jsonc           # Cloudflare 설정
├── package.json             # NPM 패키지 정보
├── tsconfig.json            # TypeScript 설정
├── ecosystem.config.cjs     # PM2 설정
├── .gitignore               # Git 무시 파일
├── README.md                # 프로젝트 문서
└── ENV_SETUP.md             # 환경변수 가이드
\`\`\`

---

## 구현된 기능

### 🔐 인증 시스템
- ✅ 이메일/비밀번호 로그인 및 회원가입
- ✅ 카카오 OAuth 2.0 소셜 로그인
- ✅ 구글 OAuth 2.0 소셜 로그인
- ✅ 세션 기반 인증 (HttpOnly, Secure 쿠키)
- ✅ 30일 자동 로그인 유지
- ✅ 로그아웃 기능

### 📚 강좌 관리
- ✅ 강좌 목록 조회 (무료/유료 필터)
- ✅ 강좌 상세 정보
- ✅ 섹션 및 차시 관리
- ✅ YouTube 비디오 통합
- ✅ 강좌 생성/수정/삭제 (관리자)
- ✅ AI 기반 차시 설명 자동 생성

### 🎓 학습 시스템
- ✅ 수강신청 기능 (무료/유료)
- ✅ 중복 신청 방지
- ✅ 내 강의실 (수강 중인 강좌 목록)
- ✅ 학습 페이지 (YouTube 플레이어)
- ✅ 차시 목록 및 탐색
- ✅ 재생 속도 조절 (0.5x ~ 2x)
- ✅ 진도 추적 시스템

### 👨‍💼 관리자 기능
- ✅ 관리자 대시보드 (통계)
- ✅ 사용자 관리
- ✅ 강좌 관리
- ✅ 수강신청 관리
- ✅ 분석 기능

### 💾 데이터베이스
- ✅ Cloudflare D1 (SQLite)
- ✅ 마이그레이션 시스템
- ✅ 로컬 개발 환경 (--local)
- ✅ 프로덕션 배포 지원

---

## 기술 스택

### **Backend**
- Hono Framework (v4.0.0)
- Cloudflare Workers
- TypeScript (v5.0.0)

### **Frontend**
- Vanilla JavaScript
- Tailwind CSS (CDN)
- Font Awesome Icons (CDN)
- Axios (CDN)

### **Database**
- Cloudflare D1 (SQLite)
- Wrangler CLI

### **Development**
- Vite (빌드 도구)
- PM2 (프로세스 관리)
- Git (버전 관리)

---

## 복원 방법

### **1. 백업 파일 다운로드**
\`\`\`bash
# 위 다운로드 링크에서 파일 다운로드
wget https://www.genspark.ai/api/files/s/uZ8PdHmX -O mindstory-lms-backup.tar.gz
\`\`\`

### **2. 압축 해제**
\`\`\`bash
# 원하는 위치에서 압축 해제
tar -xzf mindstory-lms-backup.tar.gz

# 프로젝트 디렉토리로 이동
cd home/user/webapp
\`\`\`

### **3. 의존성 설치**
\`\`\`bash
npm install
\`\`\`

### **4. 환경변수 설정**
\`\`\`bash
# .dev.vars 파일 생성 (ENV_SETUP.md 참고)
# 카카오 Client ID, 구글 Client ID/Secret, OpenAI API Key 등 설정
\`\`\`

### **5. 데이터베이스 마이그레이션**
\`\`\`bash
# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# 또는 자동으로 이미 포함된 .wrangler/state 사용
\`\`\`

### **6. 개발 서버 실행**
\`\`\`bash
# 빌드
npm run build

# PM2로 서비스 시작
pm2 start ecosystem.config.cjs

# 또는 직접 실행
npm run dev:sandbox
\`\`\`

### **7. 브라우저 접속**
\`\`\`
http://localhost:3000
\`\`\`

---

## 테스트 계정

### **관리자 계정**
- **이메일**: mindstory@admin.kr
- **비밀번호**: admin1234
- **역할**: admin

### **기존 관리자 계정**
- **이메일**: admin@lms.kr
- **비밀번호**: (알 수 없음, DB에서 해시로 저장됨)

---

## GitHub 저장소

**Repository**: https://github.com/9535mind/-  
**Branch**: main  
**최종 커밋**: Security: Remove sensitive API keys from wrangler.jsonc and add ENV_SETUP.md

---

## 주요 엔드포인트

### **페이지**
- `GET /` - 홈페이지
- `GET /login` - 로그인 페이지
- `GET /register` - 회원가입 페이지
- `GET /enrollment` - 수강신청 페이지
- `GET /courses/:id/learn` - 학습 페이지
- `GET /admin/dashboard` - 관리자 대시보드

### **인증 API**
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 내 정보 조회
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/kakao/login` - 카카오 로그인
- `GET /api/auth/google/login` - 구글 로그인

### **강좌 API**
- `GET /api/courses` - 강좌 목록
- `GET /api/courses/:id` - 강좌 상세
- `GET /api/courses/:id/lessons` - 차시 목록
- `GET /api/courses/:id/lessons/:lessonId` - 차시 상세

### **수강신청 API**
- `POST /api/enrollments` - 수강신청
- `GET /api/enrollments/my` - 내 수강신청 목록

---

## 보안 주의사항

### ⚠️ 백업 파일에 포함되지 않은 것
- `.dev.vars` - 환경변수 파일 (Git에서 무시됨)
- 실제 API 키 및 시크릿 (placeholder만 포함)

### 🔒 복원 후 필수 작업
1. `.dev.vars` 파일을 직접 생성하고 실제 API 키 입력
2. GitHub Personal Access Token 재설정 (푸시 시)
3. Cloudflare API Token 재설정 (배포 시)
4. 프로덕션 환경변수 설정 (Cloudflare Dashboard)

---

## 문제 해결

### **1. 빌드 오류**
\`\`\`bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
\`\`\`

### **2. 데이터베이스 오류**
\`\`\`bash
# 로컬 DB 초기화
npm run db:reset
\`\`\`

### **3. 포트 충돌**
\`\`\`bash
# 포트 3000 정리
fuser -k 3000/tcp
# 또는
pm2 delete all
\`\`\`

---

## 지원

**문의**: 이 백업 파일로 프로젝트를 복원하는 데 문제가 있으면 ENV_SETUP.md를 참고하세요.

**마지막 업데이트**: 2026-03-21 08:01 UTC
