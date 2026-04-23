-- MS12: 구조화 문서 자산 (제안서·기획서·보고서 등) + 검색용 메타
CREATE TABLE IF NOT EXISTS ms12_document_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT '기타',
  year INTEGER,
  target_audience TEXT,
  budget_won INTEGER,
  outcome_summary TEXT,
  keywords TEXT,
  body_excerpt TEXT,
  file_key TEXT,
  file_name TEXT,
  mime_type TEXT,
  meeting_id TEXT,
  created_by_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES ms12_rooms(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ms12_doc_year ON ms12_document_assets(year);
CREATE INDEX IF NOT EXISTS idx_ms12_doc_type ON ms12_document_assets(doc_type);
CREATE INDEX IF NOT EXISTS idx_ms12_doc_meeting ON ms12_document_assets(meeting_id);
CREATE INDEX IF NOT EXISTS idx_ms12_doc_created ON ms12_document_assets(created_at);
