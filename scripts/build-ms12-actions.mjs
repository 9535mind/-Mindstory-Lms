/**
 * action 모듈 → 단일 IIFE (globalThis.Ms12Actions) — ms12-app.js 보다 먼저 로드
 */
import { buildSync } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const entry = join(root, 'src', 'browser', 'ms12-actions.entry.ts')
const out = join(root, 'public', 'static', 'js', 'ms12-actions.js')
const outDir = dirname(out)
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
}

const r = buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020'],
  outfile: out,
  legalComments: 'none',
  logLevel: 'warning',
})
if (r.errors && r.errors.length) {
  console.error(r.errors)
  process.exit(1)
}
const code = readFileSync(out, 'utf8')
writeFileSync(
  out,
  '/* auto-generated: scripts/build-ms12-actions.mjs — do not edit by hand */\n' + code,
  'utf8',
)
console.log('✅ ' + out)
