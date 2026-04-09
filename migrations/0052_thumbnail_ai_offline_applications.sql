-- 강좌 AI 썸네일 플래그 + 오프라인 신청 테이블(스키마)
-- 데이터 이전은 0053_offline_applications_migrate.sql (0051 course_meetup_registrations 이후)

ALTER TABLE courses ADD COLUMN thumbnail_image_ai INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS offline_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  user_id INTEGER,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT,
  motivation TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_offline_app_course ON offline_applications(course_id);
CREATE INDEX IF NOT EXISTS idx_offline_app_created ON offline_applications(created_at);
