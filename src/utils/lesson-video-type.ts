/**
 * 차시 영상 소스 — DB·API 공통 정규화 (YOUTUBE | R2)
 */

export type LessonVideoTypeApi = 'YOUTUBE' | 'R2'

/** 저장·응답용 */
export function normalizeLessonVideoType(raw: unknown): LessonVideoTypeApi {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
  if (s === 'R2' || s === 'UPLOAD') return 'R2'
  if (s === 'YOUTUBE') return 'YOUTUBE'
  const lo = s.toLowerCase()
  if (lo === 'r2' || lo === 'upload') return 'R2'
  return 'YOUTUBE'
}

/** R2 공개 URL 여부 (직접 재생 링크) */
export function isLikelyR2HostedVideoUrl(url: string): boolean {
  const u = String(url || '').trim()
  if (!u.startsWith('https://')) return false
  try {
    const h = new URL(u).hostname.toLowerCase()
    return h.endsWith('.r2.dev') || h.includes('r2.cloudflarestorage.com')
  } catch {
    return false
  }
}
