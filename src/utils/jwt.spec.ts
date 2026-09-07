import { describe, expect, it } from 'vitest'
import { decodeJwtUser } from './jwt'

const token = (payload: Record<string, unknown>): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  const encoded = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

describe('decodeJwtUser', () => {
  it('decodes UTF-8 claims and accepts erp user id', () => {
    const result = decodeJwtUser(
      token({ erp_userid: '1', erp_username: '张三', exp: 200 }),
      100_000
    )
    expect(result[0]).toBeNull()
    expect(result[1]?.erp_username).toBe('张三')
  })

  it('rejects malformed, expired and future tokens', () => {
    expect(decodeJwtUser('a.b')[0]).toBeInstanceOf(Error)
    expect(decodeJwtUser(token({ sub: '1', exp: 99 }), 100_000)[0]).toBeInstanceOf(Error)
    expect(decodeJwtUser(token({ sub: '1', nbf: 101 }), 100_000)[0]).toBeInstanceOf(Error)
  })

  it('requires a stable user identifier', () => {
    expect(decodeJwtUser(token({ exp: 200 }), 100_000)[0]).toBeInstanceOf(Error)
  })
})
