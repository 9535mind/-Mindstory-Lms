-- 신규 INSERT 시 duration_days 기본값을 90일로 통일 (앱/API 기본값과 일치)
-- D1(SQLite) 일부 빌드는 ALTER TABLE ... ALTER COLUMN ... SET DEFAULT 를 지원하지 않음.
-- 스키마 기본값은 0003(30)·0060 경로와 호환을 위해 여기서는 멱등 no-op.
-- 실제 90일 기본은 애플리케이션 INSERT 및 COALESCE에서 처리.
SELECT 1;
