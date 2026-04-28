/**
 * (준비) 음성·자연어 → 동일 action 호출. UI는 아직 연결하지 않음.
 */
import { createMeeting, joinMeeting } from '../actions/meeting.actions'
import { getRecentRecords } from '../actions/record.actions'

export function extractCode(text: string): string {
  const t = (text || '').trim()
  const m = t.match(/([A-Za-z0-9][A-Za-z0-9-]{3,})/)
  return m ? m[1]! : ''
}

export async function handleCommand(text: string) {
  const t = (text || '').trim()
  if (t.includes('회의 시작')) {
    return createMeeting({})
  }
  if (t.includes('회의 참여')) {
    return joinMeeting(extractCode(t) || undefined)
  }
  if (t.includes('기록 보여줘') || t.includes('기록 보기')) {
    return getRecentRecords()
  }
  return { kind: 'unhandled' as const, text: t }
}
