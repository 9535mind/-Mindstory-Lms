-- 챗봇 RAG: 비활성(삭제 처리) 강사 제외 — 기본 1=활성

ALTER TABLE instructors ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
