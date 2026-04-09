import { normalizeLessonVideoType, type LessonVideoTypeApi } from './lesson-video-type'

/**
 * 차시 맛보기(무료 프리뷰) 플래그.
 * DB에 is_preview가 있으면 우선, 없으면 is_free_preview·is_free(레거시)를 참고한다.
 */
export function lessonPreviewFlagFromRow(row: Record<string, unknown> | null | undefined): 0 | 1 {
  if (!row) return 0
  if (Number(row.is_preview) === 1) return 1
  if (Number(row.is_free_preview) === 1) return 1
  if (Number(row.is_free) === 1) return 1
  return 0
}

export function normalizeLessonRowForApi<T extends Record<string, unknown>>(
  row: T,
): T & { is_preview: 0 | 1; is_free_preview: 0 | 1; video_type: LessonVideoTypeApi } {
  const p = lessonPreviewFlagFromRow(row)
  const video_type = normalizeLessonVideoType(row.video_type)
  return { ...row, is_preview: p, is_free_preview: p, video_type }
}
