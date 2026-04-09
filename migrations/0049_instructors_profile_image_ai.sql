-- 강사 프로필 이미지가 AI(DALL·E 등)로 생성되었는지 구분
ALTER TABLE instructors ADD COLUMN profile_image_ai INTEGER NOT NULL DEFAULT 0;
