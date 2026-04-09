-- 수강 진도: 사용자·강좌 비정규화, 총 재생 길이(초) 저장 (표시·동기화용)
ALTER TABLE lesson_progress ADD COLUMN user_id INTEGER;
ALTER TABLE lesson_progress ADD COLUMN course_id INTEGER;
ALTER TABLE lesson_progress ADD COLUMN total_seconds INTEGER NOT NULL DEFAULT 0;
