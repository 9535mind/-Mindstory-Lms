/**
 * 공식 브랜드 아이콘 — public/logo.png 파생 정적 파일과 동기
 * (SSR 페이지 <head>에 삽입)
 */
export const SITE_ICONS_HEAD_HTML = `
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#6366F1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="마인드스토리" />
    <meta name="mobile-web-app-capable" content="yes" />
`
