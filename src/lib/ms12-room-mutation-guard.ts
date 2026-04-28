import type { D1Database } from '@cloudflare/workers-types'
import { errorResponse } from '../utils/helpers'

function nowIso(): string {
  return new Date().toISOString()
}

type GuardCtx = {
  env: { DB: D1Database }
  json: (data: { success: boolean; error: string } | Record<string, unknown>, status?: number) => Response
}

/**
 * 무료 제한 시간 경과(또는 status=ended) — 실행항목·AI·초안·(연결) 서버 기록 저장 등 쓰기 작업 거부.
 */
export async function assertRoomOpenForMutations(
  c: GuardCtx,
  meetingId: string,
): Promise<Response | null> {
  const selWith = `SELECT id, status, free_end_at FROM ms12_rooms WHERE id = ?`
  const selNo = `SELECT id, status FROM ms12_rooms WHERE id = ?`
  let row: Record<string, unknown> | null = null
  try {
    row = await c.env.DB.prepare(selWith).bind(meetingId).first<Record<string, unknown>>()
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    if (!/no such column[:\s].*free_end_at|SQLITE_ERROR.*\bfree_end_at/i.test(m)) {
      throw e
    }
    row = await c.env.DB.prepare(selNo).bind(meetingId).first<Record<string, unknown>>()
  }
  if (!row) {
    return c.json(errorResponse('회의를 찾을 수 없습니다.'), 404)
  }
  if (String(row.status || 'open') === 'ended') {
    return c.json(
      errorResponse(
        '종료된 회의입니다. 열람만 가능하며, 메모·실행·AI 입력은 할 수 없습니다. 새 회의를 열어 주세요.',
      ),
      403,
    )
  }
  const fe = row.free_end_at != null ? String(row.free_end_at) : ''
  if (fe) {
    const endMs = Date.parse(fe)
    if (!Number.isNaN(endMs) && Date.now() > endMs) {
      const t2 = nowIso()
      await c.env.DB
        .prepare(
          `UPDATE ms12_rooms SET status = 'ended', updated_at = ? WHERE id = ? AND status = 'open'`,
        )
        .bind(t2, meetingId)
        .run()
      return c.json(
        errorResponse('무료 회의 이용 시간이 종료되었습니다. 새 회의를 열거나 Pro를 이용해 주세요.'),
        403,
      )
    }
  }
  return null
}
