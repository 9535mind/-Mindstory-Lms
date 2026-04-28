import type { Context } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import type { Bindings } from '../types/database'
import { isSecureCookieRequest } from './session-cookie'

/** 방문자(익명) — DB·participant_key 호환을 위해 UUID 를 id 로 쓰고, API `/me` 만 표시용 public-user 로 내려줄 수 있음 */
export type AppActor = { type: 'public'; id: string }

const VISITOR_COOKIE = 'ms12_visitor'
const LEGACY_GUEST_COOKIE = 'ms12_guest'
const VISITOR_MAX_AGE = 60 * 60 * 24 * 30

function isUuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s.trim(),
  )
}

function pickVisitorId(c: Context<{ Bindings: Bindings }>): string {
  const v = (getCookie(c, VISITOR_COOKIE) || '').trim()
  if (v && isUuidLike(v)) return v
  const legacy = (getCookie(c, LEGACY_GUEST_COOKIE) || '').trim()
  if (legacy && isUuidLike(legacy)) return legacy
  return crypto.randomUUID()
}

/**
 * 로그인 없음 — 브라우저별 익명 UUID (`ms12_visitor`).
 */
export async function getOrCreateActor(
  c: Context<{ Bindings: Bindings }>,
): Promise<AppActor> {
  const id = pickVisitorId(c)
  if ((getCookie(c, VISITOR_COOKIE) || '').trim() !== id) {
    setCookie(c, VISITOR_COOKIE, id, {
      path: '/',
      httpOnly: true,
      secure: isSecureCookieRequest(c),
      sameSite: 'Lax',
      maxAge: VISITOR_MAX_AGE,
    })
  }
  return { type: 'public', id }
}

/** GET /api/auth/me — 쿠키 보장 후 응답은 auth 라우트에서 고정 JSON */
export async function ensureActorForMeEndpoint(
  c: Context<{ Bindings: Bindings }>,
): Promise<AppActor> {
  return getOrCreateActor(c)
}

/** DB `ms12_room_participants.participant_key` — 기존 `g:` 접두사 유지 */
export function participantKey(actor: AppActor): string {
  if (!actor.id) return 'g:invalid'
  return `g:${actor.id}`
}

export function isActorPublic(actor: AppActor): boolean {
  return actor.type === 'public' && !!actor.id
}
