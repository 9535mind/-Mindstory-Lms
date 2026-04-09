-- 민간자격 카탈로그 (강좌 연결용). 수료증 발급 테이블 certificates 와 별개.
CREATE TABLE IF NOT EXISTS private_certificate_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '등록민간자격',
  registration_number TEXT NOT NULL,
  issuer_name TEXT NOT NULL DEFAULT '(주)마인드스토리',
  cost_total TEXT NOT NULL DEFAULT '과정별 상이 (수강 신청 시 안내)',
  cost_details TEXT NOT NULL DEFAULT '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.',
  refund_policy TEXT NOT NULL DEFAULT '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pcc_registration_number ON private_certificate_catalog(registration_number);

INSERT OR IGNORE INTO private_certificate_catalog (name, type, registration_number, issuer_name, cost_total, cost_details, refund_policy, display_order) VALUES
('AI미래진로상담사', '등록민간자격', '2024-005605', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 1),
('AI코스웨어지도사', '등록민간자격', '2024-005980', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 2),
('도형심리상담사', '등록민간자격', '2025-000212', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 3),
('DISC심리상담사', '등록민간자격', '2025-000213', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 4),
('가사관리사', '등록민간자격', '2025-000598', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 5),
('MYBEST컨설턴트', '등록민간자격', '2025-002778', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 6),
('발명지도사', '등록민간자격', '2025-003496', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 7),
('창업지도사', '등록민간자격', '2025-004011', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 8),
('김치문화전승교육사', '등록민간자격', '2025-004159', '(주)마인드스토리', '과정별 상이 (수강 신청 시 안내)', '응시료·교재비·발급비 등 세부 항목은 과정 안내 및 공지에 따릅니다.', '환불은 당사 교육 운영 규정 및 전자상거래 등에서의 소비자보호에 관한 법률에 따릅니다.', 9);
