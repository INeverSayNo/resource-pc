import { describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { consumeExternalAuthQuery } from './external'

const route = (query: Record<string, string>) => ({ query }) as unknown as RouteLocationNormalized

describe('external auth query', () => {
  it('uses token priority and removes every sensitive field', () => {
    const result = consumeExternalAuthQuery(
      route({ token: 'jwt', t: 'cookie', isoa: 'true', name: 'oa', pwd: 'secret', keep: '1' })
    )
    expect(result.request).toEqual({ type: 'external-token', token: 'jwt' })
    expect(result.query).toEqual({ keep: '1' })
    expect(result.hasSensitiveParams).toBe(true)
  })

  it('requires complete OA credentials but still scrubs partial values', () => {
    const result = consumeExternalAuthQuery(route({ isoa: 'true', name: 'oa' }))
    expect(result.request).toBeNull()
    expect(result.query).toEqual({})
  })
})
