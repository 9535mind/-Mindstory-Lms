-- Migration: 0011_add_certificates.sql
-- 목적: 수료증 발급 시스템 추가
-- Phase 4: Certificate System

-- 수료증 테이블 생성
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrollment_id INTEGER NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  issue_date TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  progress_rate REAL NOT NULL DEFAULT 100.0,
  test_score REAL,
  pdf_url TEXT,
  issued_by TEXT NOT NULL DEFAULT 'Mindstory LMS',
  issuer_name TEXT,
  issuer_position TEXT,
  reissue_count INTEGER DEFAULT 0,
  original_certificate_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (original_certificate_id) REFERENCES certificates(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON certificates(issue_date);

-- 샘플 데이터 (개발/테스트용)
-- INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_number, issue_date, completion_date, progress_rate)
-- VALUES (2, 1, 1, 'CERT-2025-001-001', '2025-01-15', '2025-01-15', 100.0);
