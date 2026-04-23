/**
 * 로컬 개발: 루트(이 스크립트의 부모)의 .env / .env.local / .dev.vars / process.env
 * 에서 KAKAO_CLIENT_ID(REST)를 읽어 .dev.vars에 병합합니다. (값은 콘솔에 출력하지 않습니다.)
 * .dev.vars가 없으면 루트에 생성합니다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const devVarsPath = path.join(root, '.dev.vars')
const envFiles = [path.join(root, '.env'), path.join(root, '.env.local')]

function parseDotEnv(text) {
  const out = {}
  if (!text) return out
  let s0 = String(text)
  if (s0.charCodeAt(0) === 0xfeff) s0 = s0.slice(1)
  for (const line of s0.split(/\r?\n/)) {
    let s = line.trim()
    if (!s || s.startsWith('#')) continue
    if (s.startsWith('export ')) s = s.slice(7).trim()
    const eq = s.indexOf('=')
    if (eq < 1) continue
    const k = s.slice(0, eq).trim()
    let v = s.slice(eq + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

function escapeDevVarValue(v) {
  if (/[\s#"']/.test(v)) {
    return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return String(v)
}

function isPlaceholderKakao(v) {
  const t = (v == null ? '' : String(v)).trim()
  if (!t) return true
  return t === 'your_kakao_rest_api_key'
}

/** 예: http://localhost:3000/api/auth/kakao/callback → .../auth/kakao/callback (KOE006 방지) */
function normalizeKakaoRedirectUriForMs12(v) {
  const s = (v == null ? '' : String(v)).trim()
  if (!s || !s.includes('/api/auth/kakao/callback')) return s
  try {
    const u = new URL(s)
    u.pathname = '/auth/kakao/callback'
    return u.toString()
  } catch {
    return 'http://localhost:3000/auth/kakao/callback'
  }
}

function readMergedKakaoId() {
  const merged = {}
  for (const p of envFiles) {
    if (!fs.existsSync(p)) continue
    try {
      Object.assign(merged, parseDotEnv(fs.readFileSync(p, 'utf8')))
    } catch (e) {
      console.warn('[ensure-kakao-dev-vars] read skip:', path.basename(p), e?.message || e)
    }
  }
  if (fs.existsSync(devVarsPath)) {
    try {
      Object.assign(merged, parseDotEnv(fs.readFileSync(devVarsPath, 'utf8')))
    } catch (e) {
      console.warn('[ensure-kakao-dev-vars] .dev.vars read:', e?.message || e)
    }
  }
  const fromShell = (process.env.KAKAO_CLIENT_ID || '').trim()
  if (fromShell) merged.KAKAO_CLIENT_ID = fromShell
  const raw = (merged.KAKAO_CLIENT_ID || '').trim()
  if (isPlaceholderKakao(raw)) return ''
  return raw
}

function writeDevVarsFromObject(obj) {
  const keys = Object.keys(obj).sort()
  const body =
    '# 로컬 전용 — git 커밋 금지. KAKAO_CLIENT_ID 는 scripts/ensure-kakao-dev-vars.mjs 가 .env·환경에서 병합.\n' +
    keys.map((k) => `${k}=${escapeDevVarValue(obj[k] ?? '')}`).join('\n') +
    '\n'
  fs.writeFileSync(devVarsPath, body, 'utf8')
}

function main() {
  const kakao = readMergedKakaoId()
  const templateBody =
    '# 로컬 전용 — git 커밋 금지\n' +
    '# KAKAO_CLIENT_ID: 카카오 개발자 콘솔 > 내 앱 > 앱 키 > REST API 키(서버)\n' +
    '# .env / 환경 변수 KAKAO_CLIENT_ID 로도 자동 병합됨(스크립트: ensure-kakao-dev-vars.mjs)\n'

  if (!fs.existsSync(devVarsPath)) {
    if (kakao) {
      writeDevVarsFromObject({ KAKAO_CLIENT_ID: kakao })
      console.log(
        '[ensure-kakao-dev-vars] .dev.vars 생성 및 KAKAO_CLIENT_ID 반영(값 미출력).',
        '경로:',
        devVarsPath,
      )
    } else {
      fs.writeFileSync(devVarsPath, templateBody, 'utf8')
      console.log(
        '[ensure-kakao-dev-vars] REST API 키 입력 필요: 루트 .env(또는 .dev.vars)에 KAKAO_CLIENT_ID=... 또는 터미널에서 KAKAO_CLIENT_ID 설정 후 dev 재실행.',
      )
    }
    return
  }

  const existing = parseDotEnv(fs.readFileSync(devVarsPath, 'utf8'))
  const redir = existing.KAKAO_REDIRECT_URI
  const redirNorm = redir != null ? normalizeKakaoRedirectUriForMs12(redir) : redir
  if (redir != null && redirNorm && redirNorm !== String(redir).trim()) {
    writeDevVarsFromObject({ ...existing, KAKAO_REDIRECT_URI: redirNorm })
    console.log(
      '[ensure-kakao-dev-vars] KAKAO_REDIRECT_URI 를 /api/... → /auth/kakao/callback 으로 정리했습니다. (카카오 콘솔에도 동일 URI 등록)',
    )
  }
  const existing2 = parseDotEnv(fs.readFileSync(devVarsPath, 'utf8'))
  const cur = (existing2.KAKAO_CLIENT_ID || '').trim()
  if (kakao && (isPlaceholderKakao(cur) || cur !== kakao)) {
    writeDevVarsFromObject({ ...existing2, KAKAO_CLIENT_ID: kakao })
    console.log('[ensure-kakao-dev-vars] .dev.vars에 KAKAO_CLIENT_ID 갱신(출력 생략).')
  } else if (!kakao) {
    console.log(
      '[ensure-kakao-dev-vars] REST API 키 입력 필요: .env / .dev.vars / 환경 변수 KAKAO_CLIENT_ID (카카오 REST API 키).',
    )
  }
}

main()
