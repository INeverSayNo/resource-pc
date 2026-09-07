import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, normalizeApiResult } from './result'

describe('request result', () => {
  it('normalizes a network failure without response data', async () => {
    const result = await normalizeApiResult(Promise.resolve([undefined, null]), '网络请求失败')
    expect(result[0]).toBeInstanceOf(Error)
    expect(getApiErrorMessage(result[0]!)).toBe('网络请求失败')
  })

  it('keeps backend error details', async () => {
    const error = { error_description: '账号无效' }
    const result = await normalizeApiResult(Promise.resolve([error, null]))
    expect(result).toEqual([error, null])
    expect(getApiErrorMessage(result[0]!)).toBe('账号无效')
  })
})
