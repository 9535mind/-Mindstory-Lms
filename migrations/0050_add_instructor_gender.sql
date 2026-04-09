-- 강사 성별 (AI 프로필 프롬프트 정합성): M 남성, F 여성, U 미지정(레거시·기본)
ALTER TABLE instructors ADD COLUMN gender TEXT NOT NULL DEFAULT 'U';
