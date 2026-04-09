-- 레거시 video_type 값을 API 정규값(YOUTUBE | R2)으로 통일
UPDATE lessons SET video_type = 'YOUTUBE' WHERE video_type IS NULL OR trim(video_type) = '' OR lower(video_type) IN ('youtube', 'youtu');
UPDATE lessons SET video_type = 'R2' WHERE lower(video_type) IN ('upload', 'r2');
