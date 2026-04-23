-- users: 약관·마케팅 동의(코드·카카오 OAuth·seed가 가정) — 누락 DB 보강
-- SQLite: INTEGER 0/1, 기본값 0 = 미동의
ALTER TABLE users ADD COLUMN terms_agreed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN privacy_agreed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN marketing_agreed INTEGER NOT NULL DEFAULT 0;
