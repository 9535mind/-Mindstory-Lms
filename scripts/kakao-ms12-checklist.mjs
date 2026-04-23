/**
 * MS12 카카오 로그인 — 로컬 키 여부 점검 + 콘솔·배포에 넣을 URI/명령 안내(비밀 출력 없음)
 * 사용: node scripts/kakao-ms12-checklist.mjs
 *       npm run kakao:ms12
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPlatformProxy } from 'wrangler'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const wranglerConfigPath = path.join(root, 'wrangler.toml')
const examplePath = path.join(root, '.dev.vars.example')
const devVarsPath = path.join(root, '.dev.vars')

const candidates = ['.env', '.env.local', '.dev.vars']
const envFileAbs = candidates
  .map((name) => path.resolve(root, name))
  .filter((abs) => fs.existsSync(abs))

const proxy = await getPlatformProxy({
  configPath: wranglerConfigPath,
  ...(envFileAbs.length > 0 ? { envFiles: envFileAbs } : {}),
})

let ok = false
try {
  const id = proxy.env?.KAKAO_CLIENT_ID
  ok = typeof id === 'string' && id.trim().length > 0 && id !== 'your_kakao_rest_api_key'
} finally {
  await proxy.dispose?.()
}

const line = (s) => console.log(s)

line('')
line('======== MS12 카카오 로그인 — 조치 점검 ========')
line('')
line('[1] 로컬 KAKAO_CLIENT_ID (REST API 키)')
if (ok) {
  line('    상태: OK (wrangler가 ' + (envFileAbs.length ? envFileAbs.map((p) => path.basename(p)).join(', ') : '기본') + ' 에서 읽음)')
} else {
  line('    상태: 아직 없음 또는 플레이스홀더')
  line('    → 루트에 ' + path.basename(devVarsPath) + ' 를 만들고 아래를 채우세요(예시: ' + path.basename(examplePath) + ' 복사):')
  line('         KAKAO_CLIENT_ID=카카오콘솔의_REST_API_키')
  if (!fs.existsSync(devVarsPath) && fs.existsSync(examplePath)) {
    line('    → 힌트: copy .dev.vars.example .dev.vars  (또는 수동 복사 후 키만 입력)')
  }
}
line('    → 저장 후: npm run verify:kakao-env  (또는 npm run kakao:ms12)')
line('')

line('[2] 카카오 개발자 콘솔 (https://developers.kakao.com)')
line('    앱 → 제품 설정 → 카카오 로그인 ON')
line('    Redirect URI에 아래를 “그대로” 등록 (끝에 / 없음):')
line('      · 운(ms12.org)     https://ms12.org/auth/kakao/callback')
line('      · www             https://ms12.org/auth/kakao/callback  (또는 www 전용 콘솔 룰에 맞게)')
line('      · 로컬(예: 3000)  http://localhost:3000/auth/kakao/callback')
line('      · Pages 미리보기  https://<해시>.ms12.pages.dev/auth/kakao/callback  (실제 URL 기준으로 1줄)')
line('')

line('[3] Cloudflare Pages(프로젝트 ms12) — Production/Preview')
line('    키를 로컬 .dev.vars 에 넣었다면 한 번에:')
line('      npm run push-secrets:pages')
line('    또는 수동(값 입력 프롬프트):')
line('      npx wrangler pages secret put KAKAO_CLIENT_ID --project-name ms12')
line('    (Client Secret 쓰는 앱이면) KAKAO_CLIENT_SECRET 동일')
line('')

line('[4] 배포 후 확인')
line('    브라우저:  https://ms12.org/api/auth/kakao/ready  → kakaoConfigured: true')
line('    MS12:      /app/login → 「카카오」클릭 → 동의 후 /app?oauth_sync=1')
line('')

if (!ok) {
  process.exitCode = 1
  line('(로컬 키가 없으면 exit code 1 — 위 [1]을 먼저 완료하세요.)')
} else {
  line('[OK] 로컬에서 REST 키는 감지됩니다. [2]~[4]를 프로덕션에도 맞췄는지 확인하세요.')
}
