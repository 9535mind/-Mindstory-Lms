-- MS12 guest 호스트·참가자 키(u: / g:) — 기존 user 전용 행은 user 경로로 이관
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS ms12_rooms_mig (
  id TEXT PRIMARY KEY NOT NULL,
  host_actor_type TEXT NOT NULL DEFAULT 'user' CHECK (host_actor_type IN ('user', 'guest')),
  host_user_id INTEGER,
  host_guest_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  meeting_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (host_actor_type = 'user' AND host_user_id IS NOT NULL)
    OR (host_actor_type = 'guest' AND host_guest_id IS NOT NULL)
  ),
  FOREIGN KEY (host_user_id) REFERENCES users(id)
);

INSERT INTO ms12_rooms_mig (id, host_actor_type, host_user_id, host_guest_id, title, meeting_code, status, created_at, updated_at)
SELECT id, 'user', host_user_id, NULL, title, meeting_code, status, created_at, updated_at FROM ms12_rooms;

CREATE TABLE IF NOT EXISTS ms12_room_participants_mig (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL,
  participant_key TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'guest')),
  user_id INTEGER,
  guest_id TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'participant',
  joined_at TEXT NOT NULL,
  left_at TEXT,
  attendance_status TEXT NOT NULL DEFAULT 'in',
  FOREIGN KEY (meeting_id) REFERENCES ms12_rooms_mig(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (meeting_id, participant_key)
);

INSERT INTO ms12_room_participants_mig (
  meeting_id, participant_key, actor_type, user_id, guest_id,
  display_name, role, joined_at, left_at, attendance_status
)
SELECT
  meeting_id,
  'u:' || CAST(user_id AS TEXT),
  'user',
  user_id,
  NULL,
  display_name,
  role,
  joined_at,
  left_at,
  attendance_status
FROM ms12_room_participants;

DROP TABLE IF EXISTS ms12_room_participants;
DROP TABLE IF EXISTS ms12_rooms;

ALTER TABLE ms12_rooms_mig RENAME TO ms12_rooms;
ALTER TABLE ms12_room_participants_mig RENAME TO ms12_room_participants;

CREATE INDEX IF NOT EXISTS idx_ms12_rooms_host_user ON ms12_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rooms_host_guest ON ms12_rooms(host_guest_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rooms_code ON ms12_rooms(meeting_code);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_meeting ON ms12_room_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_user ON ms12_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_guest ON ms12_room_participants(guest_id);
CREATE INDEX IF NOT EXISTS idx_ms12_rp_key ON ms12_room_participants(participant_key);

PRAGMA foreign_keys = ON;
