# ⚡ 빠른 배포 가이드 (5분)

## 🎯 목표
**대용량 영상(20분, 100MB+)을 처리할 수 있는 실전 LMS를 프로덕션에 배포**

---

## 📋 준비물 (1분)

1. **Cloudflare 계정** (무료)
   - 가입: https://dash.cloudflare.com/sign-up

2. **Cloudflare API 토큰**
   - Dashboard → My Profile → API Tokens → Create Token
   - "Edit Cloudflare Workers" 템플릿 선택
   - 권한: Pages, D1, R2 모두 Edit
   - 토큰 복사 ⚠️ (한 번만 보임)

---

## 🚀 배포 (5분)

### 방법 1: 자동 스크립트 (권장)

```bash
cd /home/user/webapp
bash deploy.sh
```

### 방법 2: 수동 단계별

```bash
# 1. 빌드
npm run build

# 2. R2 버킷 생성
npx wrangler r2 bucket create mindstory-videos
npx wrangler r2 bucket create mindstory-storage

# 3. D1 데이터베이스 생성
npx wrangler d1 create mindstory-production
# ⚠️ database_id를 복사하여 wrangler.jsonc에 입력

# 4. 배포
npx wrangler pages deploy dist --project-name mindstory-lms
```

---

## ✅ 배포 완료 후 (3분)

### 1. 마이그레이션 적용

```bash
npx wrangler d1 migrations apply mindstory-production --remote
```

### 2. 초기 데이터 입력

```bash
npx wrangler d1 execute mindstory-production --remote \
  --file=./add_enrollments.sql
```

### 3. 접속 테스트

**프로덕션 URL**: https://xxx.mindstory-lms.pages.dev

**관리자 로그인**:
- 이메일: `admin@mindstory.co.kr`
- 비밀번호: `admin123`

---

## 🎬 영상 업로드 (즉시)

### 웹 UI에서 (권장)

1. 관리자 로그인
2. 강좌 관리 → 차시 관리
3. 영상 파일 선택 (500MB까지)
4. 저장 → **자동으로 R2 업로드 + CDN 서빙**

### CLI에서

```bash
npx wrangler r2 object put mindstory-videos/videos/lesson1.mp4 \
  --file=/path/to/영상.mp4 \
  --content-type=video/mp4
```

---

## 🎯 결과

✅ **실제 사용 가능한 LMS 완성**
✅ **대용량 영상 (100MB+) 완벽 처리**
✅ **전 세계 빠른 접속 (Cloudflare CDN)**
✅ **무료로 운영 가능**

---

## 📚 상세 가이드

- **단계별 체크리스트**: DEPLOYMENT_CHECKLIST.md
- **프로덕션 가이드**: PRODUCTION_DEPLOYMENT.md
- **API 문서**: API_ENDPOINTS.md

---

## ❓ 문제 발생 시

**배포 실패**:
```bash
npx wrangler login  # API 키 재설정
```

**영상 재생 안 됨**:
```bash
npx wrangler r2 bucket list  # 버킷 확인
```

**데이터베이스 오류**:
```bash
npx wrangler d1 migrations apply mindstory-production --remote
```

---

## 🎉 완료!

**이제 실제 학생을 받을 수 있습니다!** 🚀

프로덕션 URL을 공유하고, 관리자 페이지에서 영상을 업로드하세요.
