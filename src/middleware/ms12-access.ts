import type { Context, Next } from 'hono'
import type { AppActor } from '../utils/actor'
import { getOrCreateActor } from '../utils/actor'
import type { Bindings } from '../types/database'

type Var = { actor: AppActor }

/**
 * /api/ms12/* — 로그인 없음, 방문자 actor만
 */
export async function ms12Access(
  c: Context<{ Bindings: Bindings; Variables: Var }>,
  next: Next,
): Promise<void> {
  const a = await getOrCreateActor(c)
  c.set('actor', a)
  await next()
}
