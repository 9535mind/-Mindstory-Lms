# 🔧 마인드스토리 LMS - 소셜 로그인 설정 가이드

## 📋 현재 상태 (2025.12.28)

### ✅ 정상 작동 중
- **이메일 회원가입**: 완벽 작동 (테스트 완료)
- **로그인**: 완벽 작동 (이메일 계정)

### ⚠️ 설정 필요
- **Google 로그인**: OAuth 2.0 설정 필요 (10분 소요)
- **카카오 로그인**: Redirect URI 등록 필요 (5분 소요)
- **전화번호 SMS**: 실제 SMS API 연동 필요 (NICE/알리고)

---

## 1️⃣ Google OAuth 2.0 설정 (10분)

### 단계 1: Google Cloud Console 접속
```
https://console.cloud.google.com/
```

### 단계 2: 프로젝트 생성 또는 선택
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: `마인드스토리 LMS`
4. "만들기" 클릭

### 단계 3: OAuth 동의 화면 구성
```
좌측 메뉴: [API 및 서비스] → [OAuth 동의 화면]
```

**설정 내용**:
- 사용자 유형: **외부** 선택
- 앱 이름: `마인드스토리 원격평생교육원`
- 사용자 지원 이메일: `js94659535@gmail.com`
- 승인된 도메인: `sandbox.novita.ai` 추가
- 개발자 연락처 이메일: `js94659535@gmail.com`
- "저장 후 계속" 클릭

**범위 추가**:
- `.../auth/userinfo.email` ✅
- `.../auth/userinfo.profile` ✅
- "저장 후 계속" 클릭

**테스트 사용자 추가** (개발 중):
- `js94659535@gmail.com` 추가
- "저장 후 계속" 클릭

### 단계 4: OAuth 2.0 클라이언트 ID 생성
```
좌측 메뉴: [API 및 서비스] → [사용자 인증 정보]
```

1. **"+ 사용자 인증 정보 만들기"** 클릭
2. **"OAuth 클라이언트 ID"** 선택
3. **애플리케이션 유형**: "웹 애플리케이션"
4. **이름**: `마인드스토리 LMS`

**승인된 자바스크립트 원본**:
```
https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai
```

**승인된 리디렉션 URI**:
```
https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/api/auth/google/callback
```

5. **"만들기"** 클릭

### 단계 5: 클라이언트 ID/Secret 복사

**생성 완료 후 표시되는 값**:
- 클라이언트 ID: `xxxxx.apps.googleusercontent.com`
- 클라이언트 보안 비밀번호: `xxxxxxxx`

**⚠️ 이 값을 복사해서 보관하세요!**

### 단계 6: .dev.vars 파일 수정

`.dev.vars` 파일을 열어서 다음 값을 업데이트:

```bash
# 구글 로그인 설정
GOOGLE_CLIENT_ID=여기에_클라이언트_ID_붙여넣기
GOOGLE_CLIENT_SECRET=여기에_클라이언트_보안_비밀번호_붙여넣기
GOOGLE_REDIRECT_URI=https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/api/auth/google/callback
```

### 단계 7: 서버 재시작

```bash
cd /home/user/webapp
pm2 restart mindstory-lms --update-env
```

### 단계 8: 테스트

1. 회원가입 페이지 접속: https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/register
2. "Google로 계속하기" 버튼 활성화 확인
3. 버튼 클릭 → Google 로그인 페이지로 이동
4. 로그인 → 자동 회원가입 완료!

---

## 2️⃣ 카카오 로그인 설정 (5분)

### 단계 1: 카카오 개발자 콘솔 접속
```
https://developers.kakao.com/
```

### 단계 2: 앱 선택
- "내 애플리케이션" 클릭
- **마인드스토리 LMS** 앱 선택

### 단계 3: 카카오 로그인 활성화
```
좌측 메뉴: [제품 설정] → [카카오 로그인]
```

**설정**:
- ✅ 카카오 로그인 활성화: **ON**
- ✅ OpenID Connect 활성화: **ON** (권장)

### 단계 4: Redirect URI 등록 ⭐

**"Redirect URI" 섹션에서 [+ Redirect URI 등록] 클릭**

**등록할 URI** (정확히 복사):
```
https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/api/auth/kakao/callback
```

**⚠️ 주의**:
- 마지막 `/` (슬래시) **없어야 함**
- `https://` 로 시작
- 띄어쓰기 없이 정확히 입력

### 단계 5: 동의 항목 설정
```
좌측 메뉴: [제품 설정] → [카카오 로그인] → [동의 항목]
```

**필수 설정**:
| 항목 | 설정 | 목적 |
|------|------|------|
| 닉네임 | **필수 동의** | 사용자 이름 수집 |
| 카카오계정(이메일) | **선택 동의** | 이메일 수집 |
| 프로필 사진 | **선택 동의** | 프로필 이미지 |

### 단계 6: 저장 및 대기
1. **"저장"** 버튼 클릭
2. **5~10분 대기** (카카오 서버 반영 시간)

### 단계 7: 테스트

1. 회원가입 페이지 접속
2. "카카오로 계속하기" 버튼 활성화 확인
3. 버튼 클릭 → 카카오 로그인 페이지로 이동
4. KOE006 오류 해결 확인
5. 로그인 → 자동 회원가입 완료!

---

## 3️⃣ 전화번호 SMS 인증 설정 (향후)

### 현재 상태
- **테스트 모드**: 고정 인증번호 `123456` 사용
- **실제 SMS 발송 안 됨**

### 실제 SMS API 연동 필요

**추천 SMS 서비스**:
1. **NICE 본인인증** (신뢰도 높음, 가격 ₩50~100/건)
2. **알리고 SMS** (저렴함, 가격 ₩9~15/건)
3. **NHN Cloud SMS** (안정적, 가격 ₩11~20/건)

### 연동 방법 (예: 알리고 SMS)

**1단계**: 알리고 회원가입
```
https://smartsms.aligo.in/
```

**2단계**: API 키 발급
- 관리자 페이지 → API 설정 → API 키 생성

**3단계**: `.dev.vars` 파일에 추가
```bash
# SMS 발송 설정 (알리고)
ALIGO_API_KEY=your_aligo_api_key
ALIGO_USER_ID=your_aligo_user_id
ALIGO_SENDER=01012345678  # 발신번호 (본인인증 필요)
```

**4단계**: SMS 발송 API 구현 필요
- `src/routes/auth.ts`에 실제 SMS 발송 로직 추가
- 랜덤 인증번호 생성
- 유효시간 3분 설정
- DB에 인증번호 임시 저장

---

## 4️⃣ 서버 재시작 및 확인

### 설정 완료 후 서버 재시작
```bash
cd /home/user/webapp
pm2 restart mindstory-lms --update-env
```

### 로그 확인
```bash
pm2 logs mindstory-lms --nostream
```

### 최종 테스트

**회원가입 페이지**:
```
https://3000-ieu1ambselnpjf2cme9se-c81df28e.sandbox.novita.ai/register
```

**테스트 체크리스트**:
- [ ] 이메일 회원가입 정상 작동
- [ ] Google 로그인 정상 작동
- [ ] 카카오 로그인 정상 작동
- [ ] 전화번호 SMS 테스트 모드 작동 (123456)

---

## 🚨 문제 해결

### Google: 401 invalid_client
**원인**: 클라이언트 ID가 잘못되었거나 Redirect URI 불일치

**해결**:
1. `.dev.vars`의 `GOOGLE_CLIENT_ID` 확인
2. Google Cloud Console에서 Redirect URI 확인
3. 띄어쓰기, 슬래시(`/`) 정확히 입력 확인

### 카카오: KOE006
**원인**: Redirect URI가 등록되지 않음

**해결**:
1. 카카오 개발자 콘솔에서 Redirect URI 등록 확인
2. 5~10분 대기 (서버 반영 시간)
3. 브라우저 캐시 삭제 후 재시도

### 전화번호: SMS 발송 안 됨
**원인**: 테스트 모드로만 구현됨

**해결**:
- 현재는 고정 인증번호 `123456` 사용
- 실제 SMS API 연동 필요 (위 3️⃣ 참고)

---

## 📞 문의

설정 중 문제가 발생하면:
1. 오류 메시지 스크린샷
2. 설정 화면 스크린샷
3. 위 정보와 함께 문의

---

**마지막 업데이트**: 2025.12.28  
**작성자**: GenSpark AI Assistant
