import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    /** 로컬 Vite 번들에서만 사용. 프로덕션은 /api/portone/public-config 권장 */
    'import.meta.env.VITE_PORTONE_IMP_CODE': JSON.stringify(process.env.VITE_PORTONE_IMP_CODE ?? ''),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    copyPublicDir: true
  }
})
