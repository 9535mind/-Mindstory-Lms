-- MS12 live 회의방(참석자 명단) — 문서용 ms12_meetings(0071)와 별도
CREATE TABLE IF NOT EXISTS ms12_rooms (
  id TEXT PRIMARY KEY NOT NULL,
  host_user_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  meeting_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (host_user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_ms12_rooms_host ON ms12_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rooms_code ON ms12_rooms(meeting_code);

CREATE TABLE IF NOT EXISTS ms12_room_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'participant',
  joined_at TEXT NOT NULL,
  left_at TEXT,
  attendance_status TEXT NOT NULL DEFAULT 'in',
  FOREIGN KEY (meeting_id) REFERENCES ms12_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (meeting_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_meeting ON ms12_room_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_user ON ms12_room_participants(user_id);
