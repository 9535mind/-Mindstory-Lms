/**
 * ms12_room_participants — participant_key(g:uuid)와 guest_id(원 UUID) 병행 매칭(레거시·엣지 쿠키 불일치 대비)
 */
import type { D1Database } from '@cloudflare/workers-types'
import { HTTPException } from 'hono/http-exception'
import type { AppActor } from './actor'
import { participantKey } from './actor'

export async function assertIsRoomParticipant(
  db: D1Database,
  meetingId: string,
  actor: AppActor,
): Promise<void> {
  const k = participantKey(actor)
  const guestId = actor.type === 'guest' ? actor.id : null
  const row = await db
    .prepare(
      `SELECT 1 AS ok FROM ms12_room_participants
       WHERE meeting_id = ? AND left_at IS NULL
         AND (participant_key = ? OR (? IS NOT NULL AND guest_id = ?))`,
    )
    .bind(meetingId, k, guestId, guestId)
    .first()
  if (row) return
  throw new HTTPException(403, { message: '이 회의에 입장한 참석자만 볼 수 있습니다.' })
}
