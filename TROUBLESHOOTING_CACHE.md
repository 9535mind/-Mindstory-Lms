# 트러블슈팅: 기업용 Chrome + Service Worker + Cloudflare 3중 캐시 충돌 및 `/api/security/log` 오류

**작성 맥락:** 프론트엔드 보안 이벤트 API를 `/api/security/record`로 전환한 뒤에도, 일부 환경에서 구버전 클라이언트가 `/api/security/log`를 호출하거나 오래된 JS가 실행되어 오류·혼선이 발생한 사례를 정리한다.

---

## 1. 문제 증상

- 프론트엔드에서 API 경로를 **`/api/security/record`**로 변경했음에도 불구하고,
- **구버전 캐시**(브라우저·Service Worker·엣지)에 남은 스크립트가 계속 **`/api/security/log`**를 호출.
- 서버에 **`/log` 라우트가 없거나** DB·스키마가 맞지 않으면 **`500 Internal Server Error`** 또는 네트워크 실패로 콘솔에 빨간 줄이 반복됨.
- DevTools에서 동일한 안내 로그가 **두 번** 찍히거나, `VMxxxx` 출처와 일반 파일 출처가 **동시에** 보이는 등 “옛 코드 + 신 코드”가 섞인 것처럼 보이는 현상.

---

## 2. 원인 정리 (3중 구조)

| 층 | 설명 |
|----|------|
| **기업용 Chrome 정책** | 조직 정책으로 Service Worker·캐시가 강하게 유지되는 경우가 있음. 일반 새로고침만으로는 SW/캐시가 안 비워질 수 있음. |
| **Cloudflare 엣지 캐시** | HTML·정적 JS가 엣지에 캐시되면 배포 직후에도 구버전 자산이 내려갈 수 있음. |
| **백엔드 라우트·DB 불일치** | 클라이언트만 `/record`로 바꿔도, 캐시된 JS는 `/log` 호출. 서버가 `/log`를 처리하지 않거나 `security_events` 테이블이 없으면 500으로 이어질 수 있음. |

**한 줄 요약:** “저장소의 소스는 맞는데, **브라우저·엣지가 과거 앱을 실행**하고 있거나, **서버가 구 경로·스키마를 받아들이지 못하는** 상태.”

---

## 3. 해결 방안 — 프론트·운영

1. **Service Worker 해제**
   - HTML `<head>` 초반에 등록된 SW를 **`getRegistrations()` 후 `unregister()`** 하는 스크립트 주입(또는 수동으로 DevTools → Application → Service Workers에서 제거).
   - 필요 시 `chrome://serviceworker-internals`에서 해당 origin **Unregister**.

2. **브라우저 사이트 데이터**
   - `chrome://settings/siteData` 등에서 **해당 도메인(예: mindstory.kr) 데이터 삭제**.

3. **Cloudflare 캐시**
   - Dashboard → **Caching → Purge Everything** (또는 정책에 맞는 퍼지).
   - 정적 자산은 **`public/_headers`** 등으로 `/static/*` 등 **캐시 억제**를 두어 재발 완화.

4. **JS 캐시 버스트**
   - `content-protection.js`, `security.js` 등에 **`?v=날짜-빌드`** 쿼리를 붙여 URL이 배포마다 바뀌게 함 (`STATIC_JS_CACHE_QUERY` 등).

5. **중복 스크립트 제거**
   - 동일 페이지에서 같은 보안 스크립트를 **두 번** 로드하면 로그가 “쌍둥이”처럼 두 줄 찍힐 수 있음 → 한 번만 로드하도록 HTML 점검.

---

## 4. 해결 방안 — 백엔드 / DB

1. **`security.ts` 라우트**
   - **`POST /api/security/record`** (권장)와 동일 핸들러로 **`POST /api/security/log` 별칭**을 둬서 구 클라이언트도 동일 처리.

2. **페이로드 유연성**
   - 이벤트명: **`event_type`**, 없으면 **`type`**, **`action`** 순으로 인정.
   - **`details`**: `JSON.stringify` 실패 시 **null**로 저장, 500 유발하지 않음.
   - **Content-Type**이 `application/json`이 아니어도 본문을 텍스트로 읽어 JSON 파싱 시도.

3. **D1 마이그레이션**
   - `security_events` 테이블 생성 마이그레이션 적용.
   - 원격 DB:  
     `npx wrangler d1 migrations apply mindstory-production --remote`  
     로컬 테스트 DB: `--local` 사용.

4. **방어형 응답**
   - DB 바인딩 없음·테이블 없음·INSERT 실패 등 **저장 실패 시에도** 운영 UX 보호를 위해 **로그만 남기고 `200 OK` + success 본문**으로 응답(비콘성 호출).
   - **이벤트명이 전혀 없을 때만** `400` 등으로 클라이언트 오류 표시.

---

## 5. 사후 점검 체크리스트 (Chrome DevTools)

1. **Application → Service Workers** — 비어 있음이 이상적.
2. **Network** — 보안 JS에 **`?v=...`** 붙음, **`(from ServiceWorker)`** 아님.
3. **Fetch/XHR** — **`/api/security/record`** (또는 구버전 대응으로 `/log`도 200) — **`/log`만 500**이면 아직 캐시·배포 불일치 의심.
4. **`/api/auth/me`** — 로그인 후 세션 정상 여부는 쿠키·호스트(www/apex) 정책과 별도로 확인.

---

## 6. 참고: 로컬 vs 리모트 D1

| 플래그 | 의미 |
|--------|------|
| `--local` | 개발 PC의 **로컬 D1**(테스트용, 운영 데이터와 분리). |
| `--remote` | Cloudflare에 연결된 **실제 D1**(운영·스테이징 등에 바인딩된 DB). |

---

*이 문서는 해당 이슈 대응 과정을 팀 내 공유용으로 남긴 것이며, 정책·인프라 변경 시 내용을 갱신할 것.*
