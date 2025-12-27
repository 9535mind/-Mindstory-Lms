# 마인드스토리 원격평생교육원 LMS 플랫폼

## 📋 프로젝트 개요

마인드스토리 원격평생교육원의 온라인 학습 관리 시스템(LMS) Ver.1.3 MVP입니다.

- **목적**: 온라인 수강 신청 → 학습 → 수료 → 수료증 발급까지 완결되는 경량형 LMS
- **개발 단계**: Ver.1.3 (1단계 MVP - 필수 기능만 구현)
- **기술 스택**: Hono + Cloudflare Pages + D1 Database + TypeScript

## 🌐 URL 정보

### 개발 환경
- **Local Development**: http://localhost:3000
- **Sandbox URL**: https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai

### API 엔드포인트
- **헬스체크**: `/api/health`
- **인증**: `/api/auth/*`
- **과정**: `/api/courses/*`
- **수강신청**: `/api/enrollments/*`
- **결제**: `/api/payments/*`
- **수료증**: `/api/certificates/*`
- **관리자**: `/api/admin/*`

## ✅ 현재 완료된 기능

### 1. 회원 시스템
- [x] 회원가입 / 로그인 / 로그아웃
- [x] 프로필 수정
- [x] 회원 탈퇴
- [x] 휴대폰 본인인증 (구조만 - API 연동 대기)
- [x] 세션 관리 (동시 접속 차단)

### 2. 과정 관리 시스템
- [x] 과정 CRUD (관리자)
- [x] 차시 CRUD (관리자)
- [x] 과정 목록 조회 (공개/비공개)
- [x] 추천 과정 조회
- [x] 과정 상세 정보
- [x] 전문 호스팅 연동 구조 (Kollus/VideoCloud)

### 3. 수강 신청 및 학습
- [x] 수강 신청
- [x] 내 강의실 (수강 목록)
- [x] 진도율 관리 (실시간 업데이트)
- [x] 차시별 학습 진도 추적
- [x] 수강 기간 관리

### 4. 결제 시스템
- [x] 결제 생성 (모의 구현)
- [x] 결제 내역 조회
- [x] 환불 처리 (관리자)
- [x] PG 연동 구조 (실제 연동 대기)

### 5. 수료 및 수료증
- [x] 수료 조건 체크 (진도율 80% 이상)
- [x] 수료 처리
- [x] 수료증 발급 (번호 자동 생성: MS-YYYY-XXXX)
- [x] 수료증 조회
- [x] PDF 생성 구조 (실제 PDF 생성 대기)

### 6. 관리자 대시보드
- [x] 통계 대시보드 (회원/과정/수강/매출)
- [x] 회원 관리
- [x] 수강 신청 관리
- [x] 결제 내역 관리
- [x] 수료증 관리

### 7. UI/UX
- [x] 반응형 홈페이지 (Tailwind CSS)
- [x] 모바일 최적화
- [x] 과정 목록 카드 뷰
- [x] 로딩 인디케이터

## 📊 데이터베이스 구조

### 주요 테이블
- `users` - 회원 정보
- `courses` - 과정 정보
- `lessons` - 차시 정보
- `enrollments` - 수강 신청
- `lesson_progress` - 학습 진도
- `payments` - 결제 정보
- `certificates` - 수료증
- `user_sessions` - 세션 관리
- `admin_logs` - 관리자 활동 로그

## 🚧 구조만 선반영 (Ver.1.5 확장 대비)

다음 기능들은 데이터베이스 필드와 API 구조만 준비되어 있으며, 실제 구현은 차기 단계에서 진행됩니다:

- [ ] 휴대폰 본인인증 API 연동
- [ ] PG 결제 API 연동 (토스페이먼츠 등)
- [ ] PDF 수료증 생성 및 다운로드
- [ ] 전문 호스팅 영상 재생 연동
- [ ] 시험 및 평가 시스템
- [ ] 복합 수료 조건
- [ ] 과정 유형별 분류 (일반/자격/검사)

## 🔧 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
cd /home/user/webapp
npm install
```

### 2. 데이터베이스 마이그레이션
```bash
# 로컬 D1 데이터베이스 마이그레이션
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed

# 데이터베이스 초기화 (재설정)
npm run db:reset
```

### 3. 개발 서버 실행
```bash
# 프로젝트 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 서버 상태 확인
pm2 list

# 로그 확인
pm2 logs mindstory-lms --nostream

# 서버 재시작
npm run clean-port
pm2 restart mindstory-lms

# 서버 중지
pm2 stop mindstory-lms
```

### 4. 테스트
```bash
# API 헬스체크
curl http://localhost:3000/api/health

# 추천 과정 조회
curl http://localhost:3000/api/courses/featured

# 회원가입 테스트
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "테스트",
    "terms_agreed": true,
    "privacy_agreed": true
  }'
```

## 🧪 테스트 계정

### 관리자 계정
- **이메일**: admin@mindstory.co.kr
- **비밀번호**: admin123

### 학생 계정
1. **이메일**: student1@example.com / **비밀번호**: test123
2. **이메일**: student2@example.com / **비밀번호**: test123
3. **이메일**: student3@example.com / **비밀번호**: test123

## 📦 배포

### Cloudflare Pages 배포 준비
```bash
# 프로덕션 빌드
npm run build

# Cloudflare 프로젝트 생성 (최초 1회)
npx wrangler pages project create mindstory-lms \
  --production-branch main \
  --compatibility-date 2025-12-27

# 프로덕션 D1 데이터베이스 생성
npx wrangler d1 create mindstory-production

# wrangler.jsonc에 database_id 업데이트 필요

# 프로덕션 데이터베이스 마이그레이션
npm run db:migrate:prod

# 배포
npm run deploy:prod
```

## 📂 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # 메인 애플리케이션
│   ├── types/
│   │   └── database.ts        # 타입 정의
│   ├── middleware/
│   │   └── auth.ts            # 인증 미들웨어
│   ├── routes/
│   │   ├── auth.ts            # 인증 API
│   │   ├── courses.ts         # 과정 API
│   │   ├── enrollments.ts     # 수강신청 API
│   │   ├── payments.ts        # 결제 API
│   │   ├── certificates.ts    # 수료증 API
│   │   └── admin.ts           # 관리자 API
│   └── utils/
│       └── helpers.ts         # 헬퍼 함수
├── migrations/
│   └── 0001_initial_schema.sql  # DB 스키마
├── public/
│   └── static/                # 정적 파일
├── dist/                      # 빌드 결과물
├── seed.sql                   # 테스트 데이터
├── ecosystem.config.cjs       # PM2 설정
├── wrangler.jsonc            # Cloudflare 설정
├── package.json
└── README.md
```

## 🎯 다음 단계 (추천 개발 순서)

1. **외부 서비스 API 연동**
   - 휴대폰 본인인증 (Pass, NICE)
   - PG 결제 (토스페이먼츠, 이니시스)
   - 전문 영상 호스팅 (Kollus, VideoCloud)

2. **수료증 PDF 생성**
   - 브라우저 기반 PDF 생성 또는
   - PDF 생성 API 연동

3. **관리자 웹 UI 구현**
   - 과정 관리 페이지
   - 수강생 관리 페이지
   - 통계 대시보드 UI

4. **학생 학습 UI 구현**
   - 내 강의실 페이지
   - 영상 플레이어 페이지
   - 진도 추적 UI

5. **GitHub Pages / Cloudflare Pages 배포**
   - 프로덕션 환경 구축
   - 도메인 연결
   - SSL 인증서 설정

## ⚠️ 주의사항

### API 연동 전 준비물
1. **본인인증 서비스** - Pass, NICE 등의 API 키
2. **PG 결제** - 토스페이먼츠, 이니시스 등의 가맹점 정보
3. **영상 호스팅** - Kollus, VideoCloud 등의 API 키
4. **SMS 발송** (선택) - 알리고, 문자 API 등

### 보안 설정
- `.env` 파일에 API 키 저장 (Git에 포함하지 말 것)
- 프로덕션 배포 시 `wrangler secret put` 사용
- CORS 설정 확인
- 세션 만료 시간 설정

## 📞 문의

- **개발자**: Claude (AI Assistant)
- **프로젝트**: 마인드스토리 원격평생교육원 LMS
- **버전**: Ver.1.3 MVP
- **최종 업데이트**: 2025-12-27

## 📝 라이선스

Copyright © 2025 마인드스토리 원격평생교육원. All rights reserved.

---

**개발 완료 상태**: ✅ 1단계 MVP 구현 완료 (API 연동 대기 중)
