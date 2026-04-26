/**
 * Vite 빌드 후: dist 루트에 정적 복사(선택) + Cloudflare Pages `_routes.json`
 * `public/forest.html`·`/forest-question-banks.js` 는 Worker `/*` 보다 먼저 정적으로 서빙되도록 exclude.
 */
import { copyFileSync, cpSync, existsSync, writeFileSync, statSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const publicDir = join(root, 'public')

/**
 * Pages: include = Worker가 받는 경로, exclude = 정적만(Worker 우회).
 * /api/* 만 include 하면 /app 은 정적 → 404 가 나므로 금지.
 * Wrangler 는 include 안에서 `/*` 와 `/app` 등이 겹치면 "Overlapping rules" 오류로 배포 실패하므로,
 * 전역은 `/*` 한 줄만 쓴다(이것이 /app·/api 를 모두 Worker로 보냄).
 */
const ROUTES = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/uploads/*',
    '/static/*',
    '/assets/*',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest',
    '/build.txt',
    /** 루트 폴백 HTML(→/app 안내). Worker보다 정적 우선으로 두는 편이 안정적 */
    '/index.html',
    /** JTT-Kinder 유아숲 — `public/` 가 Vite dist 루트로 복사됨. exclude 없으면 Worker가 먼저 404 */
    '/forest.html',
    '/forest-question-banks.js',
  ],
}

if (!existsSync(dist)) {
  console.error('dist/ 가 없습니다. 먼저 vite build 를 실행하세요.')
  process.exit(1)
}

const workerJs = join(dist, '_worker.js')
if (!existsSync(workerJs)) {
  console.error(
    '❌ dist/_worker.js 가 없습니다. @hono/vite-build/cloudflare-pages 가 필요합니다.',
  )
  process.exit(1)
}
try {
  const st = statSync(workerJs)
  console.log(`✅ dist/_worker.js (${(st.size / 1024).toFixed(1)} KiB)`)
} catch (e) {
  console.error('❌ dist/_worker.js 검증 실패:', e)
  process.exit(1)
}

const redirectsPublic = join(publicDir, '_redirects')
const redirectsDist = join(dist, '_redirects')
if (existsSync(redirectsPublic)) {
  copyFileSync(redirectsPublic, redirectsDist)
  console.log('✅ public/_redirects → dist/_redirects')
} else if (existsSync(redirectsDist)) {
  rmSync(redirectsDist, { force: true })
  console.log('✅ dist/_redirects 제거 (소스 없음)')
}

const uploadsSrc = join(publicDir, 'uploads')
if (existsSync(uploadsSrc)) {
  cpSync(uploadsSrc, join(dist, 'uploads'), { recursive: true })
  console.log('✅ uploads → dist 복사')
}

const assetsDir = join(publicDir, 'assets')
if (existsSync(assetsDir)) {
  cpSync(assetsDir, join(dist, 'assets'), { recursive: true })
  console.log('✅ public/assets → dist/assets')
}

writeFileSync(join(dist, '_routes.json'), JSON.stringify(ROUTES, null, 2) + '\n', 'utf8')
console.log('✅ dist/_routes.json (MS12)')

const now = new Date()
writeFileSync(
  join(dist, 'build.txt'),
  `# builtAt: ${now.toISOString()}\n${JSON.stringify({ note: 'ms12 postbuild' }, null, 2)}\n`,
  'utf8'
)
console.log('✅ dist/build.txt', now.toISOString())
