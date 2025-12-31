# 권한 찾기 가이드

## 문제 상황
드롭다운에서 필요한 권한들이 보이지 않음

---

## 해결 방법

### 방법 1: 스크롤 확인
드롭다운 메뉴 내에서:
- **위로 스크롤** (마우스 휠 또는 스크롤바)
- 알파벳 순서로 정렬되어 있음:
  - A, B, C... → **D1** (D로 시작)
  - C로 시작 → **Cloudflare Pages**

### 방법 2: 검색 기능
- 드롭다운 내에서 타이핑 시도
- "D1" 입력하면 자동으로 이동

### 방법 3: 전체 목록 확인
드롭다운을 천천히 스크롤하면서:
- 모든 항목 확인
- 스크린샷 찍어서 보내주기

---

## 예상되는 권한 목록 (알파벳 순)

```
A
├─ Account Settings
├─ Access

C
├─ Cloudflare Pages ⭐

D
├─ D1 ⭐⭐⭐

W
├─ Workers KV Storage
├─ Workers R2 Storage ⭐
├─ Workers Scripts
├─ Workers Pipelines
├─ Workers Tail
└─ ...
```

---

## 대체 방법: 템플릿 사용

만약 권한을 찾기 어렵다면:

1. 이 페이지 닫기
2. API Tokens 페이지로 돌아가기
3. **"Edit Cloudflare Workers"** 템플릿 찾기
4. **"Use template"** 클릭
5. 자동으로 대부분의 권한 설정됨
6. **"D1" 권한만 수동 추가**

