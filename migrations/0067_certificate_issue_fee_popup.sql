-- 자격증 발급 비용: 팝업·안내용 정상가·수강생 특별가 (원 단위)
ALTER TABLE private_certificate_catalog ADD COLUMN issue_fee_list_won INTEGER;
ALTER TABLE private_certificate_catalog ADD COLUMN issue_fee_student_won INTEGER;

UPDATE private_certificate_catalog
SET issue_fee_list_won = 90000, issue_fee_student_won = 70000
WHERE issue_fee_list_won IS NULL OR issue_fee_student_won IS NULL;
