-- 회의실 ↔ 공고 연결(제안·추적)
ALTER TABLE ms12_rooms ADD COLUMN linked_announcement_id TEXT;
CREATE INDEX IF NOT EXISTS idx_ms12_rooms_ann ON ms12_rooms(linked_announcement_id);
