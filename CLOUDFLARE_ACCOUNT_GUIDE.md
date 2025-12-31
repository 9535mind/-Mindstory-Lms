# 🔐 Cloudflare 계정 가이드

## 🤔 계정이 있나요? 없나요?

### ✅ 계정이 **없는** 경우 → 신규 가입

**소요 시간**: 2분

---

### 📝 신규 가입 단계

#### 1️⃣ 가입 페이지 접속

브라우저에서 다음 링크 열기:
```
https://dash.cloudflare.com/sign-up
```

---

#### 2️⃣ 정보 입력

화면에 나타나는 입력란에 정보를 입력:

- **Email**: 사용하실 이메일 주소
- **Password**: 비밀번호 (8자 이상)
- **약관 동의**: 체크박스 선택

**[Sign Up]** 버튼 클릭

---

#### 3️⃣ 이메일 인증

1. 이메일 받은편지함 확인
2. Cloudflare에서 온 이메일 찾기
   - 제목: "Verify your email address"
3. 이메일 안의 **[Verify Email]** 버튼 클릭

---

#### 4️⃣ 플랜 선택

화면에서 **Free** 플랜 선택:

| Free | Pro | Business |
|------|-----|----------|
| $0/month | $20/month | $200/month |
| **[Select]** ← 클릭 | [Select] | [Select] |

✅ **Free 플랜으로 충분합니다!**

우리 LMS는 Free 플랜으로 운영 가능:
- ✅ Cloudflare Pages (무료)
- ✅ Workers R2 Storage (10GB 무료)
- ✅ D1 Database (무료)
- ✅ 무제한 대역폭

---

#### 5️⃣ 완료!

축하합니다! Cloudflare 계정이 생성되었습니다! 🎉

**다음 단계**: API 토큰 생성
→ [TOKEN_STORAGE_GUIDE.md](./TOKEN_STORAGE_GUIDE.md) 참고

---

## 🔐 계정이 **있는** 경우 → 로그인

**소요 시간**: 1분

---

### 📝 로그인 단계

#### 1️⃣ 로그인 페이지 접속

브라우저에서 다음 링크 중 하나 열기:

```
https://dash.cloudflare.com/login
```

또는

```
https://dash.cloudflare.com/
```
(자동으로 로그인 페이지로 이동)

---

#### 2️⃣ 로그인 정보 입력

- **Email**: 가입했던 이메일
- **Password**: 비밀번호

**[Log in]** 버튼 클릭

---

#### 3️⃣ 완료!

대시보드가 나타납니다!

**다음 단계**: API 토큰 생성
→ [TOKEN_STORAGE_GUIDE.md](./TOKEN_STORAGE_GUIDE.md) 참고

---

## 🆘 문제 해결

### ❓ 비밀번호를 잊어버렸어요

1. 로그인 페이지에서 **"Forgot password?"** 클릭
2. 이메일 주소 입력
3. 이메일 받은편지함 확인
4. 비밀번호 재설정 링크 클릭
5. 새 비밀번호 설정

---

### ❓ 이메일 인증 메일이 안 와요

1. **스팸/정크 메일함** 확인
2. 몇 분 기다려보기 (최대 5분)
3. 안 오면 → 로그인 시도 → "Resend verification email" 클릭

---

### ❓ 이미 계정이 있는지 확인하려면?

로그인 시도:
```
https://dash.cloudflare.com/login
```

- 로그인 성공 → 계정 있음 ✅
- "User not found" → 계정 없음 → 신규 가입

---

## 📊 계정 확인 체크리스트

### 신규 가입 체크리스트:
- [ ] 가입 페이지 접속
- [ ] 이메일 + 비밀번호 입력
- [ ] 약관 동의 체크
- [ ] Sign Up 버튼 클릭
- [ ] 이메일 인증 완료
- [ ] Free 플랜 선택
- [ ] ✅ 계정 생성 완료!

### 로그인 체크리스트:
- [ ] 로그인 페이지 접속
- [ ] 이메일 + 비밀번호 입력
- [ ] Log in 버튼 클릭
- [ ] ✅ 대시보드 확인!

---

## 🎯 다음 단계

계정 준비 완료 후:

1. **API 토큰 생성**
   - [VISUAL_TOKEN_GUIDE.md](./VISUAL_TOKEN_GUIDE.md) 참고

2. **Deploy 탭에 토큰 저장**

3. **배포 시작**
   - "배포해줘!" 라고 요청

---

## 📞 추가 도움

### Cloudflare 공식 문서:
- 시작 가이드: https://developers.cloudflare.com/fundamentals/get-started/
- Pages 문서: https://developers.cloudflare.com/pages/
- Workers 문서: https://developers.cloudflare.com/workers/

### 질문이 있으면:
- 저에게 언제든 물어보세요! 🤖
- 24/7 대기 중입니다

---

## 💡 Pro Tips

### Tip 1: 이메일 주소
- 회사 이메일이나 주로 사용하는 이메일 권장
- Gmail, Naver, Daum 등 모두 가능

### Tip 2: 비밀번호
- 최소 8자 이상
- 영문 + 숫자 조합 권장
- 안전한 곳에 저장

### Tip 3: 이메일 인증
- 반드시 이메일 인증 완료해야 함
- 스팸 메일함도 확인

### Tip 4: Free 플랜
- 우리 LMS에 충분
- 나중에 필요하면 업그레이드 가능
- 업그레이드 없어도 운영 가능

---

## ✅ 준비 완료 확인

다음 중 하나를 완료했나요?

- [x] Cloudflare 신규 가입 완료
- [x] Cloudflare 로그인 완료

✅ 둘 중 하나 완료했다면:

**"토큰 생성해줘"** 라고 말씀하시거나

**"API 토큰 만들기"** 라고 요청하세요!
