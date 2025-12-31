/**
 * api.video 영상 업로드 및 관리 API
 * 
 * 기능:
 * - 영상 업로드 (멀티파트)
 * - 비공개 영상 설정
 * - 영상 정보 조회
 * - 영상 삭제
 */

import { Hono } from 'hono'
import ApiVideoClient from '@api.video/nodejs-client'
import { Bindings } from '../types/database'
import { successResponse, errorResponse } from '../utils/helpers'
import { requireAdmin } from '../middleware/auth'

const apiVideo = new Hono<{ Bindings: Bindings }>()

/**
 * api.video 클라이언트 초기화
 */
function getApiVideoClient(c: any) {
  const apiKey = c.env.APIVIDEO_API_KEY
  const baseUrl = c.env.APIVIDEO_BASE_URL || 'https://sandbox.api.video'
  
  if (!apiKey) {
    throw new Error('APIVIDEO_API_KEY not configured')
  }

  // Sandbox vs Production 구분
  const isSandbox = baseUrl.includes('sandbox')
  
  return new ApiVideoClient({
    apiKey: apiKey,
    baseUri: baseUrl
  })
}

/**
 * POST /api/video-apivideo/upload
 * 영상 업로드
 * 
 * Body (multipart/form-data):
 * - file: 영상 파일
 * - title: 영상 제목
 * - description: 영상 설명 (선택)
 * - is_public: 공개 여부 (기본값: false)
 * - lesson_id: 연결할 차시 ID (선택)
 */
apiVideo.post('/upload', requireAdmin, async (c) => {
  try {
    const client = getApiVideoClient(c)
    const formData = await c.req.formData()
    
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    const isPublic = formData.get('is_public') === 'true'
    const lessonId = formData.get('lesson_id') as string
    
    if (!file) {
      return c.json(errorResponse('영상 파일이 필요합니다'), 400)
    }
    
    if (!title) {
      return c.json(errorResponse('영상 제목이 필요합니다'), 400)
    }

    // 1. api.video에 비디오 생성
    const videoCreationPayload = {
      title: title,
      description: description,
      public: isPublic,
      // 비공개 영상 설정
      ...((!isPublic) && {
        mp4Support: true // MP4 다운로드 지원
      })
    }

    const video = await client.videos.create(videoCreationPayload)
    
    // 2. 파일 업로드
    const fileBuffer = await file.arrayBuffer()
    const uploadResult = await client.videos.upload(
      video.videoId,
      new Uint8Array(fileBuffer),
      {
        fileName: file.name
      }
    )

    // 3. DB에 영상 정보 저장 (lesson_id가 있는 경우)
    if (lessonId) {
      const { env } = c
      await env.DB.prepare(`
        UPDATE lessons 
        SET 
          video_url = ?,
          video_type = 'apivideo',
          video_metadata = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        uploadResult.assets.player, // 플레이어 URL
        JSON.stringify({
          video_id: uploadResult.videoId,
          provider: 'apivideo',
          title: uploadResult.title,
          description: uploadResult.description,
          duration: uploadResult.assets.mp4 ? uploadResult.assets.mp4.length : null,
          thumbnail: uploadResult.assets.thumbnail,
          is_public: uploadResult.public,
          created_at: uploadResult.createdAt
        }),
        lessonId
      ).run()
    }

    return c.json(successResponse({
      video_id: uploadResult.videoId,
      title: uploadResult.title,
      description: uploadResult.description,
      player_url: uploadResult.assets.player,
      thumbnail_url: uploadResult.assets.thumbnail,
      is_public: uploadResult.public,
      status: uploadResult.status?.ingest?.status || 'processing',
      created_at: uploadResult.createdAt,
      lesson_id: lessonId
    }))

  } catch (error: any) {
    console.error('api.video upload error:', error)
    return c.json(errorResponse(
      error.message || '영상 업로드에 실패했습니다'
    ), 500)
  }
})

/**
 * POST /api/video-apivideo/upload-url
 * URL로 영상 업로드
 * 
 * Body:
 * - url: 영상 URL
 * - title: 영상 제목
 * - description: 영상 설명 (선택)
 * - is_public: 공개 여부 (기본값: false)
 * - lesson_id: 연결할 차시 ID (선택)
 */
apiVideo.post('/upload-url', requireAdmin, async (c) => {
  try {
    const client = getApiVideoClient(c)
    const { url, title, description, is_public, lesson_id } = await c.req.json()
    
    if (!url) {
      return c.json(errorResponse('영상 URL이 필요합니다'), 400)
    }
    
    if (!title) {
      return c.json(errorResponse('영상 제목이 필요합니다'), 400)
    }

    // 1. api.video에 비디오 생성 및 URL 업로드
    const videoCreationPayload = {
      title: title,
      description: description || '',
      public: is_public === true,
      source: url
    }

    const video = await client.videos.create(videoCreationPayload)

    // 2. DB에 영상 정보 저장 (lesson_id가 있는 경우)
    if (lesson_id) {
      const { env } = c
      await env.DB.prepare(`
        UPDATE lessons 
        SET 
          video_url = ?,
          video_type = 'apivideo',
          video_metadata = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        video.assets.player,
        JSON.stringify({
          video_id: video.videoId,
          provider: 'apivideo',
          title: video.title,
          description: video.description,
          source_url: url,
          thumbnail: video.assets.thumbnail,
          is_public: video.public,
          created_at: video.createdAt
        }),
        lesson_id
      ).run()
    }

    return c.json(successResponse({
      video_id: video.videoId,
      title: video.title,
      description: video.description,
      player_url: video.assets.player,
      thumbnail_url: video.assets.thumbnail,
      is_public: video.public,
      status: video.status?.ingest?.status || 'processing',
      created_at: video.createdAt,
      lesson_id: lesson_id
    }))

  } catch (error: any) {
    console.error('api.video URL upload error:', error)
    return c.json(errorResponse(
      error.message || 'URL로 영상 업로드에 실패했습니다'
    ), 500)
  }
})

/**
 * GET /api/video-apivideo/:videoId
 * 영상 정보 조회
 */
apiVideo.get('/:videoId', requireAdmin, async (c) => {
  try {
    const client = getApiVideoClient(c)
    const videoId = c.req.param('videoId')
    
    const video = await client.videos.get(videoId)
    
    return c.json(successResponse({
      video_id: video.videoId,
      title: video.title,
      description: video.description,
      player_url: video.assets.player,
      thumbnail_url: video.assets.thumbnail,
      is_public: video.public,
      duration: video.assets.mp4 ? video.assets.mp4[0]?.length : null,
      status: video.status,
      created_at: video.createdAt,
      updated_at: video.updatedAt
    }))

  } catch (error: any) {
    console.error('api.video get error:', error)
    return c.json(errorResponse(
      error.message || '영상 정보 조회에 실패했습니다'
    ), 500)
  }
})

/**
 * DELETE /api/video-apivideo/:videoId
 * 영상 삭제
 */
apiVideo.delete('/:videoId', requireAdmin, async (c) => {
  try {
    const client = getApiVideoClient(c)
    const videoId = c.req.param('videoId')
    
    await client.videos.delete(videoId)
    
    // DB에서도 제거
    const { env } = c
    await env.DB.prepare(`
      UPDATE lessons 
      SET 
        video_url = NULL,
        video_type = NULL,
        video_metadata = NULL,
        updated_at = datetime('now')
      WHERE video_metadata LIKE ?
    `).bind(`%"video_id":"${videoId}"%`).run()
    
    return c.json(successResponse({
      message: '영상이 삭제되었습니다',
      video_id: videoId
    }))

  } catch (error: any) {
    console.error('api.video delete error:', error)
    return c.json(errorResponse(
      error.message || '영상 삭제에 실패했습니다'
    ), 500)
  }
})

/**
 * GET /api/video-apivideo/list
 * 전체 영상 목록 조회
 */
apiVideo.get('/list', requireAdmin, async (c) => {
  try {
    const client = getApiVideoClient(c)
    const page = Number(c.req.query('page')) || 1
    const pageSize = Number(c.req.query('pageSize')) || 25
    
    const videos = await client.videos.list({
      currentPage: page,
      pageSize: pageSize
    })
    
    return c.json(successResponse({
      videos: videos.data.map(v => ({
        video_id: v.videoId,
        title: v.title,
        description: v.description,
        player_url: v.assets.player,
        thumbnail_url: v.assets.thumbnail,
        is_public: v.public,
        status: v.status,
        created_at: v.createdAt
      })),
      pagination: videos.pagination
    }))

  } catch (error: any) {
    console.error('api.video list error:', error)
    return c.json(errorResponse(
      error.message || '영상 목록 조회에 실패했습니다'
    ), 500)
  }
})

export default apiVideo
