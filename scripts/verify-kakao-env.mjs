/**
 * npm run dev 와 동일한 getPlatformProxy 옵션으로 KAKAO_CLIENT_ID 주입 여부만 확인(값 미출력).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPlatformProxy } from 'wrangler'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const wranglerConfigPath = path.join(root, 'wrangler.toml')

const candidates = ['.env', '.env.local', '.dev.vars']
const envFiles = candidates
  .map((name) => path.resolve(root, name))
  .filter((abs) => fs.existsSync(abs))

const proxy = await getPlatformProxy({
  configPath: wranglerConfigPath,
  ...(envFiles.length > 0 ? { envFiles } : {}),
})
try {
  const id = proxy.env?.KAKAO_CLIENT_ID
  const ok = typeof id === 'string' && id.trim().length > 0 && id !== 'your_kakao_rest_api_key'
  console.log(ok ? '[OK] KAKAO_CLIENT_ID is set (length ' + id.trim().length + ')' : '[NG] KAKAO_CLIENT_ID missing or placeholder')
  console.log('      wrangler.toml:', wranglerConfigPath)
  console.log('      envFiles used:', envFiles.length ? envFiles.join(' | ') : '(default — .env 계열만; .dev.vars 없으면 카카오 시크릿 없음)')
  if (!ok) {
    console.log('      → 루트에 .dev.vars 를 두고 KAKAO_CLIENT_ID=... 를 넣은 뒤, npm run dev 를 다시 실행하세요.')
    process.exitCode = 1
  }
} finally {
  await proxy.dispose?.()
}
