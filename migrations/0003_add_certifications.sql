-- ============================================
-- 민간자격 시스템 마이그레이션
-- ============================================

-- 1. 민간자격 종류 테이블
CREATE TABLE IF NOT EXISTS certification_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                          -- 자격명 (예: "감정코칭 전문가 2급")
  code TEXT UNIQUE NOT NULL,                   -- 자격 코드 (예: "EC-L2")
  category TEXT NOT NULL,                      -- 분류 (coaching, counseling, psychology)
  description TEXT,                            -- 자격 설명
  requirements TEXT,                           -- 취득 요건 (JSON 형식)
  issuer_name TEXT NOT NULL DEFAULT '마인드스토리원격평생교육원',  -- 발급 기관
  issuer_registration_number TEXT,             -- 한국직업능력연구원 등록번호
  certificate_template TEXT,                   -- 자격증 템플릿 (HTML)
  price INTEGER DEFAULT 0,                     -- 자격증 발급 비용
  validity_period_months INTEGER DEFAULT 0,    -- 유효 기간 (0=평생)
  is_active INTEGER DEFAULT 1,                 -- 활성 상태
  display_order INTEGER DEFAULT 0,             -- 정렬 순서
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 민간자격 - 강좌 연결 테이블
CREATE TABLE IF NOT EXISTS certification_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certification_type_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  is_required INTEGER DEFAULT 1,               -- 필수 과정 여부
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE(certification_type_id, course_id)
);

-- 3. 민간자격 신청 테이블
CREATE TABLE IF NOT EXISTS certification_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  certification_type_id INTEGER NOT NULL,
  application_number TEXT UNIQUE NOT NULL,     -- 신청 번호 (CA-2025-XXXX)
  status TEXT DEFAULT 'pending',               -- pending, reviewing, approved, rejected, issued
  application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 신청자 정보
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_birth_date TEXT,
  applicant_address TEXT,
  
  -- 심사 정보
  reviewer_id INTEGER,                         -- 심사자 (관리자)
  review_date DATETIME,
  review_notes TEXT,                           -- 심사 의견
  rejection_reason TEXT,                       -- 반려 사유
  
  -- 발급 정보
  issue_date DATETIME,
  certificate_number TEXT UNIQUE,              -- 자격증 번호 (CERT-2025-XXXX)
  certificate_pdf_url TEXT,                    -- PDF URL
  expiry_date DATETIME,                        -- 만료일 (없으면 NULL)
  
  -- 결제 정보
  payment_id INTEGER,                          -- 자격증 발급 비용 결제
  payment_status TEXT DEFAULT 'unpaid',        -- unpaid, paid, refunded
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (certification_type_id) REFERENCES certification_types(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cert_types_active ON certification_types(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_cert_courses_type ON certification_courses(certification_type_id);
CREATE INDEX IF NOT EXISTS idx_cert_courses_course ON certification_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_cert_apps_user ON certification_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_apps_type ON certification_applications(certification_type_id);
CREATE INDEX IF NOT EXISTS idx_cert_apps_status ON certification_applications(status);
CREATE INDEX IF NOT EXISTS idx_cert_apps_number ON certification_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_cert_apps_cert_number ON certification_applications(certificate_number);

-- ============================================
-- 샘플 데이터
-- ============================================

-- 1. 민간자격 종류 샘플
INSERT INTO certification_types (name, code, category, description, requirements, issuer_registration_number, price, validity_period_months, display_order) VALUES 
(
  '감정코칭 전문가 2급',
  'EC-L2',
  'coaching',
  '감정코칭의 이론과 실습을 완료하고 전문가 역량을 갖춘 자에게 부여하는 자격입니다.',
  '{"required_courses": [3], "min_score": 80, "completion_required": true}',
  '2024-000123',
  50000,
  0,
  1
),
(
  '마인드 타임 코칭 전문가',
  'MTC-PRO',
  'coaching',
  '시간 관리와 심리학을 결합한 마인드 타임 코칭 전문가 자격입니다.',
  '{"required_courses": [1], "min_score": 80, "completion_required": true}',
  '2024-000124',
  30000,
  0,
  2
),
(
  '부모-자녀 대화 전문가',
  'PCF-PRO',
  'counseling',
  '효과적인 부모-자녀 대화법을 습득한 전문가에게 부여하는 자격입니다.',
  '{"required_courses": [2], "min_score": 80, "completion_required": true}',
  '2024-000125',
  30000,
  0,
  3
);

-- 2. 자격-강좌 연결 (강좌 ID는 seed.sql 참조)
INSERT INTO certification_courses (certification_type_id, course_id, is_required) VALUES 
(1, 3, 1),  -- 감정코칭 전문가 2급 <- 감정코칭 전문가 과정
(2, 1, 1),  -- 마인드 타임 코칭 전문가 <- 마인드 타임 코칭 입문
(3, 2, 1);  -- 부모-자녀 대화 전문가 <- 부모-자녀 대화법

-- 3. 샘플 자격 신청 (학생2가 이미 과정 수료했으므로)
INSERT INTO certification_applications (
  user_id, certification_type_id, application_number, status,
  applicant_name, applicant_phone, applicant_email, applicant_birth_date,
  application_date, payment_status
) VALUES (
  3,  -- student2@example.com
  3,  -- 부모-자녀 대화 전문가
  'CA-2025-0001',
  'pending',
  '이영희',
  '01022223333',
  'student2@example.com',
  '1992-05-20',
  datetime('now'),
  'unpaid'
);
