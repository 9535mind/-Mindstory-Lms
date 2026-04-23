-- ms12-production 등: 0005 가 적용 기록은 있으나 users.deleted_at 이 없는 불일치 DB는
-- `node scripts/ensure-d1-users-softdelete.mjs --local` / `--remote` 로 멱등 보정(ALTER+인덱스).
-- 정상 경로(0005가 실제로 적용됨)에서는 컬럼이 이미 있으므로 migration 체인만 완주(중복 ALTER 방지).
SELECT 1;
