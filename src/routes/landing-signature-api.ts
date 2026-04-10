/**
 * GET /api/landing/signature-lineup — 메인 시그니처 라인업 카드 문구 (공개)
 */
import { Hono } from 'hono'
import { Bindings } from '../types/database'
import { loadLandingSignatureCardsFromDb } from '../utils/landing-signature-data'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/landing/signature-lineup', async (c) => {
  const cards = await loadLandingSignatureCardsFromDb(c.env)
  return c.json({ success: true, cards })
})

export default app
