# 🚀 배포 체크리스트 및 단계별 가이드

## ✅ 배포 전 준비사항 (이미 완료됨)

- ✅ **코드 완성**: 모든 기능 구현 완료
- ✅ **Git 커밋**: 모든 변경사항 커밋됨
- ✅ **wrangler.jsonc**: 설정 완료 (R2, D1)
- ✅ **package.json**: 배포 스크립트 준비됨
- ✅ **영상 업로드 API**: 500MB 지원, R2 연동
- ✅ **테스트 데이터**: 강좌, 사용자, 차시 모두 준비됨

---

## 📋 배포 단계 (순서대로 진행)

### 🔐 Step 1: Cloudflare API 키 설정

#### A. Cloudflare 계정 생성/로그인
```
https://dash.cloudflare.com/sign-up
```

#### B. API 토큰 생성
1. Dashboard 우측 상단 → **My Profile**
2. 좌측 메뉴 → **API Tokens**
3. **Create Token** 버튼 클릭
4. **"Edit Cloudflare Workers"** 템플릿 선택
5. 권한 설정:
   - Account → **Cloudflare Pages** → **Edit**
   - Account → **D1** → **Edit**
   - Account → **R2** → **Edit**
6. **Continue to summary** → **Create Token**
7. ⚠️ **토큰 복사** (한 번만 표시됨!)

#### C. 샌드박스에 API 키 등록
```
Deploy 탭 → Cloudflare API Key 입력 → 저장
```

---

### 🗄️ Step 2: R2 버킷 생성

```bash
# 영상 저장용 버킷
npx wrangler r2 bucket create mindstory-videos

# 문서/증명서 저장용 버킷
npx wrangler r2 bucket create mindstory-storage

# 생성 확인
npx wrangler r2 bucket list
```

**예상 출력**:
```
mindstory-videos
mindstory-storage
```

---

### 🗃️ Step 3: D1 데이터베이스 생성

```bash
# 프로덕션 데이터베이스 생성
npx wrangler d1 create mindstory-production
```

**예상 출력**:
```
✅ Successfully created DB 'mindstory-production'!

[[d1_databases]]
binding = "DB"
database_name = "mindstory-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**중요**: `database_id`를 복사하여 `wrangler.jsonc`에 입력:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "mindstory-production",
    "database_id": "복사한-database-id-여기에"
  }
]
```

---

### 🔨 Step 4: 빌드

```bash
cd /home/user/webapp
npm run build
```

**예상 소요 시간**: 30-60초

**성공 메시지**:
```
✨ 빌드 완료!
dist/_worker.js created
```

---

### 🌐 Step 5: Cloudflare Pages 프로젝트 생성

```bash
npx wrangler pages project create mindstory-lms \
  --production-branch main \
  --compatibility-date 2025-12-27
```

**예상 출력**:
```
✅ Successfully created the 'mindstory-lms' project.
```

---

### 🚀 Step 6: 프로덕션 배포

```bash
npx wrangler pages deploy dist --project-name mindstory-lms
```

**예상 소요 시간**: 1-2분

**성공 메시지**:
```
✨ Success! Uploaded 1 file (X seconds)

✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.mindstory-lms.pages.dev
```

**중요**: 이 URL을 저장하세요! (프로덕션 URL)

---

### 🗄️ Step 7: 데이터베이스 마이그레이션 (프로덕션)

```bash
# 마이그레이션 적용
npx wrangler d1 migrations apply mindstory-production --remote

# 초기 데이터 입력
npx wrangler d1 execute mindstory-production --remote \
  --file=./add_enrollments.sql
```

---

### 🎬 Step 8: 영상 업로드 테스트

#### 방법 1: 관리자 페이지에서 (권장)

1. **프로덕션 URL 접속**: https://xxx.mindstory-lms.pages.dev
2. **관리자 로그인**:
   - 이메일: `admin@mindstory.co.kr`
   - 비밀번호: `admin123`
3. **관리자 대시보드** → **강좌 관리** → **학습상담사 과정**
4. **차시 관리** → **차시 67 수정**
5. **영상 파일 선택**: 메타인지워크북 1꿈과 비전.mp4 (27MB)
6. **저장** 클릭

→ 자동으로 R2에 업로드됨
→ 전 세계 CDN으로 즉시 서빙 시작

#### 방법 2: Wrangler CLI로 직접 업로드

```bash
# 로컬 영상을 R2에 직접 업로드
npx wrangler r2 object put mindstory-videos/videos/lesson1.mp4 \
  --file=/home/user/uploaded_files/메타인지워크북\ 1꿈과\ 비전.mp4 \
  --content-type=video/mp4

# 업로드 확인
npx wrangler r2 object list mindstory-videos
```

---

### ✅ Step 9: 배포 검증

#### A. 홈페이지 접속
```
https://xxx.mindstory-lms.pages.dev/
```

**확인사항**:
- ✅ 페이지 로딩 속도 (3초 이내)
- ✅ 강좌 목록 표시
- ✅ 이미지 로딩

#### B. 학생 로그인 테스트
```
이메일: student1@example.com
비밀번호: password123
```

**확인사항**:
- ✅ 로그인 성공
- ✅ 내 강의실 표시
- ✅ 수강 중인 강좌 5개 표시

#### C. 영상 재생 테스트
```
강좌 → 학습상담사 → 차시 67 → 재생 버튼 클릭
```

**확인사항**:
- ✅ 영상 로딩 (5초 이내)
- ✅ 재생 컨트롤 작동
- ✅ 전체 화면 가능
- ✅ 버퍼링 없이 재생

---

## 🎯 배포 완료 후 작업

### 1. meta_info에 프로젝트 이름 저장

프로덕션 URL을 받으면:
```
https://xxxxxxxx.mindstory-lms.pages.dev
```

### 2. 커스텀 도메인 연결 (선택사항)

```bash
# 자신의 도메인 연결
npx wrangler pages domain add lms.mindstory.co.kr \
  --project-name mindstory-lms
```

### 3. GitHub 연동 (선택사항)

Cloudflare Dashboard → Pages → mindstory-lms → Settings → Builds & deployments

Git 연동 후 자동 배포 설정 가능

---

## 📊 예상 비용

### 무료 플랜 (충분함)

**Cloudflare Pages**:
- ✅ 무제한 요청
- ✅ 무제한 대역폭
- ✅ 500 빌드/월
- ✅ 100GB 파일

**R2 Storage**:
- ✅ 10GB 저장/월 (영상 약 50개)
- ✅ 1백만 업로드/월
- ✅ 10백만 다운로드/월

**D1 Database**:
- ✅ 5GB 저장
- ✅ 5백만 읽기/월
- ✅ 10만 쓰기/월

**실제 사용 시나리오**:
- 20분 영상 100개 = 5GB → **무료**
- 월 1만 회 재생 → **무료**
- 학생 1000명 → **무료**

---

## ❓ 문제 해결

### 배포 실패: "Authentication error"
```bash
# API 키 재설정
npx wrangler login
```

### 빌드 실패: "Module not found"
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 영상 재생 안 됨
1. R2 버킷 생성 확인: `npx wrangler r2 bucket list`
2. wrangler.jsonc의 r2_buckets 확인
3. 파일 업로드 확인: `npx wrangler r2 object list mindstory-videos`

### 데이터베이스 오류
```bash
# 마이그레이션 상태 확인
npx wrangler d1 migrations list mindstory-production

# 마이그레이션 재적용
npx wrangler d1 migrations apply mindstory-production --remote
```

---

## 🎉 축하합니다!

배포가 완료되면:

✅ **실제 사용 가능한 LMS 플랫폼**
✅ **전 세계 어디서나 빠른 접속**
✅ **대용량 영상 완벽 처리**
✅ **관리자가 웹에서 직접 영상 업로드**
✅ **무료로 운영 가능**

---

## 📞 다음 단계

1. **사용자 추가**: 실제 학생 계정 생성
2. **강좌 추가**: 새로운 강좌 등록
3. **영상 업로드**: 모든 강의 영상 업로드
4. **도메인 연결**: lms.mindstory.co.kr
5. **마케팅 시작**: 학생 모집

---

**문제가 발생하면 PRODUCTION_DEPLOYMENT.md를 참조하거나 질문해주세요!** 🚀
