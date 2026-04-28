/**
 * 로컬 D1 + 카카오 OAuth 끝단 검증
 *
 * 1) wrangler D1 (local) 에서 sessions 메타 조회
 * 2) 떠 있는 Worker(기본 http://127.0.0.1:3000)에 /api/health, /api/auth/kakao/debug, /api/auth/kakao/login(302) 확인
 * 3) 선택: KAKAO_CALLBACK_E2E_CODE (또는 .dev.vars) 에 브라우저에서 복사한 1회용 code 를 넣으면
 *    /auth/kakao/callback(구버전 /api/.../callback 호환)을 호출한 뒤 D1 sessions 의 MAX(id)가 증가하는지 확인
 *
 * 사전: npm run build && npm run dev:d1 (또는 동일 바인딩의 wrangler pages dev, 포트 3000)
 * 환경: AUTH_TEST_BASE_URL (기본 127.0.0.1:3000)
 */
import { execSync } from 'node:child_process'

const BASE = (process.env.AUTH_TEST_BASE_URL || 'http://127.0.0.1:3000').replace(
  /\/$/,
  '',
)
const E2E_CODE = (process.env.KAKAO_CALLBACK_E2E_CODE || '').trim()

function d1Json(sql) {
  const cmd = `npx wrangler d1 execute ms12-production-v2 --local --json --command ${JSON.stringify(
    sql,
  )}`
  const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 2_000_000, shell: true })
  const parsed = JSON.parse(out)
  const first = Array.isArray(parsed) ? parsed[0] : parsed
  if (!first?.success) {
    throw new Error(`D1 error: ${out}`)
  }
  return first.results || []
}

function maxSessionId() {
  const rows = d1Json('SELECT IFNULL(MAX(id), 0) AS m FROM sessions')
  return Number(rows[0]?.m ?? 0)
}

async function getJson(path) {
  const r = await fetch(`${BASE}${path}`, {
    signal: AbortSignal.timeout(12_000),
  })
  const text = await r.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { r, body }
}

function fail(msg) {
  console.error(`[test:auth:kakao] FAIL: ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`[test:auth:kakao] OK: ${msg}`)
}

async function main() {
  console.log(`[test:auth:kakao] BASE=${BASE}`)

  let count
  let maxId
  try {
    const cr = d1Json('SELECT COUNT(*) AS c FROM sessions')
    count = Number(cr[0]?.c ?? 0)
    maxId = maxSessionId()
  } catch (e) {
    fail(
      `D1(sessions) 조회 실패. 로컬 DB/migrations: npm run db:migrate:local\n${e?.message || e}`,
    )
  }
  ok(`D1 local: sessions count=${count}, max_id=${maxId}`)

  try {
    const h = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(8_000) })
    if (!h.ok) fail(`/api/health -> ${h.status} (dev:d1 를 켰는지 확인)`)
  } catch (e) {
    fail(
      `Worker에 연결할 수 없습니다 (${BASE}). 먼저: npm run build && npm run dev:d1\n${e?.message || e}`,
    )
  }
  ok('GET /api/health')

  const dbg = await getJson('/api/auth/kakao/debug')
  if (!dbg.r.ok) fail(`/api/auth/kakao/debug -> ${dbg.r.status}`)
  const d = dbg.body?.data
  if (d == null) fail('debug response missing data')
  const ruri = String(d.redirectUri || '')
  let pathname = ''
  try {
    pathname = ruri ? new URL(ruri).pathname : ''
  } catch {
    /* ignore */
  }
  // ms12 기본: /auth/kakao/callback (서버는 /api/auth/... 콜백도 수용)
  const pathOk =
    pathname === '/auth/kakao/callback' || pathname === '/api/auth/kakao/callback'
  if (!pathOk) {
    fail(`unexpected redirectUri: ${d.redirectUri}`)
  }
  const hasKakaoId = !!(d.clientIdLength && d.clientIdLength > 0)
  ok(
    `GET /api/auth/kakao/debug (redirectUri=${d.redirectUri}, clientIdLength=${d.clientIdLength || 0})`,
  )

  const login = await fetch(`${BASE}/api/auth/kakao/login`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(8_000),
  })
  if (hasKakaoId) {
    if (login.status !== 302 && login.status !== 301) {
      const t = await login.text().catch(() => '')
      fail(
        `GET /api/auth/kakao/login -> ${login.status} (기대 302). body: ${t.slice(0, 400)}`,
      )
    }
    const loc = login.headers.get('location') || ''
    if (!loc.includes('kauth.kakao.com')) {
      fail(`Kakao authorize URL expected, got: ${loc.slice(0, 200)}`)
    }
    ok('GET /api/auth/kakao/login -> 302 kauth.kakao.com')
  } else {
    if (login.status === 503) {
      console.log(
        '[test:auth:kakao] SKIP /login 302: .dev.vars 에 KAKAO_CLIENT_ID(REST) 를 넣고 다시 실행하세요.',
      )
    } else {
      const t = await login.text().catch(() => '')
      fail(
        `KAKAO_CLIENT_ID 없이 /login -> ${login.status} (기대 503). body: ${t.slice(0, 300)}`,
      )
    }
  }

  if (!E2E_CODE) {
    console.log(
      '\nE2E(실제 콜백+세션 INSERT) 는 스킵했습니다. 브라우저로 로그인 한 뒤 `code` 쿼리를 복사해:\n' +
        '  set KAKAO_CALLBACK_E2E_CODE=...  (Windows: setx 또는 PowerShell $env:...=)\n' +
        '  npm run test:auth:kakao\n',
    )
    return
  }
  if (!hasKakaoId) {
    fail(
      'E2E 를 쓰려면 .dev.vars 의 KAKAO_CLIENT_ID(및 콘솔에 등록한 Redirect URI)가 필요합니다.',
    )
  }

  const before = maxSessionId()
  const cb = await fetch(
    `${BASE}/auth/kakao/callback?code=${encodeURIComponent(E2E_CODE)}`,
    { redirect: 'manual', signal: AbortSignal.timeout(30_000) },
  )
  const after = maxSessionId()
  const setCookie = cb.headers.get('set-cookie') || ''
  if (cb.status !== 302 && cb.status !== 301) {
    const body = await cb.text()
    fail(
      `callback -> ${cb.status} (기대 302). session max id: ${before} -> ${after}. body: ${body.slice(0, 500)}`,
    )
  }
  if (after <= before) {
    fail(
      `sessions MAX(id) 가 증가하지 않음 (${before} -> ${after}). 쿠키/리다이렉트: status=${cb.status} location=${(cb.headers.get('location') || '').slice(0, 80)} set-cookie=${!!setCookie}`,
    )
  }
  if (!/session/i.test(setCookie) && !setCookie) {
    console.warn(
      '[test:auth:kakao] WARN: Set-Cookie 가 비어 있을 수 있으나(프록시) D1 행은 생성됨',
    )
  }
  ok(`E2E: callback 302, sessions max_id ${before} -> ${after} (D1 INSERT 확인)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
