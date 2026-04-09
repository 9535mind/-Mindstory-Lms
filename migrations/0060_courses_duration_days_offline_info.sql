-- mindstory-production 등: duration_days(0003)·offline_info(0055/핫픽스)가 이미 있으면
-- ALTER TABLE ... ADD COLUMN 이 duplicate column 으로 실패함. SQLite는 ADD COLUMN IF NOT EXISTS 없음.
-- 정상 마이그레이션 경로(0003+0055)에서는 이 파일이 불필요하므로 멱등 no-op.
-- (과거 0003/0055 누락 DB는 수동으로 두 컬럼을 추가한 뒤 마이그레이션만 기록하면 됨.)
SELECT 1;
