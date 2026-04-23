/**
 * 공고 수집 확장 지점 (API·RSS·허용 범위 크롤 → 구조화 후 POST /api/ms12/announcements/ingest)
 *
 * 대상별로 공개 API·RSS·HTML 구조가 다르므로 소스별 모듈로 분리하는 것을 권장합니다.
 * Worker 에서 robots.txt·이용약관·요청 빈도를 준수하고, 수집 결과는 항상 ms12_announcements 스키마에 맞게 정규화합니다.
 */
export const ANNOUNCEMENT_SOURCE_CODES = [
  'mohw',
  'moe',
  'mogef',
  'chest',
  'lottery',
  'other',
] as const
