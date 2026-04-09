-- 강좌 휴지통(Soft delete): 신규 카탈로그에서 제외하되 수강 기록은 유지
ALTER TABLE courses ADD COLUMN deleted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);
