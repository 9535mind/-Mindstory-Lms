-- MS12 무료/Pro 구분, 무료 회의 30분 종료 시각
-- 앱에서 'pro' | 그 외(free)로 해석
ALTER TABLE users ADD COLUMN ms12_plan TEXT NOT NULL DEFAULT 'free';
CREATE INDEX IF NOT EXISTS idx_users_ms12_plan ON users(ms12_plan);

ALTER TABLE ms12_rooms ADD COLUMN free_end_at TEXT;
