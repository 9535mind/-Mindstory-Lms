# MS12 회의 플랫폼 — 범위·카카오 로그인·점검

이 문서는 **MS12 회의** 전용입니다. 수강·유아숲·기타 LMS 화면과 혼동하지 않도록 UI 카피와 운영 설정을 여기에 맞춥니다.

---

## 1. 제품 범위

- **포함**: `/app` 회의 허브, 회의실, 보관함, 문서·공고, `/api/ms12/*`, 이메일·카카오·Google 로그인(동일 계정 DB).
- **배포 검증 URL(forest 등 다른 제품)**: 워크스페이스 규칙의 `forest.html` 안내를 따릅니다. MS12 회의 QA는 **`/app`** 기준입니다.

---

## 2. 카카오 로그인 — 끝까지 맞추기

### 한 번에 점검(터미널)

프로젝트 루트에서:

```bash
npm run kakao:ms12
```

로컬에 `KAKAO_CLIENT_ID`가 잡히는지, 카카오 콘솔에 넣을 Redirect URI, Cloudflare `wrangler pages secret` 예시가 출력됩니다. (비밀 값은 출력하지 않습니다.)

로컬 키만 빠르게 보려면:

```bash
npm run verify:kakao-env
```

로컬 `.dev.vars` / `.env`를 Cloudflare Pages **`ms12`** 프로젝트 Secret으로 올리려면(비어 있지 않은 키만):

```bash
npm run push-secrets:pages
```

### 2.1 카카오 개발자 콘솔

1. [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → (MS12용) 앱 선택 또는 생성.
2. **앱 키**: **REST API 키**를 서버에 넣습니다 → Cloudflare **Pages/Worker 환경 변수** `KAKAO_CLIENT_ID` (로컬은 `.dev.vars` / `.env`).
3. **제품 설정 → 카카오 로그인**: 사용 설정 **ON**.
4. **Redirect URI**에 아래를 **정확히** 등록 (끝 슬래시 없음, 스킴·호스트 일치).

| 환경 | 등록할 Redirect URI 예시 |
|------|-------------------------|
| 운영 (ms12.org) | `https://ms12.org/auth/kakao/callback` |
| Cloudflare Pages 미리보기 | `https://<hash>.<project>.pages.dev/auth/kakao/callback` (실제 미리보기 URL 기준) |
| 로컬 | `http://localhost:<포트>/auth/kakao/callback` (실제 dev 서버 origin과 동일) |

- 코드는 운영 호스트 `ms12.org` / `www.ms12.org`에 대해 **고정** `https://ms12.org/auth/kakao/callback` 을 쓰는 경로가 있습니다. 콘솔에 **이 한 줄**이 있어야 KOE006(redirect_mismatch)이 나지 않습니다.
- 콜백 경로는 `/auth/kakao/callback` 이 기준이며, `/api/auth/kakao/callback` 은 호환용으로도 동작합니다(같은 핸들러).

### 2.2 서버·배포 시크릿

- `KAKAO_CLIENT_ID` — 필수(REST API 키).
- `KAKAO_CLIENT_SECRET` — 카카오 앱에 Client Secret이 켜져 있으면 설정. 없이 동작하는 앱도 있음(토큰 요청 시 서버가 재시도).
- `KAKAO_REDIRECT_URI` — 로컬/사설 IP 등 **특수 호스트**에서만 보조. 운영 `ms12.org`는 코드의 고정 URI를 따릅니다.

### 2.3 동작 확인

1. `GET /api/auth/kakao/ready` → `kakaoConfigured: true` 이면 REST 키는 잡힌 상태.
2. 브라우저에서 `/app/login` → **카카오** 링크 → 동의 후 `/app?oauth_sync=1` 로 돌아오고, 상단 배지·이름이 로그인 상태로 바뀌는지 확인.
3. `GET /api/auth/me` → 200, `data`에 사용자 필드.

### 2.4 자주 나는 오류

- **KOE006 / redirect_uri_mismatch**: 콘솔 Redirect URI와 실제 `redirect_uri` 쿼리가 **한 글자라도** 다름(www 유무, http/https, 경로).
- **KOE101 등**: JavaScript 키를 넣은 경우 — 반드시 **REST API 키** 사용.

---

## 3. 기능 스모크 점검 (배포 후)

| 영역 | 확인 |
|------|------|
| 빌드 | `npm run build` 성공 |
| 홈 `/app` | 로딩 후 셸 표시, 게스트/로그인 배지 |
| `/app/login` | 이메일 로그인, 카카오, Google 링크 |
| 회의 | `/app/meeting/new` → 코드 발급·입장 |
| 회의실 | 메모·요약·실행 항목·초안 탭 (참가자·AI 키 있을 때 API) |
| 보관·기록 | `/app/archive`, `/app/meeting-record/...` (권한 있을 때) |
| 문서·공고 | `/app/library`, `/app/announcements` (D1·권한) |
| 로그아웃 | 버튼 → `/app` → 비로그인 표시 |

자동 E2E는 없으므로, **프리뷰 URL**이 있으면 위 순서로 수동 확인하는 것을 권장합니다.

---

## 4. MS12 UI 카피 원칙

- **사용**: 회의, 참석자, 보관함, 문서, 공고, MS12, 로그인/로그아웃.
- **UI에서 피할 표현(다른 제품과 혼동)**: 수강, 강좌, 유아숲, LMS(사용자 대면 문구) 등. (계정 DB는 내부적으로 동일해도 **화면 문구는 MS12 중심**으로 유지.)
