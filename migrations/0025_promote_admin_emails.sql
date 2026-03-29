-- 지정 이메일 계정을 관리자(role=admin)로 승격 (해당 행이 있을 때만 반영)
-- 앱 코드 상수와 동기화: src/utils/admin-emails.ts 의 ADMIN_EMAILS
-- 참고: 요청 문자열 "9535mind@,gmail.com" 은 오타로 보아 9535mind@gmail.com 으로 처리
UPDATE users
SET role = 'admin',
    updated_at = datetime('now')
WHERE deleted_at IS NULL
  AND email IN (
    '9535mind@gmail.com',
    'js94659535@gmail.com'
  );
