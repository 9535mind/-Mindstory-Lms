/**
 * 인증 미들웨어
 * 로그인한 사용자만 접근할 수 있도록 제한
 */

import { Context, Next } from 'hono'
import { Bindings, User } from '../types/database'

/**
 * 세션 쿠키에서 사용자 정보 가져오기
 */
export async function requireAuth(c: Context<{ Bindings: Bindings }>, next: Next) {
  const sessionToken = c.req.cookie('session_token')
  
  if (!sessionToken) {
    console.log('[AUTH] No session token found, redirecting to login')
    return c.redirect('/login')
  }
  
  const { DB } = c.env
  
  // 세션 확인
  const session = await DB.prepare(`
    SELECT s.*, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? 
    AND s.expires_at > datetime('now')
    AND u.deleted_at IS NULL
  `).bind(sessionToken).first<User & { session_token: string; expires_at: string }>()
  
  if (!session) {
    console.log('[AUTH] Invalid or expired session, redirecting to login')
    // 만료된 쿠키 삭제
    c.header('Set-Cookie', 'session_token=; Path=/; HttpOnly; Max-Age=0')
    return c.redirect('/login')
  }
  
  console.log('[AUTH] User authenticated:', session.name)
  
  // Context에 사용자 정보 저장
  c.set('user', session)
  
  await next()
}

/**
 * 옵션: 로그인한 사용자만 API 접근 가능
 */
export async function requireAuthAPI(c: Context<{ Bindings: Bindings }>, next: Next) {
  const sessionToken = c.req.cookie('session_token')
  
  if (!sessionToken) {
    return c.json({ success: false, error: '로그인이 필요합니다.' }, 401)
  }
  
  const { DB } = c.env
  
  const session = await DB.prepare(`
    SELECT s.*, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? 
    AND s.expires_at > datetime('now')
    AND u.deleted_at IS NULL
  `).bind(sessionToken).first<User & { session_token: string; expires_at: string }>()
  
  if (!session) {
    return c.json({ success: false, error: '세션이 만료되었습니다.' }, 401)
  }
  
  c.set('user', session)
  
  await next()
}

/**
 * 옵션: 로그인 정보가 있으면 사용자 정보 추가, 없으면 그냥 진행
 */
export async function optionalAuth(c: Context<{ Bindings: Bindings }>, next: Next) {
  const sessionToken = c.req.cookie('session_token')
  
  if (sessionToken) {
    const { DB } = c.env
    
    const session = await DB.prepare(`
      SELECT s.*, u.* 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? 
      AND s.expires_at > datetime('now')
      AND u.deleted_at IS NULL
    `).bind(sessionToken).first<User & { session_token: string; expires_at: string }>()
    
    if (session) {
      c.set('user', session)
    }
  }
  
  await next()
}

/**
 * 관리자만 접근 가능
 */
export async function requireAdmin(c: Context<{ Bindings: Bindings }>, next: Next) {
  const sessionToken = c.req.cookie('session_token')
  
  if (!sessionToken) {
    return c.json({ success: false, error: '로그인이 필요합니다.' }, 401)
  }
  
  const { DB } = c.env
  
  const session = await DB.prepare(`
    SELECT s.*, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? 
    AND s.expires_at > datetime('now')
    AND u.deleted_at IS NULL
  `).bind(sessionToken).first<User & { session_token: string; expires_at: string }>()
  
  if (!session) {
    return c.json({ success: false, error: '세션이 만료되었습니다.' }, 401)
  }
  
  if (session.role !== 'admin') {
    return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403)
  }
  
  c.set('user', session)
  
  await next()
}
