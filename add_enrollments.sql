-- 기존 수강 신청 모두 삭제
DELETE FROM enrollments;

-- 학생 1 (김민수 - id: 2) - 모든 강좌 (1, 2, 3, 4, 7)
INSERT INTO enrollments (user_id, course_id, status, start_date, end_date, created_at, updated_at)
VALUES 
  (2, 1, 'active', datetime('now', '-5 days'), datetime('now', '+25 days'), datetime('now', '-5 days'), datetime('now')),
  (2, 2, 'active', datetime('now', '-10 days'), datetime('now', '+20 days'), datetime('now', '-10 days'), datetime('now')),
  (2, 3, 'active', datetime('now', '-3 days'), datetime('now', '+27 days'), datetime('now', '-3 days'), datetime('now')),
  (2, 4, 'active', datetime('now', '-15 days'), datetime('now', '+15 days'), datetime('now', '-15 days'), datetime('now')),
  (2, 7, 'active', datetime('now', '-7 days'), datetime('now', '+23 days'), datetime('now', '-7 days'), datetime('now'));

-- 학생 2 (이영희 - id: 3) - 모든 강좌 (1, 2, 3, 4, 7)
INSERT INTO enrollments (user_id, course_id, status, start_date, end_date, created_at, updated_at)
VALUES 
  (3, 1, 'active', datetime('now', '-8 days'), datetime('now', '+22 days'), datetime('now', '-8 days'), datetime('now')),
  (3, 2, 'active', datetime('now', '-12 days'), datetime('now', '+18 days'), datetime('now', '-12 days'), datetime('now')),
  (3, 3, 'active', datetime('now', '-6 days'), datetime('now', '+24 days'), datetime('now', '-6 days'), datetime('now')),
  (3, 4, 'active', datetime('now', '-20 days'), datetime('now', '+10 days'), datetime('now', '-20 days'), datetime('now')),
  (3, 7, 'active', datetime('now', '-4 days'), datetime('now', '+26 days'), datetime('now', '-4 days'), datetime('now'));

-- 학생 3 (박철수 - id: 4) - 모든 강좌 (1, 2, 3, 4, 7)
INSERT INTO enrollments (user_id, course_id, status, start_date, end_date, created_at, updated_at)
VALUES 
  (4, 1, 'active', datetime('now', '-2 days'), datetime('now', '+28 days'), datetime('now', '-2 days'), datetime('now')),
  (4, 2, 'active', datetime('now', '-6 days'), datetime('now', '+24 days'), datetime('now', '-6 days'), datetime('now')),
  (4, 3, 'active', datetime('now', '-1 days'), datetime('now', '+29 days'), datetime('now', '-1 days'), datetime('now')),
  (4, 4, 'active', datetime('now', '-10 days'), datetime('now', '+20 days'), datetime('now', '-10 days'), datetime('now')),
  (4, 7, 'active', datetime('now', '-5 days'), datetime('now', '+25 days'), datetime('now', '-5 days'), datetime('now'));
