-- 메인(/) 시그니처 라인업 3카드 — 제목·설명·버튼·링크 편집용
CREATE TABLE IF NOT EXISTS landing_signature_cards (
  id TEXT PRIMARY KEY CHECK (id IN ('classic', 'next', 'ncs')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_label TEXT NOT NULL,
  button_href TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
