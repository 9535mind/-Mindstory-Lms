-- 테스트 관리자 계정
INSERT OR REPLACE INTO users (
  email, password_hash, name, role, created_at, updated_at
) VALUES (
  'admin@mindstory.co.kr',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '관리자',
  'admin',
  datetime('now'),
  datetime('now')
);

SELECT * FROM users WHERE email = 'admin@mindstory.co.kr';
