-- ============================================
-- 민간자격 발급 유형 추가 마이그레이션
-- ============================================

-- 1. certification_types 테이블에 issuer_type 필드 추가
ALTER TABLE certification_types ADD COLUMN issuer_type TEXT DEFAULT 'direct';
-- direct: 직접 발급 ((주)마인드스토리)
-- partner: 기관 연계 (평생교육진흥회, 메타인지학습연구회 등)

-- 2. 기존 데이터 업데이트 (모두 직접 발급으로 설정)
UPDATE certification_types 
SET issuer_type = 'direct' 
WHERE issuer_type IS NULL OR issuer_type = '';

-- 3. issuer_name의 기본값 변경을 위한 인덱스 생성
-- (이미 생성된 테이블이므로 기본값 변경은 불가, 신규 레코드부터 적용)

-- 4. 샘플 연계 기관 자격 추가
INSERT OR IGNORE INTO certification_types (
  name, code, category, description, issuer_type, issuer_name, issuer_registration_number,
  price, is_active, display_order, requirements
) VALUES
-- 평생교육진흥회 연계
('부모교육 전문가 1급', 'PE-L1', 'education', 
 '평생교육진흥회에서 인정하는 부모교육 전문가 자격증입니다.', 
 'partner', '평생교육진흥회', '2024-000200',
 80000, 1, 10, '{"min_completion": 80, "partner_org": "평생교육진흥회"}'),

-- 메타인지학습연구회 연계
('메타인지 학습코칭 전문가', 'ML-COACH', 'education',
 '메타인지학습연구회와 연계한 학습코칭 전문가 자격증입니다.',
 'partner', '메타인지학습연구회', '2024-000201',
 100000, 1, 11, '{"min_completion": 85, "partner_org": "메타인지학습연구회"}'),

-- 추가 연계 기관 (예시)
('청소년 진로상담사 2급', 'CC-L2', 'counseling',
 '한국청소년상담복지개발원 연계 진로상담사 자격증입니다.',
 'partner', '한국청소년상담복지개발원', '2024-000202',
 120000, 1, 12, '{"min_completion": 90, "partner_org": "한국청소년상담복지개발원"}');

-- 5. 연계 기관 코스 설정 (예시: 코스 1번과 연결)
-- 실제 코스 연결은 관리자가 직접 설정
