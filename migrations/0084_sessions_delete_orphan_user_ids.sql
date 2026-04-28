-- 고아 세션: users 에 없는 user_id 를 가리키는 sessions 행 정리(일회 D1 / wrangler d1 execute)
-- OAuth 오류·수동 users 삭제 등으로 남은 쿠키로 인한 sessionFound+user_not_found 방지
DELETE FROM sessions
WHERE user_id NOT IN (SELECT id FROM users);
