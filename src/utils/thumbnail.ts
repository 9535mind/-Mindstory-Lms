/**
 * 썸네일 유틸리티
 * - 동영상 썸네일 추출
 * - 이미지 URL 검증
 * - Fallback 처리
 */

/**
 * 외부 이미지 URL 유효성 검증
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false
    
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) return false
    
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) === 0) return false
    
    return true
  } catch (error) {
    console.error('Image URL validation error:', error)
    return false
  }
}

/**
 * 강좌 제목으로 기본 썸네일 생성 (SVG)
 */
export function generateDefaultThumbnail(title: string): string {
  const firstChar = title.charAt(0).toUpperCase()
  const colors = [
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
  ]
  const color = colors[title.charCodeAt(0) % colors.length]
  
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${color}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">
        ${firstChar}
      </text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * 썸네일 URL 가져오기 (Fallback 포함)
 */
export function getThumbnailUrl(thumbnailUrl: string | null, courseTitle: string): string {
  if (!thumbnailUrl) {
    return generateDefaultThumbnail(courseTitle)
  }
  
  // 상대 경로는 그대로 반환
  if (thumbnailUrl.startsWith('/')) {
    return thumbnailUrl
  }
  
  // 외부 URL은 그대로 반환 (브라우저에서 onerror 처리)
  return thumbnailUrl
}
