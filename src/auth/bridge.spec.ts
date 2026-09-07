import { describe, expect, it } from 'vitest'
import { isUnauthorizedForCurrentSession } from './bridge'

describe('401 token matching', () => {
  it('only expires the session that issued the failed request', () => {
    expect(isUnauthorizedForCurrentSession('old-token', 'new-token')).toBe(false)
    expect(isUnauthorizedForCurrentSession('new-token', 'new-token')).toBe(true)
    expect(isUnauthorizedForCurrentSession('', 'new-token')).toBe(false)
  })
})
