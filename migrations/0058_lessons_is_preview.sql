-- 차시 맛보기(무료 프리뷰) — 강좌 결제 없이 시청 허용 플래그
-- 기존 lessons.is_free(레거시)가 1이면 맛보기로 간주
ALTER TABLE lessons ADD COLUMN is_preview INTEGER NOT NULL DEFAULT 0;

UPDATE lessons SET is_preview = 1 WHERE COALESCE(is_free, 0) = 1;
