/**
 * public/logo.png(또는 logo.png.png) → favicon·터치 아이콘·PWA용 PNG 생성
 * 로고 전체가 잘리지 않도록 contain + 흰 배경(레터박스) 처리
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = join(__dirname, '..', 'public')
const srcPath = existsSync(join(pub, 'logo.png'))
  ? join(pub, 'logo.png')
  : join(pub, 'logo.png.png')

if (!existsSync(srcPath)) {
  console.error('❌ public/logo.png 또는 public/logo.png.png 가 필요합니다.')
  process.exit(1)
}

const input = readFileSync(srcPath)
const bg = { r: 255, g: 255, b: 255, alpha: 1 }

async function toSquarePng(size) {
  return sharp(input)
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toBuffer()
}

const b16 = await toSquarePng(16)
const b32 = await toSquarePng(32)
const b48 = await toSquarePng(48)
const b180 = await toSquarePng(180)
const b192 = await toSquarePng(192)
const b512 = await toSquarePng(512)

writeFileSync(join(pub, 'favicon-16x16.png'), b16)
writeFileSync(join(pub, 'favicon-32x32.png'), b32)
writeFileSync(join(pub, 'apple-touch-icon.png'), b180)
writeFileSync(join(pub, 'android-chrome-192x192.png'), b192)
writeFileSync(join(pub, 'android-chrome-512x512.png'), b512)

const icoBuf = await pngToIco([b16, b32, b48])
writeFileSync(join(pub, 'favicon.ico'), icoBuf)

console.log('✅ favicon·apple-touch·android-chrome·logo 기반 아이콘 생성 완료')
