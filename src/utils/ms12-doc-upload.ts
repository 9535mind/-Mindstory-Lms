import type { Bindings } from '../types/database'
import { getR2PublicBaseUrl } from './r2-image-upload'

const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/x-hwp',
  'application/haansofthwp',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export async function uploadMs12DocumentToR2(
  env: Bindings,
  file: File,
): Promise<{ key: string; publicUrl: string }> {
  const bucket = env.R2
  if (!bucket) {
    throw new Error('R2_NOT_CONFIGURED')
  }
  const t = file.type || 'application/octet-stream'
  if (!ALLOWED.has(t) && !t.startsWith('image/')) {
    throw new Error('UNSUPPORTED_TYPE')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 12)
  const orig = (file.name || 'file').replace(/[^a-zA-Z0-9._-가-힣]/g, '_').slice(0, 80)
  const key = `ms12-docs/${ts}-${rand}-${orig}`
  const buf = await file.arrayBuffer()
  await bucket.put(key, buf, {
    httpMetadata: { contentType: t || 'application/octet-stream' },
  })
  const publicUrl = `${getR2PublicBaseUrl(env)}/${key}`
  return { key, publicUrl }
}
