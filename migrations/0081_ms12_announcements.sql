-- MS12 공모·지원사업 공고 (구조화 자산; 수집은 API/크롤러→ingest)
CREATE TABLE IF NOT EXISTS ms12_announcements (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  budget_max_won INTEGER,
  budget_note TEXT,
  support_amount TEXT,
  target_audience TEXT,
  deadline TEXT,
  region TEXT,
  category TEXT,
  keywords TEXT,
  source_url TEXT NOT NULL,
  source TEXT NOT NULL,
  raw_excerpt TEXT,
  body_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ms12_ann_deadline ON ms12_announcements(deadline);
CREATE INDEX IF NOT EXISTS idx_ms12_ann_source ON ms12_announcements(source);
CREATE INDEX IF NOT EXISTS idx_ms12_ann_region ON ms12_announcements(region);
CREATE INDEX IF NOT EXISTS idx_ms12_ann_org ON ms12_announcements(organization);

-- 데모·개발용 시드 (실서비스에서는 ingest/수집으로 대체)
INSERT OR IGNORE INTO ms12_announcements (id, title, organization, budget_max_won, budget_note, support_amount, target_audience, deadline, region, category, keywords, source_url, source, raw_excerpt, created_at, updated_at) VALUES
('a1demo001h00000001', '지역사회 통합 돌봄 지원 사업', '보건복지부', 10000000, '1천만원 이하 과제 우대', '총 5억 규모 중 소규모 과제', '지자체·사회복지시설', date('now', '+60 day'), '전국', '공모', '돌봄,복지,지역', 'https://www.mohw.go.kr/', 'mohw', '지역 네트워크 구축 지원', datetime('now'), datetime('now')),
('a1demo001h00000002', '초등 돌봄 연계 프로그램', '서울특별시교육청', 50000000, '학교당 5천만원 이하', '학교·지역센터 연계', '초등학생·학부모', date('now', '+45 day'), '서울', '교육', '초등,돌봄,방과', 'https://www.sen.go.kr/', 'moe', '방과 후 활동 강화', datetime('now'), datetime('now')),
('a1demo001h00000003', '여성 일자리 창업 지원', '여성가족부', NULL, '심사 결정', '최대 3천만원', '예비창업 여성', date('now', '+30 day'), '광주', '창업', '여성,창업,일자리', 'https://www.mogef.go.kr/', 'mogef', '지역 일자리 확대', datetime('now'), datetime('now')),
('a1demo001h00000004', '복권기금 사회복지 사업', '사회복지공동모금회', 20000000, '2천만원 이하', '심의 후 확정', '비영리 단체', date('now', '+90 day'), '전국', '복지', '모금,복지,단체', 'https://www.chest.or.kr/', 'chest', '지역 사회복지 강화', datetime('now'), datetime('now')),
('a1demo001h00000005', '복권기금 지역특화 사업', '복권기금 사업', 15000000, '1.5억 이하', '지역 거점 구축', '청소년', date('now', '+120 day'), '부산', '문화', '청소년,복권기금,지역', 'https://www.kcgp.or.kr/', 'lottery', '청소년 문화활동', datetime('now'), datetime('now'));
