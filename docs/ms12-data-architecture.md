# ms12 데이터·파일 아키텍처 (D1 + R2)

Cloudflare **Workers** 기준. **인증**은 앱 내 **세션(쿠키) + D1 `users`/`user_sessions`**이며, **Firebase(클라이언트)**는 보조(카카오 커스텀 토큰 연동 시 등)로만 쓰는 정책.

---

## 1. D1 테이블 역할 (ms12·공통 업무)

| 대상 | 실제 D1 오브젝트 | 역할 | 이 저장소 구현 |
|------|------------------|------|----------------|
| **회의 (meetings)** | `ms12_meetings` | ms12 회의 원문·요약·소유자·가시성 | ✅ 구현 (`0071_ms12_meetings.sql`, `/api/ms12/meeting/*`) |
| **사용자 (users)** | `users` (+ 확장 컬럼) | 계정, 역할, 소셜, 프로필 | ✅ 기존 LMS |
| **세션** | `user_sessions` / `sessions` | 로그인 세션 토큰 | ✅ 기존 |
| **초대 (invitations)** | *(전용 테이블 없음 — 아래 “미구현”)* | ms12 회의/워크스페이스 초대 등 | ❌ **미구현** (필요 시 `ms12_invitations` 등으로 추가) |
| **보안 이벤트** | `security_events` | DevTools/탭 전환 감지 등 **클라이언트 보안 로그** | ✅ `migrations/0020_create_security_events.sql`, `POST /api/security/log` |
| **감사(audit) 로그** | *(별도 `audit_logs` 테이블 없음)* | **규정/감사**용 **불변** 추적이면 `ms12_audit_logs` 류 **신규** 권장 | ❌ **미구현** (`security_events`와 구분) |
| **제안(Proposal) 메타** | *(전용 없음)* | Proposal Studio **문서 ID·상태** 등 메타 | ❌ **미구현** (코드/마이그레이션에 `proposal` **명칭 없음**) |

### 참고: `users` / `ms12_meetings` 관계

- `ms12_meetings.owner_id` → `users.id` (FK).

---

## 2. D1 vs R2 구분

| 저장 종류 | 위치 | 예시 |
|-----------|------|------|
| **정형/검색·권한·감사 메타** | **D1** | 사용자, 세션, 회의 행, 주문, 강의 메타, 보안 이벤트, (향후) 초대/감사/제안 메타 |
| **바이너리·대용량·파일** | **R2** | 강의 영상, PDF, 썸네일, 일반 **업로드 바이트**, (미래) 회의 **내보낸 PDF/첨부** |
| **문서 “내용”이 Firestore** | **사용하지 않음** (정책) | — |

- R2 **키/경로·MIME** 등은 D1(또는 `upload` 메타)에 **참조**만 두는 패턴이 일반적.

---

## 3. Firebase

- **용도**: Google/Kakao 등 **로그인 보조**, 필요 시 **Custom Token** 연동.
- **ms12 업무 본문·회의**는 **D1**에 둔다(현 정책).

---

## 4. “Proposal Studio / audit_logs / documents” 코드베이스 스캔 요약

| 키워드 | 이 저장소 `src`·`migrations` | 비고 |
|--------|------------------------------|------|
| **Proposal Studio** | **없음** | 미구현 / 다른 서비스·브랜치 가능 |
| **audit_logs** (테이블명) | **없음** | `security_events` 만 존재 (역할이 다를 수 있음) |
| **invitations** | **없음** | 미구현 |
| **문서(파일)** | **R2 + 업로드 라우트** | `upload`, `R2` 바인딩 (LMS 맥락) |
| **documents** (전용 NoSQL) | **없음** | — |

(검색 시점: 2026, 리포 `ms12` 기준)
