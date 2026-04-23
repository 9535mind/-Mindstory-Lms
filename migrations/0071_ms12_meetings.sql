-- ms12: 회의 문서 (Firestore meetings 컬렉션과 동일 필드를 D1에 저장)
CREATE TABLE IF NOT EXISTS ms12_meetings (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  raw_notes TEXT NOT NULL DEFAULT '',
  summary_basic TEXT,
  summary_action TEXT,
  summary_report TEXT,
  generated_actions TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_ms12_meetings_owner ON ms12_meetings(owner_id);
CREATE INDEX IF NOT EXISTS idx_ms12_meetings_updated ON ms12_meetings(updated_at);
