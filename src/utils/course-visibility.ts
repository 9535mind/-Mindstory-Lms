/**
 * 공개 카탈로그·신규 수강 노출용 — published 이고 휴지통(soft delete) 아님
 * (마이그레이션 전 DB는 deleted_at 컬럼 없을 수 있음 → 호출부에서 try/catch)
 */

/** courses 테이블 단독 WHERE 절 */
export const SQL_COURSE_CATALOG_VISIBLE =
  `LOWER(TRIM(COALESCE(status,''))) = 'published' AND (deleted_at IS NULL OR TRIM(COALESCE(deleted_at,'')) = '')`

/** JOIN 시 courses 별칭 c */
export const SQL_COURSE_CATALOG_VISIBLE_ALIAS =
  `LOWER(TRIM(COALESCE(c.status,''))) = 'published' AND (c.deleted_at IS NULL OR TRIM(COALESCE(c.deleted_at,'')) = '')`
