// 간단한 DB 연결 테스트 API
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/test-db', async (c) => {
  try {
    const { DB } = c.env as any
    
    if (!DB) {
      return c.json({ success: false, error: 'DB binding not found', env: Object.keys(c.env) })
    }
    
    const result = await DB.prepare('SELECT COUNT(*) as count FROM users').first()
    
    return c.json({ 
      success: true, 
      message: 'DB connected!',
      userCount: result.count,
      env: Object.keys(c.env)
    })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    })
  }
})

export default app
