-- 실행 항목: 세부·우선순위·분류(명세 Ⅲ④)
ALTER TABLE ms12_action_items ADD COLUMN task_detail TEXT;
ALTER TABLE ms12_action_items ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE ms12_action_items ADD COLUMN item_category TEXT NOT NULL DEFAULT 'required';
