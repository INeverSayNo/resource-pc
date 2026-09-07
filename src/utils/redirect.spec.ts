import { describe, expect, it } from 'vitest'
import { resolveInternalRedirect } from './redirect'

describe('resolveInternalRedirect', () => {
  it('accepts an existing internal route', () => {
    expect(resolveInternalRedirect('/dashboard/index?tab=1', '/dashboard/index')).toBe(
      '/dashboard/index?tab=1'
    )
  })

  it('rejects external, login and missing routes', () => {
    const fallback = '/dashboard/index'
    expect(resolveInternalRedirect('https://example.com', fallback)).toBe(fallback)
    expect(resolveInternalRedirect('//example.com', fallback)).toBe(fallback)
    expect(resolveInternalRedirect('/login', fallback)).toBe(fallback)
    expect(resolveInternalRedirect('/not-found', fallback)).toBe(fallback)
  })
})
