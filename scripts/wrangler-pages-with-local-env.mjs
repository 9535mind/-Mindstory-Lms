/**
 * `wrangler pages dev` 전용: --env-file + (필요 시) --binding 으로 KAKAO_* 를 Worker env 에 넣는다.
 * 다른 wrangler 서브커맨드(`-v` 등)에는 추가 인자를 붙이지 않는다.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const wranglerBin = path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
if (!fs.existsSync(wranglerBin)) {
  console.error('[wrangler-pages-with-local-env] wrangler not found. Run: npm i')
  process.exit(1)
}

function parseDotEnv(text) {
  const out = {}
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

const passthrough = process.argv.slice(2)
if (passthrough.length === 0) {
  console.error('Usage: node scripts/wrangler-pages-with-local-env.mjs <wrangler subcommand> ...')
  process.exit(1)
}

const isPagesDev = passthrough[0] === 'pages' && passthrough[1] === 'dev'
const args = [wranglerBin, ...passthrough]

if (isPagesDev) {
  const toAbs = (name) => path.resolve(root, name)
  const envChain = [toAbs('.env'), toAbs('.env.local'), toAbs('.dev.vars')].filter((p) => fs.existsSync(p))

  const merged = {}
  for (const p of envChain) {
    try {
      Object.assign(merged, parseDotEnv(fs.readFileSync(p, 'utf8')))
    } catch (e) {
      console.warn('[wrangler-pages-with-local-env] read failed:', p, e?.message || e)
    }
  }

  if (envChain.length === 0) {
    console.warn(
      '[wrangler-pages-with-local-env] No .env / .env.local / .dev.vars found — KAKAO_CLIENT_ID may be missing.',
    )
  } else {
    console.log(
      '[wrangler-pages-with-local-env] --env-file (abs paths, later overrides):',
      envChain.map((p) => path.basename(p)).join(' -> '),
    )
  }

  const bindingKeys = [
    'KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET',
    'KAKAO_REDIRECT_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
  ]
  const bindings = []
  for (const key of bindingKeys) {
    const v = merged[key]
    if (v != null && String(v).trim() !== '' && v !== 'your_kakao_rest_api_key') {
      bindings.push(`${key}=${v}`)
    }
  }
  if (bindings.length > 0) {
    const idLen =
      merged.KAKAO_CLIENT_ID != null && String(merged.KAKAO_CLIENT_ID).trim() !== ''
        ? String(merged.KAKAO_CLIENT_ID).trim().length
        : 0
    console.log(
      '[wrangler-pages-with-local-env] --binding (local pages dev) KAKAO_CLIENT_ID',
      idLen > 0 ? `len=${idLen}` : 'missing',
      merged.KAKAO_CLIENT_SECRET != null && String(merged.KAKAO_CLIENT_SECRET).trim() !== '' ? '+secret' : '',
    )
  } else {
    console.warn(
      '[wrangler-pages-with-local-env] No KAKAO_* in merged .env. Set KAKAO_CLIENT_ID (and optional GOOGLE_*) in project root .dev.vars and restart dev:d1.',
    )
  }

  for (const p of envChain) {
    args.push('--env-file', p)
  }
  for (const b of bindings) {
    args.push('--binding', b)
  }
}

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  cwd: root,
  env: { ...process.env, WRANGLER_LOG: process.env.WRANGLER_LOG || 'log' },
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
