/**
 * MS12 공개 모드 — 계정·OAuth 비활성화.
 * GET /api/auth/me 만 고정 JSON(+ 방문자 쿠키 발급); 나머지 계정 관련 경로는 410.
 */
import { Hono } from 'hono'
import type { Bindings } from '../types/database'
import { ensureActorForMeEndpoint } from '../utils/actor'

const ME_NO_STORE = { 'Cache-Control': 'private, no-store, must-revalidate' as const }

const PUBLIC_ME = {
  success: true,
  data: {
    type: 'public',
    id: 'public-user',
    name: '방문 사용자',
  },
  actor: {
    type: 'public',
    id: 'public-user',
  },
  authMode: 'public',
} as const

const auth = new Hono<{ Bindings: Bindings }>()

auth.get('/me', async (c) => {
  await ensureActorForMeEndpoint(c)
  return c.json(PUBLIC_ME, 200, ME_NO_STORE)
})

function gone(c: { json: (body: unknown, status?: number) => Response }) {
  return c.json({ success: false, message: '이 기능은 제공하지 않습니다.' }, 410)
}

auth.post('/register', gone)
auth.post('/login', gone)
auth.post('/logout', gone)
auth.put('/profile', gone)
auth.get('/check-withdrawal', gone)
auth.post('/change-password', gone)
auth.post('/withdrawal', gone)
auth.post('/verify-phone', gone)
auth.post('/phone/request', gone)
auth.post('/phone/confirm', gone)
auth.get('/debug-session-db', () => new Response('Not Found', { status: 404 }))

export default auth
