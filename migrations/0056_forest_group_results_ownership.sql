-- Forest 집단 결과: 소유자(로그인 사용자) 및 보고서 requestId — 열람 권한 검증용
ALTER TABLE forest_group_results ADD COLUMN user_id INTEGER;
ALTER TABLE forest_group_results ADD COLUMN request_id TEXT;

CREATE INDEX IF NOT EXISTS idx_forest_group_user_id ON forest_group_results (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_forest_group_request_id ON forest_group_results (request_id);
