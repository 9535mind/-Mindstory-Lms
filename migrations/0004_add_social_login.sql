-- ============================================
-- 소셜 로그인 시스템 추가
-- ============================================

-- 1. users 테이블에 소셜 로그인 필드 추가
ALTER TABLE users ADD COLUMN social_provider TEXT;  -- 'kakao', 'google', 'naver' 등
ALTER TABLE users ADD COLUMN social_id TEXT;  -- 소셜 플랫폼의 고유 ID
ALTER TABLE users ADD COLUMN profile_image_url TEXT;  -- 프로필 이미지 URL

-- 2. 소셜 로그인은 비밀번호 불필요
-- password 컬럼을 NULL 허용으로 변경 (SQLite는 ALTER COLUMN 불가, 새 마이그레이션에서 처리)

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_social ON users(social_provider, social_id);
