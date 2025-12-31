# 💾 Cloudflare API 토큰 저장 가이드

## 📌 방법 1: Deploy 탭에 저장 (가장 권장 ⭐)

### 장점:
- ✅ 가장 안전
- ✅ 자동으로 암호화 저장
- ✅ 배포 시 자동 사용
- ✅ 별도 관리 불필요

### 저장 방법:
```
1. 좌측 메뉴 "Deploy" 탭 클릭
2. "Cloudflare API Key" 입력란에 토큰 붙여넣기
3. "Save" 버튼 클릭
4. ✅ 완료!
```

### 토큰 형태:
```
예시: abc123def456ghi789jkl012mno345pqr678stu
      (실제로는 더 깁니다)
```

---

## 📌 방법 2: 텍스트 파일로 저장 (임시용)

### 주의사항:
- ⚠️  보안에 취약할 수 있음
- ⚠️  파일을 안전한 곳에 보관
- ⚠️  공유 폴더에 저장 금지

### 저장 위치 예시:

#### Windows:
```
C:\Users\내이름\Documents\cloudflare-token.txt
```

#### Mac:
```
/Users/내이름/Documents/cloudflare-token.txt
```

#### 파일 내용:
```
Cloudflare API Token
생성일: 2025-12-30
용도: MindStory LMS 배포

토큰:
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 📌 방법 3: 비밀번호 관리자 사용 (추천)

### 추천 비밀번호 관리자:
- 1Password
- LastPass
- Bitwarden
- Chrome 비밀번호 관리자

### 저장 방법:
```
1. 비밀번호 관리자 열기
2. 새 항목 추가
3. 제목: "Cloudflare API Token - MindStory LMS"
4. 사용자명: (Cloudflare 이메일)
5. 비밀번호: (API 토큰 붙여넣기)
6. 메모: "프로덕션 배포용"
7. 저장
```

---

## 🔍 토큰 생성 후 확인 방법

토큰을 생성하면 이런 화면이 나옵니다:

```
┌────────────────────────────────────────────────────────┐
│ Success! API token created                             │
│                                                        │
│ ⚠️  Important: Copy your token now!                   │
│ This is the only time we will show the full token.    │
│                                                        │
│ Token:                                                │
│ ┌──────────────────────────────────────────────────┐ │
│ │ abc123def456ghi789jkl012mno345pqr678stu901vwx234│ │
│ │                                                  │ │
│ │               [ Copy ] 버튼                       │ │
│ └──────────────────────────────────────────────────┘ │
│                                                        │
│ Permissions:                                          │
│ ✅ Account - Cloudflare Pages - Edit                  │
│ ✅ Account - Workers R2 Storage - Edit                │
│ ✅ Account - D1 - Edit                                 │
│                                                        │
│              [ Continue ] 버튼                         │
└────────────────────────────────────────────────────────┘
```

**반드시 [ Copy ] 버튼을 클릭해서 복사하세요!**

---

## 🔐 토큰 보안 수칙

### ✅ 해야 할 것:
- Deploy 탭에 저장
- 비밀번호 관리자에 저장
- 안전한 로컬 파일에 저장

### ❌ 하지 말아야 할 것:
- 공개 채팅에 붙여넣기
- GitHub에 커밋
- 이메일로 전송
- 공유 문서에 저장
- 스크린샷 찍어서 공유

---

## 🆘 토큰을 잃어버렸다면?

### 해결 방법:

1. **Cloudflare 대시보드 접속**
   ```
   https://dash.cloudflare.com/
   ```

2. **프로필 → My Profile → API Tokens**

3. **기존 토큰 삭제**
   - 잃어버린 토큰 옆의 [...] 클릭
   - "Delete" 선택
   - 확인

4. **새 토큰 생성**
   - "Create Token" 클릭
   - "Edit Cloudflare Workers" 템플릿 선택
   - 다시 생성
   - **이번엔 꼭 저장!**

---

## 📊 토큰 생성 체크리스트

생성 전:
- [ ] Cloudflare 로그인 완료
- [ ] 텍스트 파일 또는 비밀번호 관리자 준비

생성 중:
- [ ] "Edit Cloudflare Workers" 템플릿 선택
- [ ] 권한 확인 (Pages, R2, D1)
- [ ] "Create Token" 클릭

생성 후 (중요!):
- [ ] **즉시 [ Copy ] 버튼 클릭**
- [ ] Deploy 탭에 붙여넣기 + 저장
- [ ] 텍스트 파일에 백업 저장
- [ ] 토큰 테스트 (배포 시도)

---

## 🎯 토큰 저장 위치 요약

| 방법 | 안전성 | 편리성 | 추천도 |
|------|--------|--------|--------|
| Deploy 탭 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 최고 |
| 비밀번호 관리자 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 추천 |
| 로컬 텍스트 파일 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️  임시 |
| 메모장/메모앱 | ⭐⭐ | ⭐⭐⭐⭐ | ❌ 비추천 |

---

## 🔄 토큰 생성 플로우

```
시작
 ↓
Cloudflare 로그인
 ↓
프로필 → My Profile
 ↓
API Tokens 메뉴
 ↓
Create Token 클릭
 ↓
템플릿 선택: "Edit Cloudflare Workers"
 ↓
Continue to summary
 ↓
Create Token
 ↓
⚠️  토큰 화면 (단 한 번만 표시!)
 ↓
[ Copy ] 버튼 클릭 ← 🔴 매우 중요!
 ↓
Deploy 탭에 붙여넣기
 ↓
Save 버튼 클릭
 ↓
✅ 완료!
```

---

## 💡 Pro Tips

### Tip 1: 즉시 두 곳에 저장
토큰 복사 후:
1. Deploy 탭에 즉시 붙여넣기 + 저장
2. 텍스트 파일에도 백업 저장

### Tip 2: 토큰 이름 지정
Cloudflare에서 토큰 생성 시 이름 설정 가능:
```
예: "MindStory LMS Production Deploy"
```

### Tip 3: 유효기간 설정
- 보안이 중요하면: 90일로 설정
- 편의성 우선이면: 만료 없음

### Tip 4: 권한 최소화
필요한 권한만 선택:
- ✅ Cloudflare Pages - Edit
- ✅ Workers R2 Storage - Edit
- ✅ D1 - Edit
- ❌ 그 외 불필요한 권한 제거

---

## 🎬 스크린샷으로 보는 전체 과정

### 1단계: API Tokens 페이지
```
https://dash.cloudflare.com/ → 프로필 → My Profile → API Tokens
```

### 2단계: Create Token
```
파란색 "Create Token" 버튼 클릭
```

### 3단계: 템플릿 선택
```
"Edit Cloudflare Workers" 찾기
→ 우측 "Use template" 클릭
```

### 4단계: 권한 확인
```
자동으로 설정된 권한 확인:
- Account - Cloudflare Pages - Edit
- Account - Workers R2 Storage - Edit  
- Account - D1 - Edit
```

### 5단계: 토큰 생성
```
"Continue to summary" → "Create Token"
```

### 6단계: 토큰 복사 ⚠️
```
⚠️  중요: 이 화면에서 복사!
[ Copy ] 버튼 클릭
```

### 7단계: Deploy 탭에 저장
```
좌측 메뉴 "Deploy" → API Key 입력 → Save
```

---

## ✅ 최종 체크리스트

배포 준비 완료 확인:

- [ ] Cloudflare 계정 생성 완료
- [ ] API 토큰 생성 완료
- [ ] 토큰 복사 완료
- [ ] Deploy 탭에 토큰 저장 완료
- [ ] (선택) 백업 저장 완료

**모두 체크했다면 이제 배포 준비 완료!** 🎉

저에게 **"배포해줘!"** 라고 말씀해주세요!
