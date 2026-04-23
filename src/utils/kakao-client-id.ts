/**
 * Kakao **REST API 키** (서버 OAuth) — Worker 시크릿 `KAKAO_CLIENT_ID` 와 1:1.
 * - Worker: `KAKAO_CLIENT_ID` (Cloudflare / .dev.vars)
 * - 폴백: `import.meta.env.__KAKAO_CLIENT_ID_FROM_FILE` (Vite build 시 루트 .env/.dev.vars 스냅샷; 파일에는 반드시 `KAKAO_CLIENT_ID` 키만 사용)
 * JavaScript 키는 Vite `VITE_KAKAO_JS_KEY` — **이 모듈에서 읽지 않음** (브라우저 번들 전용).
 */
import type { Context } from 'hono'
import type { Bindings } from '../types/database'

const PLACEHOLDER = 'your_kakao_rest_api_key'

function trimId(v: unknown): string {
  if (v == null) return ''
  const s = String(v).trim()
  if (!s || s === PLACEHOLDER) return ''
  return s
}

function fromImportMetaFileSnapshot(): string {
  const env = import.meta.env as { __KAKAO_CLIENT_ID_FROM_FILE?: string }
  return trimId(env.__KAKAO_CLIENT_ID_FROM_FILE)
}

export function getKakaoClientId(c: Context<{ Bindings: Bindings }>): string {
  const fromBindings = trimId(c.env?.KAKAO_CLIENT_ID)
  if (fromBindings) return fromBindings
  if (typeof process !== 'undefined' && process.env?.KAKAO_CLIENT_ID) {
    const t = trimId(process.env.KAKAO_CLIENT_ID)
    if (t) return t
  }
  return fromImportMetaFileSnapshot()
}
