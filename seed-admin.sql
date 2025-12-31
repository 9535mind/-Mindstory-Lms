-- 테스트 관리자 계정 생성
-- 이메일: admin@mindstory.co.kr
-- 비밀번호: admin123 (해시: bcrypt)

INSERT OR REPLACE INTO users (
  id, email, password, name, role, status, 
  terms_agreed, privacy_agreed, marketing_agreed,
  created_at, updated_at
) VALUES (
  1,
  'admin@mindstory.co.kr',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '관리자',
  'admin',
  'active',
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
);
