-- Migration: 회원 탈퇴 기능 추가
-- Created: 2025-12-28
-- Description: 소프트 삭제 방식의 회원 탈퇴 기능

-- users 테이블에 탈퇴 관련 컬럼 추가
ALTER TABLE users ADD COLUMN deleted_at DATETIME;
ALTER TABLE users ADD COLUMN deletion_reason TEXT;

-- 탈퇴 사유 옵션:
-- 1. 사용하지 않는 서비스입니다
-- 2. 원하는 강의가 없습니다
-- 3. 다른 학습 플랫폼을 사용합니다
-- 4. 개인정보 보호를 위해
-- 5. 기타 (직접 입력)

-- 탈퇴한 사용자 조회를 위한 인덱스
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 탈퇴 후 30일이 지난 데이터 완전 삭제를 위한 뷰 (관리자용)
-- 실제 삭제는 별도 배치 작업으로 처리 예정
