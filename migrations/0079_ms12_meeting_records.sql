-- 저장/불러오기: 회의 풀 스냅샷 (실시간 ms12_rooms 와 별도)
CREATE TABLE IF NOT EXISTS ms12_meeting_records (
  id TEXT PRIMARY KEY NOT NULL,
  room_id TEXT,
  title TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '일반',
  participants_json TEXT,
  raw_notes TEXT NOT NULL DEFAULT '',
  transcript TEXT,
  final_notes TEXT,
  summary_basic TEXT,
  summary_action TEXT,
  summary_report TEXT,
  visibility TEXT NOT NULL DEFAULT 'public_internal' CHECK (visibility IN ('public_internal', 'restricted', 'private_admin')),
  tags TEXT,
  project_name TEXT,
  budget_ref TEXT,
  target_group TEXT,
  created_by_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES ms12_rooms(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_mrec_date ON ms12_meeting_records(meeting_date);
CREATE INDEX IF NOT EXISTS idx_mrec_category ON ms12_meeting_records(category);
CREATE INDEX IF NOT EXISTS idx_mrec_by ON ms12_meeting_records(created_by_key);
CREATE INDEX IF NOT EXISTS idx_mrec_room ON ms12_meeting_records(room_id);
CREATE INDEX IF NOT EXISTS idx_mrec_updated ON ms12_meeting_records(updated_at);
