-- Migration: 0010_add_course_reviews.sql
-- 목적: 수강평 및 별점 시스템 추가
-- Phase 2: Review/Rating System

-- 수강평 테이블 생성
CREATE TABLE IF NOT EXISTS course_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(course_id, user_id) -- 한 사용자당 강좌별 1개의 리뷰만 가능
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_created_at ON course_reviews(created_at);

-- 강좌 테이블에 별점 통계 컬럼 추가
ALTER TABLE courses ADD COLUMN rating_average REAL DEFAULT 0.0;
ALTER TABLE courses ADD COLUMN rating_count INTEGER DEFAULT 0;

-- D1 배치 실행 시 트리거 본문에서 incomplete input 오류가 나와,
-- 통계 컬럼은 앱·배치로 갱신하도록 둠(로컬 SQLite 전용 트리거는 제거).

-- 샘플 데이터 (개발/테스트용)
-- INSERT INTO course_reviews (course_id, user_id, rating, comment) 
-- VALUES 
--   (1, 2, 5, '정말 유익한 강좌였습니다! 강사님의 설명이 명쾌합니다.'),
--   (1, 3, 4, '좋은 내용이지만 조금 더 심화 내용이 있었으면 좋겠습니다.'),
--   (2, 2, 5, '기초부터 차근차근 알려주셔서 이해하기 쉬웠습니다.');
