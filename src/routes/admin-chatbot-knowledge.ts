/**
 * 관리자 — 챗봇 지식 베이스 · 대화 로그 API
 * GET/POST/PUT/DELETE /api/admin/chatbot-knowledge*
 */

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { Bindings } from '../types/database'
import { requireAdmin } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/helpers'

const app = new Hono<{ Bindings: Bindings }>()

async function readJsonBody(c: Context): Promise<Record<string, unknown>> {
  try {
    const raw = await c.req.text()
    if (!raw || !raw.trim()) return {}
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

const MAX_KEYWORD = 500
const MAX_ANSWER = 16000

app.get('/chatbot-knowledge', requireAdmin, async (c) => {
  const { DB } = c.env
  try {
    const r = await DB.prepare(
      `SELECT id, question_keyword, answer_text, is_active, updated_at, created_at
       FROM chatbot_knowledge
       ORDER BY datetime(updated_at) DESC, id DESC`,
    ).all<{
      id: number
      question_keyword: string
      answer_text: string
      is_active: number
      updated_at: string
      created_at: string
    }>()
    return c.json(successResponse({ items: r.results || [] }))
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (/no such table/i.test(m)) {
      return c.json(successResponse({ items: [] }))
    }
    console.error('[admin/chatbot-knowledge] list', e)
    return c.json(errorResponse('목록을 불러오지 못했습니다.'), 500)
  }
})

app.post('/chatbot-knowledge', requireAdmin, async (c) => {
  const { DB } = c.env
  const body = await readJsonBody(c)
  const kw = String(body.question_keyword ?? '').trim().slice(0, MAX_KEYWORD)
  const ans = String(body.answer_text ?? '').trim().slice(0, MAX_ANSWER)
  const active = body.is_active === false || body.is_active === 0 ? 0 : 1
  if (!kw) return c.json(errorResponse('질문 키워드를 입력해 주세요.'), 400)
  if (!ans) return c.json(errorResponse('표준 답변을 입력해 주세요.'), 400)
  try {
    await DB.prepare(
      `INSERT INTO chatbot_knowledge (question_keyword, answer_text, is_active, updated_at)
       VALUES (?, ?, ?, datetime('now'))`,
    )
      .bind(kw, ans, active)
      .run()
    const row = await DB.prepare(`SELECT last_insert_rowid() AS id`).first<{ id: number }>()
    const id = row?.id
    return c.json(successResponse({ id }))
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (/no such table/i.test(m)) {
      return c.json(errorResponse('DB에 chatbot_knowledge 테이블이 없습니다. 마이그레이션을 적용해 주세요.'), 503)
    }
    console.error('[admin/chatbot-knowledge] create', e)
    return c.json(errorResponse('저장에 실패했습니다.'), 500)
  }
})

app.put('/chatbot-knowledge/:id', requireAdmin, async (c) => {
  const { DB } = c.env
  const id = parseInt(c.req.param('id') || '0', 10)
  if (!Number.isFinite(id) || id <= 0) return c.json(errorResponse('유효한 ID가 필요합니다.'), 400)
  const body = await readJsonBody(c)
  const kw = String(body.question_keyword ?? '').trim().slice(0, MAX_KEYWORD)
  const ans = String(body.answer_text ?? '').trim().slice(0, MAX_ANSWER)
  const active = body.is_active === false || body.is_active === 0 ? 0 : 1
  if (!kw) return c.json(errorResponse('질문 키워드를 입력해 주세요.'), 400)
  if (!ans) return c.json(errorResponse('표준 답변을 입력해 주세요.'), 400)
  try {
    const r = await DB.prepare(
      `UPDATE chatbot_knowledge
       SET question_keyword = ?, answer_text = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(kw, ans, active, id)
      .run()
    if (r.meta.changes === 0) return c.json(errorResponse('해당 항목을 찾을 수 없습니다.'), 404)
    return c.json(successResponse({ id }))
  } catch (e) {
    console.error('[admin/chatbot-knowledge] update', e)
    return c.json(errorResponse('수정에 실패했습니다.'), 500)
  }
})

app.delete('/chatbot-knowledge/:id', requireAdmin, async (c) => {
  const { DB } = c.env
  const id = parseInt(c.req.param('id') || '0', 10)
  if (!Number.isFinite(id) || id <= 0) return c.json(errorResponse('유효한 ID가 필요합니다.'), 400)
  try {
    const r = await DB.prepare(`DELETE FROM chatbot_knowledge WHERE id = ?`).bind(id).run()
    if (r.meta.changes === 0) return c.json(errorResponse('해당 항목을 찾을 수 없습니다.'), 404)
    return c.json(successResponse({ deleted: true }))
  } catch (e) {
    console.error('[admin/chatbot-knowledge] delete', e)
    return c.json(errorResponse('삭제에 실패했습니다.'), 500)
  }
})

app.get('/chatbot-conversations', requireAdmin, async (c) => {
  const { DB } = c.env
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '40', 10) || 40))
  try {
    const r = await DB.prepare(
      `SELECT id, user_id, user_message, assistant_reply, source, created_at
       FROM chatbot_conversation_logs
       ORDER BY datetime(created_at) DESC
       LIMIT ?`,
    )
      .bind(limit)
      .all<{
        id: number
        user_id: number | null
        user_message: string
        assistant_reply: string
        source: string | null
        created_at: string
      }>()
    return c.json(successResponse({ items: r.results || [] }))
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (/no such table/i.test(m)) {
      return c.json(successResponse({ items: [] }))
    }
    console.error('[admin/chatbot-conversations] list', e)
    return c.json(errorResponse('대화 목록을 불러오지 못했습니다.'), 500)
  }
})

export default app
