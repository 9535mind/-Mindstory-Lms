-- 정가(regular_price)·비고(price_remarks), 개강일 제거, 오프라인 모임 신청

ALTER TABLE courses ADD COLUMN regular_price INTEGER;
UPDATE courses SET regular_price = COALESCE(price, 0) WHERE regular_price IS NULL;

ALTER TABLE courses ADD COLUMN price_remarks TEXT;

ALTER TABLE courses DROP COLUMN next_cohort_start_date;

CREATE TABLE IF NOT EXISTS course_meetup_registrations (
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

CREATE INDEX IF NOT EXISTS idx_meetup_course ON course_meetup_registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_meetup_created ON course_meetup_registrations(created_at);
