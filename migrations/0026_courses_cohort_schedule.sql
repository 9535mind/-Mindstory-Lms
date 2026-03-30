-- 강좌 개강일·일정 안내 (챗봇·프론트 공용)
-- next_cohort_start_date: ISO 8601 날짜 (YYYY-MM-DD), 다음 기수 개강일 1건
-- schedule_info: 자유 입력(반복 개강·추가 안내 등). 날짜와 병행 가능
ALTER TABLE courses ADD COLUMN next_cohort_start_date TEXT NULL;
ALTER TABLE courses ADD COLUMN schedule_info TEXT NULL;
