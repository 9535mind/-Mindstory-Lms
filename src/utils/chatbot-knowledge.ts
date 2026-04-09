/**
 * chatbot_knowledge 최우선 매칭 + 대화 로그 (관리자 학습용)
 */

import type { D1Database } from '@cloudflare/workers-types'

export type ChatbotKnowledgeRow = {
  id: number
  question_keyword: string
  answer_text: string
  is_active: number
  updated_at: string
  created_at: string
}

function normalizeForMatch(s: string): string {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/**
 * 사용자 메시지에 등록 키워드가 포함되면 해당 고정 답변 반환.
 * 긴 키워드 우선(더 구체적인 규칙이 먼저 적용).
 */
export async function matchChatbotKnowledge(
  db: D1Database,
  userMessage: string,
): Promise<{ id: number; answer_text: string; question_keyword: string } | null> {
  const msg = normalizeForMatch(userMessage)
  if (!msg) return null

  let rows: ChatbotKnowledgeRow[] = []
  try {
    const r = await db
      .prepare(
        `SELECT id, question_keyword, answer_text, is_active, updated_at, created_at
         FROM chatbot_knowledge
         WHERE is_active = 1
         ORDER BY length(question_keyword) DESC`,
      )
      .all<ChatbotKnowledgeRow>()
    rows = (r.results || []) as ChatbotKnowledgeRow[]
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (/no such table/i.test(m)) return null
    console.warn('[chatbot_knowledge] match query failed', e)
    return null
  }

  for (const row of rows) {
    const kw = normalizeForMatch(row.question_keyword)
    if (!kw) continue
    if (msg.includes(kw)) {
      return {
        id: row.id,
        question_keyword: row.question_keyword,
        answer_text: row.answer_text,
      }
    }
  }
  return null
}

export async function insertChatbotConversationLog(
  db: D1Database,
  opts: {
    userId: number | null
    userMessage: string
    assistantReply: string
    source: string
  },
): Promise<void> {
  const um = String(opts.userMessage || '').slice(0, 4000)
  const ar = String(opts.assistantReply || '').slice(0, 16000)
  if (!um || !ar) return
  try {
    await db
      .prepare(
        `INSERT INTO chatbot_conversation_logs (user_id, user_message, assistant_reply, source)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(opts.userId ?? null, um, ar, opts.source.slice(0, 64))
      .run()
  } catch (e) {
    const m = String(e instanceof Error ? e.message : e)
    if (/no such table/i.test(m)) return
    console.warn('[chatbot_conversation_logs] insert skip', e)
  }
}
