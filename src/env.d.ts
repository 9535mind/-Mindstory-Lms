/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Kakao JavaScript 키 — Vite 클라이언트에만. REST와 별도 */
  readonly VITE_KAKAO_JS_KEY?: string
  /** 빌드 시 루트 .env·.dev.vars 의 KAKAO_CLIENT_ID(REST) 스냅샷 — Worker getKakaoClientId 폴백 */
  readonly __KAKAO_CLIENT_ID_FROM_FILE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
