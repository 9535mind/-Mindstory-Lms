-- 소셜 로그인을 위한 users 테이블 수정
-- social_provider와 social_id 컬럼 추가

ALTER TABLE users ADD COLUMN social_provider TEXT;
ALTER TABLE users ADD COLUMN social_id TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- social_id에 유니크 인덱스 추가 (중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_social_id ON users(social_id);

-- 기존 이메일 인덱스 확인
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
