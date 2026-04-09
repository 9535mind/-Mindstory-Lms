/**
 * R2 동영상 업로드 — 강좌 차시용
 */

import type { Bindings } from '../types/database'
import { getR2PublicBaseUrl } from './r2-image-upload'

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-m4v']
const MAX_BYTES = 500 * 1024 * 1024

export async function uploadVideoFileToR2(
  env: Bindings,
  file: File,
  keyPrefix: string,
): Promise<{ url: string; key: string }> {
  const bucket = env.R2
  if (!bucket) {
    throw new Error('R2_NOT_CONFIGURED')
  }
  const extFromName = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4'
  const mime = file.type || 'video/mp4'
  if (!ALLOWED_TYPES.includes(mime) && !['mp4', 'webm', 'mov', 'avi', 'm4v'].includes(extFromName)) {
    throw new Error('UNSUPPORTED_VIDEO_TYPE')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('VIDEO_TOO_LARGE')
  }

  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const key = `${keyPrefix.replace(/\/$/, '')}/videos/${timestamp}-${randomString}.${extFromName}`

  const arrayBuffer = await file.arrayBuffer()
  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: mime,
    },
  })

  const url = `${getR2PublicBaseUrl(env)}/${key}`
  return { url, key }
}
