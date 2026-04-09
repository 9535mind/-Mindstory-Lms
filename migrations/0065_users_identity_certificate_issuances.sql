-- 본인인증·자격증 발급비 결제 (PortOne) 연동
ALTER TABLE users ADD COLUMN real_name TEXT;
ALTER TABLE users ADD COLUMN phone_number TEXT;
ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0;

-- 민간자격 카탈로그 발급비(원) — 결제 금액 검증용
ALTER TABLE private_certificate_catalog ADD COLUMN fee_won INTEGER NOT NULL DEFAULT 33000;

CREATE TABLE IF NOT EXISTS certificate_issuances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  certificate_id INTEGER NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  imp_uid_cert TEXT,
  imp_uid_pay TEXT,
  issued_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (certificate_id) REFERENCES private_certificate_catalog(id)
);

CREATE INDEX IF NOT EXISTS idx_cert_issuances_user ON certificate_issuances(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_issuances_status ON certificate_issuances(status);
