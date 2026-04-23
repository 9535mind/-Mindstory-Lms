-- MS12: 회의 실행 항목(액션 아이템) — rooms와 연동
CREATE TABLE IF NOT EXISTS ms12_action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL,
  title TEXT NOT NULL,
  assignee TEXT,
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_by_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES ms12_rooms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ms12_ai_meeting ON ms12_action_items(meeting_id, status);
CREATE INDEX IF NOT EXISTS idx_ms12_ai_meeting_id ON ms12_action_items(meeting_id);
