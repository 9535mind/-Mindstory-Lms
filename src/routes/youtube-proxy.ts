/**
 * YouTube oEmbed 프록시 API
 * CORS 문제 해결
 */

import { Hono } from 'hono'
import { Bindings } from '../types/database'

const youtubeProxy = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/youtube/oembed
 * YouTube oEmbed API 프록시
 */
youtubeProxy.get('/oembed', async (c) => {
  try {
    const videoUrl = c.req.query('url')
    
    if (!videoUrl) {
      return c.json({ error: 'URL parameter is required' }, 400)
    }
    
    // YouTube oEmbed API 호출
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
    )
    
    if (!response.ok) {
      return c.json({ error: 'Failed to fetch video info' }, response.status)
    }
    
    const data = await response.json()
    
    // CORS 헤더 추가
    return c.json(data, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    
  } catch (error) {
    console.error('YouTube oEmbed proxy error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// OPTIONS 요청 처리 (CORS preflight)
youtubeProxy.options('/oembed', (c) => {
  return c.text('', 204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
})

export default youtubeProxy
