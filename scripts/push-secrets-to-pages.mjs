/**
 * .env + .dev.vars 에 있는 값(비어 있지 않은 키만)을 Cloudflare Pages(ms12) Secret 으로 동기화합니다.
 * 값은 콘솔에 출력하지 않습니다. 사용: node scripts/push-secrets-to-pages.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const PROJECT = 'ms12'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Worker Bindings / 자주 쓰는 시크릿 (wrangler [vars] 와 겹치지 않게)
const KEYS = [
  'OPENAI_API_KEY',
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

function parse(text) {
  const out = {}
  for (const line of text.split(/\r?\n/)) {
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

function loadMerge() {
  const a = join(root, '.env')
  const b = join(root, '.dev.vars')
  let merged = {}
  if (existsSync(a)) {
    try {
      merged = { ...merged, ...parse(readFileSync(a, 'utf8')) }
    } catch {
      /* empty */
    }
  }
  if (existsSync(b)) {
    try {
      merged = { ...merged, ...parse(readFileSync(b, 'utf8')) }
    } catch {
      /* empty */
    }
  }
  return merged
}

function main() {
  const merged = loadMerge()
  if (Object.keys(merged).length === 0) {
    console.error('[push-secrets] .env / .dev.vars 가 없거나 비어 있습니다. 건너뜀.')
    process.exit(1)
  }

  let n = 0
  for (const key of KEYS) {
    const v = merged[key]
    if (v == null || String(v).trim() === '') continue
    n++
    const r = spawnSync(
      'npx',
      ['wrangler', 'pages', 'secret', 'put', key, '--project-name', PROJECT],
      {
        input: String(v).trimEnd() + (String(v).endsWith('\n') ? '' : '\n'),
        encoding: 'utf8',
        shell: true,
        cwd: root,
        maxBuffer: 2_000_000,
      },
    )
    if (r.status !== 0) {
      console.error(
        `[push-secrets] 실패: ${key} (exit ${r.status})`,
        r.stderr || r.stdout || '',
      )
      process.exit(1)
    }
    console.log(`[push-secrets] OK: ${key}`)
  }
  if (n === 0) {
    console.error(
      '[push-secrets] 푸시할 키가 없습니다. ' +
        KEYS.join(', ') +
        ' 중 .env / .dev.vars 에 비어 있지 않은 항목을 넣으세요.',
    )
    process.exit(1)
  }
  console.log(`[push-secrets] 완료: ${n} 개 Secret 반영 (프로젝트 ${PROJECT})`)
}

main()
