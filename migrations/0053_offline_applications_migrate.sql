-- 0051 course_meetup_registrations → offline_applications 이전 후 레거시 테이블 제거
-- (0051 미적용 DB에서는 이 마이그레이션을 적용하지 마세요.)

INSERT INTO offline_applications (course_id, user_id, applicant_name, phone, region, motivation, created_at)
SELECT course_id, user_id, applicant_name, phone, region, motivation, created_at
FROM course_meetup_registrations;

DROP TABLE IF EXISTS course_meetup_registrations;
