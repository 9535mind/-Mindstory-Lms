/**
 * /api/auth/me — 세션·게스트 reason 진단(임시 디버그 필드용)
 */
import type { Context } from 'hono'
import type { Bindings } from '../types/database'
import {
  getSessionTokenFromRequest,
  normalizeSessionTokenString,
  SQL_SESSION_S_VALID,
} from './helpers'

export type MeGuestReason =
  | 'ok'
  | 'no_cookie'
  | 'no_db'
  | 'session_not_found'
  | 'session_expired'
  | 'user_not_found'
  | 'unknown'

export type MeAuthDebug = {
  hasCookie: boolean
  sessionPrefix: string | null
  sessionFound: boolean
  sessionExpired: boolean
  userFound: boolean
  guestReason: MeGuestReason
}

/**
 * getCurrentUser 결과와 동일 토큰으로 sessions 조회·reason 결정(게스트 reason 표시)
 */
export async function buildMeAuthDebug(
  c: Context<{ Bindings: Bindings }>,
  user: Record<string, unknown> | null,
  resolvedTokenHint?: string | null,
): Promise<MeAuthDebug> {
  let token: string | null = null
  if (resolvedTokenHint != null && String(resolvedTokenHint).trim() !== '') {
    token = normalizeSessionTokenString(resolvedTokenHint)
  }
  if (!token) {
    token = getSessionTokenFromRequest(c)
  }

  if (user) {
    return {
      hasCookie: !!token,
      sessionPrefix: token ? token.slice(0, 8) : null,
      sessionFound: true,
      sessionExpired: false,
      userFound: true,
      guestReason: 'ok',
    }
  }

  if (!token) {
    return {
      hasCookie: false,
      sessionPrefix: null,
      sessionFound: false,
      sessionExpired: false,
      userFound: false,
      guestReason: 'no_cookie',
    }
  }

  const sessionPrefix = token.slice(0, 8)
  const { DB } = c.env
  if (!DB) {
    return {
      hasCookie: true,
      sessionPrefix,
      sessionFound: false,
      sessionExpired: false,
      userFound: false,
      guestReason: 'no_db',
    }
  }

  const row = await DB.prepare('SELECT 1 as x FROM sessions WHERE session_token = ?')
    .bind(token)
    .first<{ x: number }>()

  if (!row) {
    return {
      hasCookie: true,
      sessionPrefix,
      sessionFound: false,
      sessionExpired: false,
      userFound: false,
      guestReason: 'session_not_found',
    }
  }

  const stillValid = await DB.prepare(
    `SELECT 1 as ok FROM sessions s WHERE s.session_token = ? AND ${SQL_SESSION_S_VALID}`,
  )
    .bind(token)
    .first<{ ok: number }>()

  if (!stillValid) {
    return {
      hasCookie: true,
      sessionPrefix,
      sessionFound: true,
      sessionExpired: true,
      userFound: false,
      guestReason: 'session_expired',
    }
  }

  return {
    hasCookie: true,
    sessionPrefix,
    sessionFound: true,
    sessionExpired: false,
    userFound: false,
    guestReason: 'user_not_found',
  }
}
