# 🌐 브라우저 테스트 가이드

## ✅ 완료된 수정 사항
- ✅ `enrollments` 테이블 컬럼명 수정 (created_at → enrolled_at)
- ✅ 존재하지 않는 컬럼 제거 (total_lessons, total_duration_minutes)
- ✅ API 정상 작동 확인
- ✅ 테스트 데이터 추가

## 🎯 브라우저 테스트 단계

### 1단계: 로그인 페이지 접속
```
URL: https://mindstory-lms.pages.dev/login
```

### 2단계: 테스트 계정으로 로그인
```
이메일: demo@test.com
비밀번호: demo1234
```

### 3단계: 로그인 후 확인사항
- ✅ 로그인 성공 메시지 표시
- ✅ 자동으로 메인 페이지 또는 대시보드로 이동
- ✅ 우측 상단에 "데모사용자님" 표시

### 4단계: 내 강의실 접속
```
방법 1: 상단 메뉴에서 "내 강의실" 클릭
방법 2: 직접 URL 접속 - https://mindstory-lms.pages.dev/my-courses
```

### 5단계: 수강 목록 확인
다음 강좌들이 표시되어야 합니다:
- ✅ React 기초 과정 (진도율 30%)
- ✅ Node.js 실전 프로젝트 (진도율 15%)

## 🔍 문제 발생 시 디버깅

### F12 개발자 도구 열기
```
Windows: F12 또는 Ctrl + Shift + I
Mac: Cmd + Option + I
```

### Console 탭에서 확인
```javascript
// 1. 토큰 확인
console.log('Token:', localStorage.getItem('session_token'))

// 2. 사용자 정보 확인
console.log('User:', localStorage.getItem('user'))

// 3. API 직접 테스트
fetch('/api/enrollments/my', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('session_token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('수강 목록:', data)
})
```

### Network 탭에서 확인
1. Network 탭 클릭
2. 페이지 새로고침 (F5)
3. "enrollments" 검색
4. 요청 클릭해서 응답 확인

**예상 응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 7,
      "course_id": 1,
      "enrolled_at": "2025-12-31 04:27:40",
      "progress": 30,
      "completed_at": null,
      "title": "React 기초 과정",
      "thumbnail_url": "https://via.placeholder.com/300x200"
    },
    {
      "id": 2,
      "user_id": 7,
      "course_id": 2,
      "enrolled_at": "2025-12-31 04:27:40",
      "progress": 15,
      "completed_at": null,
      "title": "Node.js 실전 프로젝트",
      "thumbnail_url": "https://via.placeholder.com/300x200"
    }
  ]
}
```

## 📱 모바일에서 테스트
1. 모바일 기기에서 https://mindstory-lms.pages.dev/login 접속
2. demo@test.com / demo1234로 로그인
3. 메뉴에서 내 강의실 확인

## 🔄 캐시 문제 해결
만약 이전 버전이 보인다면:
1. **강력 새로고침**
   - Windows: Ctrl + Shift + R 또는 Ctrl + F5
   - Mac: Cmd + Shift + R

2. **캐시 완전 삭제**
   - F12 → Application → Storage → Clear site data
   - 또는 브라우저 설정 → 쿠키 및 사이트 데이터 삭제

## 🎉 성공 기준
- ✅ 로그인 성공
- ✅ 사용자 이름 표시
- ✅ 내 강의실 페이지 접근
- ✅ 2개의 수강 과목 표시
- ✅ Console에 에러 없음
- ✅ Network 탭에서 API 응답 200 OK

## 💡 추가 테스트 계정

### 계정 1: 일반 사용자
```
이메일: test123@gmail.com
비밀번호: test123456
수강 과목: 없음 (빈 목록 표시 테스트용)
```

### 계정 2: 관리자
```
이메일: admin-test@gmail.com
비밀번호: admin123456
역할: 관리자 (관리자 대시보드 접근 가능)
```

## 📞 문제 보고
문제가 발생하면 다음 정보를 캡처해 주세요:
1. 스크린샷
2. Console 탭 에러 메시지
3. Network 탭의 실패한 요청 응답
4. 사용한 브라우저 및 버전

---

**테스트 날짜**: 2025-12-31
**배포 URL**: https://mindstory-lms.pages.dev
**상태**: ✅ 준비 완료
