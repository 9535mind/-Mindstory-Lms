-- 강사(Instructor) 프로필 테이블 + courses 강사 연결을 users → instructors 로 전환
-- 기존 courses.instructor_id(회원 users.id) 값은 legacy_instructor_user_id 로 보존

CREATE TABLE IF NOT EXISTS instructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  profile_image TEXT,
  bio TEXT,
  specialty TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_instructors_created ON instructors(created_at);

ALTER TABLE courses RENAME COLUMN instructor_id TO legacy_instructor_user_id;

ALTER TABLE courses ADD COLUMN instructor_id INTEGER REFERENCES instructors(id);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_ref ON courses(instructor_id);
